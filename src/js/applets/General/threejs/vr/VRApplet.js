import {Session} from '../../../../../library/src/Session'
import {DOMFragment} from '../../../../../library/src/ui/DOMFragment'

// import '../style.css'
import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Example Applet for integrating with the UI Manager
export class VRApplet {

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
		
		this.controller = null;

        // Setup Neurofeedback
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
            <div id='${props.id}' class="brainsatplay-threejs-wrapper" style='height:100%; width:100%; position: relative;'>
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
             * VR Demo
             */
			const loadingManager = new THREE.LoadingManager(
				// Loaded
				() => {
					gsap.delayedCall(0.1,() => 
					{
						this.renderer.domElement.style.opacity = '1'
						this.responsive()
					})
				}
			)

			this.appletContainer = document.getElementById(`${this.props.id}`)
			 
			let camera, scene, renderer;
			let attractor, light;

			let x = 15 * Math.random();
			let y = 15 * Math.random();
			let z = 15 * Math.random();

			const scale = .02; // for reducing overall displayed size
			const speed = 5; // integer, increase for faster visualization

			const steps = 100000;
			let current = 1;
			const shown = 10000;

			const beta = 8 / 3;
			const rho = 28;
			const sigma = 10;

			const dt = .005;

			function draw() {

				const geometry = attractor.geometry;

				geometry.attributes.position.array.copyWithin( 3 );
				geometry.attributes.color.array.copyWithin( 3 );

				if ( current < steps ) {

					const dx = sigma * ( y - x ) * dt;
					const dy = ( x * ( rho - z ) - y ) * dt;
					const dz = ( x * y - beta * z ) * dt;

					x += dx;
					y += dy;
					z += dz;

					geometry.attributes.position.set( [ scale * x, scale * y, scale * z ], 0 );

					light.color.setHSL( current / steps, 1, .5 );

					geometry.attributes.color.set( light.color.toArray(), 0 );

				}

				if ( current < steps + shown ) {

					current ++;

				} else {

					current = 0;

				}

			}


			let init = () => {

				scene = new THREE.Scene();

				let baseCameraPos = new THREE.Vector3(0, 1.6, 1)
				this.camera = new THREE.PerspectiveCamera( 50, this.appletContainer.offsetWidth / this.appletContainer.offsetHeight, 0.1, 10 );
				this.camera.position.set( baseCameraPos.x, baseCameraPos.y,baseCameraPos.z );

				//

				const geometry = new THREE.BufferGeometry();

				const positions = new Float32Array( 3 * shown );

				for ( let i = 0; i < positions.length; i += 3 ) {

					positions.set( [ scale * x, scale * y, scale * z ], i );

				}

				geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

				const colors = new Float32Array( 3 * shown );

				for ( let i = 0; i < positions.length; i += 3 ) {

					colors.set( [ 1, 0, 0 ], i );

				}

				geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

				const material = new THREE.LineBasicMaterial( { vertexColors: true } );

				const attractorBasePos = new THREE.Vector3(0, 1.5, - 2)
				attractor = new THREE.Line( geometry, material );
				attractor.position.set( attractorBasePos.x, attractorBasePos.y, attractorBasePos.z );
				attractor.frustumCulled = false; // critical to avoid blackouts!
				scene.add( attractor );

				//

				light = new THREE.PointLight( 0xffffff, 1 );
				light.distance = 2;
				attractor.add( light );

				const ground = new THREE.Mesh(
					new THREE.PlaneGeometry( 10, 10 ),
					new THREE.MeshPhongMaterial()
				);
				ground.geometry.rotateX( - 90 * Math.PI / 180 );
				scene.add( ground );

				// Renderer

				this.renderer = new THREE.WebGLRenderer( { antialias: true } );
				this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
				this.renderer.setSize( this.appletContainer.offsetWidth, this.appletContainer.offsetHeight );
                this.appletContainer.appendChild( this.renderer.domElement );
				this.renderer.domElement.style.width = '100%'
				this.renderer.domElement.style.height = '100%'
				this.renderer.domElement.id = `${this.props.id}canvas`
                this.renderer.domElement.style.opacity = '0'
                this.renderer.domElement.style.transition = 'opacity 1s'

				// XR
				navigator.xr.isSessionSupported('immersive-vr').then((isSupported) => {
					if (isSupported){
						this.renderer.xr.enabled = true;
						this.renderer.xr.enabled = true;
						this.controller = this.renderer.xr.getController( 0 );
						this.VRButton = VRButton.createButton( this.renderer )
						this.VRButton.id = `${this.props.id}VRButton`

						this.controller.addEventListener( 'connected', ( event ) => {
							document.getElementById(`${this.props.id}canvas`).parentNode.appendChild( document.getElementById(`${this.props.id}VRButton`) );
							this.camera.position.z = baseCameraPos.z
						} );
						
						this.controller.addEventListener( 'disconnected', () => {
							this.appletContainer.appendChild( document.getElementById(`${this.props.id}VRButton`) );
							this.camera.position.z = baseCameraPos.z

						} );
						
						this.appletContainer.appendChild( this.VRButton );
					}
				})


				// Controls
				// const controls = new OrbitControls(camera, this.renderer.domElement)
				// controls.screenSpacePanning = true
				// controls.enableDamping = true
				// controls.enabled = true;
				// controls.target.set(attractorBasePos.x,attractorBasePos.y,attractorBasePos.z)

				if ( typeof TESTING !== 'undefined'  ) { for ( let i = 0; i < 200; i ++ ) { render(); } };

			}

			let render = () => {

				for ( let i = 0; i < speed; i ++ ) draw();

				attractor.geometry.attributes.position.needsUpdate = true;
				attractor.geometry.attributes.color.needsUpdate = true;
				attractor.rotation.z += .001;

				this.renderer.render( scene, this.camera );

            }

            let animate = () => {

				this.renderer.setAnimationLoop( render );

			}
            
            init();
			animate();

			setTimeout(() => {
				this.renderer.domElement.style.opacity = '1'
			}, 100)
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        this.renderer.setAnimationLoop( null );
        this.controller.removeEventListener( 'connected')
        this.controller.removeEventListener( 'disconnected')

        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
		this.camera.aspect = this.appletContainer.offsetWidth / this.appletContainer.offsetHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( this.appletContainer.offsetWidth, this.appletContainer.offsetHeight );        this.bci.atlas.makeFeedbackOptions(this)
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