import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
import { SoundJS } from '../../../platform/js/frontend/UX/Sound';
import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class SensoriumApplet {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
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
        this.inputs = [];
        this.controls = [];
        this.indices = [];

        this.looping = false;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='`+props.id+`menu' style='position:absolute; z-index:2;'> 
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
            document.getElementById(props.id+'addsound'),onclick = () => {
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
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
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
                    <input type="file" id='${props.id}uploadedFile${idx}'></input> 
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

        let idx = this.inputs.length;

        document.getElementById(this.props.id+'filemenu').insertAdjacentHTML('beforeend',fileinput(idx));
        document.getElementById(this.props.id+'soundcontrols').insertAdjacentHTML('beforeend',controls(idx));
        document.getElementById(this.props.id+'fileWrapper'+idx).onchange = () => {
            let url = document.getElementById(this.props.id+'uploadedFile'+idx).value;
            this.loadSound(url,idx);
        }
        
        this['muted'+idx] = false;

        this.indices.push(idx);
        this.inputs.push(document.getElementById(this.props.id+'fileWrapper'+idx));
        this.controls.push(document.getElementById(this.props.id+'controlWrapper'+idx));
    }


    //doSomething(){}
    loadSound = (url, idx=0) => {
        if(!this.audio) this.audio = new SoundJS();
        if (this.audio.ctx===null) {return;};
        
        this.audio.addSounds([url]);
        let len = this.audio.sourceList.length-1;
        document.getElementById(this.props.id+'play'+idx).onclick = () => {
            this.audio.playSound(len,0,true);
        }
        document.getElementById(this.props.id+'stop'+idx).onclick = () => {
            this.audio.stopSound(len);
            this.inputs[len].parentNode.removeChild(this.inputs[len]);
            this.controls[len].parentNode.removeChild(this.controls[len]);
            if(this.indices.length-1 !== len) { 
                this.indices.map((el,i)=>{
                    if(i > len) { return el--; } //subtract off these indices
                });  
            }
            this.indices.splice(len,1);
            
        }
        document.getElementById(this.props.id+'mute'+idx).onclick = () => {
            if(this.audio.sourceGains[len].gain !== 0){
                this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                this['muted'+idx] = true;
            } else { this['muted'+idx] = false; }
        }
    };

    animate = () => {
        if(this.looping){
            this.indices.forEach((idx)=> {
                let option = document.getElementById(this.props.id+'select'+idx).value;
                if(!this['muted'+idx]){
                    if(this.bci.atlas.data.heg.length>0) {
                        if(option === 'hr') {
                            this.audio.sourceGains[len].gain.setValueAtTime( //make the sound fall off on a curve based on when a beat occurs
                                Math.max(0,Math.min(1/(0.001*(Date.now()-this.bci.atlas.data.heg[0].beat_detect.beats[this.bci.atlas.data.heg[0].beat_detect.beats.length-1].t)),1)), 
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'heg') { //Raise HEG ratio compared to baseline
                            if(!this['hegbaseline'+idx]) this['hegbaseline'+idx] = this.bci.atlas.data.heg[0].ratio[this.bci.atlas.data.heg[0].ratio.length-1];
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.min(Math.max(0,this.bci.atlas.data.heg[0].ratio[this.bci.atlas.data.heg[0].ratio.length-1]-this['hegbaseline'+idx]),1), //
                                this.audio.ctx.currentTime
                            );
                        } else if (option === 'hrv') { //Maximize HRV, set the divider to set difficulty
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.max(0,Math.min(this.bci.atlas.data.heg[0].beat_detect.beats[this.bci.atlas.data.heg[0].beat_detect.beats.length-1].hrv/30,1)), //
                                this.audio.ctx.currentTime
                            );
                        } 
                    }
                    if(this.bci.atlas.settings.eeg === true && this.bci.atlas.settings.analyzing === true) { 
                        if (option === 'delta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime); //bandpowers should be normalized to microvolt values, so set these accordingly
                        } else if (option === 'theta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha1') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'alpha2') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'beta') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'gamma') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === '40hz') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'tb') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'a12') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (option === 'ab') {
                            this.audio.sourceGains[len].gain.setValueAtTime(0, this.audio.ctx.currentTime);
                        } else if (this.bci.atlas.settings.coherence === true && option === 'acoh') {
                            this.audio.sourceGains[len].gain.setValueAtTime(
                                Math.max(Math.min(0,this.bci.atlas.getCoherenceScore(this.bci.atlas.getFrontalCoherenceData(),'alpha1')),1), 
                                this.audio.ctx.currentTime
                            );
                        }
                    }
                }
            });
        
            setTimeout(()=>{this.animate();},16);
        }
    }

} 
