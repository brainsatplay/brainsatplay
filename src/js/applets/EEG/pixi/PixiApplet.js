import {brainsatplay} from '../../../brainsatplay'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'
import * as PIXI from 'pixi.js';
import featureImg from './img/feature.png'
// import perlinImg from './img/perlin.jpeg'

import vertexSrc from "./shaders/vertex.glsl"
// import fragmentNoiseSrc from "./shaders/perlin/fragment.glsl"
// import fragmentGridSrc from "./shaders/grid/fragment.glsl"
// import fragmentRippleSrc from "./shaders/ripple/fragment.glsl"
// import fragmentWaveSrc from "./shaders/waves/fragment.glsl"
import fragmentSrc from "./shaders/noiseCircle/fragment.glsl"
// import fragmentCombineSrc from "./shaders/combination/fragment.glsl"
//Example Applet for integrating with the UI Manager
export class PixiApplet {

    static name = "Pixi"; 
    static devices = ['eeg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "Control a shader with your brain."
    static categories = ['data'];
    static image=featureImg

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
        };

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the this.app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the this.app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                <canvas id='${props.id}-canvas'></canvas>
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

        if(this.settings.length > 0) { this.configure(this.settings); } //you can give the this.app initialization settings if you want via an array.


        //Add whatever else you need to initialize     
        const canvas = document.getElementById(`${this.props.id}-canvas`);   
        this.app = new PIXI.Application({view: canvas});

        this.colorBuffer = Array.from({length: 5}, e => [1.0,1.0,1.0])
        const uniforms = {
            amplitude: 0.75,
            time: 0,
            aspect: this.app.renderer.view.width/this.app.renderer.view.height,  
            colors: this.colorBuffer.flat(1)          
        };
        this.shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        this.generateShaderElements()
        let startTime = Date.now();
        this.app.ticker.add((delta) => {
            this.shaderQuad.shader.uniforms.time = (Date.now() - startTime)/1000
            this.colorBuffer.shift()
            this.colorBuffer.push([0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/1000)),0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/500)),0.25 + 0.75*(0.5 + 0.5*Math.sin(Date.now()/200))])
            this.shaderQuad.shader.uniforms.colors = this.colorBuffer.flat(1) 

            this.app.renderer.render(this.shaderQuad, this.shaderTexture);
        });
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        const containerElement = document.getElementById(this.props.id);
        let w = containerElement.offsetWidth
        let h = containerElement.offsetHeight
        this.app.renderer.view.width = w;
        this.app.renderer.view.height = h;
        this.app.renderer.view.style.width = w + 'px';
        this.app.renderer.view.style.height = h + 'px';
        this.app.renderer.resize(w,h)
        this.shaderQuad.shader.uniforms.aspect = this.app.renderer.view.width/this.app.renderer.view.height
        this.generateShaderElements()
    }

    generateShaderElements() {
        const containerElement = document.getElementById(this.props.id);
        const w = containerElement.offsetWidth
        const h = containerElement.offsetHeight

        this.geometry = new PIXI.Geometry()
                .addAttribute('aVertexPosition', // the attribute name
                    [0, 0, // x, y
                        Math.min(w,h), 0, // x, y
                        Math.min(w,h), Math.min(w,h),
                        0, Math.min(w,h)], // x, y
                    2) // the size of the attribute
                .addAttribute('aUvs', // the attribute name
                    [0, 0, // u, v
                        1, 0, // u, v
                        1, 1,
                        0, 1], // u, v
                    2) // the size of the attribute
                .addIndex([0, 1, 2, 0, 2, 3]);

        // if (this.shaderContainer == null) 
        this.shaderTexture = PIXI.RenderTexture.create(Math.min(w,h),Math.min(w,h));
        // if (this.shaderQuad == null)  
        this.shaderQuad = new PIXI.Mesh(this.geometry, this.shader);

        if (this.shaderContainer != null) this.app.stage.removeChild(this.shaderContainer)
        this.shaderContainer = new PIXI.Container();
        this.shaderContainer.addChild(this.shaderQuad);
        this.app.stage.addChild(this.shaderContainer);

        // Final combination pass
        // const combineUniforms = {
        //     texNoise: noiseTexture,
        //     texWave: waveTexture,
        // };
        // const combineShader = PIXI.Shader.from(vertexSrc, fragmentCombineSrc, combineUniforms);
        // const combineQuad = new PIXI.Mesh(this.geometry, combineShader);

        this.shaderContainer.position.set((containerElement.offsetWidth - Math.min(w,h))/2, (containerElement.offsetHeight - Math.min(w,h))/2);
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