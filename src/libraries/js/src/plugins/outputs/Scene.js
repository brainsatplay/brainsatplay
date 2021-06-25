import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WebXRPolyfill from 'webxr-polyfill';
const polyfill = new WebXRPolyfill();

export class Scene{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            camerax: {default: 0},
            cameray: {default: 1.6},
            cameraz: {default: 1.5},
            orbitcontrols: {default: true},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            scene: null,
            container: null,
            drawFunctions: {},
            looping: false
        }

        this.ports = {
            default: {
                types: {
                    in: 'function',
                    out: null
                }
            },
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
            </div>`
        }

        let setupHTML = (app) => {

            this.props.container = document.getElementById(`${this.props.id}`);
            this.props.scene = new THREE.Scene();

            this.props.camera = new THREE.PerspectiveCamera( 50, this.props.container.offsetWidth / this.props.container.offsetHeight, 0.1, 1000 );
            this.props.camera.position.set( this.params.camerax, this.params.cameray, this.params.cameraz );

            this.props.renderer = new THREE.WebGLRenderer( { antialias: true } );
            // this.props.renderer.domElement.style.width = '100%'
            // this.props.renderer.domElement.style.height = '100%'
            this.props.renderer.domElement.id = `${this.props.id}canvas`
            this.props.renderer.autoClear = false;
            this.props.renderer.setPixelRatio( window.devicePixelRatio );
            this.props.renderer.setSize( this.props.container.offsetWidth, this.props.container.offsetHeight );
            this.props.container.appendChild( this.props.renderer.domElement );
            // this.props.renderer.shadowMap.enabled = true;

            // Controls
            // this.props.controls = new OrbitControls(this.props.camera, this.props.renderer.domElement)
            // this.props.controls.enablePan = true
            // this.props.controls.enableDamping = true
            // this.props.controls.enabled = true;

            // Support WebXR
            window.navigator.xr.isSessionSupported('immersive-vr').then((isSupported) => {
                this.props.renderer.xr.enabled = true;
                this.props.VRButton = VRButton.createButton( this.props.renderer );
                this.props.container.appendChild( this.props.VRButton );

                this.props.controller = this.props.renderer.xr.getController( 0 );
                this.props.controller.addEventListener( 'connected', ( event ) => {
                    document.getElementById(`${this.props.id}canvas`).parentNode.appendChild( this.props.VRButton );
                } );
                
                this.props.controller.addEventListener( 'disconnected', () => {
                    this.props.container.appendChild( this.props.VRButton );
                    this.props.camera.position.set( this.params.camerax, this.params.cameray, this.params.cameraz );
                } );
            })

            this.props.looping = true
            this._animate()
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => {
        this.props.looping = false
    }

    responsive = () => {
        this.props.camera.aspect = this.props.container.offsetWidth / this.props.container.offsetHeight;
        this.props.camera.updateProjectionMatrix();
        this.props.renderer.setSize( this.props.container.offsetWidth, this.props.container.offsetHeight );
    }

    default = (userData) => {
        userData.forEach(u => {
            if (!Array.isArray(u.data)) u.data = [u.data]
            u.data.forEach(mesh => this.props.scene.add(mesh))
        })
    }

    _animate = () => {

        this.props.renderer.setAnimationLoop( this._render );

    }

    _render = () => {
        // this.props.controls.update()
        this.props.renderer.render( this.props.scene, this.props.camera );
    }
}