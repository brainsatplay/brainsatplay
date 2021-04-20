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
    static categories = ['feedback'];
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

        // Setup Neurofeedback
        this.defaultNeurofeedback = function defaultNeurofeedback(){return 0.5 + 0.5*Math.sin(Date.now()/2000)} // default neurofeedback function
        this.getNeurofeedback = this.defaultNeurofeedback


        this.brainMetrics = [
            {name:'delta',label: 'Delta', color: [0,0.5,1]}, // Blue-Cyan
            {name:'theta',label: 'Theta',color: [1,0,1]}, // Purple
            {name:'alpha1',label: 'Low Alpha',color:[0,1,0]}, // Green
            {name:'alpha2',label: 'High Alpha',color: [0,1,0]}, // Green
            {name:'beta',label: 'Beta',color: [1,1,0]}, // Yellow
            {name:'lowgamma',label: 'Gamma',color: [1,1,0]} // Red
          ]
          this.brainData = []   
          this.lastColorSwitch=Date.now() 

          this.history = 5
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
                    
                    <div class="brainsatplay-neurofeedback-container" style="position:absolute; top: 25px; left: 25px;">
                    </div>

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


        // const containerElement = document.getElementById(this.props.id);
        const canvas = document.getElementById(`${this.props.id}-canvas`); 
        
        // this.mouse = {x:0, y:0}
        // containerElement.onmousemove = (e) =>{
        //     this.mouse.x = 2*((e.layerX/containerElement.offsetWidth) - 0.5)*this.responsiveScaling.x
        //     this.mouse.y = 2*((e.layerY/containerElement.offsetHeight) - 0.5)*this.responsiveScaling.y
        // }
        

        
        this.app = new PIXI.Application({view: canvas});

        this.colorBuffer = Array.from({length: this.history}, e => [1.0,1.0,1.0])
        this.timeBuffer = Array.from({length: this.history}, e => 0)
        this.noiseBuffer = Array.from({length: this.history}, e => 1.0)

        const uniforms = {
            amplitude: 0.75,
            times: this.timeBuffer,
            aspect: this.app.renderer.view.width/this.app.renderer.view.height,  
            colors: this.colorBuffer.flat(1),
            mouse: [0,0], //[this.mouse.x, this.mouse.y],
            noiseIntensity: this.noiseBuffer
        };
        this.shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        // this.responsive()
        this.generateShaderElements()
        let startTime = Date.now();
        this.app.ticker.add((delta) => {

            // Organize Brain Data 
            this.setBrainData(this.bci.atlas.data.eeg)

            // Change Color
            let c = this.getColor()
            this.colorBuffer.shift()
            this.colorBuffer.push(c)

            this.timeBuffer.shift()
            this.timeBuffer.push((Date.now() - startTime)/1000)

            this.noiseBuffer.shift()
            let neurofeedback = this.getNeurofeedback()
            this.noiseBuffer.push(5.0 * neurofeedback)
                
            // Set Uniforms
            this.shaderQuad.shader.uniforms.colors = this.colorBuffer.flat(1) 
            this.shaderQuad.shader.uniforms.times = this.timeBuffer
            this.shaderQuad.shader.uniforms.noiseIntensity = this.noiseBuffer

            // this.shaderQuad.shader.uniforms.mouse = [this.mouse.x,this.mouse.y]

            // Draw
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
        this.aspect = this.app.renderer.view.width/this.app.renderer.view.height
        this.shaderQuad.shader.uniforms.aspect = this.aspect
        this.generateShaderElements()
        this.bci.atlas.makeFeedbackOptions(this)
    }

    generateShaderElements() {
        const containerElement = document.getElementById(this.props.id);
        const w = containerElement.offsetWidth
        const h = containerElement.offsetHeight
        

        this.geometry = new PIXI.Geometry()
                .addAttribute('aVertexPosition', // the attribute name
                    [0, 0, // x, y
                        w, 0, // x, y
                        w, h,
                        0, h], // x, y
                    2) // the size of the attribute
                .addAttribute('aUvs', // the attribute name
                    [-1, -1, // u, v
                        1, -1, // u, v
                        1, 1,
                        -1, 1], // u, v
                    2) // the size of the attribute
                .addIndex([0, 1, 2, 0, 2, 3]);

        // if (this.shaderContainer == null) 
        this.shaderTexture = PIXI.RenderTexture.create(w,h);
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

        // this.shaderContainer.position.set((containerElement.offsetWidth - Math.min(w,h))/2, (containerElement.offsetHeight - Math.min(w,h))/2);
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

indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
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