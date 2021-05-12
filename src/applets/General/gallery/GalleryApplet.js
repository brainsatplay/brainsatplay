import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
 
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shaders/vertex.glsl'
import wavesFragmentShader from './shaders/waves/fragment.glsl'
import noiseCircleFragmentShader from './shaders/noiseCircle/fragment.glsl'
import creationFragmentShader from './shaders/creation/fragment.glsl'
import blobFragmentShader from './shaders/voronoiblobs/fragment.glsl'
import fractalpyramidFragmentShader from './shaders/fractalpyramid/fragment.glsl'
import cineshaderlavaFragmentShader from './shaders/cineshaderlava/fragment.glsl'
import octagramsFragmentShader from './shaders/octagrams/fragment.glsl'

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
        this.isMobile = this.checkIfMobile()

        this.currentShader = null;

        this.three.planes = []

        this.shaders = {
            
            waves: {
                name: 'Rainbow Waves',
                vertexShader: vertexShader,
                fragmentShader: wavesFragmentShader,
                credit: 'Pixi.js'
            },
            box: {
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
            // cineshaderlava: {
            //     name: 'Cineshader Lava',
            //     vertexShader: vertexShader,
            //     fragmentShader: cineshaderlavaFragmentShader,
            //     credit: 'edankwan (Shadertoy)'
            // },
            // fractalpyramid: {
            //     name: 'Fractal Pyramid',
            //     vertexShader: vertexShader,
            //     fragmentShader: fractalpyramidFragmentShader,
            //     credit: 'bradjamesgrant (Shadertoy)'
            // },
            voronoiblobs: {
                name: 'Voronoi Blobs',
                vertexShader: vertexShader,
                fragmentShader: blobFragmentShader,
                credit: 'Elise (Shadertoy)'
            },
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
             `
            //  <div style="position:absolute; top: 0; right: 0; z-index: 1; padding: 25px;">
            //         <select id='${props.id}selector'></select>
            //     </div>
            + `
                <div class="brainsatplay-neurofeedback-container" style="margin-top: 25px; position:absolute; top: 0; left: 0; z-index: 1; ">
                </div>
                <div id="${props.id}credit" style="text-align: right; font-size: 80%; padding: 25px; position:absolute; bottom: 0; right: 0; z-index: 1; ">
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            // let selector = document.getElementById(`${this.props.id}selector`)
            // Object.keys(this.shaders).forEach((k) => {
            //     selector.innerHTML += `<option value='${k}'>${this.shaders[k].name}</option>`
            // })
            
            // this.currentShader = this.shaders[selector.value]

            // selector.onchange = (e) => {
            //     this.currentShader = this.shaders[e.target.value]
            //     this.updateShader()
            // }
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

this.appletContainer = document.getElementById(this.props.id)

/**
 * Scene
 */
this.three.scene = new THREE.Scene()

/**
 * Camera
 */

let baseCameraPos = new THREE.Vector3(0,0,3)
this.camera = new THREE.PerspectiveCamera(75, this.appletContainer.offsetWidth/this.appletContainer.offsetHeight, 0.01, 1000)
this.camera.position.z = baseCameraPos.z*1.5

/**
 * Texture Params
 */

 let containerAspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight //this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
 let fov_y = baseCameraPos.z * this.camera.getFilmHeight() / this.camera.getFocalLength();
 this.three.meshWidth = this.three.meshHeight = Math.min(((fov_y)* this.camera.aspect) / containerAspect, (fov_y)* this.camera.aspect);

// Renderer
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

// // XR
// navigator.xr.isSessionSupported('immersive-vr').then((isSupported) => {
//     if (isSupported && !this.isMobile){
//         this.three.renderer.xr.enabled = true;
//         this.three.renderer.xr.setReferenceSpaceType( 'local' );
//         this.controller = this.three.renderer.xr.getController( 0 );
//         this.VRButton = VRButton.createButton( this.three.renderer )
//         this.VRButton.id = `${this.props.id}VRButton`

//         this.controller.addEventListener( 'connected', ( event ) => {
//             document.getElementById(`${this.props.id}canvas`).parentNode.appendChild( document.getElementById(`${this.props.id}VRButton`) );
//             this.camera.position.z = baseCameraPos.z*1.5
//         } );
        
//         this.controller.addEventListener( 'disconnected', () => {
//             this.appletContainer.appendChild( document.getElementById(`${this.props.id}VRButton`) );
//             this.camera.position.z = baseCameraPos.z*1.5

//         } );
        
//         this.appletContainer.appendChild( this.VRButton );
//     }
// })

// Controls
this.controls = new OrbitControls(this.camera, this.three.renderer.domElement)
this.controls.enablePan = false
this.controls.enableDamping = true
this.controls.enabled = false;
this.controls.minPolarAngle = 2*Math.PI/6; // radians
this.controls.maxPolarAngle = 4*Math.PI/6; // radians
// this.controls.minAzimuthAngle = -1*Math.PI/6; // radians
// this.controls.maxAzimuthAngle = 1*Math.PI/6; // radians
this.controls.minDistance = baseCameraPos.z; // radians
this.controls.maxDistance = baseCameraPos.z*10; // radians

// Plane
const planeGeometry = new THREE.PlaneGeometry(this.three.meshWidth, this.three.meshHeight, 1, 1)
let tStart = Date.now()

let shaderKeys = Object.keys(this.shaders)
let numShaders = shaderKeys.length
shaderKeys.forEach((k,i) => {

    this.material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        vertexShader: this.shaders[k].vertexShader,
        fragmentShader: this.shaders[k].fragmentShader,
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

    let radius = 10
    let plane = new THREE.Mesh(planeGeometry, this.material)
    let angle = 2 * Math.PI * i/numShaders
    plane.position.set(radius*(Math.cos(angle)),0,radius*(Math.sin(angle)))
    plane.rotation.set(0,-angle - Math.PI/2,0)
    this.three.planes.push(plane)
    this.three.scene.add(plane)
})


// SINGLE SHADER

// this.material = new THREE.ShaderMaterial({
//     transparent: true,
//     uniforms:
//     {
//         // aspect: {value: this.three.meshWidth / this.three.meshHeight},
//         amplitude: {value: 0.75},
//         times: {value: this.timeBuffer},
//         colors: {value: this.colorBuffer.flat(1)},
//         mouse: {value: [0,0]}, //[this.mouse.x, this.mouse.y],
//         neurofeedback: {value: this.noiseBuffer}
//     }
// })
// this.plane = new THREE.Mesh(planeGeometry, this.material)
// this.three.scene.add(this.plane)
// this.updateShader()

// Resize
this.resize = () => {
    this.camera.aspect = this.appletContainer.offsetWidth/this.appletContainer.offsetHeight
    this.camera.updateProjectionMatrix()
    // regeneratePlaneGeometry()
    // this.material.uniforms.aspect.value = this.three.meshWidth / this.three.meshHeight
    
    this.three.renderer.setSize(this.appletContainer.offsetWidth, this.appletContainer.offsetHeight);
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

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        this.three.renderer.setAnimationLoop( null );
        // this.controller.removeEventListener( 'connected')
        // this.controller.removeEventListener( 'disconnected')
        this.clearThree()
    }

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
        document.getElementById(`${this.props.id}credit`).innerHTML = `<p>Credit: ${this.currentShader.credit}</p>`
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

checkIfMobile(){
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
        return true;
    } else {
        return false;
    }
}

} 