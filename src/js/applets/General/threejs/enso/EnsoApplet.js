import {brainsatplay} from '../../../../../library/src/brainsatplay'
import {DOMFragment} from '../../../../../library/src/frontend/utils/DOMFragment'

import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import vertexShader from './shaders/enso/vertex.glsl'
import fragmentShader from './shaders/enso/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { gsap } from 'gsap'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import dummyTexture from "./img/dummyTexture.jpeg"
import featureImg from './img/feature.png'

// import * as p5 from 'p5'
// console.log(p5.noise)

//Example Applet for integrating with the UI Manager
export class EnsoApplet {

    static name = "Enso"; 
    static description = "Calm the ring!"
    static image=featureImg
    static categories = ['feedback'];
    static devices = ['eeg'] //,heg

    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };
        this.defaultNeurofeedback = function defaultNeurofeedback(){return 0.5 + 0.5*Math.sin(Date.now()/5000)} // default neurofeedback function
        this.getNeurofeedback = this.defaultNeurofeedback   
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' class="brainsatplay-threejs-wrapper" style='height:100%; width:100%;'>
                <div class="brainsatplay-threejs-renderer-container"><canvas class="brainsatplay-threejs-webgl"></canvas></div>
                <div class="brainsatplay-threejs-gui-container"></div>
                <div class="brainsatplay-threejs-gameHero brainsatplay-threejs-container">
                    <div class="brainsatplay-neurofeedback-container">
                    </div>
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id);
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
        this.bci.atlas.makeFeedbackOptions(this)


/**
 * Enso
 */

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(0.1,() => 
        {
            canvas.style.opacity = '1'
            this.resizeEnso()
        })
    }, 
    // Progress
    (itemURL, itemsLoaded, itemsTotal) => {
        // console.log(itemsLoaded/itemsTotal)
    }
)
const textureLoader = new THREE.TextureLoader(loadingManager)
textureLoader.load(dummyTexture)

/**
 * Canvas
 */
const appletContainer = document.getElementById(this.props.id)
let canvas = appletContainer.querySelector('canvas.brainsatplay-threejs-webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()
// // const light = new THREE.AmbientLight(0x00b3ff);
// const light = new THREE.AmbientLight(0xffffff);
// light.position.set(0, 5, 10);
// light.intensity = 1.4;
// scene.add(light);

let diameter = 100

/**
 * Camera
 */
let baseCameraPos = new THREE.Vector3(0,0,diameter*2)
const camera = new THREE.PerspectiveCamera(75, appletContainer.clientWidth / appletContainer.clientHeight, 0.01, 1000)
camera.position.z = baseCameraPos.z
this.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

// Renderer
this.renderer.setSize(appletContainer.clientWidth, appletContainer.clientHeight);
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
appletContainer.querySelector('.brainsatplay-threejs-renderer-container').appendChild(this.renderer.domElement)



/**
 * VR
 */
navigator.xr.isSessionSupported('immersive-vr').then((isSupported) => {
    if (isSupported){
        this.renderer.xr.enabled = true;
        appletContainer.appendChild( VRButton.createButton( this.renderer ) );
    }
})


// GUI
// const gui = new GUI({ autoPlace: false });
// appletContainer.querySelector('.gui-container').appendChild(gui.domElement);

/** 
 * Postprocessing 
 **/

 // Render Target

 let RenderTargetClass = null

 if(this.renderer.getPixelRatio() === 1 && this.renderer.capabilities.isWebGL2)
 {
     RenderTargetClass = THREE.WebGLMultisampleRenderTarget
 }
 else
 {
     RenderTargetClass = THREE.WebGLRenderTarget
 }

 const renderTarget = new RenderTargetClass(
    window.innerWidth , window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        maxFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        type: THREE.HalfFloatType // For Safari (doesn't work)
    }
 )

 // Composer
const effectComposer = new EffectComposer(this.renderer,renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(appletContainer.clientWidth, appletContainer.clientHeight)

 // Passes
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const bloomPass = new UnrealBloomPass()
bloomPass.enabled = true
// bloomPass.strength = 0.5
bloomPass.radius = 1
// bloomPass.threshold = 0.6
effectComposer.addPass(bloomPass)


// Antialiasing
if(this.renderer.getPixelRatio() === 1 && !this.renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('Using SMAA')
}


// Controls
const controls = new OrbitControls(camera, this.renderer.domElement)
controls.screenSpacePanning = true
controls.enableDamping = true
controls.enabled = true;

//controls.addEventListener('change', render)

// Plane
const generateTorus = () => {
    return new THREE.TorusGeometry(diameter,3,10,100);
}

const geometry = generateTorus()
let tStart = Date.now()

// const material = new THREE.MeshNormalMaterial( );

var materialControls = new function () {
    this.rPower = 0.0;
    this.gPower = 0.85;
    this.bPower = 1.0;
    this.alpha = 1.0;
    this.noiseIntensity = 0.5;

    this.updateColor = function () {
        material.uniforms.uColor.value = [
            materialControls.rPower,
            materialControls.gPower,
            materialControls.bPower,
            materialControls.alpha
        ]
    };

    this.updateNoise = function () {
        material.uniforms.uNoiseIntensity.value = materialControls.noiseIntensity
    };
};


const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // transparent: true,
    // wireframe: true,
    // blending: THREE.AdditiveBlending,
    uniforms:
    {
        uTime: { value: 0 },
        uColor: {value: [materialControls.rPower,materialControls.gPower,materialControls.bPower,materialControls.alpha] },
        uNoiseIntensity: {value: materialControls.noiseIntensity}
    }
})


// Mesh
const enso = new THREE.Mesh(geometry, material)
scene.add(enso)

// let colorMenu = gui.addFolder('Color');
// colorMenu.add(materialControls, 'rPower', 0, 1).onChange(materialControls.updateColor);
// colorMenu.add(materialControls, 'gPower', 0, 1).onChange(materialControls.updateColor);
// colorMenu.add(materialControls, 'bPower', 0, 1).onChange(materialControls.updateColor);

// let offsetMenu = gui.addFolder('Noise');
// offsetMenu.add(materialControls, 'noiseIntensity', 0, 1).onChange(materialControls.updateNoise);



// Resize
this.resizeEnso = () => {
    camera.aspect = appletContainer.clientWidth / appletContainer.clientHeight
    camera.updateProjectionMatrix()
    // camera.position.z = baseCameraPos.z /  Math.min(window.innerWidth, window.innerHeight)*1000
    this.renderer.setSize(appletContainer.clientWidth, appletContainer.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(appletContainer.clientWidth, appletContainer.clientHeight)

}

window.addEventListener('resize', this.resizeEnso, 
false)

function regenerateGeometry() {
    let newGeometry = generateTorus()
    enso.geometry.dispose()
    enso.geometry = newGeometry
}

// Animate
var animate = () => {

    // Limit Framerate
    setTimeout( () => {
        material.uniforms.uTime.value = Date.now() - tStart
        let neurofeedback = this.getNeurofeedback()
        if (neurofeedback){
            material.uniforms.uNoiseIntensity.value = 1-neurofeedback
            let coherenceReadout = appletContainer.querySelector('.brainsatplay-threejs-alphacoherence')
            if (coherenceReadout) coherenceReadout.innerHTML = neurofeedback.toFixed(5)
        }
        controls.update()
        effectComposer.render()
    }, 1000 / 60 );
};


// // Stats
// const stats = Stats()
// appletContainer.appendChild(stats.dom)

this.renderer.setAnimationLoop( animate );
}

    // // Clear Three.js Scene Completely
    // clearThree(){
    //     for (let i = this.three.scene.children.length - 1; i >= 0; i--) {
    //         const object = this.three.scene.children[i];
    //         if (object.type === 'Mesh') {
    //             object.geometry.dispose();
    //             object.material.dispose();
    //         }
    //         this.three.scene.remove(object);
    //     }
    //     this.three.scene = null;
    //     this.three.renderer = null;
    //     this.three.canvas = null;
    // }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        this.renderer.setAnimationLoop( null );
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.resizeEnso()
        this.bci.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}
} 