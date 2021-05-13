import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
import { SoundJS } from '../../../platform/js/frontend/UX/Sound';
import * as PIXI from 'pixi.js';
import * as settingsFile from './settings'
import vertexSrc from "./shaders/vertex.glsl"
// import fragmentSrc from "./shaders/fractalGalaxy/fragment.glsl"
import fragmentSrc from "./shaders/network/fragment.glsl"

//Example Applet for integrating with the UI Manager
export class SensoriumApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
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
        this.audio = null;
        this.soundStruct = { source:{}, input:{}, controls:{}, muted:false, lastGain:1, uiIdx:false, sourceIdx:false };
        this.sounds = [];//array of soundStructs
        this.inputs = [];
        this.controls = [];
        this.indices = [];

        this.looping = false;

        // Setup Neurofeedback
        this.defaultNeurofeedback = function defaultNeurofeedback(){return 0.5 + 0.5*Math.sin(Date.now()/2000)} // default neurofeedback function
        this.getNeurofeedback = this.defaultNeurofeedback;

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

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%; position: relative;'>
            <canvas id='${props.id}-canvas' style="position: absolute; top: 0; left: 0;"></canvas>
            <div class="brainsatplay-neurofeedback-container" style="position:absolute; top: 25px; right: 25px;">
            </div> 
                <div id='`+props.id+`menu' style='position:absolute; z-index:2; position: absolute; top: 0; left: 0;'> 
                    <button id='`+props.id+`showhide' style='z-index:2; opacity:0.2;'>Hide UI</button> 
                    <button id='${props.id}addsound'>Add Sound</button>
                    <div id='${props.id}filemenu'></div>
                    <div id='${props.id}soundcontrols'></div> 
                    </div>
                </div>    
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id+'addsound').onclick = () => {
                this.addSoundInput();
            };
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


        //Add whatever else you need to initialize
        this.looping = true;
        
        this.ct = 0;

        const canvas = document.getElementById(`${this.props.id}-canvas`); 
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
            this.setBrainData(this.session.atlas.data.eeg)

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



        this.animate();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.indices.forEach((i)=>{
            this.audio.stopSound(i);
        });
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
        this.session.atlas.makeFeedbackOptions(this)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    
    addSoundInput = () => {
        let fileinput = (idx=0, props=this.props) => {
            return `
                <div id='${props.id}fileWrapper${idx}' style='font-size:10px;'> 
                    <div id='${props.id}fileinfo${idx}'></div> 
                    Sounds:<select id='${props.id}select${idx}'><option value=''>None</option></select> 
                    <button id='${props.id}uploadedFile${idx}'>Add File</button> ${idx}
                    <div id='${props.id}status${idx}'></div>
                </div>
            `;
        }

        let controls = (idx=0, props=this.props) => {
            return `
                <div id='${props.id}controlWrapper${idx}'>
                    <button id='${props.id}play${idx}'>Play ${idx}</button>
                    <button id='${props.id}mute${idx}'>Mute ${idx}</button>
                    <button id='${props.id}stop${idx}'>Remove ${idx}</button>
                    Feedback ${idx}:
                    <select id='${props.id}select${idx}'>
                        <option value='none'>None</option>
                        <option value='hr'>Heart Beat</option>
                        <option value='heg'>HEG Ratio</option>
                        <option value='hrv'>Heart Rate Variability</option>
                        <option value='delta'>Delta Bandpower</option>
                        <option value='theta'>Theta Bandpower</option>
                        <option value='alpha1'>Alpha1 Bandpower</option>
                        <option value='alpha2'>Alpha2 Bandpower</option>
                        <option value='beta'>Beta Bandpower</option>
                        <option value='gamma'>Low Gamma Bandpower</option>
                        <option value='40hz'>40Hz Bandpower</option>
                        <option value='tb'>Theta/Beta Ratio</option>
                        <option value='a12'>Alpha 2/1 Ratio</option>
                        <option value='ab'>Alpha/Beta Ratio</option>
                        <option value='acoh'>Frontal Alpha Coherence</option>
                    </select>
                </div>
            `;
        }

        let idx = this.ct; this.ct++;

        let newSound = JSON.parse(JSON.stringify(this.soundStruct));
        this.sounds.push(newSound);
        newSound.uiIdx = idx;
        
        document.getElementById(this.props.id+'filemenu').insertAdjacentHTML('beforeend',fileinput(idx));
        newSound.input = document.getElementById(this.props.id+'fileWrapper'+idx);

        document.getElementById(this.props.id+'uploadedFile'+idx).onclick = () => {
            if(!this.audio) this.audio = new SoundJS();
            if (this.audio.ctx===null) {return;};

            this.audio.decodeLocalAudioFile((sourceListIdx)=>{    
                document.getElementById(this.props.id+'soundcontrols').insertAdjacentHTML('beforeend',controls(idx));
                newSound.controls = document.getElementById(this.props.id+'controlWrapper'+idx);
                
                newSound.source = this.audio.sourceList[sourceListIdx]; 
                newSound.sourceIdx = sourceListIdx;
                newSound.input.style.display='none';
                document.getElementById(this.props.id+'status'+idx).innerHTML = "Loading..." 

                this.loadSoundControls(newSound);
                document.getElementById(this.props.id+'status'+idx).innerHTML = "";
            }, 
            ()=> { 
                
            });
            
        }
        
        
    }


    //doSomething(){}
    loadSoundControls = (newSound) => {
        
        document.getElementById(this.props.id+'play'+newSound.uiIdx).onclick = () => {
            this.audio.playSound(newSound.sourceIdx,0,true);
        }

        document.getElementById(this.props.id+'stop'+newSound.uiIdx).onclick = () => {
            
            try{this.audio.playSound(newSound.sourceIdx,0,false);} catch(er) {}
            this.audio.stopSound(newSound.sourceIdx);
            
            newSound.input.parentNode.removeChild(newSound.input);
            newSound.controls.parentNode.removeChild(newSound.controls);

            let thisidx=0;
            this.sounds.forEach((soundStruct,j)=> {
                if(soundStruct.sourceIdx === newSound.sourceIdx) thisidx = j; 
                else if(soundStruct.sourceIdx > newSound.sourceIdx) {
                    soundStruct.sourceIdx--;
                    this.loadSoundControls(soundStruct);
                }

            });
            this.sounds.splice(thisidx,1);

        }

        document.getElementById(this.props.id+'mute'+newSound.uiIdx).onclick = () => {
            if(this.audio.sourceGains[newSound.sourceIdx].gain.value !== 0){
                newSound.lastGain = this.audio.sourceGains[newSound.sourceIdx].gain.value;
                this.audio.sourceGains[newSound.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                newSound.muted = true;
                
            } else {  newSound.muted = false; this.audio.sourceGains[newSound.sourceIdx].gain.setValueAtTime(newSound.lastGain, this.audio.ctx.currentTime); }
        }
    };

    animate = () => {
        if(this.looping){
            this.sounds.forEach((soundStruct)=> {
                let option = document.getElementById(this.props.id+'select'+soundStruct.uiIdx).value;
                if(!soundStruct.muted){
                    if(this.session.atlas.data.heg.length>0) {
                        if(option === 'hr') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime( //make the sound fall off on a curve based on when a beat occurs
                                Math.max(0,Math.min(1/(0.001*(Date.now()-this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].t)),1)), 
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'heg') { //Raise HEG ratio compared to baseline
                            if(!this['hegbaseline'+idx]) this['hegbaseline'+idx] = this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1];
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.min(Math.max(0,this.session.atlas.data.heg[0].ratio[this.session.atlas.data.heg[0].ratio.length-1]-this['hegbaseline'+idx]),1), //
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'hrv') { //Maximize HRV, set the divider to set difficulty
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.max(0,Math.min(this.session.atlas.data.heg[0].beat_detect.beats[this.session.atlas.data.heg[0].beat_detect.beats.length-1].hrv/30,1)), //
                                this.audio.ctx.currentTime
                            );
                        } 
                    }
                    if(this.session.atlas.settings.eeg === true && this.session.atlas.settings.analyzing === true) { 
                        if (option === 'delta') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime); //bandpowers should be normalized to microvolt values, so set these accordingly
                        } else if (option === 'theta') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha1') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha2') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'beta') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'gamma') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === '40hz') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'tb') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'a12') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'ab') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (this.session.atlas.settings.coherence === true && option === 'acoh') {
                            this.audio.sourceGains[soundStruct.sourceIdx].gain.setValueAtTime(
                                Math.max(Math.min(0,this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')),1), 
                                this.audio.ctx.currentTime
                            );
                        }
                    }
                }
            });
        
            setTimeout(()=>{this.animate();},16);
        }
    }



    // Shader Stuff
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

} 
