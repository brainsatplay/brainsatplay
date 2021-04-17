import {brainsatplay} from '../../../brainsatplay'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'
import p5 from 'p5';
import {Ring} from './Ring';
import featureImg from './img/feature.png'

//Example Applet for integrating with the UI Manager
export class BrainArtApplet {

    static name = "Brain Art"; 
    static devices = ['eeg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "Generate art using your brain."
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
            buttonOutput: 0 //Add whatever else
        };

        this.ring = null;
        this.sketch = null;
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 

            let buttonStyle = `
            box-sizing: border-box; 
            min-height: 50px;
            flex-grow: 1;
            width: 200px;
            position: relative;
            padding: 5px;
            border-radius: 5px;
            font-size: 80%;
            background: transparent;
            color: white;
            border: 1px solid rgb(200, 200, 200);
            text-align: left;
            transition: 0.5s;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px;
        `


            return `
                <div id='${props.id}' style='height:${props.height}; width:${props.width}; position:relative; '>
                    <div style="position:absolute; bottom: 25px; right: 25px;">
                        <button id='${props.id}-reset' style="${buttonStyle}">Reset</button>
                    </div>

                    <div style="position:absolute; top: 25px; left: 25px;">
                        <select>
                            <option value='default' disabled>Select your art style</option>
                            <option value="Ring">Ring</option>
                        </select>
                        <p style="font-size: 80%;">Press CTRL + SHIFT + s to take a screenshot.
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

        if(this.settings.length > 0) { this.configure(this.settings); } //you can give the app initialization settings if you want via an array.


        //Add whatever else you need to initialize        
        const containerElement = document.getElementById(this.props.id);


        const sketch = (p) => {
            p.setup = () => {
                p.createCanvas(containerElement.clientWidth, containerElement.clientHeight);
                this.ring = new Ring(p)
                p.background(0);
            };

            p.draw = () => {
                this.ring.setBrainData(this.bci.atlas.data.eeg)
                // if (Date.now() - this.ring.lastDraw >= this.ring.drawInterval || this.ring.lastDraw == null){
                    this.ring.drawShape()
                    this.ring.lastDraw = Date.now()
                // }
            };
        };

        setTimeout(() => {this.sketch = new p5(sketch, containerElement)},100);

        document.getElementById(`${this.props.id}-reset`).onclick = () => {
            this.sketch.background(0)
        }       
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let containerElement = document.getElementById(this.props.id)
        this.sketch.resizeCanvas(containerElement.clientWidth, containerElement.clientHeight);
        this.sketch.background(0)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }
} 