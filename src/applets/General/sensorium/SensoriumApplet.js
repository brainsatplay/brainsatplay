import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
import { SoundJS } from '../../../platform/js/frontend/UX/Sound';
import * as settingsFile from './settings'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import galaxyFragmentShader from "./shaders/fractalGalaxy/fragment.glsl"
import whiteFragmentShader from "./shaders/white/fragment.glsl"
import wavesFragmentShader from './shaders/waves/fragment.glsl'
import noiseCircleFragmentShader from './shaders/noiseCircle/fragment.glsl'
import creationFragmentShader from './shaders/creation/fragment.glsl'
import blobFragmentShader from './shaders/voronoiblobs/fragment.glsl'
import fractalpyramidFragmentShader from './shaders/fractalpyramid/fragment.glsl'
import cineshaderlavaFragmentShader from './shaders/cineshaderlava/fragment.glsl'
import octagramsFragmentShader from './shaders/octagrams/fragment.glsl'

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
        this.audio = null;
        this.inputs = [];
        this.controls = [];
        this.indices = [];

        this.looping = false;

        // UI
        this.three = {}
        this.currentShader = null;

        this.three.planes = []

        this.shaders = {
            white: {
                name: 'Whiteout',
                vertexShader: vertexShader,
                fragmentShader: whiteFragmentShader,
                credit: 'Garrett Flynn'
            },
            waves: {
                name: 'Rainbow Waves',
                vertexShader: vertexShader,
                fragmentShader: wavesFragmentShader,
                credit: 'Pixi.js'
            },
            noisecircle: {
                name: 'Noise Circle',
                vertexShader: vertexShader,
                fragmentShader: noiseCircleFragmentShader,
                credit: 'Garrett Flynn'
            },
            creation: {
                name: 'Creation',
                vertexShader: vertexShader,
                fragmentShader: creationFragmentShader,
                credit: 'Danilo Guanabara (Shadertoy)'
            },
            octagrams: {
                name: 'Octagrams',
                vertexShader: vertexShader,
                fragmentShader: octagramsFragmentShader,
                credit: 'whisky_shusuky (Shadertoy)'
            },
            cineshaderlava: {
                name: 'Cineshader Lava',
                vertexShader: vertexShader,
                fragmentShader: cineshaderlavaFragmentShader,
                credit: 'edankwan (Shadertoy)'
            },
            fractalpyramid: {
                name: 'Fractal Pyramid',
                vertexShader: vertexShader,
                fragmentShader: fractalpyramidFragmentShader,
                credit: 'bradjamesgrant (Shadertoy)'
            },
            voronoiblobs: {
                name: 'Voronoi Blobs',
                vertexShader: vertexShader,
                fragmentShader: blobFragmentShader,
                credit: 'Elise (Shadertoy)'
            },
            galaxy: {
                name: 'Galaxy',
                vertexShader: vertexShader,
                fragmentShader: galaxyFragmentShader,
                credit: 'JoshP (Shadertoy)'
            }
        }

        // Setup Neurofeedback
        this.defaultNeurofeedback = function defaultNeurofeedback(){return 0.5 + 0.5*Math.sin(Date.now()/2000)} // default neurofeedback function
        this.getNeurofeedback = this.defaultNeurofeedback


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

        this.history = 5 
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
            <div class="brainsatplay-neurofeedback-container" style="position:absolute; top: 25px; right: 25px;">
            <div style="position:absolute; top: 50px; right: 0px; z-index: 1;">
                <select id='${props.id}selector'></select>
            </div>
            </div> 
                <div id='`+props.id+`menu' style='position:absolute; z-index:2; position: absolute; top: 0; left: 0;'> 
                    <button id='`+props.id+`showhide' style='z-index:2; opacity:0.2;'>Hide UI</button> 
                    <button id='${props.id}addsound'>Add Sound</button>
                    <div id='${props.id}filemenu'></div>
                    <div id='${props.id}soundcontrols'></div> 
                    </div>
                </div>    
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id+'addsound').onclick = () => {
                this.addSoundInput();
            };

            let selector = document.getElementById(`${this.props.id}selector`)
            Object.keys(this.shaders).forEach((k) => {
                selector.innerHTML += `<option value='${k}'>${this.shaders[k].name}</option>`
            })
            
            this.currentShader = this.shaders[selector.value]

            selector.onchange = (e) => {
                if (e.target.value != 'Gallery'){
                    this.shaders[0] = this.shaders[e.target.value]
                    this.shaders[e.target.value] = this.currentShader
                    this.currentShader = this.shaders[0]
                    this.updateShader()
                } else {
                    
                }
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
const planeGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1)
let tStart = Date.now()

let shaderKeys = Object.keys(this.shaders)
let numShaders = shaderKeys.length
shaderKeys.forEach((k,i) => {

    if (i === 0){
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: this.shaders[k].vertexShader,
            fragmentShader: this.shaders[k].fragmentShader,
            uniforms:
            {
                aspect: {value: this.three.meshWidth / this.three.meshHeight},
                amplitude: {value: 0.75},
                times: {value: this.timeBuffer},
                colors: {value: this.colorBuffer.flat(1)},
                mouse: {value: [0,0]}, //[this.mouse.x, this.mouse.y],
                neurofeedback: {value: this.noiseBuffer}
            }
        })

        let radius = 0;//10
        let plane = new THREE.Mesh(planeGeometry, this.material)
        let angle = (2 * Math.PI * i/numShaders) - Math.PI/2
        plane.position.set(radius*(Math.cos(angle)),0,radius*(Math.sin(angle)))
        plane.rotation.set(0,-angle - Math.PI/2,0)
        this.three.planes.push(plane)
        this.three.scene.add(plane)
    }
})

// Animate
let startTime = Date.now()
this.render = () => {

    // setTimeout( () => {
        if (this.three.renderer.domElement != null){

                // Organize Brain Data 
                this.setBrainData(this.session.atlas.data.eeg)

                // Change Color
                let c = this.getColor()
                this.colorBuffer.shift()
                this.colorBuffer.push(c)

                this.timeBuffer.shift()
                this.timeBuffer.push((Date.now() - startTime)/1000)

                this.noiseBuffer.shift()
                let neurofeedback = this.getNeurofeedback()
                this.noiseBuffer.push(neurofeedback)
                    
                // Set Uniforms
                this.three.planes.forEach(plane => {
                    plane.material.uniforms.colors.value = this.colorBuffer.flat(1) 
                    plane.material.uniforms.times.value = this.timeBuffer
                    plane.material.uniforms.neurofeedback.value = this.noiseBuffer
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
        this.controls.enabled = true;
    }, 100)
    
}

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.indices.forEach((i)=>{
            this.audio.stopSound(i);
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
                p.material.uniforms.aspect.value = this.three.meshWidth / this.three.meshHeight
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
                <div id='${props.id}fileWrapper${idx}' style='font-size:10px;'> 
                    <div id='${props.id}fileinfo${idx}'></div> 
                    Sounds:<select id='${props.id}select${idx}'><option value=''>None</option></select> 
                    <button id='${props.id}uploadedFile${idx}'>Add File</button>
                    <div id='${props.id}status${idx}'></div>
                </div>
            `;
        }

        let controls = (idx=0, props=this.props) => {
            return `
                <div id='${props.id}controlWrapper${idx}'>
                    <button id='${props.id}play${idx}'>Play ${idx}</button>
                    <button id='${props.id}mute${idx}'>Mute ${idx}</button>
                    <button id='${props.id}stop${idx}'>Remove ${idx}</button>
                    Feedback ${idx}:
                    <select id='${props.id}select${idx}'>
                        <option value='none'>None</option>
                        <option value='hr'>Heart Beat</option>
                        <option value='heg'>HEG Ratio</option>
                        <option value='hrv'>Heart Rate Variability</option>
                        <option value='delta'>Delta Bandpower</option>
                        <option value='theta'>Theta Bandpower</option>
                        <option value='alpha1'>Alpha1 Bandpower</option>
                        <option value='alpha2'>Alpha2 Bandpower</option>
                        <option value='beta'>Beta Bandpower</option>
                        <option value='gamma'>Low Gamma Bandpower</option>
                        <option value='40hz'>40Hz Bandpower</option>
                        <option value='tb'>Theta/Beta Ratio</option>
                        <option value='a12'>Alpha 2/1 Ratio</option>
                        <option value='ab'>Alpha/Beta Ratio</option>
                        <option value='acoh'>Frontal Alpha Coherence</option>
                    </select>
                </div>
            `;
        }

        let idx = this.inputs.length;

        document.getElementById(this.props.id+'filemenu').insertAdjacentHTML('beforeend',fileinput(idx));
        document.getElementById(this.props.id+'uploadedFile'+idx).onclick = () => {
            if(!this.audio) this.audio = new SoundJS();
            if (this.audio.ctx===null) {return;};
            this.audio.decodeLocalAudioFile(()=>{    
                document.getElementById(this.props.id+'soundcontrols').insertAdjacentHTML('beforeend',controls(idx));
                
                this['muted'+idx] = false;
                this.controls.push(document.getElementById(this.props.id+'controlWrapper'+idx));
                this.loadSoundControls(idx);
                document.getElementById(this.props.id+'status'+idx).innerHTML = "";
            }, ()=> { document.getElementById(this.props.id+'status'+idx).innerHTML = "Loading..." });
            
        }
        this.indices.push(idx);
        this.inputs.push(document.getElementById(this.props.id+'fileWrapper'+idx));
    }


    //doSomething(){}
    loadSoundControls = (idx=0) => {
        
        let i = this.audio.sourceList.length-1;
        document.getElementById(this.props.id+'play'+idx).onclick = () => {
            console.log(i)
            this.audio.playSound(i,0,true);
        }
        document.getElementById(this.props.id+'stop'+idx).onclick = () => {
            if(this.audio.sourceList[i]) {
                try{this.audio.playSound(i,0,false);} catch(er) {}
                this.audio.stopSound(i);
                
            }
            this.inputs[i].parentNode.removeChild(this.inputs[i]);
            this.controls[i].parentNode.removeChild(this.controls[i]);
            if(this.indices.length-1 !== i) { 
                this.indices.map((el,i)=>{
                    if(i > i) { return el--; } //subtract off these indices
                });  
            }
            this.indices.splice(i,1);
            
        }
        document.getElementById(this.props.id+'mute'+idx).onclick = () => {
            if(this.audio.sourceGains[i].gain.value !== 0){
                this['lastgain'+idx] = this.audio.sourceGains[i].gain.value;
                this.audio.sourceGains[i].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                this['muted'+idx] = true;
                
            } else { this['muted'+idx] = false; this.audio.sourceGains[i].gain.setValueAtTime(this['lastgain'+idx], this.audio.ctx.currentTime); }
        }
    };

    animate = () => {
        if(this.looping){
            this.indices.forEach((idx)=> {
                let option = document.getElementById(this.props.id+'select'+idx).value;
                if(!this['muted'+idx]){
                    if(this.session.atlas.data.heg.length>0) {
                        if(option === 'hr') {
                            this.audio.sourceGains[len].gain.setValueAtTime( //make the sound fall off on a curve based on when a beat occurs
                                Math.max(0,Math.min(1/(0.001*(Date.now()-this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].t)),1)), 
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'heg') { //Raise HEG ratio compared to baseline
                            if(!this['hegbaseline'+idx]) this['hegbaseline'+idx] = this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1];
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.min(Math.max(0,this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1]-this['hegbaseline'+idx]),1), //
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'hrv') { //Maximize HRV, set the divider to set difficulty
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.max(0,Math.min(this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].hrv/30,1)), //
                                this.audio.ctx.currentTime
                            );
                        } 
                    }
                    if(this.session.atlas.settings.eeg === true && this.session.atlas.settings.analyzing === true) { 
                        if (option === 'delta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime); //bandpowers should be normalized to microvolt values, so set these accordingly
                        } else if (option === 'theta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha1') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha2') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'beta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'gamma') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === '40hz') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'tb') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'a12') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'ab') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (this.session.atlas.settings.coherence === true && option === 'acoh') {
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.max(Math.min(0,this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')),1), 
                                this.audio.ctx.currentTime
                            );
                        }
                    }
                }
            });
        
            setTimeout(()=>{this.animate();},16);
        }
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


    updateShader = () => {

        let newMaterial = new THREE.ShaderMaterial({
            vertexShader: this.currentShader.vertexShader,
            fragmentShader: this.currentShader.fragmentShader,
            transparent: this.three.planes[0].material.transparent,
            uniforms: this.three.planes[0].material.uniforms
        })
        this.three.planes[0].material.dispose()
        this.three.planes[0].material = newMaterial
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

  getColor(){
    let currentColor = [0,0,0]
    let distances = this.brainData
    let maxDist = Math.max(...distances)
    if (distances.every(d => d == maxDist)) {
        currentColor = [0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/1000)),0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/500)),0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/200))]
    } else {
        // let ind = this.indexOfMax(distances)
        // if (this.currentColors == null) this.currentColors = [{ind: ind, color: this.brainMetrics[ind].color},{ind: ind, color: this.brainMetrics[ind].color}]
        // if (ind != this.currentColors[1].ind) {this.currentColors.shift(); this.currentColors.push({ind: ind, color: this.brainMetrics[ind].color}); this.lastColorSwitch=Date.now()}
        // for (let i = 0; i < 3; i++){
        //     currentColor[i] = this.currentColors[0].color[i] + (this.currentColors[1].color[i] + this.currentColors[0].color[i]) * Math.min(1,(Date.now() - this.lastColorSwitch)/100000)
        // }
        for (let i = 0; i < 3; i++){
            this.brainMetrics.forEach((dict,ind) => {
                currentColor[i] += (dict.color[i] * distances[ind]/maxDist)
            })
        }
    }
    return currentColor
}

} 
