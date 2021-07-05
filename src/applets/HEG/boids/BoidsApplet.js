import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import {DynamicParticles} from '../../../libraries/js/src/utils/graphics/DynamicParticles'

import * as THREE from 'three'
//import * as Phenomenon from 'three.phenomenon'

import * as settingsFile from './settings'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export class BoidsApplet {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        //etc..
        this.canvas = null;
        this.ctx = null;

        this.renderer, this.scene, this.camera, this.composer, this.points; 
        this.boids;
        this.nBoids = 0;
        this.startTime = Date.now();
        this.ticks = 0;

        this.looping = false;
        this.loop = null;

        this.hidden = true;
        this.score=0;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id=`+props.id+`>
                <div id='`+props.id+`menu' height='100%' width='100%' style='position:absolute; z-index:3; '>
                    <div>Score: <span id='`+props.id+`score'>0</span></div>
                    <button id='`+props.id+`showhide' style='opacity:0.2; z-index:2;'>Show UI</button><br>
                    <table id='`+props.id+`table' style='z-index:99; display:none;'>
                        <tr><td>Cohesion:</td><td><input type='range' id='`+props.id+`cohesion' min="0" max="0.1" value="0.0001" step="0.0001"></td><td><button id='`+props.id+`cohesionreset'>Reset</button></td></tr>
                        <tr><td>Separation:</td><td><input type='range' id='`+props.id+`separation' min="0" max="10" value="1" step="0.1"></td><td><button id='`+props.id+`separationreset'>Reset</button></td></tr>
                        <tr><td>Alignment:</td><td><input type='range' id='`+props.id+`align' min="0" max="0.9" value="0.5" step="0.01"></td><td><button id='`+props.id+`alignreset'>Reset</button></td></tr>
                        <tr><td>Swirl:</td><td><input type='range' id='`+props.id+`swirl' min="0" max="0.01" value="0.0001" step="0.0001" ></td><td><button id='`+props.id+`swirlreset'>Reset</button></td></tr>
                        <tr><td>Anchor:</td><td><input type='range' id='`+props.id+`anchor' min="0" max="0.05" value="0.003" step="0.001" ></td><td><button id='`+props.id+`anchorreset'>Reset</button></td></tr>
                        <tr><td>Max Speed:</td><td><input type='range' id='`+props.id+`speed' min="0" max="10" value="1" step="0.1" ></td><td><button id='`+props.id+`speedreset'>Reset</button></td></tr>
                        <tr><td>Gravity:</td><td><input type='range' id='`+props.id+`gravity' min="0" max="10" value="0" step="0.1"></td><td><button id='`+props.id+`gravityreset'>Reset</button></td></tr>
                    </table>
                </div>
                <div id='`+props.id+`canvasContainer' height='100%' width='100%' style='width:100%; height:100%;'></div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            let showhide = document.getElementById(props.id+'showhide');
            let table = document.getElementById(props.id+'table');
            showhide.onclick = () => {
                if(this.hidden === false) {
                    table.style.display = 'none';
                    showhide.innerHTML = "Show UI";
                    this.hidden = true;
                }
                else {
                    table.style.display = '';
                    showhide.innerHTML = "Hide UI";
                    this.hidden = false;
                }
            }

            showhide.onmouseover = () => {
                showhide.style.opacity = 1.0;
            }
            showhide.onmouseleave = () => {
                showhide.style.opacity = 0.2;
            }

            // document.getElementById(props.id+'cohesion').onchange = () => {
            //     this.class.cohesionMul = document.getElementById(props.id+'cohesion').value;
            // }
            // document.getElementById(props.id+'cohesionreset').onclick = () => {
            //     this.class.cohesionMul = 0.001;
            //     document.getElementById(props.id+'cohesion').value = 0.001;
            // }
            // document.getElementById(props.id+'separation').onchange = () => {
            //     this.class.separationMul = document.getElementById(props.id+'separation').value;
            // }
            // document.getElementById(props.id+'separationreset').onclick = () => {
            //     this.class.separationMul = 1;
            //     document.getElementById(props.id+'separation').value = 1;
            // }
            // document.getElementById(props.id+'align').onchange = () => {
            //     this.class.alignmentMul = document.getElementById(props.id+'align').value;
            // }
            // document.getElementById(props.id+'alignreset').onclick = () => {
            //     this.class.alignmentMul = 0.5;
            //     document.getElementById(props.id+'align').value = 0.5;
            // }
            // document.getElementById(props.id+'swirl').onchange = () => {
            //     this.class.swirlMul = document.getElementById(props.id+'swirl').value;
            // }
            // document.getElementById(props.id+'swirlreset').onclick = () => {
            //     this.class.swirlMul = 0.0001;
            //     document.getElementById(props.id+'swirl').value = 0.0001;
            // }
            // document.getElementById(props.id+'anchor').onchange = () => {
            //     this.class.attractorMul = document.getElementById(props.id+'anchor').value;
            // }
            // document.getElementById(props.id+'anchorreset').onclick = () => {
            //     this.class.attractorMul = 0.003;
            //     document.getElementById(props.id+'anchor').value = 0.003;
            // }
            // document.getElementById(props.id+'speed').onchange = () => {
            //     this.class.particleClass.settings.maxSpeed = document.getElementById(props.id+'speed').value;
            // }
            // document.getElementById(props.id+'speedreset').onclick = () => {
            //     this.class.particleClass.settings.maxSpeed = 1;
            //     document.getElementById(props.id+'speed').value = 1;
            // }
            // document.getElementById(props.id+'gravity').onchange = () => {
            //     this.class.particleClass.settings.gravity = document.getElementById(props.id+'gravity').value;
            // }
            // document.getElementById(props.id+'gravityreset').onclick = () => {
            //     this.class.particleClass.settings.gravity = 0;
            //     document.getElementById(props.id+'gravity').value = 0;
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


        this.setupThreeScene();

        this.canvas = this.renderer.domElement;

        this.boids = new DynamicParticles(['boids',1000,[500,500,500]],this.canvas,false);

        this.setupParticleInstances();

        this.looping = true;

        this.renderer.setAnimationLoop(this.updateLoop);
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        cancelAnimationFrame(this.loop);
        //this.class.stop();
        this.class = null;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.camera.aspect = this.AppletHTML.node.clientWidth / this.AppletHTML.node.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.AppletHTML.node.clientWidth, this.AppletHTML.node.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    setupThreeScene(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.AppletHTML.node.clientWidth / this.AppletHTML.node.clientHeight, 0.01, 1000);
        this.camera.position.z = 5
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
        this.renderer.shadowMap.enabled = true;

        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.id = `${this.props.id}canvas`;
        // this.renderer.domElement.style.opacity = '0';
        // this.renderer.domElement.style.transition = 'opacity 1s';

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = true
        this.controls.enableDamping = true
        this.controls.enabled = true;
        // this.controls.minPolarAngle = 2*Math.PI/6; // radians
        // this.controls.maxPolarAngle = 4*Math.PI/6; // radians
        // this.controls.minDistance = 0; // radians
        // this.controls.maxDistance = 1000; // radians

        document.getElementById(this.props.id+"canvasContainer").appendChild(this.renderer.domElement);
        // this.renderer.domElement.style.opacity = '1';
    }

    setupParticleInstances=()=>{
        
       
        this.nBoids;
        this.boids.particles.forEach((group) => {
            this.nBoids += group.max;
        });
    
        let vertices = [];

        this.boids.particles.forEach((group)=> {

            group.particles.forEach((boid)=>{

                let x = boid.position.x;
                let y = boid.position.y;
                let z = -boid.position.z ;

                vertices.push( x, y, z );
            });
        });

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        
        let color = new THREE.Color();
        let colors = [];

        for (let i = 0; i < this.nBoids; i++) {
            let roll = Math.random();
            if(roll <= 0.15){
                color.set('skyblue');
                colors.push(color.r,color.g,color.b);
            }
            else if ((roll > 0.15) && (roll <= 0.3)) {
                color.set('royalblue');
                colors.push(color.r,color.g,color.b);
            }
            else if ((roll > 0.3) && (roll <= 0.45)) { 
                color.set('purple');
                colors.push(color.r,color.g,color.b);
            }
            else if ((roll > 0.45) && (roll <= 0.6)) { 
                color.set('firebrick');
                colors.push(color.r,color.g,color.b);
            }
            else if ((roll > 0.6) && (roll < 0.9)) {
                color.set('white');
                colors.push(color.r,color.g,color.b);
            }
            else {
                color.set('goldenrod');
                colors.push(color.r,color.g,color.b);
            }
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3));

        let pointmat = new THREE.PointsMaterial( 
            // { color: 0xffffff },
            { 
                vertexColors: THREE.VertexColors,
                opacity:0.99
            } 
            );

        /*
        var spriteUrl = 'https://i.ibb.co/NsRgxZc/star.png';

        var textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "Anonymous"
        var myTexture = textureLoader.load(spriteUrl);
        pointmat.map = myTexture;
        */
        this.points = new THREE.Points( geometry, pointmat );
        this.scene.add( this.points );
    }

    renderScene = () => {

        let positions = this.points.geometry.attributes.position.array;

        let count = 0;
        this.boids.particles.forEach((group,i)=> {
            group.particles.forEach((boid,j)=>{
                positions[count*3] =   boid.position.x;
                positions[count*3+1] = boid.position.y;
                positions[count*3+2] = -boid.position.z;
                count++;
            });
        });

        this.points.geometry.attributes.position.needsUpdate = true;   
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    updateLoop = () => {

        if(this.looping){
            if(this.session.atlas.settings.heg && this.session.atlas.settings.deviceConnected) {
                let ct = this.session.atlas.data.heg[0].count;
                if(ct >= 2) {
                    let avg = 40; if(ct < avg) { avg = ct; }
                    let slice = this.session.atlas.data.heg[0].ratio.slice(ct-avg);
                    let score = this.session.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
                    this.score += score;
                    document.getElementById(this.props.id+'score').innerHTML = this.score.toFixed(3);
                }
            }

            this.renderScene();
        }
    }



   
} 
