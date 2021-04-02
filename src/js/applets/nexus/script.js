import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
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
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { gsap } from 'gsap'

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
const texture = textureLoader.load("./img/mapTexture.jpeg")
const displacementMap = textureLoader.load("./img/mapDisplacement.jpeg")

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
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
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
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
    window.innerWidth, 
    window.innerHeight,
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
effectComposer.setSize(window.innerWidth, window.innerHeight)

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
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX/window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY/window.innerHeight) * 2 + 1
})


window.addEventListener('click', () => {
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
        aspectRatio: {value: window.innerWidth / window.innerHeight}
    }
})



// Mesh
const plane = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    meshWidth = fov_y * camera.aspect
    meshHeight = meshWidth / imageAspect
    regeneratePlaneGeometry()
    points.forEach(point => {
        point.updateMesh(meshWidth,meshHeight)
        let screenPos = new THREE.Vector3(point.x,point.y,point.z)
        screenPos.project(camera)
        let translateX = window.innerWidth * screenPos.x * 0.5
        point.element.style.transform = `translate(${translateX}px)`
    })

    let me = points.get('me')
    material.uniforms.point.value = new THREE.Vector2(me.x,me.y)
    material.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
    controls.target.set(me.x,me.y,0.12)
    camera.position.set(me.x,me.y)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(window.innerWidth, window.innerHeight)

}, 
false)

// Fullscreen
window.addEventListener('dblclick', () => {
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

function regeneratePlaneGeometry() {
    let newGeometry = new THREE.PlaneGeometry(
        meshWidth, meshHeight, segmentsX, segmentsX/imageAspect
    )
    plane.geometry.dispose()
    plane.geometry = newGeometry
}

// Animate
let currentIntersect = null

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


// Stats
// const stats = Stats()
// document.body.appendChild(stats.dom)

animate();