import {brainsatplay} from '../../brainsatplay'
import {DOMFragment} from '../../frontend/utils/DOMFragment'

import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import mapVertexShader from './shaders/map/vertex.glsl'
import mapFragmentShader from './shaders/map/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GlitchPass } from './postprocessing/CustomGlitchPass'
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { gsap } from 'gsap'
import mapTexture from "./img/mapTexture.jpeg"
import mapDisp from "./img/mapDisplacement.jpeg"

//Example Applet for integrating with the UI Manager
export class NexusApplet {
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

        //etc..

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:${props.height}; width:${props.width};'>
                <canvas class="webgl"></canvas>
                <div class="loading-bar"></div>
                <div class="point-container"></div>
                <div id="gameHero" class="container"><div><h1>Nexus</h1><p>Neurofeedback + Group Meditation</p></div></div>
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



/**
 * Nexus: Neurofeedback + Group Meditation
 */

// Raycaster
const raycaster = new THREE.Raycaster()

// Loading Manager
const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(3.0,() => 
        {
        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
        loadingBarElement.classList.add('ended')
        loadingBarElement.style.transform = ''
        document.getElementById("gameHero").style.opacity = 0;

        gsap.delayedCall(2.0,() => 
        {
            // Get My Location
            getGeolocation()
            glitchPass.enabled = true
        })
    })
    },

    // Progress
    (itemURL, itemsLoaded, itemsTotal) => {
        loadingBarElement.style.transform = `scaleX(${itemsLoaded/itemsTotal})`
    }
)

// Textures
const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load(mapTexture)
const displacementMap = textureLoader.load(mapDisp)

/**
 * Canvas
 */
const container = document.getElementById(this.props.id)
const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.01, 1000)
camera.position.z = 3
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

/**
 * Texture Params
 */
 let imageWidth = 1200
 let imageHeight = 600
 const segmentsX = 400
 const imageAspect = imageWidth/imageHeight
 let fov_y = camera.position.z * camera.getFilmHeight() / camera.getFocalLength();
 let meshWidth = fov_y * camera.aspect;
 let meshHeight = meshWidth / imageAspect;

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(meshWidth, fov_y, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
    
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
overlay.position.z = 0.2
scene.add(overlay)

// Renderer
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(Math.min(container.devicePixelRatio,2))
document.body.appendChild(renderer.domElement)

/** 
 * Postprocessing 
 **/

 // Render Target

 let RenderTargetClass = null

 if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
 {
     RenderTargetClass = THREE.WebGLMultisampleRenderTarget
 }
 else
 {
     RenderTargetClass = THREE.WebGLRenderTarget
 }

 const renderTarget = new RenderTargetClass(
    container.clientWidth, 
    container.clientHeight,
    {
        minFilter: THREE.LinearFilter,
        maxFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        type: THREE.HalfFloatType // For Safari (doesn't work)
    }
 )

 // Composer
const effectComposer = new EffectComposer(renderer,renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(container.clientWidth, container.clientHeight)

 // Passes
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const glitchPass = new GlitchPass()
glitchPass.goWild = false
glitchPass.enabled = false
effectComposer.addPass(glitchPass)

const shaderPass = new ShaderPass(RGBShiftShader)
shaderPass.enabled = true
effectComposer.addPass(shaderPass)

const bloomPass = new UnrealBloomPass()
bloomPass.enabled = true
effectComposer.addPass(bloomPass)

// Antialiasing
if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('Using SMAA')
}


// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
controls.enableDamping = true
//controls.addEventListener('change', render)

// Mouse
const mouse = new THREE.Vector2()
container.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX/container.clientWidth) * 2 - 1
    mouse.y = -(e.clientY/container.clientHeight) * 2 + 1
})


container.addEventListener('click', () => {
    if (currentIntersect){
        currentIntersect.object.material.opacity = 1.0 
    }
})

// Set Default Users
let points = new Map()
let diameter = 1e-2/4;
points.set('me',new UserMarker({name: 'me',diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight}))

// Plane
const planeGeometry = new THREE.PlaneGeometry(meshWidth, meshHeight, segmentsX, segmentsX/imageAspect)
let tStart = Date.now()

const material = new THREE.ShaderMaterial({
    vertexShader: mapVertexShader,
    fragmentShader: mapFragmentShader,
    transparent: true,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    uniforms:
    {
        point: { value: new THREE.Vector2(NaN,NaN) },
        count: {value: 1 },
        uTime: { value: 0 },
        uTexture: { value: texture },
        displacementMap: { value: displacementMap },
        displacementHeight: { value: 0.1 },
        colorThreshold: { value: 0.030},
        aspectRatio: {value: container.clientWidth / container.clientHeight}
    }
})



// Mesh
const plane = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

// Resize
container.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    meshWidth = fov_y * camera.aspect
    meshHeight = meshWidth / imageAspect
    regeneratePlaneGeometry()
    points.forEach(point => {
        point.updateMesh(meshWidth,meshHeight)
        let screenPos = new THREE.Vector3(point.x,point.y,point.z)
        screenPos.project(camera)
        let translateX = container.clientWidth * screenPos.x * 0.5
        point.element.style.transform = `translate(${translateX}px)`
    })

    let me = points.get('me')
    material.uniforms.point.value = new THREE.Vector2(me.x,me.y)
    material.uniforms.aspectRatio.value = container.clientWidth / container.clientHeight
    controls.target.set(me.x,me.y,0.12)
    camera.position.set(me.x,me.y)
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(container.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(container.devicePixelRatio, 2))
    effectComposer.setSize(container.clientWidth, container.clientHeight)

}, 
false)

// Fullscreen
container.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if (!fullscreenElement){
        if (canvas.requestFullscreen){
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen){
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen){
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen){
            document.webkitExitFullscreen()
        }
    }
})

// Animate
let currentIntersect = null


// Stats
// const stats = Stats()
// document.body.appendChild(stats.dom)

var animate = function () {
    requestAnimationFrame(animate)
    animateUsers()
    material.uniforms.uTime.value = Date.now() - tStart
    points.forEach(point => {
        point.animateLabel(camera)
    })
    // stats.update()
    controls.update()
    // renderer.render(scene, camera)
    effectComposer.render()
};

animate()

function regeneratePlaneGeometry() {
    let newGeometry = new THREE.PlaneGeometry(
        meshWidth, meshHeight, segmentsX, segmentsX/imageAspect
    )
    plane.geometry.dispose()
    plane.geometry = newGeometry
}
// Draw Shapes
function animateUsers(){
    raycaster.setFromCamera(mouse,camera)
    const objectArray = Array.from( points.keys() ).map(key => points.get(key).marker)
    const intersects = raycaster.intersectObjects(objectArray)

    if (intersects.length){
        if (currentIntersect === null){
            const scale = intersects[0].object.scale
            intersects[0].object.scale.set(scale.x*2,scale.y*2,scale.z*2)
            intersects[0].object.material.opacity = 0.75
        }
        currentIntersect = intersects[0]
        
    } else {
        if (currentIntersect !== null){
            const scale = currentIntersect.object.scale
            currentIntersect.object.scale.set(scale.x/2,scale.y/2,scale.z/2)
            currentIntersect.object.material.opacity = 0.50
        }
        currentIntersect = null;
    }

    points.forEach(point => {

        // Remove old marker
        point.prevMarkers.forEach((obj) => {
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove( obj );
        })

        // Add new marker
        scene.add(point.marker)
    })
}

// Geolocation
function getGeolocation(){
    navigator.geolocation.getCurrentPosition(
       // Success   
    (pos) => {
        points.get('me').setGeolocation(pos.coords)
        let me = points.get('me')
        // material.uniforms.points.value[0]= {
        //     position: new THREE.Vector2(me.x,me.y)
        //  }
         material.uniforms.point.value = new THREE.Vector2(me.x,me.y)
         controls.target.set(me.x,me.y,0.12)
         camera.position.set(me.x,me.y)
    }, 
    // Error
    (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }, 
    // Options
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
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