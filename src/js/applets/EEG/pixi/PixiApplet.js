import {brainsatplay} from '../../../brainsatplay'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'
import * as PIXI from 'pixi.js';
import featureImg from './img/feature.png'

//Example Applet for integrating with the UI Manager
export class PixiApplet {

    static name = "Pixi"; 
    static devices = ['eeg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "Bandpower visualizer."
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

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                    <canvas id='${this.props.id}-canvas'></canvas>
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
        const canvas = document.getElementById(`${this.props.id}-canvas`);

        this.app = new PIXI.Application({ 
            view:canvas,
            antialias: true
         });
        //  this.app.renderer.resize(containerElement.clientWidth,containerElement.clientHeight)

        containerElement.appendChild(this.app.view);
        
        let graphics = new PIXI.Graphics()

        // Translate
        let centerX = this.app.renderer.width / 2
        let centerY = this.app.renderer.height / 2
        this.bendStrength = 2;
        graphics.lineStyle(10,0x00ffff)
        graphics.beginFill(0xff0000)
        let n1 = {
                position: {
                x:50,
                y:0
            }
        }
        let n2 = {
            position: {
                x:0,
                y:50
            }
        }
        let ctrlPt1 = [n1.position.x*this.bendStrength, n1.position.y*this.bendStrength]
        let ctrlPt2 = [n2.position.x*this.bendStrength, n2.position.y*this.bendStrength]

        const bezier = new PIXI.Graphics();
        bezier.x = centerX
        bezier.y = centerY
        bezier.lineStyle(5, 0xAA0000, 1);
        bezier.bezierCurveTo(ctrlPt1[0],ctrlPt1[1],ctrlPt2[0],ctrlPt2[1],n2.position.x, n2.position.y);
        bezier.position.x = 50;
        bezier.position.y = 50;
        this.app.stage.addChild(bezier);

        let animate = () => {

        }

        this.app.ticker.add(animate);;
        
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let container = document.getElementById(this.props.id)

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

    //doSomething(){}

   
} 