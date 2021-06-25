import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WebXRPolyfill from 'webxr-polyfill';
const polyfill = new WebXRPolyfill();
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

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
            controls: null,
            looping: false,
            velocity: new THREE.Vector3(),
            direction: new THREE.Vector3(),
            left: false,
            right: false,
            backward: false,
            forward: false,
            prevTime: performance.now()
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
            this.props.controls = new PointerLockControls(this.props.camera, this.props.container);
            this.props.scene.add(this.props.controls.getObject());
            this.props.container.addEventListener( 'click', _ => {
                // Ask the browser to lock the pointer
                this.props.container.requestPointerLock = this.props.container.requestPointerLock ||
                this.props.container.mozRequestPointerLock ||
                this.props.container.webkitRequestPointerLock;
                this.props.container.requestPointerLock();
              }, false);

            document.addEventListener('keydown', event => {this._onKeyDown(event)}, false);
            document.addEventListener('keyup', event => {this._onKeyUp(event)}, false);

            // Support WebXR
            navigator.xr.isSessionSupported('immersive-vr').then(async (isSupported) => {
                this.props.VRButton = VRButton.createButton( this.props.renderer );
                this.props.container.appendChild( this.props.VRButton );

                if (isSupported){
                    this.props.renderer.xr.enabled = true;
                    this.props.controller = this.props.renderer.xr.getController( 0 );
                    this.props.controller.addEventListener( 'connected', ( event ) => {
                        document.getElementById(`${this.props.id}canvas`).parentNode.appendChild( this.props.VRButton );
                    } );
                    
                    this.props.controller.addEventListener( 'disconnected', () => {
                        this.props.container.appendChild( this.props.VRButton );
                        this.props.camera.position.set( this.params.camerax, this.params.cameray, this.params.cameraz );
                    } );
                }
            }).catch(err => {
                console.log("Immersive VR is not supported: " + err);
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

    _onKeyDown = (e) => {
        switch (e.code){
            case 'ArrowUp':
            case 'KeyW':
                this.props.forward = true
                break
            case 'ArrowDown':
            case 'KeyS':
                this.props.backward = true
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.props.left = true
                break
            case 'ArrowRight':
            case 'KeyD':
                this.props.right = true
                break
        }
    }

    _onKeyUp = (e) => {
        switch (e.code){
            case 'ArrowUp':
            case 'KeyW':
                this.props.forward = false
                break
            case 'ArrowDown':
            case 'KeyS':
                this.props.backward = false
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.props.left = false
                break
            case 'ArrowRight':
            case 'KeyD':
                this.props.right = false
                break
        }
    }

    _setCamera = () => {
        this.props.camera.position.set( this.params.camerax, this.params.cameray, this.params.cameraz );
    }

    _animate = () => {

        this.props.renderer.setAnimationLoop( this._render );

    }

    _render = () => {
        // this.props.controls.update()
        const time = performance.now()
        const delta = ( time - this.props.prevTime ) / 1000;

        this.props.velocity.x -= this.props.velocity.x * 10.0 * delta;
        this.props.velocity.z -= this.props.velocity.z * 10.0 * delta;

        this.props.direction.z = Number( this.props.forward ) - Number( this.props.backward );
        this.props.direction.x = Number( this.props.right ) - Number( this.props.left );
        this.props.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.props.forward || this.props.backward ) this.props.velocity.z -= this.props.direction.z * 400.0 * delta;
        if ( this.props.left || this.props.right ) this.props.velocity.x -= this.props.direction.x * 400.0 * delta;

        this.props.controls.moveRight( - this.props.velocity.x * delta );
        this.props.controls.moveForward( - this.props.velocity.z * delta );

        this.props.renderer.render( this.props.scene, this.props.camera );

        this.props.prevTime = time;
    }
}