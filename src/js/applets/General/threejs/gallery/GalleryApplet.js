import {Session} from '../../../../../library/src/Session'
import {DOMFragment} from '../../../../../library/src/ui/DOMFragment'
 
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import wavesFragmentShader from './shaders/waves/fragment.glsl'
import noiseCircleFragmentShader from './shaders/noiseCircle/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import * as settingsFile from './settings'

export class GalleryApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.info = settingsFile.settings
        this.session = session; //Reference to the Session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.three = {}

        this.currentShader = null;

        this.shaders = {
            waves: {
                name: 'Rainbow Waves',
                vertexShader: vertexShader,
                fragmentShader: wavesFragmentShader
            },
            box: {
                name: 'Noise Circle',
                vertexShader: vertexShader,
                fragmentShader: noiseCircleFragmentShader
            },
            // white: {
            //     name: 'White Box',
            //     vertexShader: vertexShader,
            //     fragmentShader: whiteFragmentShader
            // },
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

    init() {

        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' class="wrapper" style='height:100%; width:100%; position: relative; overflow: none;'>
                <div id='${props.id}renderer-container'><canvas id='${props.id}canvas'></canvas></div>
                <div style="position:absolute; top: 0; right: 0; z-index: 1; padding: 25px;">
                    <select id='${props.id}selector'></select>
                </div>
                <div class="brainsatplay-neurofeedback-container" style="margin-top: 25px; position:absolute; top: 0; left: 0; z-index: 1; ">
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            let selector = document.getElementById(`${this.props.id}selector`)
            Object.keys(this.shaders).forEach((k) => {
                selector.innerHTML += `<option value='${k}'>${this.shaders[k].name}</option>`
            })
            
            this.currentShader = this.shaders[selector.value]

            selector.onchange = (e) => {
                this.currentShader = this.shaders[e.target.value]
                this.updateShader()
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

/**
 * Three.js Shader
 */

this.colorBuffer = Array.from({length: this.history}, e => [1.0,1.0,1.0])
this.timeBuffer = Array.from({length: this.history}, e => 0)
this.noiseBuffer = Array.from({length: this.history}, e => 1.0)

/**
 * Canvas
 */
this.appletContainer = document.getElementById(this.props.id)
this.three.canvas = document.getElementById(`${this.props.id}canvas`)
this.three.canvas.style.opacity = '0'
this.three.canvas.style.transition = 'opacity 1s'

/**
 * Scene
 */
this.three.scene = new THREE.Scene()

/**
 * Camera
 */

let minZoomDistance = 3
this.camera = new THREE.PerspectiveCamera(75, this.appletContainer.offsetWidth/this.appletContainer.offsetHeight, 0.01, 1000)
this.camera.position.z = minZoomDistance*1.5

this.three.renderer = new THREE.WebGLRenderer({
    canvas: this.three.canvas,
    alpha: true
})


navigator.xr.isSessionSupported('immersive-vr').then((isSupported) => {
    if (isSupported){
        this.renderer.xr.enabled = true;
        this.appletContainer.appendChild( VRButton.createButton( this.renderer ) );
    }
})

/**
 * Texture Params
 */

 let containerAspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight //this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
 let fov_y = minZoomDistance * this.camera.getFilmHeight() / this.camera.getFocalLength();
 this.three.meshWidth = this.three.meshHeight = Math.min(((fov_y)* this.camera.aspect) / containerAspect, (fov_y)* this.camera.aspect);

// Renderer
this.three.renderer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight);
this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
document.getElementById(`${this.props.id}renderer-container`).appendChild(this.three.renderer.domElement)
this.three.canvas.style.opacity = '0'
this.three.canvas.style.transition = 'opacity 1s'

// GUI
// const gui = new dat.GUI({width: 400});

/** 
 * Postprocessing 
 **/

 // Render Target

 let RenderTargetClass = null

 if(this.three.renderer.getPixelRatio() === 1 && this.three.renderer.capabilities.isWebGL2)
 {
     RenderTargetClass = THREE.WebGLMultisampleRenderTarget
 }
 else
 {
     RenderTargetClass = THREE.WebGLRenderTarget
 }

 const renderTarget = new RenderTargetClass(
    this.appletContainer.offsetWidth, this.appletContainer.offsetHeight,
    {
        minFilter: THREE.LinearFilter,
        maxFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        type: THREE.HalfFloatType // For Safari (doesn't work)
    }
 )

 // Composer
const effectComposer = new EffectComposer(this.three.renderer,renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight)

 // Passes
const renderPass = new RenderPass(this.three.scene, this.camera)
effectComposer.addPass(renderPass)

// // Custom Shader Pass
// const customPass = new ShaderPass({
//     uniforms: {
//         tDiffuse: { value: null },
//         uInterfaceMap: { value: null }
//     },
//     vertexShader: interfaceVertexShader,
//     fragmentShader: interfaceFragmentShader
// })
// customPass.material.uniforms.uInterfaceMap.value = futuristicInterface
// effectComposer.addPass(customPass)

// Antialiasing
if(this.three.renderer.getPixelRatio() === 1 && !this.three.renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('Using SMAA')
}

// Controls
this.controls = new OrbitControls(this.camera, this.three.renderer.domElement)
this.controls.enablePan = false
this.controls.enableDamping = true
this.controls.enabled = false;
this.controls.minPolarAngle = 2*Math.PI/6; // radians
this.controls.maxPolarAngle = 4*Math.PI/6; // radians
this.controls.minAzimuthAngle = -1*Math.PI/6; // radians
this.controls.maxAzimuthAngle = 1*Math.PI/6; // radians
this.controls.minDistance = minZoomDistance; // radians
this.controls.maxDistance = minZoomDistance*5; // radians

// Plane
const planeGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1)
let tStart = Date.now()
this.material = new THREE.ShaderMaterial({
    vertexShader: this.currentShader.vertexShader,
    fragmentShader: this.currentShader.fragmentShader,
    transparent: true,
    uniforms:
    {
        // aspect: {value: this.three.meshWidth / this.three.meshHeight},
        amplitude: {value: 0.75},
        times: {value: this.timeBuffer},
        colors: {value: this.colorBuffer.flat(1)},
        mouse: {value: [0,0]}, //[this.mouse.x, this.mouse.y],
        neurofeedback: {value: this.noiseBuffer}
    }
})



// Mesh
this.plane = new THREE.Mesh(planeGeometry, this.material)
this.three.scene.add(this.plane)

// Resize
this.resize = () => {
    this.camera.aspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
    this.camera.updateProjectionMatrix()
    regeneratePlaneGeometry()
    // this.material.uniforms.aspect.value = this.three.meshWidth / this.three.meshHeight
    
    this.three.renderer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight);
    this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight)
}

let regeneratePlaneGeometry = () => {
    let containerAspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
    this.three.meshWidth = this.three.meshHeight = Math.min(((fov_y)* this.camera.aspect) / containerAspect, (fov_y)* this.camera.aspect);
    let newGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1)
    this.plane.geometry.dispose()
    this.plane.geometry = newGeometry
}

// Animate
let startTime = Date.now()
var animate = () => {

    setTimeout( () => {
        if (this.three.canvas != null){

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
                this.material.uniforms.colors.value = this.colorBuffer.flat(1) 
                this.material.uniforms.times.value = this.timeBuffer
                this.material.uniforms.neurofeedback.value = this.noiseBuffer

                this.controls.update()
                effectComposer.render()
        }
    }, 1000 / 60 );
};

    this.three.renderer.setAnimationLoop( animate )
    setTimeout(() => {
        this.three.canvas.style.opacity = '1'
    }, 100)
}

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
        this.three.renderer = null;
        this.three.canvas = null;
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.three.renderer.setAnimationLoop( null );
        this.clearThree()
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if(this.three.renderer) this.resize()
        this.session.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }


    updateShader = () => {
        let newMaterial = new THREE.ShaderMaterial({
            vertexShader: this.currentShader.vertexShader,
            fragmentShader: this.currentShader.fragmentShader,
            transparent: this.material.transparent,
            uniforms: this.material.uniforms
        })
        this.plane.material.dispose()
        this.plane.material = newMaterial
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