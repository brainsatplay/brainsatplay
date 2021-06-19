import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/cosmos/vertex.glsl'
import fragmentShader from './shaders/cosmos/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class AttractorsApplet {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.info = settingsFile.settings;
        this.session = bci; //Reference to the Session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.currentAttractor = null
        this.attractors = {
            'Aizawa Attractor': (x,y,z,timestep) => {
                const a = 0.95;
                const b = 0.7;
                const c = 0.6;
                const d = 3.5;
                const e = 0.25;
                const f = 0.1;
                        
                let dx = ((z-b) * x - d*y) * timestep;
                let dy = (d * x + (z-b) * y) *timestep;
                let dz = (c + a*z - ((z*z*z) /3) - (x*x) + f * z * (x*x*x)) * timestep;
                return [dx,dy,dz]
            },
        
            'Arneodo Attractor': (x,y,z,timestep) => {
                timestep *= 2;

                const a = -5.5;
                const b = 3.5;
                const d = -1;
                        
                let dx = y * timestep;
                let dy = z * timestep;
                let dz = (-a*x -b*y -z + (d* (Math.pow(x, 3)))) * timestep;
                return [dx,dy,dz]
            },
        
            'Dadras Attractor': (x,y,z,timestep) => {
                const a = 3;
                const b = 2.7;
                const c = 1.7;
                const d = 2;
                const e = 9;
                        
                let dx = (y- a*x +b*y*z) * timestep;
                let dy = (c*y -x*z +z) * timestep;
                let dz = (d*x*y - e*z) * timestep;
                return [dx,dy,dz]
            },
        
            // 'Dequan Attractor': (x,y,z,timestep) => {
            //     const a = 40.0;
            //     const b = 1.833;
            //     const c = 0.16;
            //     const d = 0.65;
            //     const e = 55.0;
            //     const f = 20.0;
                        
            //     let dx = ( a*(y-x) + c*x*z) * timestep;
            //     let dy = (e*x + f*y - x*z) * timestep;
            //     let dz = (b*z + x*y - d*x*x) * timestep;
            //     return [dx,dy,dz]
            // },

            'Lorenz Attractor': (x,y,z,timestep) => {
                const a = 10.0;
                const b = 28.0;
                const c = 2.6666666667;
                        
                let dx = (a * (y - x)) * timestep;
                let dy = (x * (b-z) - y) * timestep;
                let dz = (x*y - c*z) * timestep;
                return [dx,dy,dz]
            },
        
            'Lorenz Mod 2 Attractor': (x,y,z,timestep) => {
                const a = 0.9;
                const b = 5.0;
                const c = 9.9;
                const d = 1.0;
                        
                let dx = (-a*x+ y*y - z*z + a *c) * timestep;
                let dy = (x*(y-b*z)+d)  * timestep;
                let dz = (-z + x*(b*y +z))  * timestep;
                return [dx,dy,dz]
            },
        
            'Thomas Attractor': (x,y,z,timestep) => {

                timestep *= 5;
                const b = 0.19;
        
                let dx = (-b*x + Math.sin(y)) * timestep;
                let dy = (-b*y + Math.sin(z)) * timestep;
                let dz = (-b*z + Math.sin(x)) * timestep;
                return [dx,dy,dz]
            },
        
            'Three Scroll Unified Chaotic System Attractor': (x,y,z,timestep) => {

                timestep *= 5;

                const a = 40.0;
                const b = 0.833;
                const c = 20.0;
                const d = 0.5;
                const e = 0.65;
                    
                let dx = (a*(y-x) + d*x*z)   * timestep * 0.1 ;
                let dy = (c*y - x*z )        * timestep * 0.1 ;
                let dz = (b*z + x*y - e*x*x) * timestep * 0.1 ;
                return [dx,dy,dz]
            }
        }


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
                <div style="position:absolute; top: 0; right: 0; z-index: 1; padding: 25px;">
                    <select id='${props.id}selector'></select>
                </div>
                </div>
            `;  
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            let selector = document.getElementById(`${this.props.id}selector`)
            Object.keys(this.attractors).forEach((k) => {
                selector.innerHTML += `<option value='${k}'>${k}</option>`
            })
            
            this.currentAttractor = this.attractors[selector.value]

            selector.onchange = (e) => {
                this.currentAttractor = this.attractors[selector.value]
                this.generateAttractor()
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
        this.session.atlas.makeFeedbackOptions(this,document.getElementById(this.props.id).querySelector('.brainsatplay-neurofeedback-container'))



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
parameters.count = 100000
parameters.size = 5
let geometry = null
let material = null
let points = null

// Attractor
const scale = 15; // for reducing overall displayed size
const dt = .005;

const draw = () => {

    const geometry = points.geometry;

    for (let i = 0; i < geometry.attributes.position.count; i++){
        let x = geometry.attributes.position.array[(3*i)]
        let y = geometry.attributes.position.array[(3*i)+1]
        let z = geometry.attributes.position.array[(3*i)+2]
        const [dx,dy,dz] = this.currentAttractor(x,y,z,dt)
        if (isNaN(dx) || isNaN(dy) || isNaN(dz)){
            geometry.attributes.position.array[(3*i)] += scale * Math.random() - scale/2
            geometry.attributes.position.array[(3*i)+1] += scale * Math.random() - scale/2
            geometry.attributes.position.array[(3*i)+2] += scale * Math.random() - scale/2
        } else {
            geometry.attributes.position.array[(3*i)] += dx
            geometry.attributes.position.array[(3*i)+1] += dy
            geometry.attributes.position.array[(3*i)+2] += dz
        }
    }
}


this.generateAttractor = () =>
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
    const scales = new Float32Array(parameters.count * 1)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Positions
        positions[i3    ] = scale * Math.random() - scale/2; // Math.cos(branchAngle) * radius
        positions[i3 + 1] = scale * Math.random() - scale/2 // 0
        positions[i3 + 2] = scale * Math.random() - scale/2 // Math.sin(branchAngle) * radius
       
        // Scales
       scales[i] = 0.2 + 0.8*Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        side: THREE.DoubleSide,
        uniforms:
        {
            uTime: { value: 0 },
            uSize: { value: 100 * this.renderer.getPixelRatio() }
        },    
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    points.frustumCulled = false; // critical to avoid blackouts!

    scene.add(points)
}

// gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateCosmos)
// gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateCosmos)
// gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateCosmos)
// gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateCosmos)
// gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateCosmos)
// gui.addColor(parameters, 'insideColor').onFinishChange(generateCosmos)
// gui.addColor(parameters, 'outsideColor').onFinishChange(generateCosmos)

this.onResize = () => {
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
let baseCameraPos = new THREE.Vector3(0,0,30)
const camera = new THREE.PerspectiveCamera(75, appletContainer.clientWidth / appletContainer.clientHeight, 0.01, 1000)
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
 * Generate attractor
 */
this.generateAttractor()

/**
 * Animate
 */
const clock = new THREE.Clock()

const animate = () =>
{
    setTimeout( () => {
    const elapsedTime = clock.getElapsedTime()

    draw();

    points.geometry.attributes.position.needsUpdate = true;
    // points.geometry.attributes.color.needsUpdate = true;
    // points.rotation.z += .01;

    // // Update material
    // let neurofeedback = this.getNeurofeedback()
    // if (neurofeedback){
    //     material.uniforms.uTime.value += 0.001 + 0.01*neurofeedback
    //     let coherenceReadout = appletContainer.querySelector('.brainsatplay-threejs-alphacoherence')
    //     if (coherenceReadout) coherenceReadout.innerHTML = neurofeedback.toFixed(5)
    // }
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
        this.onResize()
        this.session.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }
} 
