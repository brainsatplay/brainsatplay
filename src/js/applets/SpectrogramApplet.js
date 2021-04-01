import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import {addChannelOptions,addCoherenceOptions} from '../frontend/menus/selectTemplates'
import {Spectrogram} from '../bciutils/visuals/eegvisuals'

//Example Applet for integrating with the UI Manager
export class SpectrogramApplet {
    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            width:'800px',
            height:'600px'
        };

        this.class = null;
        this.loop = null;
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
            <div id='`+props.id+`'>
                <div id='`+props.id+`menu' style='position:absolute; z-index:4; color: white;'> 
                    Mode
                    <select id='`+props.id+`mode'>
                        <option value="FFT" selected="selected">FFT</option>
                        <option value="Coherence">Coherence</option>
                    </select>
                    Channel
                    <select id='`+props.id+`channel'>
                        <option value="0" selected="selected">0</option>
                    </select>
                </div>
                <canvas id='`+props.id+`canvas' height='100%' width='100%' style='z-index:3; width:100%; height:100%;'></canvas>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            let a = this.bci.atlas.data;
            addChannelOptions(props.id+'channel',a.eegshared.eegChannelTags);
            document.getElementById(props.id+'channel').onchange = () => {
              this.class.clear();
            }
            document.getElementById(props.id+"mode").onchange = () => {
                this.class.clear();
                if(document.getElementById(props.id+"mode").value === "FFT"){
                  addChannelOptions(props.id+"channel",a.eegshared.eegChannelTags);
                }
                else if(document.getElementById(props.id+"mode").value === "Coherence"){
                  addCoherenceOptions(props.id+"channel",a.coherence);
                }
            }
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

        this.class = new Spectrogram(this.props.id+'canvas', 10000);
        this.class.init();
            
        this.looping = true;
        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.class.deInit();
        this.class = null;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let a = this.bci.atlas.data;
        if(this.bci.atlas.settings.eeg) {
            if(document.getElementById(this.props.id+"mode").value === "FFT"){
                addChannelOptions(this.props.id+"channel",a.eegshared.eegChannelTags);
            }
            else if(document.getElementById(this.props.id+"mode").value === "Coherence"){
                addCoherenceOptions(this.props.id+"channel",a.coherence);
            }
        }
            this.class.canvas.style.width = this.AppletHTML.node.style.width;
            this.class.canvas.style.height = this.AppletHTML.node.style.height;
        
            this.class.canvas.width = Math.floor(this.AppletHTML.node.clientWidth);
            this.class.canvas.height = Math.floor(this.AppletHTML.node.clientHeight*4);
        
            this.class.init();

    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    updateLoop = () => {
        if(this.looping) {
            if(this.bci.atlas.settings.eeg){
                if(this.bci.atlas.getLatestFFTData()[0].fftCount > 0) this.onUpdate();
            }
            setTimeout(() => {this.loop = requestAnimationFrame(this.updateLoop),16});
        }
    }

    onUpdate = () => {
        let a = this.bci.atlas;
        var graphmode = document.getElementById(this.props.id+"mode").value;
        var view = document.getElementById(this.props.id+"channel").value
        var ch = parseInt(view);
        if(graphmode === "FFT"){
          a.data.eegshared.eegChannelTags.find((o,i) => {
            if(o.ch === ch){
              let tag = o.tag;
              var coord = a.getEEGDataByTag(tag);
              if(coord.ffts.length > 1) {
                  this.class.latestData = [...coord.ffts[coord.ffts.length - 1]];
                  this.class.draw();
              }
              return true;
            }
          });
        }
        else if(graphmode === "Coherence"){
          a.data.coherence.find((o,i) => {
            if(o.tag === view){
              let coord = o;
              if(coord.ffts.length > 1) {
                this.class.latestData = [...coord.ffts[coord.ffts.length - 1]];          
                this.class.draw();
              }
              return true;
            }
          });
        }
    }

   
} 