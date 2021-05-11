import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/cosmos/vertex.glsl'
import fragmentShader from './shaders/cosmos/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class CosmosApplet {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.info = settingsFile.settings;
        this.bci = bci; //Reference to the Session to access data and subscribe
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
                <div class="brainsatplay-neurofeedback-container" style="position: absolute; top: 25px; left: 25px;"></div>
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
        this.bci.atlas.makeFeedbackOptions(this,document.getElementById(this.props.id).querySelector('.brainsatplay-neurofeedback-container'))



/**
 * Cosmos
 */

 // Canvas
 const appletContainer = document.getElementById(this.props.id)
 const canvas = appletContainer.querySelector('canvas.brainsatplay-threejs-webgl')
 canvas.style.opacity = '0'
 canvas.style.transition = 'opacity 1s'

// Scene
const scene = new THREE.Scene()

/**
 * Cosmos
 */
const parameters = {}
parameters.count = 200000
parameters.size = 0.005
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null

const generateCosmos = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const randomness = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius
    
        randomness[i3    ] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms:
        {
            uTime: { value: 0 },
            uSize: { value: 20*camera.position.z * this.renderer.getPixelRatio() }
        },    
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

// gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateCosmos)
// gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateCosmos)
// gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateCosmos)
// gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateCosmos)
// gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateCosmos)
// gui.addColor(parameters, 'insideColor').onFinishChange(generateCosmos)
// gui.addColor(parameters, 'outsideColor').onFinishChange(generateCosmos)

this.resizeCosmos = () => {
    // Update camera
    camera.aspect = appletContainer.clientWidth / appletContainer.clientHeight
    camera.updateProjectionMatrix()
    // camera.position.x = baseCameraPos.x * camera.aspect
    // camera.position.y = baseCameraPos.y * camera.aspect
    // camera.position.z = baseCameraPos.z * camera.aspect

    // Update renderer
    this.renderer.setSize(appletContainer.clientWidth, appletContainer.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(appletContainer.clientWidth, appletContainer.clientHeight)
}

/**
 * Camera
 */
// Base camera
let baseCameraPos = new THREE.Vector3(0.4,0.4,0.4)
const camera = new THREE.PerspectiveCamera(75, appletContainer.clientWidth / appletContainer.clientHeight, 0.1, 100)
camera.position.x = baseCameraPos.x * camera.aspect
camera.position.y = baseCameraPos.y * camera.aspect
camera.position.z = baseCameraPos.z * camera.aspect
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = true;

/**
 * Renderer
 */
this.renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
this.renderer.setSize(appletContainer.clientWidth, appletContainer.clientHeight)
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

// const bloomPass = new UnrealBloomPass()
// bloomPass.enabled = true
// bloomPass.strength = 0.1
// bloomPass.radius = 1
// bloomPass.threshold = 0.6
// effectComposer.addPass(bloomPass)


// Antialiasing
if(this.renderer.getPixelRatio() === 1 && !this.renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('Using SMAA')
}

/**
 * Generate galaxy
 */
generateCosmos()

/**
 * Animate
 */
const clock = new THREE.Clock()

const animate = () =>
{
    setTimeout( () => {
    const elapsedTime = clock.getElapsedTime()

    // Update material
    let neurofeedback = this.getNeurofeedback()
    if (neurofeedback){
        material.uniforms.uTime.value += 0.001 + 0.01*neurofeedback
        let coherenceReadout = appletContainer.querySelector('.brainsatplay-threejs-alphacoherence')
        if (coherenceReadout) coherenceReadout.innerHTML = neurofeedback.toFixed(5)
    }
    // Update controls
    controls.update()

    // Render
    // this.renderer.render(scene, camera)
    effectComposer.render()
    }, 1000 / 60 );    
}

this.renderer.setAnimationLoop( animate );

setTimeout(() => {
    canvas.style.opacity = '1'
}, 100)
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        this.renderer.setAnimationLoop( null );
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.resizeCosmos()
        this.bci.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

} 
