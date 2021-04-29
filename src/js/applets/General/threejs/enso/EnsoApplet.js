import {Session} from '../../../../../library/src/Session'
import {DOMFragment} from '../../../../../library/src/ui/DOMFragment'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import vertexShader from './shaders/enso/vertex.glsl'
import fragmentShader from './shaders/enso/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { gsap } from 'gsap'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

//Example Applet for integrating with the UI Manager
export class EnsoApplet {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };
        this.isMobile = this.checkIfMobile()

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
            <div id='${props.id}' class="brainsatplay-threejs-wrapper" style='height:100%; width:100%; position: relative'>
                <div class="brainsatplay-threejs-renderer-container"><canvas class="brainsatplay-threejs-webgl"></canvas></div>
                <div class="brainsatplay-threejs-gui-container"></div>
                <div class="brainsatplay-neurofeedback-container" style="position: absolute; top: 25; left: 25;"></div>
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

/**
 * Canvas
 */
const appletContainer = document.getElementById(this.props.id)
let canvas = appletContainer.querySelector('canvas.brainsatplay-threejs-webgl')
canvas.style.opacity = '0'
canvas.style.transition = 'opacity 1s'
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
    if (isSupported && !this.isMobile){
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

setTimeout(() => {
    canvas.style.opacity = '1'
}, 100)

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

    checkIfMobile(){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            return true;
        } else {
            return false;
        }
    }
} 