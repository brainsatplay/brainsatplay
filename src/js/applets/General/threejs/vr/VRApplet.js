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
        this.isMobile = this.checkIfMobile()

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
					if (isSupported && !this.isMobile){
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

    checkIfMobile(){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            return true;
        } else {
            return false;
        }
    }
} 