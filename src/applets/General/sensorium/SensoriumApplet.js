import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
import { SoundJS } from '../../../platform/js/frontend/UX/Sound';
import * as settingsFile from './settings'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import galaxyFragmentShader from "./shaders/fractalGalaxy/fragment.glsl"
import negaGalaxyFragmentShader from "./shaders/nega_fractalGalaxy/fragment.glsl"
import wavesFragmentShader from './shaders/waves/fragment.glsl'
import noiseCircleFragmentShader from './shaders/noiseCircle/fragment.glsl'
import creationFragmentShader from './shaders/creation/fragment.glsl'
import blobFragmentShader from './shaders/voronoiblobs/fragment.glsl'
import fractalpyramidFragmentShader from './shaders/fractalpyramid/fragment.glsl'
import cineshaderlavaFragmentShader from './shaders/cineshaderlava/fragment.glsl'
import octagramsFragmentShader from './shaders/octagrams/fragment.glsl'

import {addChannelOptions, addCoherenceOptions } from '../../../platform/js/frontend/menus/selectTemplates'

//Example Applet for integrating with the UI Manager
export class SensoriumApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        // Audio
        this.soundStruct = { source:{}, input:{}, controls:{}, feedback:{}, muted:false, lastGain:1, uiIdx:false, sourceIdx:false };
        this.visuals = [];
        this.sounds = [];//array of soundStructs

        this.looping = false;
        this.hidden = false;

        // UI
        this.three = {}
        this.currentShader = null;

        this.three.planes = []

        this.shaders = {
            galaxy: {
                name: 'Galaxy',
                vertexShader: vertexShader,
                fragmentShader: galaxyFragmentShader,
                uniforms: ['iHRV','iHEG','iHR'],
                credit: 'JoshP (Shadertoy)'
            },
            negagalaxy: {
                name: 'Nega Galaxy',
                vertexShader: vertexShader,
                fragmentShader: negaGalaxyFragmentShader,
                uniforms: ['iHRV','iHEG','iHR'],
                credit: 'JoshP (Shadertoy) * JoshB'
            },
            waves: {
                name: 'Rainbow Waves',
                vertexShader: vertexShader,
                fragmentShader: wavesFragmentShader,
                uniforms: [],
                credit: 'Pixi.js'
            },
            noisecircle: {
                name: 'Noise Circle',
                vertexShader: vertexShader,
                fragmentShader: noiseCircleFragmentShader,
                uniforms: ['iFFT'],
                credit: 'Garrett Flynn'
            },
            creation: {
                name: 'Creation',
                vertexShader: vertexShader,
                fragmentShader: creationFragmentShader,
                uniforms: [],
                credit: 'Danilo Guanabara (Shadertoy)'
            },
            octagrams: {
                name: 'Octagrams',
                vertexShader: vertexShader,
                fragmentShader: octagramsFragmentShader,
                uniforms: [],
                credit: 'whisky_shusuky (Shadertoy)'
            },
            cineshaderlava: {
                name: 'Cineshader Lava',
                vertexShader: vertexShader,
                fragmentShader: cineshaderlavaFragmentShader,
                uniforms: [],
                credit: 'edankwan (Shadertoy)'
            },
            fractalpyramid: {
                name: 'Fractal Pyramid',
                vertexShader: vertexShader,
                fragmentShader: fractalpyramidFragmentShader,
                uniforms: [],
                credit: 'bradjamesgrant (Shadertoy)'
            },
            voronoiblobs: {
                name: 'Voronoi Blobs',
                vertexShader: vertexShader,
                fragmentShader: blobFragmentShader,
                uniforms: [],
                credit: 'Elise (Shadertoy)'
            },
        }

        this.modifiers = {}

        this.brainMetrics = [
            {name:'delta',label: 'Delta', color: [0,0.5,1]}, // Blue-Cyan
            {name:'theta',label: 'Theta',color: [1,0,1]}, // Purple
            {name:'alpha1',label: 'Low Alpha',color:[0,1,0]}, // Green
            {name:'alpha2',label: 'High Alpha',color: [0,1,0]}, // Green
            {name:'beta',label: 'Beta',color: [1,1,0]}, // Yellow
            {name:'lowgamma',label: 'Gamma',color: [1,0,0]} // Red
        ]

        this.brainData = []   
        this.lastColorSwitch=Date.now() 

        this.history = 5; 
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%; position: relative;'>
            <div style="position:absolute; top: 75px; right: 25px; z-index: 1;">
                <select id='${props.id}shaderSelector'></select>
            </div>
                <div id='`+props.id+`menu' style='position:absolute; z-index:2; position: absolute; top: 0; left: 0;'> 
                    <button id='`+props.id+`showhide' style='z-index:2; opacity:0.2;'>Hide UI</button> 
                    <button id='${props.id}addeffect'>Add Effects</button>
                    <span id='${props.id}effectmenu'></span>
                    </div>
                </div>    
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id+'addeffect').onclick = () => {
                this.addSoundInput();
            };

            let selector = document.getElementById(`${this.props.id}shaderSelector`)
            Object.keys(this.shaders).forEach((k) => {
                selector.innerHTML += `<option value='${k}'>${this.shaders[k].name}</option>`
            })
            
            this.currentShader = this.shaders[selector.value];

            selector.onchange = (e) => {
                console.log('changed')
                if (e.target.value != 'Gallery'){
                    this.currentShader = this.shaders[selector.value]
                    this.swapShader()
                } else {
                    
                }
            }

            let showhide = document.getElementById(props.id+'showhide');

            showhide.onclick = () => {
                if(this.hidden == false) {
                    this.hidden = true;
                    document.getElementById(props.id+"showhide").innerHTML = "Show UI";
                    document.getElementById(props.id+'addsound').style.display = "none";
                    document.getElementById(props.id+'selectorcontainer').style.display = "none";
                    document.getElementById(props.id+'nfb').style.display = "none";
                    document.getElementById(props.id+'filemenu').style.display = "none";
                    document.getElementById(props.id+'soundcontrols').style.display = "none";
                }
                else{
                    this.hidden = false;
                    document.getElementById(props.id+"showhide").innerHTML = "Hide UI";
                    document.getElementById(props.id+'addsound').style.display = "";
                    document.getElementById(props.id+'selectorcontainer').style.display = "";
                    document.getElementById(props.id+'nfb').style.display = "";
                    document.getElementById(props.id+'filemenu').style.display = "";
                    document.getElementById(props.id+'soundcontrols').style.display = "";
                }
            }

            showhide.onmouseover = () => {
                showhide.style.opacity = 1.0;
            }
            showhide.onmouseleave = () => {
                showhide.style.opacity = 0.2;
            }
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.


        //Add whatever else you need to initialize
        this.looping = true;
        
        this.ct = 0;

/**
 * Three.js Shader
 */

this.colorBuffer = Array.from({length: this.history}, e => [1.0,1.0,1.0])
this.timeBuffer = Array.from({length: this.history}, e => 0)
this.noiseBuffer = Array.from({length: this.history}, e => 1.0)

this.appletContainer = document.getElementById(this.props.id)

/**
 * Scene
 */
this.three.scene = new THREE.Scene()

/**
 * Camera
 */

this.baseCameraPos = new THREE.Vector3(0,0,3)
this.camera = new THREE.PerspectiveCamera(75, this.appletContainer.offsetWidth/this.appletContainer.offsetHeight, 0.01, 1000)
this.camera.position.z = this.baseCameraPos.z//*1.5

/**
 * Texture Params
 */

 let containerAspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight //this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
this.fov_y = this.camera.position.z * this.camera.getFilmHeight() / this.camera.getFocalLength();

 // Square
//  this.three.meshWidth = this.three.meshHeight = Math.min(((fov_y)* this.camera.aspect) / containerAspect, (fov_y)* this.camera.aspect);

// Fit Screen
this.three.meshWidth = this.fov_y * this.camera.aspect
this.three.meshHeight = this.three.meshWidth/containerAspect

// Renderer
this.three.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
this.three.renderer.setSize( this.appletContainer.offsetWidth, this.appletContainer.offsetHeight );
this.appletContainer.appendChild( this.three.renderer.domElement );
this.three.renderer.domElement.style.width = '100%'
this.three.renderer.domElement.style.height = '100%'
this.three.renderer.domElement.id = `${this.props.id}canvas`
this.three.renderer.domElement.style.opacity = '0'
this.three.renderer.domElement.style.transition = 'opacity 1s'

// Controls
this.controls = new OrbitControls(this.camera, this.three.renderer.domElement)
this.controls.enablePan = false
this.controls.enableDamping = true
this.controls.enabled = false;
this.controls.minPolarAngle = 2*Math.PI/6; // radians
this.controls.maxPolarAngle = 4*Math.PI/6; // radians
this.controls.minDistance = this.baseCameraPos.z; // radians
this.controls.maxDistance = this.baseCameraPos.z*10; // radians

// Plane
const planeGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1);
let tStart = Date.now();

let shaderKeys = Object.keys(this.shaders);
let numShaders = shaderKeys.length;
shaderKeys.forEach((k,i) => {

    if (i === 0){
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: this.shaders[k].vertexShader,
            fragmentShader: this.shaders[k].fragmentShader,
            uniforms: // Default Uniforms
            {
                iResolution: {value: new THREE.Vector2(this.three.meshWidth, this.three.meshHeight)},
                iTime: {value: 0},
            }
        })

        let radius = 0;//10
        let plane = new THREE.Mesh(planeGeometry, this.material)
        plane.name = k
        let angle = (2 * Math.PI * i/numShaders) - Math.PI/2
        plane.position.set(radius*(Math.cos(angle)),0,radius*(Math.sin(angle)))
        plane.rotation.set(0,-angle - Math.PI/2,0)
        this.three.planes.push(plane)
        this.three.scene.add(plane)
    }
});

// Animate
this.startTime = Date.now()
this.render = () => {

    // setTimeout( () => {
        if (this.three.renderer.domElement != null){

                // Organize Brain Data 
                this.setBrainData(this.session.atlas.data.eeg)

                this.three.planes.forEach(p => {
                    this.updateMaterialUniforms(p.material,this.modifiers);
                })

                this.controls.update()
                this.three.renderer.render( this.three.scene, this.camera );
        }
    // }, 1000 / 60 );
};

    let animate = () => {
        this.three.renderer.setAnimationLoop( this.render );
    }

    animate()
    setTimeout(() => {
        this.three.renderer.domElement.style.opacity = '1'
        // this.controls.enabled = true;
    }, 100)
    
}

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.sounds.forEach((struct)=>{
            if(struct.sourceIdx) window.audio.stopSound(struct.sourceIdx);
        });
        this.three.renderer.setAnimationLoop( null );
        this.clearThree()
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if(this.three.renderer) {
            this.camera.aspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
            this.camera.updateProjectionMatrix()
            // Resize Plane Geometry
            let containerAspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
            // let fov_y = this.camera.position.z * this.camera.getFilmHeight() / this.camera.getFocalLength();
            // this.three.meshWidth = this.three.meshHeight = Math.min(((fov_y)* this.camera.aspect) / containerAspect, (fov_y)* this.camera.aspect);
            this.three.meshWidth = this.fov_y * this.camera.aspect
            this.three.meshHeight = this.three.meshWidth/containerAspect

            let newGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1)
            this.three.planes.forEach(p => {
                p.geometry.dispose()
                p.geometry = newGeometry
                p.material.uniforms.iResolution.value = new THREE.Vector2(this.three.meshWidth, this.three.meshHeight)
            })
            
            this.three.renderer.setSize(this.appletContainer.offsetWidth, this.appletContainer.offsetHeight);
        }
        this.session.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    addSoundInput = () => {
        let fileinput = (idx=0, props=this.props) => {
            return `
                Feedback ${idx}: 
                <span id='${props.id}selectors${idx}'></span>
                <span id='${props.id}fileWrapper${idx}' style='font-size:10px;'> 
                    <span id='${props.id}fileinfo${idx}'></span> 
                    Sounds:<select id='${props.id}select${idx}'><option value=''>None</option></select> 
                    <button id='${props.id}uploadedFile${idx}'>Add File</button> ${idx}
                    <span id='${props.id}status${idx}'></span>
                </span>
            `;
        }

        let controls = (idx=0, props=this.props) => {
            return `
                <span id='${props.id}controlWrapper${idx}'>
                    <button id='${props.id}play${idx}'>${idx}: Play</button>
                    <button id='${props.id}mute${idx}'>${idx}: Mute</button>
                    <button id='${props.id}stop${idx}'>${idx}: Remove</button>
                </span>
            `;
        }
        
        let fdback = (idx=0, props=this.props) => {
            return `
            <select id='${props.id}select${idx}'>
                <option value='none'>None</option>
                <option value='audio'>Audio FFT</option>
                <option value='heg_heartbeat'>Heart Beat</option>
                <option value='heg_hr'>Heart Rate</option>
                <option value='heg'>HEG Ratio</option>
                <option value='heg_hrv'>Heart Rate Variability</option>
                <option value='eeg_bandpowers'>EEG Bandpower FFT</option>
                <option value='eeg_delta'>Delta Bandpower</option>
                <option value='eeg_theta'>Theta Bandpower</option>
                <option value='eeg_alpha1'>Alpha1 Bandpower</option>
                <option value='eeg_alpha2'>Alpha2 Bandpower</option>
                <option value='eeg_beta'>Beta Bandpower</option>
                <option value='eeg_gamma'>Low Gamma Bandpower</option>
                <option value='eeg_40hz'>40Hz Bandpower</option>
                <option value='eeg_tb'>Theta/Beta Ratio</option>
                <option value='eeg_a12'>Alpha 2/1 Ratio</option>
                <option value='eeg_ab'>Alpha/Beta Ratio</option>
                <option value='eeg_acoh'>Frontal Alpha Coherence</option>
            </select>
            <select id='${props.id}channel${idx}' style='display:none;'></select>
            `;
        }

        let idx = this.ct; this.ct++;

        let newSound = JSON.parse(JSON.stringify(this.soundStruct));
        this.sounds.push(newSound);
        newSound.uiIdx = idx;
        
        document.getElementById(this.props.id+'effectmenu').insertAdjacentHTML('beforeend',`<div id='${this.props.id}effectWrapper${idx}'>`+fileinput(idx)+`</div>`);
        newSound.input = document.getElementById(this.props.id+'fileWrapper'+idx);

        document.getElementById(this.props.id+'selectors'+newSound.uiIdx).insertAdjacentHTML('beforeend',fdback(idx));
        newSound.feedback = document.getElementById(this.props.id+'select'+newSound.uiIdx)

        document.getElementById(this.props.id+'select'+newSound.uiIdx).onchange = () => {
            let value = document.getElementById(this.props.id+'select'+newSound.uiIdx).value;
            console.log(value)
            if(value.includes('eeg')){
                document.getElementById(this.props.id+'channel'+newSound.uiIdx).style.display = "";
                if(value.includes('coh')) {
                    addCoherenceOptions(this.props.id+'channel'+newSound.uiIdx,this.session.atlas.data.coherence);
                } else {
                    addChannelOptions(this.props.id+'channel'+newSound.uiIdx,this.session.atlas.data.eegshared.eegChannelTags);
                }
            } else if (value.inclues('heg')) {
                document.getElementById(this.props.id+'channel'+newSound.uiIdx).style.display = "none";
            }
        }


        document.getElementById(this.props.id+'uploadedFile'+idx).onclick = () => {
            if(!window.audio) window.audio = new SoundJS();
            if (window.audio.ctx===null) {return;};

            window.audio.decodeLocalAudioFile((sourceListIdx)=>{    
                document.getElementById(this.props.id+'effectWrapper'+idx).insertAdjacentHTML('beforeend',controls(idx));
                newSound.controls = document.getElementById(this.props.id+'controlWrapper'+idx);
                newSound.source = window.audio.sourceList[sourceListIdx]; 
                newSound.sourceIdx = sourceListIdx;
                newSound.input.style.display='none';
                document.getElementById(this.props.id+'status'+idx).innerHTML = "Loading..." 

                this.loadSoundControls(newSound);
                document.getElementById(this.props.id+'status'+idx).innerHTML = "";
            }, 
            ()=> { 
                
            });
            
        }
        
        
    }


    //doSomething(){}
    loadSoundControls = (newSound) => {
        
        document.getElementById(this.props.id+'play'+newSound.uiIdx).onclick = () => {
            try{window.audio.playSound(newSound.sourceIdx,0,true);}catch(er){}
        }

        document.getElementById(this.props.id+'stop'+newSound.uiIdx).onclick = () => {
            
            try{window.audio.playSound(newSound.sourceIdx,0,false);} catch(er) {}
            window.audio.stopSound(newSound.sourceIdx);
            
            newSound.input.parentNode.removeChild(newSound.input);
            newSound.controls.parentNode.removeChild(newSound.controls);

            let thisidx=0;
            this.sounds.forEach((soundStruct,j)=> {
                if(soundStruct.sourceIdx === newSound.sourceIdx) thisidx = j; 
                else if(soundStruct.sourceIdx > newSound.sourceIdx) {
                    soundStruct.sourceIdx--;
                    this.loadSoundControls(soundStruct);
                }

            });
            this.sounds.splice(thisidx,1);

        }

        document.getElementById(this.props.id+'mute'+newSound.uiIdx).onclick = () => {
            if(window.audio.sourceGains[newSound.sourceIdx].gain.value !== 0){
                newSound.lastGain = window.audio.sourceGains[newSound.sourceIdx].gain.value;
                window.audio.sourceGains[newSound.sourceIdx].gain.setValueAtTime(0, window.audio.ctx.currentTime);
                newSound.muted = true;
                
            } else {  newSound.muted = false; window.audio.sourceGains[newSound.sourceIdx].gain.setValueAtTime(newSound.lastGain, window.audio.ctx.currentTime); }
        }
    };

    animate = () => {
        if(this.looping){
            this.modifiers = {};
            this.sounds.forEach((soundStruct)=> {
                let option = soundStruct.feedback.value;
                if(!soundStruct.muted){
                    if(this.session.atlas.data.heg.length>0) {
                        if(option === 'heg_heartbeat') { //Heart Beat causing tone to fall off
                            modifiers.iHB = 1/(0.001*(Date.now()-this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].t)) 
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime( //make the sound fall off on a curve based on when a beat occurs
                                Math.max(0,Math.min(modifiers.iHB,1)), 
                                window.audio.ctx.currentTime
                            ); 
                            this.modifiers.iHB = 1/(Date.now()-this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].t) //heart beat gives a decreasing value starting at 1 which signifies when a heart beat occurred
                        } else if (option === 'heg_hr') { //Heart rate modifies play speed
                            let hr_mod = 60/this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].bpm;
                            soundStruct.source.playBackRate.value = hr_mod;
                            this.modifiers.iHR = this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].bpm;
                        }
                         else if (option === 'heg') { //Raise HEG ratio compared to baseline
                            if(!soundStruct.hegbaseline) soundStruct.hegbaseline = this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1];
                            let hegscore = this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1]-soundStruct.hegbaseline;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.min(Math.max(0,hegscore),1), //
                                window.audio.ctx.currentTime
                            );
                            this.modifiers.iHEG = hegscore; //starts at 0
                        } else if (option === 'heg_hrv') { //Maximize HRV, set the divider to set difficulty
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.max(0,Math.min(this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].hrv/30,1)), //
                                window.audio.ctx.currentTime
                            );
                            this.modifiers.iHRV = this.getData("iHRV");
                        } 
                    }
                    if(this.session.atlas.settings.eeg === true && this.session.atlas.settings.analyzing === true) { 
                        let channel = document.getElementById(this.props.id+'channel'+soundStruct.uiIdx).value;
                        if (option === 'eeg_delta') {
                            this.modifiers.iDelta = this.session.atlas.getLatestFFTData(channel)[0].mean.delta;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iDelta/50,1)), window.audio.ctx.currentTime); //bandpowers should be normalized to microvolt values, so set these accordingly
                        } else if (option === 'eeg_theta') {
                            this.modifiers.iTheta = this.session.atlas.getLatestFFTData(channel)[0].mean.theta;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iTheta/30,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_alpha1') {
                            this.modifiers.iAlpha1 = this.session.atlas.getLatestFFTData(channel)[0].mean.alpha1;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iAlpha1/20,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_alpha2') {
                            this.modifiers.iAlpha2 = this.session.atlas.getLatestFFTData(channel)[0].mean.alpha2;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iAlpha2/20,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_beta') {
                            this.modifiers.iBeta = this.session.atlas.getLatestFFTData(channel)[0].mean.beta;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iBeta/10,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_gamma') {
                            this.modifiers.iGamma = this.session.atlas.getLatestFFTData(channel)[0].mean.lowgamma;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iGamma/5,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_40hz') {
                            this.modifiers.i40Hz = this.session.atlas.get40HzGamma(this.session.atlas.getEEGDataByChannel(channel))
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.i40Hz/5,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_tb') {
                            this.modifiers.iThetaBeta = this.session.atlas.getThetaBetaRatio(this.session.atlas.getEEGDataByChannel(channel))
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iThetaBeta,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_a12') {
                            this.modifiers.iAlpha1Alpha2 = this.session.atlas.getAlphaRatio(this.session.atlas.getEEGDataByChannel(channel))
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iAlpha1Alpha2,1)), window.audio.ctx.currentTime);
                        } else if (option === 'eeg_ab') {
                            this.modifiers.iAlphaBeta = this.session.atlas.getAlphaBetaRatio(this.session.atlas.getEEGDataByChannel(channel))
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(Math.max(0,Math.min(modifiers.iAlphaBeta,1)), window.audio.ctx.currentTime);
                        } else if (this.session.atlas.settings.coherence === true && option === 'eeg_acoh') {
                            this.modifiers.iAlpha1Coherence = this.session.atlas.getLatestCoherenceData(channel)[0].mean.alpha1;
                            window.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.min(Math.max(0,this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')),1), 
                                window.audio.ctx.currentTime
                            );
                        } else if (option === 'eeg_bandpowers') {
                            this.modifiers.iFFT = this.getData("iFFT");
                        } 
                    }
                    if(option === 'audio') {
                        var array = new Uint8Array(window.audio.analyserNode.frequencyBinCount);
                        this.modifiers.iFFT = window.audio.analyserNode.getByteFrequencyData(array);
                    }
                }
            });

            setTimeout(()=>{this.animate();},16);
        }
    }

    swapShader = () => {

        let newMaterial = new THREE.ShaderMaterial({
            vertexShader: this.currentShader.vertexShader,
            fragmentShader: this.currentShader.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
        })

        this.updateMaterialUniforms(newMaterial,this.modifiers);

        this.three.planes.forEach(p => {
            p.material.dispose();
            p.material = newMaterial;          
        })
    }

    getData(u) {
        if (u === 'iFFT'){
            let channel;
            if(!ch) {
                channel = this.session.atlas.getLatestFFTData()[0];
            } else { channel = this.session.atlas.getLatestFFTData(ch); }
            return  channel.fft;
        }
        else if (u === 'iHRV'){
            return  this.session.atlas.heg[0].beat_detect.beats[this.session.atlas.heg[0].beat_detect.beats.length-1].hrv;
        }
        // Defaults
        else if (u === 'iTime'){
            return  (Date.now() - this.startTime)/1000; // Seconds
        }
        else if (u === 'iResolution'){
            return  new THREE.Vector2(this.three.meshWidth, this.three.meshHeight);
        }
    }

    updateMaterialUniforms = (material,modifiers={}) => {
        ['iResolution','iTime',...this.currentShader.uniforms].forEach(u => {

            if (material.uniforms[u] == null) material.uniforms[u] = {}

            /* todo
                add Uniforms for each selector value
            */

            else if (u === 'iFFT' && modifiers.iFFT){
                material.uniforms[u].value = modifiers.iFFT;
            }

            else if (u === 'iHRV' && modifiers.iHRV){
                material.uniforms[u].value = modifiers.iHRV;
            }
            // Defaults
            else if (u === 'iTime'){
                material.uniforms[u].value = (Date.now() - this.startTime)/1000; // Seconds
            }

            else if (u === 'iResolution'){
                material.uniforms[u].value = new THREE.Vector2(this.three.meshWidth, this.three.meshHeight);
            }
        })

        return material
    }
    


    /* 
    UI Stuff
    */

    // Clear Three.js Scene Completely
    clearThree(){
        for (let i = this.three.scene.children.length - 1; i >= 0; i--) {
            const object = this.three.scene.children[i];
            if (object.type === 'Mesh') {
                object.geometry.dispose();
                object.material.dispose();
            }
            this.three.scene.remove(object);
        }
        this.three.scene = null;
        this.three.renderer.domElement = null;
        this.three.renderer = null;
    }

    setBrainData(eeg_data){
        this.brainData = []
        this.brainMetrics.forEach((dict,i) => {
            this.brainData.push([])
            eeg_data.forEach((data) => {
                this.brainData[i] = data.means[dict.name].slice(data.means[dict.name].length-20)
            })
        })
        this.brainData = this.brainData.map(data => {
            if (data.length > 0) return data.reduce((tot,curr) => tot + curr)
            else return 1
        })  
  }
} 
