import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import {eegmath} from '../eegmath'

import uvgrid from './uvgrid.png'

export class THREEShaderHelper {

    constructor(session=undefined, canvas=undefined) {

        if(!canvas || !session) {console.error('THREEShaderHelper needs a canvas!'); return false;};

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

        canvas.addEventListener('mousemove', (ev) => {
            this.mousexyzw[0] = ev.offsetX;
            this.mousexyzw[1] = ev.offsetY;
        });

        canvas.addEventListener('mousedown',(ev) => {
            this.mouseclicked = 1.0;
            this.mousexyzw[3] = ev.offsetX;
            this.mousexyzw[4] = ev.offsetY;
        });

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
            iResolution: {default:THREE.Vector2(100,100),min:8,max:8192}, //viewport resolution
            iTime:      {default:0,min:0,max:999999}, //milliseconds elapsed from shader begin
            iTimeDelta: {default:0,min:0,max:2},
            iFrame:     {default:0,min:0,max:999999},
            iFrameRate: {default:0,min:0,max:144},
            iChannelTime:   {default:[0,0,0,0],min:0,max:99999},
            iChannelResolution:{type:'v3v',min:8,max:8192, default:[new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100),new THREE.Vector3(100,100)]},
            iChannel0:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel1:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel2:  {type:'t', default:new THREE.Texture(uvgrid)},
            iChannel3:  {type:'t', default:new THREE.Texture(uvgrid)},
            iSampleRate:    {type:'1f', default:44100,min:8000,max:96000},
            iDate:      {default:new THREE.Vector4(date.getYear(),date.getMonth(),date.getDay(),date.getHours()*3600+date.getMinutes()*60+date.getSeconds())},
            iMouse:     {default:[0,0,0,0],min:0,max:8192},  //XY mouse coordinates, z, w are last click location
            iMouseInput: {default:false}, //Click occurred before past frame?
            iImage:           {type:'t', default:new THREE.Texture(canvas.toDataURL())}, //Texture map returned from shader (to keep state)
            iAudio:           {default: new Array(256).fill(0), min:0,max:255},              //Audio analyser FFT, array of 256, values max at 255
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

this.vertexTemplate = `
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

this.fragmentTemplate = `
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

        this.shaderSettings = {
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
        }

        let uniforms = this.generateMaterialUniforms();

        let geometry = this.createMeshGeometry('plane',canvas.width,canvas.height);
        this.currentView = 'plane';

        this.material = new THREE.ShaderMaterial({
            transparent:true,
            side: THREE.DoubleSide,
            vertexShader: this.shaderSettings.vertexShader,
            fragmentShader: this.shaderSettings.fragmentShader,
            uniforms:uniforms
        });

        this.mesh = new THREE.Mesh({
            geometry:geometry,
            material:this.material,
        });

        this.setMeshRotation();


    }

    generateMaterialUniforms(shaderSettings=this.shaderSettings) {
        let bciuniforms = {};
        shaderSettings.uniforms.forEach((u)=>{
            let pass = false;
            for(const prop in this.baseUniforms) {
                if (prop === 'iChannelResolution') {
                    bciuniforms[u] = this.baseUniforms[u];
                } else if (prop.includes('iChannel')) {
                    bciuniforms[u] = this.baseUniforms[u];
                    if(!bciuniforms['iChannelResolution']) {
                        bciuniforms['iChannelResolution'] = this.baseUniforms['iChannelResolution'];
                    }
                    let ch = parseInt(u[8]);
                    bciuniforms['iChannelResolution'].value[ch] = new THREE.Vector3(
                        bciuniforms[u].value.image.width,
                        bciuniforms[u].value.image.height
                    );
                }
                else if(u === prop) {
                    bciuniforms[u]=this.baseUniforms[u];
                    pass = true;
                    break;
                }
            }
        });
        return bciuniforms;
    }

    resetMaterialUniforms() {
        for(let name in this.shaderSettings.uniformNames) {
            if(this.uniformSettings[name] && this.material.uniforms[name]) {
                this.material.uniforms[name].value = this.uniformSettings[name].default;
                this.baseUniforms[name].value = this.uniformSettings[name].default;
            }
        }
    }

    updateMaterialUniforms() {
        let time = Date.now();
        
        for(let name in this.shaderSettings.uniformNames) {
        
            if(name === 'iResolution') {
                if(this.currentView === 'halfsphere' || this.currentView === 'circle') {
                    this.material.uniforms.iResolution.value.x = this.canvas.width;
                    this.material.uniforms.iResolution.value.y = this.canvas.height;
                } else if (this.currentView !== 'plane') {
                    this.material.uniforms.iResolution.value = new THREE.Vector2(Math.max(this.canvas.width,this.canvas.height), this.canvas.width); //fix for messed up aspect ratio on vrscreen and sphere
                } else {
                    this.material.uniforms.iResolution.value = new THREE.Vector2(this.canvas.width, this.canvas.height); //leave plane aspect alone
                }
            } else if (name === 'iTime') {
                this.material.uniforms.iTime.value = (time-this.startTime)*0.001;
            } else if (name === 'iTimeDelta') {
                this.material.uniforms.iTimeDelta.value = (time-this.lastTime)*0.001;
                this.lastTime = time;
            } else if (name === 'iFrame') {
                this.material.uniforms.iFrame.value++;
            } else if (name === 'iFrameRate') {
                this.material.uniforms.iFrameRate.value = time - this.lastFrame;
                this.lastFrame = time;
            } else if (name === 'iChannelTime') {
                let t = (time-this.startTime)*0.001;
                this.material.uniforms.iChannelTime[0] = t;
                this.material.uniforms.iChannelTime[1] = t;
                this.material.uniforms.iChannelTime[2] = t;
                this.material.uniforms.iChannelTime[3] = t;
            } else if (name === 'iDate') {
                let date = new Date();
                this.material.uniforms.iDate.value.x = date.getYear();
                this.material.uniforms.iDate.value.y = date.getMonth();
                this.material.uniforms.iDate.value.z = date.getDay();
                this.material.uniforms.iDate.value.w = date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds();
            } else if (name === 'iMouse') {
                this.material.uniforms.iMouse= new THREE.Vector4(...this.mousexyzw);
            } else if (name === 'iMouseInput') {
                this.material.uniforms.iMouseInput = this.mouseclicked;
            } else if (name === 'iImage') {
                this.material.uniforms.iImage.value = this.canvas.toDataURL();
            } else if (name === 'iAudio') {
                if(window.audio) {
                    Array.from(window.audio.getAnalyzerData().slice(0,256));
                }
            } else if (name === 'iHEG') {
                if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                    if(this.session.atlas.data.heg[this.heg].ratio.length > 0) {
                        if(!this.hegbaseline) this.hegbaseline = this.session.atlas.data.heg[this.heg].ratio[this.session.atlas.data.heg[this.heg].ratio.length-1];
                        let hegscore = this.session.atlas.data.heg[this.heg].ratio[this.session.atlas.data.heg[this.heg].ratio.length-1] - this.hegbaseline;
                        this.material.uniforms.iHEG.value = hegscore;
                    }
                }
            } else if (name === 'iHRV') {
                if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                
                    if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                        if(this.session.atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                            let hrv = this.session.atlas.data.heg[this.heg].beat_detect.beats[this.session.atlas.data.heg[this.heg].beat_detect.beats.length-1].hrv;
                            this.material.uniforms.iHRV.value = hrv;
                        }
                    }
                }
            } else if (name === 'iHR') {
                if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                
                    if(this.session.atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                        let hr_mod = 60/this.session.atlas.data.heg[this.heg].beat_detect.beats[this.session.atlas.data.heg[this.heg].beat_detect.beats.length-1].bpm;
                        this.material.uniforms.iHR.value = hr_mod;
                    }
                }
            } else if (name === 'iHB') {
                if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                
                    if(this.session.atlas.data.heg[this.heg].beat_detect.beats.length > 0) {
                        this.material.uniforms.iHB.value = 1/(0.001*(time-this.session.atlas.data.heg[this.heg].beat_detect.beats[this.session.atlas.data.heg[this.heg].beat_detect.beats.length-1].t)) 
                    }
                }
            } else if (name === 'iBRV') {
                if(this.session.atlas.data.heg.length>0 && this.session.atlas.settings.deviceConnected === true) {
                    
                    if(this.session.atlas.data.heg[this.heg].beat_detect.breaths.length > 0) {
                        this.material.uniforms.iBRV = this.session.atlas.data.heg[this.heg].beat_detect.breaths[this.session.atlas.data.heg[this.heg].beat_detect.breaths.length-1].brv;
                    }
                }
            } else if(this.session.atlas.settings.eeg === true && this.session.atlas.settings.analyzing === true) { 
                let channel = this.channel;
            
                if (name === 'iFFT') {
                    let data = this.session.atlas.getLatestFFTData(channel)[0];
                    if (data.fft){
                        let fft = eegmath.interpolateArray(channel.fft,256);
                        if(fft) this.material.uniforms.iFFT.value = fft;
                    }
                }
                else if (name === 'iDelta') {
                    this.material.uniforms.iDelta.value = this.session.atlas.getLatestFFTData(channel)[0].mean.delta;                 
                } else if (name === 'iTheta') {
                    this.material.uniforms.iTheta.value = this.session.atlas.getLatestFFTData(channel)[0].mean.theta;              
                } else if (name === 'iAlpha1') {
                    this.material.uniforms.iAlpha1.value = this.session.atlas.getLatestFFTData(channel)[0].mean.alpha1;               
                } else if (name === 'iAlpha2') {
                    this.material.uniforms.iAlpha2.value = this.session.atlas.getLatestFFTData(channel)[0].mean.alpha2;                  
                } else if (name === 'iBeta') {
                    this.material.uniforms.iBeta.value = this.session.atlas.getLatestFFTData(channel)[0].mean.beta;                   
                } else if (name === 'iGamma') {
                    this.material.uniforms.iGamma.value = this.session.atlas.getLatestFFTData(channel)[0].mean.lowgamma;
                } else if (name === 'i40Hz') {
                    this.material.uniforms.i40Hz.value = this.session.atlas.get40HzGamma(this.session.atlas.getEEGDataByChannel(channel))                  
                } else if (name === 'iThetaBeta') {
                    this.material.uniforms.iThetaBeta.value = this.session.atlas.getThetaBetaRatio(this.session.atlas.getEEGDataByChannel(channel))                 
                } else if (name === 'iAlpha1Alpha2') {
                    this.material.uniforms.iAlpha1Alpha2.value = this.session.atlas.getAlphaRatio(this.session.atlas.getEEGDataByChannel(channel))              
                } else if (name === 'iAlphaBeta') {
                    this.material.uniforms.iAlphaBeta.value = this.session.atlas.getAlphaBetaRatio(this.session.atlas.getEEGDataByChannel(channel)) 
                } else if (name === 'iAlphaTheta') {
                    this.material.uniforms.iAlphaTheta.value = this.session.atlas.getAlphaThetaRatio(this.session.atlas.getEEGDataByChannel(channel))
                } else if (this.session.atlas.settings.analysis.eegcoherence === true && name === 'iFrontalAlpha1Coherence') {
                    this.material.uniforms.iFrontalAlpha1Coherence.value = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1') // this.session.atlas.getLatestCoherenceData(0)[0].mean.alpha1;
                }
            } else if (this.uniformSettings[name]) {
                if(this.uniformSettings[name].callback) {
                    this.material.uniforms[name].value = this.uniformSettings[name].callback();
                }
            }
        }

    }

    addUniformSetting(name='newUniform',callback=()=>{return 0;},defaultValue=0,type=undefined,min=0,max=1) {
        this.uniformSettings[name] = {callback:callback,default:defaultValue,min:min,max:max};
        this.baseUniforms[name] = {value:defaultValue};
        if(type) { this.baseUniforms[name].type = type; }
    }

    createMeshGeometry(type='plane',width,height){
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

    setMeshGeometry(type='plane') {
        this.currentView = type;
        this.mesh.geometry = this.createMeshGeometry(type);
    }

    setMeshRotation(anglex=0,angley=Math.PI,anglez=0){
        this.mesh.rotation.set(anglex,angley,anglez);
    }

    setShader = (name='',vertexShader=``,fragmentShader=``,uniformNames=[],author='') => {
        this.shaderSettings.name = name;
        this.shaderSettings.vertexShader = vertexShader;
        this.shaderSettings.fragmentShader = fragmentShader;
        this.shaderSettings.uniformNames = uniformNames;
        this.shaderSettings.author = author;

        let uniforms = this.generateMaterialUniforms();

        this.material = new THREE.ShaderMaterial({
            transparent:true,
            side: THREE.DoubleSide,
            vertexShader: this.shaderSettings.vertexShader,
            fragmentShader: this.shaderSettings.fragmentShader,
            uniforms:uniforms
        });
    }

    swapShader = (onchange=()=>{this.startTime=Date.now()}) => {

        let uniforms = this.generateMaterialUniforms();

        let newMaterial = new THREE.ShaderMaterial({
            vertexShader: this.shaderSettings.vertexShader,
            fragmentShader: this.shaderSettings.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms:uniforms
        });

        this.mesh.material.dispose();
        this.mesh.material = newMaterial;

        onchange();
    }

    setShaderFromText = (fragmentShaderText=this.fragmentTemplate,vertexShaderText=this.vertexTemplate,name='',author='',onchange=()=>{this.startTime=Date.now()}) => {

        this.fragmentTemplate = fragmentShaderText;
        this.vertexTemplate = vertexShaderText;

        // Dynamically Extract Uniforms
        let regex = new RegExp('uniform (.*) (.*);', 'g')
        let result = [...fragmentShader.matchAll(regex)]
        let alluniforms = [];
        result.forEach(a => {
            alluniforms.push(a[2].replace(/(\[.+\])/g, ''))
        });

        this.shaderSettings.name = name;
        this.shaderSettings.vertexShader = vertexShaderText;
        this.shaderSettings.fragmentShader = fragmentShaderText;
        this.shaderSettings.author = author;
        this.shaderSettings.uniformNames = alluniforms;

        this.swapShader(onchange);

    }

    generateGUI(uniformNames){
        let updateUniformsWithGUI = (key,value) => {
            if (this.material.uniforms[key] == null) this.material.uniforms[key] = {};
            this.material.uniforms[key].value = value;
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