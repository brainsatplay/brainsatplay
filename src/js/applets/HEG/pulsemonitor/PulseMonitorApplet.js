import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'


//Example Applet for integrating with the UI Manager
export class PulseMonitorApplet {

    
    
    static image= featureImg

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.looping = false;
        this.loop = null;
        this.breathCounter = 0;
        this.beatCounter = 0;

        this.canvas; this.ctx;
        this.angle1 = 1.57; this.angle2 = 1.8;

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
                <div id='${props.id}text' style='position:absolute;'>
                    Heart Rate Estimate: <span id='${props.id}hr' style='color:crimson;'>Waiting</span><br>
                    Breathing Rate Estimate: <span id='${props.id}br' style='color:green;'>Waiting</span>
                </div>
                <canvas id='${props.id}canvas'></canvas>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.canvas = document.getElementById(props.id+'canvas');
            this.ctx = this.canvas.getContext("2d");
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
        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let canvas = document.getElementById(this.props.id+"canvas");
        canvas.width = this.AppletHTML.node.clientWidth;
        canvas.height = this.AppletHTML.node.clientHeight;
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
            if(this.bci.atlas.settings.heg) {
                this.onUpdate();
            }
            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop),16});
        }
    }

    onUpdate = () => {
        let heg = this.bci.atlas.data.heg[0];
        if(heg) {
            let hr = heg.beat_detect.beats;
            let breaths = heg.beat_detect.breaths;

            if(hr.length > this.beatCounter) {
                this.beatCounter = hr.length;
                let bpm = hr[hr.length-1].bpm;
                let span = document.getElementById(this.props.id+'hr');
                span.innerHTML = bpm.toFixed(2);
                if(bpm < 30 || bpm > 200) { span.style.color = 'yellow'; } else if (span.style.color !== 'red') { span.style.color = 'red'; }
                console.log(bpm, hr[hr.length-1]);
            }
            if(breaths.length > this.breathCounter) {
                this.breathCounter = breaths.length;
                let bpm = breaths[breaths.length-1].bpm;
                let span = document.getElementById(this.props.id+'br');
                span.innerHTML = bpm.toFixed(2);
                if(bpm < 4.5 || bpm > 20) { span.style.color = 'yellow'; } else if (span.style.color !== 'green') { span.style.color = 'green'; }
                console.log(bpm, breaths[breaths.length-1]);
            }
        }
    }

    draw = () => {
        //just a circle that pulses every beat?

        if(this.angle > 1.57 && this.angle < 3.14){ //generalize

        }
    }

   
} 