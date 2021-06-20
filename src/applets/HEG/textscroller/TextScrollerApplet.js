import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as settingsFile from './settings'


export class TextScrollerApplet {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        
        this.c = null;
        this.ctx = null;
        this.text = 'Leap clear of all that is corporeal, and make yourself grown to a like expanse with that greatness which is beyond all measure... rise above all time and become eternal... then you will apprehend God. \
        Think that for you too nothing is impossible; deem that you too are immortal, and that you are able to grasp all things in your thought, to know every craft and science; find your home in the haunts of every living creature; \
        make yourself higher than all heights and lower than all depths; bring together in yourself all opposites of quality, heat and cold, dryness and fluidity; \
        think that you are everywhere at once, on land, at sea, in heaven; think that you are not yet begotten, that you are in the womb, that you are young, that you are old, that you have died, that you are in the world beyond the grave; \
        grasp in your thought all of this at once, all times and places, all substances and qualities and magnitudes together; then you can apprehend God. \
        But if you shut up your soul in your body, and abase yourself, and say “I know nothing, I can do nothing; I am afraid of earth and sea, I cannot mount to heaven; I know not what I was, nor what I shall be,” then what have you to do with God?';
        this.hidden = false;
        
        this.pxf = 0.5; //Pixels per frame;
        this.lastpxf = this.pxf; //Store last pxf when paused or whatever
        this.maxXPos = 100;
        this.textXPos = 0;
        this.animationId = null;

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
                <div id='`+props.id+`menu' style='position:absolute; z-index:4;'> \
                    <textarea id='`+props.id+`Textarea'>Breathe in, Breathe out, Breathe in, Breathe out...</textarea><br> \
                    <button id='`+props.id+`submittext'>Submit</button> \
                </div>
                <button id='`+props.id+`showhide' style='float:right; z-index:5;'>Hide UI</button>       
                <canvas id='`+props.id+`canvas'></canvas>
            </div>
            `;

        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            this.c = document.getElementById(props.id+'canvas');
            this.ctx = this.c.getContext("2d");

            document.getElementById(props.id+'submittext').onclick = () => {
                this.text = document.getElementById(props.id+'Textarea').value;
                this.textXPos = 0;
              }
          
              document.getElementById(props.id+"showhide").onclick = () => {
                if(this.hidden == false) {
                  this.hidden = true;
                  document.getElementById(props.id+"showhide").innerHTML = "Show UI";
                  document.getElementById(props.id+'menu').style.display = "none";
                }
                else{
                  this.hidden = false;
                  document.getElementById(props.id+"showhide").innerHTML = "Hide UI";
                  document.getElementById(props.id+'menu').style.display = "";
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


        this.maxXPos = this.AppletHTML.node.clientWidth;

        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        cancelAnimationFrame(this.updateLoop);
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let canvas = document.getElementById(this.props.id+"canvas");
        canvas.width = this.AppletHTML.node.clientWidth;
        canvas.height = this.AppletHTML.node.clientHeight;
        this.maxXPos = this.AppletHTML.node.clientWidth;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    startpxf = () => {
        this.pxf = this.lastpxf; 
    }

    stoppxf = () => {
        this.lastpxf = this.pxf; this.pxf = 0;
    }

    onData(score) {
        this.pxf += score;
    }

    updateLoop = () => {
        if(this.session.atlas.settings.heg && this.session.atlas.settings.deviceConnected) {
            let ct = this.session.atlas.data.heg[0].count;
            let avg = 40; if(ct < avg) { avg = ct; }
            let slice = this.session.atlas.data.heg[0].ratio.slice(ct-avg);
            let score = this.session.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
            this.onData(score);
        }
        this.draw();
        setTimeout(()=>{this.animationId = requestAnimationFrame(this.updateLoop);},15);
    }
    
  draw = () => {
    this.maxXPos = this.c.width;

    this.textXPos += this.pxf;

    //draw this.text at correct position, in middle of canvas;
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);

    this.ctx.font = "2em Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(this.text, this.maxXPos - this.textXPos, this.c.height*0.5);
     
  }
    
    

   
} 
