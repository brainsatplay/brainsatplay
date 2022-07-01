import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'


//this file imports a bunch of stuff so you can pass threejs functions

export class threeUtil {
    constructor(canvas,callbackManager,proxy) {

        this.manager = callbackManager;

        this.THREE=THREE;
        this.canvas=canvas, 
        this.proxy = proxy;
        this.renderer=undefined,
        this.composer=undefined,
        this.gui=undefined,
        this.controls=undefined,
        this.camera=undefined,
        this.scene=undefined
        
        this.ANIMATING = false;
        this.ANIMFRAMETIME = 0;

        //keep references to the utility classes we want to use
        this.OrbitControls = OrbitControls;
        this.EffectComposer = EffectComposer;
        this.RenderPass = RenderPass;
        this.SMAAPass = SMAAPass;
        this.UnrealBloomPass = UnrealBloomPass;
        this.PickHelper = PickHelper; //an available class

    }

    setup = (self, args, origin) => { //setup three animation
        this.defaultSetup();
        
        this.ANIMATING = true;
        this.animate(self, args, origin);
    }

    draw = (self, args, origin) => { //frame draw function
        //do something
        this.defaultDraw();
    }

    finished = (self, args, origin) => {
        let dict = {foo:'render', output:this.ANIMFRAMETIME, origin:origin};
        if(this.manager) {
            let emitevent = this.manager.checkEvents('render');
            if(emitevent) this.manager.EVENTS.emit('render',dict);
            else postMessage(dict);
        }
        else postMessage(dict);
    }

    clear = (self, args, origin) => {
      this.defaultClear();
    }

    animate = (self, args, origin) => {
      if(!this.ANIMATING) return;
      this.ANIMFRAMETIME = performance.now() - this.ANIMFRAMETIME;
      this.draw(self, args, origin);
      this.finished(self, args, origin);
      this.ANIMFRAMETIME = performance.now();
      let nextFrame = () => {
        this.animate(self, args, origin);
      }
      requestAnimationFrame(nextFrame);
      //console.log('frame rendered');
    }

    resizeRendererToDisplaySize = (renderer=this.renderer,proxy=this.proxy,camera=this.camera) => {
      const canvas = renderer.domElement;
      const width = proxy.clientWidth;
      const height = proxy.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
        if(camera) {
          camera.aspect = proxy.clientWidth / proxy.clientHeight;
          camera.updateProjectionMatrix();
        }
      }
      //console.log(canvas, width, height);
      return needResize;
    }

    defaultSetup = () => {
      let canvas = this.canvas;
      this.renderer = new THREE.WebGLRenderer({canvas});
      this.time = 0;
  
      const fov = 75;
      const aspect = 2; // the canvas default
      const near = 0.1;
      const far = 100;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.z = 4;
    
      this.controls = new OrbitControls(this.camera, this.proxy);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    
      this.scene = new THREE.Scene();
    
      {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.scene.add(light);
      }
    
      const boxWidth = 1;
      const boxHeight = 1;
      const boxDepth = 1;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    
      const makeInstance = (geometry, color, x) => {
        const material = new THREE.MeshPhongMaterial({
          color,
        });
    
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    
        cube.position.x = x;
    
        return cube;
      }
    
      this.cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
      ];

      

      this.pickPosition = {x: -2, y: -2};

      let getCanvasRelativePosition = (event) => {
        const rect = this.proxy.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }
    
      let setPickPosition = (event) => {
        const pos = getCanvasRelativePosition(event);
        this.pickPosition.x = (pos.x / this.proxy.clientWidth ) *  2 - 1;
        this.pickPosition.y = (pos.y / this.proxy.clientHeight) * -2 + 1;  // note we flip Y
      }
    
      let clearPickPosition = () => {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
      }
    
      this.pickHelper = new this.PickHelper();
      
      clearPickPosition();
    
      
      
      this.proxy.addEventListener('mousemove', setPickPosition);
      this.proxy.addEventListener('mouseout', clearPickPosition);
      this.proxy.addEventListener('mouseleave', clearPickPosition);
    
      this.proxy.addEventListener('touchstart', (event) => {
        // prevent the window from scrolling
        event.preventDefault();
        setPickPosition(event.touches[0]);
      }, {passive: false});
    
      this.proxy.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
      });
    
      this.proxy.addEventListener('touchend', clearPickPosition);

      this.pickPosition = {x: -2, y: -2};
      this.pickHelper = new this.PickHelper();
      clearPickPosition();


      //this.renderer.setAnimationLoop(this.draw);
    }

    defaultDraw = () => {
        this.time += this.ANIMFRAMETIME*0.001;
        this.resizeRendererToDisplaySize(this.renderer,this.proxy,this.camera)
        
    
        this.cubes.forEach((cube, ndx) => {
          const speed = 1 + ndx * .1;
          const rot = this.time * speed;
          cube.rotation.x = rot;
          cube.rotation.y = rot;
        });
    
        
        this.pickHelper.pick(this.pickPosition, this.scene, this.camera, this.time);
        //console.log(this.pickPosition);
        this.renderer.render(this.scene, this.camera);
  
    }

    defaultClear = () => {
        
        this.ANIMATING = false;
        //this.renderer.setAnimationLoop( null );
        this.scene = null;
        if(this.renderer)
          this.renderer.domElement = null;
        this.renderer=null,
        this.composer=null,
        this.gui=null,
        this.controls=null,
        this.camera=null,
        this.scene=null
    }

};

export class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }

  pick(normalizedPosition, scene, camera, time) { //just set this function for new use cases
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}