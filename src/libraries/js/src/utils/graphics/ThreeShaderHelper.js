import * as THREE from 'three'
import { Texture } from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import {Math2} from '../mathUtils/Math2'

import uvgrid from './uvgrid.png'

/*
This class cretes THREE.js shader meshes that have responsive uniforms to bci and shadertoy presets

Usage:

let helper = new THREEShaderHelper(session,canvas);

three.scene.add(this.meshes[0]);

//you can add meshes, uniforms, and a bunch of other things

//in animation loop:
    this.updateAllMaterialUniforms();
    three.renderer.render(three.scene, three.camera);
*/

export class THREEShaderHelper {

    static defaultVertexTemplate = `
varying vec2 vUv;

void main()
{

    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
`;

static defaultFragmentTemplate = `
#define FFTLENGTH 256
precision mediump float;
uniform vec2 iResolution; //Shader display resolution
uniform float iTime; //Shader time increment

uniform float iHEG;
uniform float iHRV;
uniform float iHR;
uniform float iHB;
uniform float iFrontalAlpha1Coherence;
uniform float iFFT[FFTLENGTH];
uniform float iAudio[FFTLENGTH];
void main(){
    gl_FragColor = vec4(iAudio[20]/255. + iHEG*0.1+gl_FragCoord.x/gl_FragCoord.y,gl_FragCoord.y/gl_FragCoord.x,gl_FragCoord.y/gl_FragCoord.x - iHEG*0.1 - iAudio[120]/255.,1.0);
}                    
`;

    constructor(session=undefined, canvas=undefined) {

        if(!canvas || !session) {console.error('THREEShaderHelper needs a canvas and a session!'); return false;};

        this.session = session;
        this.eegchannel = 0;
        this.heg = 0;

        this.canvas = canvas;
        this.startTime=Date.now();
        this.lastTime = this.startTime;
        this.lastFrame = this.startTime;
        this.mouseclicked = 0.0;
        this.mousexyzw = [0,0,0,0];

        this.gui = new GUI({ autoPlace: false });
        this.guiControllers = [];

        this.addCanvasEventListeners(canvas);

        let date = new Date();

        this.baseUniforms = {
            iResolution: {value:THREE.Vector2(100,100)}, //viewport resolution
            iTime:      {value:0}, //milliseconds elapsed from shader begin
            iTimeDelta: {value:0},
            iFrame:     {value:0},
            iFrameRate: {value:0},
            iChannelTime:   {value:[0,0,0,0]},
            iChannelResolution:{type:'v3v', value:[new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100)]},
            iChannel0:  {type:'t', value:new THREE.Texture(uvgrid)},
            iChannel1:  {type:'t', value:new THREE.Texture(uvgrid)},
            iChannel2:  {type:'t', value:new THREE.Texture(uvgrid)},
            iChannel3:  {type:'t', value:new THREE.Texture(uvgrid)},
            iSampleRate:    {type:'1f', value:44100},
            iDate:      {value:new THREE.Vector4(date.getYear(),date.getMonth(),date.getDay(),date.getHours()*3600+date.getMinutes()*60+date.getSeconds())},
            iMouse:     {value:[0,0,0,0]},  //XY mouse coordinates, z, w are last click location
            iMouseInput: {value:false}, //Click occurred before past frame?
            iImage:     {type:'t', value:new THREE.Texture(canvas.toDataURL())}, //Texture map returned from shader (to keep state)
            iAudio:           {value:new Array(256).fill(0)},     //Audio analyser FFT, array of 256, values max at 255
            iHRV:             {value:0},       //Heart Rate Variability (values typically 5-30)
            iHEG:             {value:0},       //HEG change from baseline, starts at zero and can go positive or negative
            iHR:              {value:0},       //Heart Rate in BPM
            iHB:              {value:0},       //Is 1 when a heart beat occurs, falls off toward zero on a 1/t curve (s)
            iBRV:             {value:0},       //Breathing rate variability, usually low, ideal is 0.
            iFFT:             {value:new Array(256).fill(0)},  //Raw EEG FFT, array of 256. Values *should* typically be between 0 and 100 (for microvolts) but this can vary a lot so normalize or clamp values as you use them
            iDelta:           {value:0},       //Delta bandpower average. The following bandpowers have generally decreasing amplitudes with frequency.
            iTheta:           {value:0},       //Theta bandpower average.
            iAlpha1:          {value:0},       //Alpha1 " "
            iAlpha2:          {value:0},       //Alpha2 " "
            iBeta:            {value:0},       //Beta " "
            iGamma:           {value:0},       //Low Gamma (30-45Hz) " "
            iThetaBeta:       {value:0},       //Theta/Beta ratio
            iAlpha1Alpha2:    {value:0},       //Alpha1/Alpha2 ratio
            iAlphaBeta:       {value:0},       //Alpha/Beta ratio
            i40Hz:            {value:0},       //40Hz bandpower
            iFrontalAlpha1Coherence: {value:0} //Alpha 1 coherence, typically between 0 and 1 and up, 0.9 and up is a strong correlation
        }

        //default settings for uniforms
        this.uniformSettings = {
            iResolution: {default:THREE.Vector2(100,100),min:8,max:8192, step:1}, //viewport resolution
            iTime:      {default:0,min:0,max:999999, step:1}, //milliseconds elapsed from shader begin
            iTimeDelta: {default:0,min:0,max:2, step:0.1},
            iFrame:     {default:0,min:0,max:999999, step:1},
            iFrameRate: {default:0,min:0,max:144, step:1},
            iChannelTime:   {default:[0,0,0,0],min:0,max:99999, step:1},
            iChannelResolution:{type:'v3v',min:8,max:8192, step:1, default:[new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100)]},
            iChannel0:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel1:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel2:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel3:  {type:'t', default:new THREE.Texture(uvgrid)},
            iSampleRate:    {type:'1f', default:44100,min:8000,max:96000, step:1000},
            iDate:      {default:new THREE.Vector4(date.getYear(),date.getMonth(),date.getDay(),date.getHours()*3600+date.getMinutes()*60+date.getSeconds())},
            iMouse:     {default:[0,0,0,0],min:0,max:8192, step:1},  //XY mouse coordinates, z, w are last click location
            iMouseInput: {default:false}, //Click occurred before past frame?
            iImage:           {type:'t', default:new THREE.Texture(canvas.toDataURL())}, //Texture map returned from shader (to keep state)
            iAudio:           {default: new Array(256).fill(0), min:0,max:255, step:1},              //Audio analyser FFT, array of 256, values max at 255
            iHRV:             {default:0, min:0, max:40,step:0.5},                           //Heart Rate Variability (values typically 5-30)
            iHEG:             {default:0, min:-3, max:3,step:0.1},                           //HEG change from baseline, starts at zero and can go positive or negative
            iHR:              {default:0, min:0, max:240,step:1},                            //Heart Rate in BPM
            iHB:              {default:0, min:0, max:1},                                     //Is 1 when a heart beat occurs, falls off toward zero on a 1/t curve (s)
            iBRV:             {default:0, min:0, max:10,step:0.5},                           //Breathing rate variability, usually low, ideal is 0.
            iFFT:             {default:new Array(256).fill(0),min:0,max:1000},               //Raw EEG FFT, array of 256. Values *should* typically be between 0 and 100 (for microvolts) but this can vary a lot so normalize or clamp values as you use them
            iDelta:           {default:0, min:0, max:100,step:0.5},                          //Delta bandpower average. The following bandpowers have generally decreasing amplitudes with frequency.
            iTheta:           {default:0, min:0, max:100,step:0.5},                          //Theta bandpower average.
            iAlpha1:          {default:0, min:0, max:100,step:0.5},                          //Alpha1 " "
            iAlpha2:          {default:0, min:0, max:100,step:0.5},                          //Alpha2 " "
            iBeta:            {default:0, min:0, max:100,step:0.5},                          //Beta " "
            iGamma:           {default:0, min:0, max:100,step:0.5},                          //Low Gamma (30-45Hz) " "
            iThetaBeta:       {default:0, min:0, max:5,step:0.1},                            //Theta/Beta ratio
            iAlpha1Alpha2:    {default:0, min:0, max:5,step:0.1},                            //Alpha1/Alpha2 ratio
            iAlphaBeta:       {default:0, min:0, max:5,step:0.1},                            //Alpha/Beta ratio
            iAlphaTheta:      {default:0, min:0, max:5,step:0.1},
            i40Hz:            {default:0, min:0, max:10,step:0.1},                           //40Hz bandpower
            iFrontalAlpha1Coherence: {default:0, min:0, max:1.1,step:0.1}                           //Alpha 1 coherence, typically between 0 and 1 and up, 0.9 and up is a strong correlation
        }

        this.vertexTemplate = this.defaultVertexTemplate;
        this.fragmentTemplate = this.defaultFragmentTemplate;

        this.shaderSettings = [{
            name: 'default',
            vertexShader: this.vertexTemplate,
            fragmentShader: this.fragmentTemplate,
            uniformNames:[
                'iResolution',
                'iTime',
                'iHEG',
                'iHRV',
                'iHR',
                'iHB',
                'iFrontalAlpha1Coherence',
                'iFFT',
                'iAudio'
            ],
            author:'B@P'
        }];

        let uniforms = this.generateMaterialUniforms();

        let geometry = this.createMeshGeometry('plane',canvas.width,canvas.height);
        this.currentViews = ['plane'];

        let material = new THREE.ShaderMaterial({
            transparent:true,
            side: THREE.DoubleSide,
            vertexShader: this.shaderSettings[0].vertexShader,
            fragmentShader: this.shaderSettings[0].fragmentShader,
            uniforms:uniforms
        });

        let mesh = new THREE.Mesh({
            geometry:geometry,
            material:material,
        });

        this.materials = [material];
        this.meshes = [mesh];

        this.setMeshRotation(0);

    }

    //Generate a shader mesh with the specified parameters. Returns a mesh with the ShaderMaterial applied.
    static generateShaderGeometry(type='plane',width,height,fragment=this.defaultFragmentTemplate,vertex=this.defaultVertexTemplate) {
        let geometry = this.createMeshGeometry(type,width,height);
        let material = this.generateShaderMaterial(fragment,vertex);
        return new THREE.Mesh(geometry,material);
    }
    
    //Generate a shader material with the specified vertex and fragment. Returns a material.
    static generateShaderMaterial(fragment=this.defaultFragmentTemplate,vertex=this.defaultVertexTemplate) {
        return new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide,
            transparent: true
        });
    }

    //Generate a shader mesh with the specified parameters: supports sphere, plane, circle, halfsphere, vrscreen
    static createMeshGeometry(type='plane',width,height){
        if (type === 'sphere'){
            return new THREE.SphereGeometry(Math.min(width, height), 50, 50).rotateY(-Math.PI*0.5);
        } else if (type === 'plane') {
            let plane = new THREE.PlaneGeometry(width, height, 1, 1);
            let angle = (2 * Math.PI * 1) - Math.PI/2;
            plane.position.set(radius*(Math.cos(angle)),0,radius*(Math.sin(angle)));
            plane.rotation.set(0,-angle - Math.PI/2,0);
            return plane;
        } else if (type === 'circle') {      
            return new THREE.CircleGeometry( Math.min(width, height), 32 );
        } else if (type === 'halfsphere') {      
            return new THREE.SphereGeometry(Math.min(width, height), 50, 50, -2*Math.PI, Math.PI, 0, Math.PI).translate(0,0,-3);
        } else if (type === 'vrscreen') {
            return new THREE.SphereGeometry(Math.min(width, height), 50, 50, -2*Math.PI-1, Math.PI+1, 0.5, Math.PI-1).rotateY(0.5).translate(0,0,-3);
        }
    }

    deinit() {
        this.removeCanvasEventListeners();
    }

    onmousemove=(ev)=> {
        this.mousexyzw[0] = ev.offsetX;
        this.mousexyzw[1] = ev.offsetY;
    }

    mousedown = (ev) => {
        this.mouseclicked = 1.0;
        this.mousexyzw[2] = ev.offsetX;
        this.mousexyzw[3] = ev.offsetY; 
    }

    addCanvasEventListeners(canvas=this.canvas) { 
        canvas.addEventListener('mousemove', this.onmousemove);
        canvas.addEventListener('mousedown', this.mousedown);
    }

    removeCanvasEventListeners(canvas=this.canvas) { 
        canvas.removeEventListener('mousemove', this.onmousemove);
        canvas.removeEventListener('mousedown', this.mousedown);
    }

    //create a whole new shader mesh with specified settings
    addNewShaderMesh(
        fragment=this.defaultFragmentTemplate,
        vertex=this.defaultVertexTemplate,
        type='plane',
        width=this.canvas.width, 
        height=this.canvas.height,
        uniformNames=[],
        name='',
        author='',
        atlas=this.session.atlas
    ) {
        let geometry;
        if(typeof type === 'string') geometry = this.createMeshGeometry(type,width,height);
        else geometry = type; //can pass a str8 geometry object
        let material = this.generateShaderMaterial(fragment,vertex);
        let mesh = new THREE.Mesh(geometry,material);
        

        this.shaderSettings.push({
            name:name,
            vertexShader: vertex,
            fragmentShader: fragment,
            uniformNames:uniformNames,
            author:author
        });

        let uniforms = this.generateMaterialUniforms(this.shaderSettings[this.shaderSettings.length-1]);

        materal.uniforms = uniforms;

        this.updateMaterialUniforms(material,uniformNames,atlas,type);

        this.currentViews.push(type);
        this.materials.push(material);
        this.meshes.push(mesh);

    }

    //only applies to the main mesh geometry
    setMeshGeometry(matidx=0,type='plane') {
        if(this.meshes[matidx]) {
            this.currentViews[matidx] = type;
            this.meshes[matidx].geometry = this.createMeshGeometry(type);
            this.meshes[matidx].rotation.set(0,Math.PI,0);
        }
    }

    setMeshRotation(matidx=0,anglex=0,angley=Math.PI,anglez=0){
        if(this.meshes[matidx])
            this.meshes[matidx].rotation.set(anglex,angley,anglez);
    }

    //this should allow you to set custom textures
    setChannelTexture(channelNum=0,imageOrVideo=uvgrid,material=this.materials[0]) {
        if(!this.baseUniforms['iChannel'+channelNum]) { //if adding new textures, the glsl needs to be able to accommodate it
            let l = this.baseUniforms['iChannelResolution'].value.length-1;
            if(this.baseUniforms['iChannelResolution'].value.length-1 < channelNum) {
                this.baseUniforms['iChannelResolution'].value.push(...new Array(channelNum-l).fill(0));
                this.baseUniforms['iChannelTime'].value.push(...new Array(channelNum-l).fill(Date.now()-this.startTime));
            }
        }
        this.baseUniforms['iChannel'+channelNum] = {type:'t', value:new THREE.Texture(imageOrVideo)};
        this.baseUniforms['iChannelResolution'].value[channelNum] = new THREE.Vector2(imageOrVideo.width, imageOrVideo.height);
        if(material) {
            material.uniforms['iChannel'+channelNum] = this.baseUniforms['iChannel'+channelNum];
            material.uniforms['iChannelResolution'] = this.baseUniforms['iChannelResolution'];
            material.uniforms['iChannelTime'] = this.baseUniforms['iChannelTime'];
        }
    }

    //lets you add uniform settings e.g. textures, floats, vertex lists (for meshes, type=v3v)
    addUniformSetting(name='newUniform',defaultValue=0,type=undefined,callback=()=>{return 0;},min=0,max=1,step=0.1) { //min,max,step are for slider controls (only applies to floats)
        this.uniformSettings[name] = {default:defaultValue,min:min,max:max,step:step,callback:callback};
        this.baseUniforms[name] = {value:defaultValue};
        if(type) { this.baseUniforms[name].type = type; }
    }


    generateMaterialUniforms(shaderSettings=this.shaderSettings[0]) {
        let uniforms = {};
        shaderSettings.uniformNames.forEach((u)=>{
            let pass = false;
            for(const prop in this.baseUniforms) {
                if (prop === 'iChannelResolution') {
                    uniforms[u] = this.baseUniforms[u];
                } else if (prop.includes('iChannel')) {
                    uniforms[u] = this.baseUniforms[u];
                    if(!uniforms['iChannelResolution']) {
                        uniforms['iChannelResolution'] = this.baseUniforms['iChannelResolution'];
                    }
                    let ch = parseInt(u[8]);
                    uniforms['iChannelResolution'].value[ch] = new THREE.Vector3(
                        uniforms[u].value.image.width,
                        uniforms[u].value.image.height
                    );
                } else if (prop.includes('iImage')){
                   uniforms[u] = {type:'t',value:this.canvas.toDataURL()};
                }
                else if(u === prop) {
                    uniforms[u]=this.baseUniforms[u];
                    pass = true;
                    break;
                }
            }
        });
        return uniforms;
    }

    resetMaterialUniforms(material=this.materials[0],uniformNames=this.shaderSettings[0].uniformNames) {
        for(let name in uniformNames) {
            if(this.uniformSettings[name]) {
                this.baseUniforms[name].value = this.uniformSettings[name].default;
                material.uniforms[name] = this.baseUniforms[name];
            }
        }
    }

    //Updates dynamic uniforms for selected material, uniforms. Static uniforms (textures, meshes, etc) are set once.
    updateMaterialUniforms(material=this.materials[0],uniformNames=this.shaderSettings[0].uniformNames,atlas=this.session.atlas,meshType=this.currentViews[matidx]) {
        let time = Date.now();
        
        for(let name in uniformNames) {
        
            if (!material.uniforms[name]) { 
                material.uniforms[name] = {value:0};
            }

            if(name === 'iResolution') {
                if(meshType === 'halfsphere' || meshType === 'circle') {
                    material.uniforms.iResolution.value = new THREE.Vector2(this.canvas.width,this.canvas.height);
                } else if (meshType !== 'plane') {
                    material.uniforms.iResolution.value = new THREE.Vector2(Math.max(this.canvas.width,this.canvas.height), this.canvas.width); //fix for messed up aspect ratio on vrscreen and sphere
                } else {
                    material.uniforms.iResolution.value = new THREE.Vector2(this.canvas.width, this.canvas.height); //leave plane aspect alone
                }
            } else if (name === 'iTime') {
                material.uniforms.iTime.value = (time-this.startTime)*0.001;
            } else if (name === 'iTimeDelta') {
                let t0 = time-this.lastTime;
                material.uniforms.iTimeDelta.value = (t0)*0.001;
                if(t0 > 5) {
                    this.lastTime = time;
                }
            } else if (name === 'iFrame') {
                material.uniforms.iFrame.value++;
            } else if (name === 'iFrameRate') {
                let t0 = time - this.lastFrame;
                material.uniforms.iFrameRate.value = 1/(t0*0.001);
                if(t0 > 5) { 
                    this.lastFrame = time;
                }
            } else if (name === 'iChannelTime') {
                let t = (time-this.startTime)*0.001;
                material.uniforms.iChannelTime.value.forEach((t,i)=>{
                    material.uniforms.iChannelTime.value[i] = t;
                });
            } else if (name === 'iDate') {
                let date = new Date();
                material.uniforms.iDate.value.x = date.getYear();
                material.uniforms.iDate.value.y = date.getMonth();
                material.uniforms.iDate.value.z = date.getDay();
                material.uniforms.iDate.value.w = date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds();
            } else if (name === 'iMouse') {
                material.uniforms.iMouse.value = new THREE.Vector4(...this.mousexyzw);
            } else if (name === 'iMouseInput') {
                material.uniforms.iMouseInput.value = this.mouseclicked;
            } else if (name === 'iImage') {
                material.uniforms.iImage.value = this.canvas.toDataURL();
            } else if (name === 'iAudio') {
                if(window.audio) {
                    material.uniforms.iFFT.value = Array.from(window.audio.getAnalyzerData().slice(0,256));
                }
            } else if (name === 'iHEG') {
                if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                    if(atlas.data.heg[this.heg].ratio.length > 0) {
                        if(!this.hegbaseline) this.hegbaseline = atlas.data.heg[this.heg].ratio[atlas.data.heg[this.heg].ratio.length-1];
                        let hegscore = atlas.data.heg[this.heg].ratio[atlas.data.heg[this.heg].ratio.length-1] - this.hegbaseline;
                        material.uniforms.iHEG.value = hegscore;
                    }
                }
            } else if (name === 'iHRV') {
                if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                        if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                            let hrv = atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].hrv;
                            material.uniforms.iHRV.value = hrv;
                        }
                    }
                }
            } else if (name === 'iHR') {
                if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                
                    if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                        let hr_mod = 60/atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].bpm;
                        material.uniforms.iHR.value = hr_mod;
                    }
                }
            } else if (name === 'iHB') {
                if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                
                    if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                        material.uniforms.iHB.value = 1/(0.001*(time-atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].t)) 
                    }
                }
            } else if (name === 'iBRV') {
                if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                    
                    if(atlas.data.heg[this.heg].beat_detect.breaths.length > 0) {
                        material.uniforms.iBRV = atlas.data.heg[this.heg].beat_detect.breaths[atlas.data.heg[this.heg].beat_detect.breaths.length-1].brv;
                    }
                }
            } else if(atlas.settings.eeg === true && atlas.settings.analyzing === true) { 
                let channel = this.channel;
            
                if (name === 'iFFT') {
                    let data = atlas.getLatestFFTData(channel)[0];
                    if (data.fft){
                        let fft = Math2.interpolateArray(channel.fft,256);
                        if(fft) material.uniforms.iFFT.value = fft;
                    }
                }
                else if (name === 'iDelta') {
                    material.uniforms.iDelta.value = atlas.getLatestFFTData(channel)[0].mean.delta;                 
                } else if (name === 'iTheta') {
                    material.uniforms.iTheta.value = atlas.getLatestFFTData(channel)[0].mean.theta;              
                } else if (name === 'iAlpha1') {
                    material.uniforms.iAlpha1.value = atlas.getLatestFFTData(channel)[0].mean.alpha1;               
                } else if (name === 'iAlpha2') {
                    material.uniforms.iAlpha2.value = atlas.getLatestFFTData(channel)[0].mean.alpha2;                  
                } else if (name === 'iBeta') {
                    material.uniforms.iBeta.value = atlas.getLatestFFTData(channel)[0].mean.beta;                   
                } else if (name === 'iGamma') {
                    material.uniforms.iGamma.value = atlas.getLatestFFTData(channel)[0].mean.lowgamma;
                } else if (name === 'i40Hz') {
                    material.uniforms.i40Hz.value = atlas.get40HzGamma(atlas.getEEGDataByChannel(channel))                  
                } else if (name === 'iThetaBeta') {
                    material.uniforms.iThetaBeta.value = atlas.getThetaBetaRatio(atlas.getEEGDataByChannel(channel))                 
                } else if (name === 'iAlpha1Alpha2') {
                    material.uniforms.iAlpha1Alpha2.value = atlas.getAlphaRatio(atlas.getEEGDataByChannel(channel))              
                } else if (name === 'iAlphaBeta') {
                    material.uniforms.iAlphaBeta.value = atlas.getAlphaBetaRatio(atlas.getEEGDataByChannel(channel)) 
                } else if (name === 'iAlphaTheta') {
                    material.uniforms.iAlphaTheta.value = atlas.getAlphaThetaRatio(atlas.getEEGDataByChannel(channel))
                } else if (atlas.settings.analysis.eegcoherence === true && name === 'iFrontalAlpha1Coherence') {
                    material.uniforms.iFrontalAlpha1Coherence.value = atlas.getCoherenceScore(atlas.getFrontalCoherenceData(),'alpha1') // atlas.getLatestCoherenceData(0)[0].mean.alpha1;
                } else if (this.uniformSettings[name]) {
                    if(this.uniformSettings[name].callback) {
                        material.uniforms[name].value = this.uniformSettings[name].callback();
                    }
                }
            } else if (this.uniformSettings[name]) {
                if(this.uniformSettings[name].callback) {
                    material.uniforms[name].value = this.uniformSettings[name].callback();
                }
            }
        }

    }

    //update all of the uniforms simultaneously to save time
    updateAllMaterialUniforms() {
        Object.keys(this.baseUniforms).forEach((name) => {
            let materialsfiltered = [];
            this.shaderSettings.filter((setting,j) => {
                if(setting.uniformNames.indexOf(name)>-1) {
                    materialsfiltered.push(this.materials[j]);
                    return true;
                }
            });     
            if(materialsfiltered.length > 0) {
                let value;
                if(name === 'iResolution') {
                    if(meshType === 'halfsphere' || meshType === 'circle') {
                        value = new THREE.Vector2(this.canvas.width,this.canvas.height);
                    } else if (meshType !== 'plane') {
                        value = new THREE.Vector2(Math.max(this.canvas.width,this.canvas.height), this.canvas.width); //fix for messed up aspect ratio on vrscreen and sphere
                    } else {
                        value = new THREE.Vector2(this.canvas.width, this.canvas.height); //leave plane aspect alone
                    }
                } else if (name === 'iTime') {
                    value = (time-this.startTime)*0.001;
                } else if (name === 'iTimeDelta') {
                    value = (time-this.lastTime)*0.001;
                    this.lastTime = time;
                } else if (name === 'iFrame') {
                    this.baseUniforms.iFrame.value++;
                    value = this.baseUniforms.iFrame.value;
                } else if (name === 'iFrameRate') {
                    value = 1/((time - this.lastFrame)*0.001);
                    this.lastFrame = time;
                } else if (name === 'iChannelTime') {
                    let t = (time-this.startTime)*0.001;
                    this.baseUniforms.iChannelTime.value.forEach((t,i)=>{
                        this.baseUniforms.iChannelTime.value[i] = t;
                    });
                    value = this.baseUniforms.iChannelTime.value;
                } else if (name === 'iDate') {
                    let date = new Date();
                    value = new THREE.Vector4(date.getYear(),date.getMonth(),date.getDay(),date.getHours()*60*60+date.getMinutes()*60+date.getSeconds());
                } else if (name === 'iMouse') {
                    value = new THREE.Vector4(...this.mousexyzw);
                } else if (name === 'iMouseInput') {
                    value = this.mouseclicked;
                } else if (name === 'iImage') {
                    value = this.canvas.toDataURL();
                } else if (name === 'iAudio') {
                    if(window.audio) {
                        value = Array.from(window.audio.getAnalyzerData().slice(0,256));
                    }
                } else if (name === 'iHEG') {
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                        if(atlas.data.heg[this.heg].ratio.length > 0) {
                            if(!this.hegbaseline) this.hegbaseline = atlas.data.heg[this.heg].ratio[atlas.data.heg[this.heg].ratio.length-1];
                            let hegscore = atlas.data.heg[this.heg].ratio[atlas.data.heg[this.heg].ratio.length-1] - this.hegbaseline;
                            value = hegscore;
                        }
                    }
                } else if (name === 'iHRV') {
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                        if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                            if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                                let hrv = atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].hrv;
                                value = hrv;
                            }
                        }
                    }
                } else if (name === 'iHR') {
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                        if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                            let hr_mod = 60/atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].bpm;
                            value = hr_mod;
                        }
                    }
                } else if (name === 'iHB') {
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                    
                        if(atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                           value = 1/(0.001*(time-atlas.data.heg[this.heg].beat_detect.beats[atlas.data.heg[this.heg].beat_detect.beats.length-1].t)) 
                        }
                    }
                } else if (name === 'iBRV') {
                    if(atlas.data.heg.length>0 && atlas.settings.deviceConnected === true) {
                        
                        if(atlas.data.heg[this.heg].beat_detect.breaths.length > 0) {
                            iBRV = atlas.data.heg[this.heg].beat_detect.breaths[atlas.data.heg[this.heg].beat_detect.breaths.length-1].brv;
                        }
                    }
                } else if(atlas.settings.eeg === true && atlas.settings.analyzing === true) { 
                    let channel = this.channel;
                
                    if (name === 'iFFT') {
                        let data = atlas.getLatestFFTData(channel)[0];
                        if (data.fft){
                            let fft = Math2.interpolateArray(channel.fft,256);
                            if(fft) value = fft;
                        }
                    }
                    else if (name === 'iDelta') {
                        value = atlas.getLatestFFTData(channel)[0].mean.delta;                 
                    } else if (name === 'iTheta') {
                        value = atlas.getLatestFFTData(channel)[0].mean.theta;              
                    } else if (name === 'iAlpha1') {
                        value = atlas.getLatestFFTData(channel)[0].mean.alpha1;               
                    } else if (name === 'iAlpha2') {
                        value = atlas.getLatestFFTData(channel)[0].mean.alpha2;                  
                    } else if (name === 'iBeta') {
                        value = atlas.getLatestFFTData(channel)[0].mean.beta;                   
                    } else if (name === 'iGamma') {
                        value = atlas.getLatestFFTData(channel)[0].mean.lowgamma;
                    } else if (name === 'i40Hz') {
                        value = atlas.get40HzGamma(atlas.getEEGDataByChannel(channel))                  
                    } else if (name === 'iThetaBeta') {
                        value = atlas.getThetaBetaRatio(atlas.getEEGDataByChannel(channel))                 
                    } else if (name === 'iAlpha1Alpha2') {
                        value = atlas.getAlphaRatio(atlas.getEEGDataByChannel(channel))              
                    } else if (name === 'iAlphaBeta') {
                        value = atlas.getAlphaBetaRatio(atlas.getEEGDataByChannel(channel)) 
                    } else if (name === 'iAlphaTheta') {
                        value = atlas.getAlphaThetaRatio(atlas.getEEGDataByChannel(channel))
                    } else if (atlas.settings.analysis.eegcoherence === true && name === 'iFrontalAlpha1Coherence') {
                        value = atlas.getCoherenceScore(atlas.getFrontalCoherenceData(),'alpha1') // atlas.getLatestCoherenceData(0)[0].mean.alpha1;
                    } else if (this.uniformSettings[name]) {
                        if(this.uniformSettings[name].callback) {
                            value = this.uniformSettings[name].callback();
                        }
                    }
                } else if (this.uniformSettings[name]) {
                    if(this.uniformSettings[name].callback) {
                        value = this.uniformSettings[name].callback();
                    }
                }
            
                materialsfiltered.forEach(material => {
                    if (!material.uniforms[name]) { 
                        material.uniforms[name] = {value:value};
                    } else material.uniforms[name].value = value;
                });
            }
        });
    }

    //applies to main shader
    setShader = (matidx=0, name='',vertexShader=``,fragmentShader=``,uniformNames=[],author='',atlas=this.session.atlas) => {
        this.shaderSettings[matidx].name = name;
        this.shaderSettings[matidx].vertexShader = vertexShader;
        this.shaderSettings[matidx].fragmentShader = fragmentShader;
        this.shaderSettings[matidx].uniformNames = uniformNames;
        this.shaderSettings[matidx].author = author;

        let uniforms = this.generateMaterialUniforms(this.shaderSettings[matidx]); //get base/invariant uniforms

        this.materials[matidx] = new THREE.ShaderMaterial({
            vertexShader: this.shaderSettings.vertexShader,
            fragmentShader: this.shaderSettings.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms:uniforms
        });

        this.updateMaterialUniforms(this.materials[matidx],uniformNames,atlas,this.currentViews[matidx]); //get latest data
        
        if(this.meshes[matidx]){
            this.meshes[matidx].material.dispose();
            this.meshes[matidx].material = this.materials[matidx];
        }
    }

    swapShader = (matidx=0,onchange=()=>{this.startTime=Date.now()}) => {

        let uniforms = this.generateMaterialUniforms(this.shaderSettings[matidx]); //get base/invariant uniforms

        this.materials[matidx] = new THREE.ShaderMaterial({
            vertexShader: this.shaderSettings[matidx].vertexShader,
            fragmentShader: this.shaderSettings[matidx].fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: uniforms
        });

        this.updateMaterialUniforms(); //get latest data

        if(this.meshes[matidx]){
            this.meshes[matidx].material.dispose();
            this.meshes[matidx].material = this.materials[matidx];
        }

        onchange();
    }

    setShaderFromText = (matidx=0,fragmentShaderText=this.defaultFragmentTemplate,vertexShaderText=this.defaultVertexTemplate,name='',author='',onchange=()=>{this.startTime=Date.now()}) => {

        this.fragmentTemplate = fragmentShaderText;
        this.vertexTemplate = vertexShaderText;

        // Dynamically Extract Uniforms
        let regex = new RegExp('uniform (.*) (.*);', 'g')
        let result = [...fragmentShader.matchAll(regex)]
        let alluniforms = [];
        result.forEach(a => {
            if(a[1].includes('sampler')){
                this.baseUniforms[u] = {default:new Texture(uvmap),type:'t'};
                this.uniformSettings[u] = {default:new Texture(uvmap),type:'t'};
            } else if (a[1].includes('float')) {
                if(!this.baseUniforms[u]) {
                    this.baseUniforms[u] = {value:0};
                    this.uniformSettings[u] = {default:0,min:0,max:100,step:1};
                }
            }
            alluniforms.push(a[2].replace(/(\[.+\])/g, ''));
        });

        this.shaderSettings[matidx].name = name;
        this.shaderSettings[matidx].vertexShader = vertexShaderText;
        this.shaderSettings[matidx].fragmentShader = fragmentShaderText;
        this.shaderSettings[matidx].author = author;
        this.shaderSettings[matidx].uniformNames = alluniforms;

        this.swapShader(matidx,onchange);

    }

    generateGUI(uniformNames=this.uniformSettings.uniformNames,material=this.material){
        let updateUniformsWithGUI = (key,value) => {
            if (this.material.uniforms[key] == null) material.uniforms[key] = {};
            material.uniforms[key].value = value;
        }

        let folders = Object.keys(this.gui.__folders)
        if (!folders.includes('Uniforms')){
            this.gui.addFolder('Uniforms');
        }
        let paramsMenu = this.gui.__folders['Uniforms']

        this.guiControllers.forEach(c => {
            paramsMenu.remove(c)
        })
        this.guiControllers = [];        

        let keys = Object.keys(this.baseUniforms);
        uniformNames.forEach((name)=> {
            if(keys.indexOf(name) > -1){
                if(typeof this.baseUniforms[name].value !== 'object' && this.uniformSettings[name].min && this.uniformSettings[name].max && this.uniformSettings[name].step){
                    this.guiControllers.push(
                        paramsMenu.add(
                            this.baseUniforms, 
                            name, 
                            this.uniformSettings[name].min,
                            this.uniformSettings[name].max,
                            this.uniformSettings[name].step
                            ).onChange(
                                (val) => updateUniformsWithGUI(name,val))
                                );
                }
            } 
        });
    }



}