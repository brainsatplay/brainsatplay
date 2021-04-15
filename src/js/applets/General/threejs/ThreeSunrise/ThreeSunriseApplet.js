import {brainsatplay} from '../../../../brainsatplay'
import {DOMFragment} from '../../../../frontend/utils/DOMFragment'

import * as THREE from 'three'
import * as POSTPROCESSING from 'postprocessing'

import texUrl from './textures/8k_earth_daymap.jpg'
import cloudtexUrl from './textures/clouds_8k.jpg'
import moontexUrl from './textures/moon_4k.jpg'
import emissiveUrl from './textures/8k_earth_nightmap.jpg'           
import metalUrl from './textures/8k_earth_specular_map.tif'

export class ThreeSunriseApplet {

    static devices = ['heg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }

    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.looping = false;

        this.scene,this.renderer,this.camera, this.composer,
        this.points, this.sunMesh, this.sphereMesh,
        this.cloudMesh, this.pointLight, this.redpointLight,
        this.redpointLight2; this.godrayeffect, this.bloomEffect,
        this.bloompass, this.renderPass, this.godraypass;
       
        this.begin = 0;
        this.ticks = 0;
        this.change = 0.00015; //Default
        this.threeAnim;
        this.threeWidth = 100;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='`+props.id+`'>
                <div id="`+props.id+`threeContainer"></div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera( 75, (400) / 435, 0.1, 1000 );
            
            this.camera.position.x = 1.5;
            this.camera.position.y = 0.5;
            this.camera.position.z = 2;
    
            this.camera.rotation.x = -0.3;
            this.camera.rotation.y = -0.2;
            this.camera.rotation.z = -0.2;
    
            
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            this.renderer.shadowMap.enabled = true;
            //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            //Add whatever else you need to initialize
            
            document.getElementById(props.id+"threeContainer").appendChild(this.renderer.domElement);
            
            var nStars = 5000;
    
            var vertices = [];
    
            for ( var i = 0; i < nStars; i ++ ) {
    
                var x = THREE.Math.randFloatSpread( 500 );
                var y = THREE.Math.randFloatSpread( 1000 );
                var z = THREE.Math.randFloatSpread( 1500 );
    
                vertices.push( x, y, z );
            }
            
            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
            var color = new THREE.Color();
            var colors = [];
    
            for (var i = 0; i < nStars; i++) {
                var roll = Math.random();
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
    
            var pointmat = new THREE.PointsMaterial( { 
                vertexColors: THREE.VertexColors,
                opacity:0.99
            } );
    
            /*
            var spriteUrl = 'https://i.ibb.co/NsRgxZc/star.png';
    
            var textureLoader = new THREE.TextureLoader()
            textureLoader.crossOrigin = "Anonymous"
            var myTexture = textureLoader.load(spriteUrl);
            pointmat.map = myTexture;
            */
            this.points = new THREE.Points( geometry, pointmat );
            this.scene.add( this.points );
    
            var sunmat = new THREE.MeshBasicMaterial( {
                wireframe: false,
                color: 0xffe8c6
            } );
            
            var sunsphere = new THREE.SphereBufferGeometry( 0.5, 20, 20 );
            this.sunMesh = new THREE.Mesh( sunsphere, sunmat );
    
            this.sunMesh.position.set(5, 0, -10);
    
            this.scene.add( this.sunMesh );
    
            console.log(window.location.pathname);
            
            var textureLoader = new THREE.TextureLoader()
            //textureLoader.crossOrigin = "Anonymous"
            var globetex = textureLoader.load(texUrl);
            globetex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
            //var globebump = textureLoader.load('assets/textures/8k_earth_bump_map.tif');
            
            var globeemissive = textureLoader.load(emissiveUrl);
            globeemissive.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
            var globemetal = textureLoader.load(metalUrl);
            globemetal.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
    
            //material
            var globemat = new THREE.MeshStandardMaterial( {
                wireframe: false,
                color: 0xa1e3fe,
                roughness: 0.7,
                metalness: 1.0
            } );
            globemat.map = globetex;
            globemat.emissiveMap = globeemissive;
            globemat.emissive = color.set('yellow');
            globemat.emissiveIntensity = 0.5;
            //globemat.metalnessMap = globemetal;
    
            //globemat.bumpMap = globebump;
            //globemat.normalMap = globenormals;
            globemat.map.minFilter = THREE.LinearFilter;
            
            //sphere
            var earthsphere = new THREE.SphereBufferGeometry(2,500,500);
            this.sphereMesh = new THREE.Mesh( earthsphere, globemat );
    
            this.sphereMesh.castShadow = true;
            this.sphereMesh.receiveShadow = true;
    
            this.scene.add( this.sphereMesh );
    
            var cloudtex = textureLoader.load(cloudtexUrl);
            cloudtex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
            var cloudmat = new THREE.MeshStandardMaterial( {
                transparent: true,
                map: cloudtex,
                alphaMap: cloudtex
            });
            //cloudmat.map.minFilter = THREE.LinearFilter;
    
            var cloudsphere = new THREE.SphereBufferGeometry(2.01,500,500);
            this.cloudMesh = new THREE.Mesh( cloudsphere, cloudmat );
            //this.cloudMesh.castShadow = true;
            this.cloudMesh.receiveShadow = true;
    
            this.scene.add(this.cloudMesh);
    
            //var moondispUrl = require('../assets/textures/moon_displace_4k.jpg');
    
            var moontex = textureLoader.load(moontexUrl);
    
            var moonmat = new THREE.MeshStandardMaterial({
                map: moontex,
                roughness: 1.0,
                metalness: 1.2
            });
    
    
            var moonSphere = new THREE.SphereBufferGeometry(1.0, 50, 50);
            this.moonMesh = new THREE.Mesh( moonSphere, moonmat );
            this.moonMesh.position.set(0, 0, -5);
            this.moonMesh.castShadow = true;
            this.moonMesh.receiveShadow = true;
    
            this.scene.add(this.moonMesh);
    
            this.pointLight = new THREE.PointLight(0xFFFFFF);
            this.pointLight.position.set( 0, 0, -8 );
    
            this.pointLight.castShadow = true;
            this.pointLight.intensity = 4;
    
            this.pointLight.shadow.mapSize.width = 4096;
            this.pointLight.shadow.mapSize.height = 4096;
    
            //this.pointLight.shadow.camera.fov = 360;
    
            //var sphere = new THREE.SphereBufferGeometry( 0.5, 20, 20 );
            //this.pointLight.add(new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ));
    
            this.scene.add( this.pointLight );
    
            this.redpointLight = new THREE.PointLight(0xff2c35);
            this.redpointLight.position.set( 0, 0, -8 );
    
            this.redpointLight.intensity = 1;
    
          
            //this.redpointLight.shadow.camera.fov = 360;
    
            //var sphere = new THREE.SphereBufferGeometry( 0.5, 20, 20 );
            //this.pointLight.add(new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ));
    
            this.scene.add( this.redpointLight );
    
            this.redpointLight2 = new THREE.PointLight(0xff2c35);
            this.redpointLight2.position.set( 0, 0, -8 );
    
            this.redpointLight2.intensity = 2;
    
    
            //this.redpointLight2.shadow.camera.fov = 360;
    
            this.scene.add( this.redpointLight2 );
    
            this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
            this.renderPass = new POSTPROCESSING.RenderPass( this.scene, this.camera )
            
            this.composer.addPass( this.renderPass );
    
            this.godrayeffect = new POSTPROCESSING.GodRaysEffect(this.camera, this.sunMesh, {
                height: 720,
                kernelSize: POSTPROCESSING.KernelSize.SMALL,
                density: 3,
                decay: 0.92,
                weight: 0.5,
                exposure: 0.6,
                samples: 60,
                clampMax: 1.0
            });
    
            this.godrayeffect.dithering = true;
    
            this.godraypass = new POSTPROCESSING.EffectPass(this.camera, this.godrayeffect);
            this.composer.addPass(this.godraypass)
    
            this.bloomEffect = new POSTPROCESSING.BloomEffect({
                blendFunction: POSTPROCESSING.BlendFunction.SCREEN,
                kernelSize: POSTPROCESSING.KernelSize.SMALL,
                luminanceThreshold: 0.1,
                luminanceSmoothing: 0.5,
                opacity: 2,
                height: 480
            })
    
            this.bloompass = new POSTPROCESSING.EffectPass(this.camera, this.bloomEffect);
            this.composer.addPass(this.bloompass);
    
            this.renderPass.renderToScreen = false;
            this.godraypass.renderToScreen = false;
            this.bloompass.renderToScreen = true;
    
            this.sphereMesh.rotation.z -= 0.3;
            this.sphereMesh.rotation.y += 0.5;
            this.sphereMesh.rotation.x = Math.random();
    
            this.cloudMesh.rotation.y = Math.random() * 2;
    
            this.points.rotation.z += 1;
    
            this.begin = 0;
            this.ticks = 0;
            this.change = 0.00015; //Default
            this.threeAnim;
    
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
    
        if(this.threeWidth !== this.AppletHTML.node.clientWidth) {
            this.threeWidth = this.AppletHTML.node.clientWidth;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            this.renderer.setSize(this.threeWidth, this.AppletHTML.node.clientHeight);
            this.composer.setSize(this.threeWidth, this.AppletHTML.node.clientHeight);
            this.camera.aspect = this.threeWidth / this.AppletHTML.node.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.looping = true;
        this.render();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
                
        this.looping = false;
        cancelAnimationFrame(this.threeAnim);
        this.renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
        this.composer = null;
        this.scene = null;
        this.projector = null;
        this.camera = null;
        this.controls = null;

        this.sphereMesh = null;
        this.points = null;

        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if(this.threeWidth !== this.AppletHTML.node.clientWidth) {
            this.threeWidth = this.AppletHTML.node.clientWidth;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            this.renderer.setSize(this.threeWidth, this.AppletHTML.node.clientHeight);
            this.composer.setSize(this.threeWidth, this.AppletHTML.node.clientHeight);
            this.camera.aspect = this.threeWidth / this.AppletHTML.node.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    onData(score) {
        this.change = score * 0.04;
    }

    render = () => {

        if(this.looping) {
            if(this.bci.atlas.settings.heg) {
                let ct = this.bci.atlas.data.heg[0].count;
                if(ct >= 2) {
                    let avg = 40; if(ct < avg) { avg = ct; }
                    let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
                    let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
                    this.onData(score);
                    this.draw();
                }
            }

            this.ticks -= this.change*1000;

            this.sphereMesh.rotation.y += this.change*0.25;
            this.cloudMesh.rotation.y = this.sphereMesh.rotation.y;
            this.points.rotation.y -= this.change;

            var theta = (this.ticks + 2900) * 0.001;
            this.pointLight.position.x = Math.sin(theta) * 40;
            //this.pointLight.position.y = Math.cos( time * 7 ) * 3;
            this.pointLight.position.z = Math.cos(theta) * 40;
            this.redpointLight.position.x = Math.sin(theta - 0.15) * 40;
            this.redpointLight.position.z = Math.cos(theta - 0.15) * 40;
            this.redpointLight2.position.x = Math.sin(theta + 0.15) * 40;
            this.redpointLight2.position.z = Math.cos(theta + 0.15) * 40;
            
            this.sunMesh.position.x = Math.sin(theta) * 40;
            this.sunMesh.position.z = Math.cos(theta) * 40;

            this.moonMesh.position.x = Math.sin(theta*1.05 + 0.83) * 30;
            this.moonMesh.position.z = Math.cos(theta*1.05 + 0.83) * 30;
            
            this.composer.render();
            
            setTimeout(()=>{this.threeAnim = requestAnimationFrame(this.render)},15);
        }
    }  

   
} 