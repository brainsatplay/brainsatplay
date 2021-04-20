import {brainsatplay} from '../../../brainsatplay'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'

import { SoundJS } from '../../../frontend/UX/Sound';
import featureImg from './img/feature.png'

export class CircleApplet {

    static name = "Circle"; 
    static devices = ['heg']
    static description = "Increase your HEG ratio!"
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
            //Add whatever else
        };

        //etc..
        this.loop = null;
        this.looping = false;
   
        this.canvas = null;
        this.ctx = null;
        this.angle = 1.57;
        this.angleChange = 0;
        this.soundFX = null;
        this.hidden = false;
        this.bgColor = "#34baeb";
        this.cColor = "#ff3a17";

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id=`+props.id+`>
                <div id='`+props.id+`menu' style='position:absolute; z-index:3; '>
                    <button id='`+props.id+`showhide' style='opacity:0.1;'>Hide UI</button>
                    <table id='`+props.id+`table' style='z-index:99;'>
                        <td><button id='`+props.id+`audio'>Tone</button></td>
                    </table>
                </div>
                <canvas id='`+props.id+`canvas' style='z-index:1;'></canvas>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            let aud = document.getElementById(props.id+'audio');
            aud.style.opacity = 0.3;
            aud.onclick = () => {
                if(this.soundFX === null) {
                    this.soundFX = new SoundJS();
                    this.soundFX.gainNode.gain.value = 0.1;
                    this.soundFX.playFreq([300]);
                    aud.style.opacity = 1.0;
                }
                else {
                    if(this.soundFX.gainNode.gain.value === 0) {
                            this.soundFX.gainNode.gain.value = 0.1;
                            aud.style.opacity = 1.0;
                    }
                    else {
                        this.soundFX.gainNode.gain.value = 0;
                        aud.style.opacity = 0.2;
                    }
                }
            }

            let showhide = document.getElementById(props.id+'showhide');
            let table = document.getElementById(props.id+'table');
            showhide.onclick = () => {
                if(this.hidden === false) {
                    table.style.display = 'none';
                    showhide.innerHTML = "Show UI";
                    this.hidden = true;
                }
                else {
                    table.style.display = '';
                    showhide.innerHTML = "Hide UI";
                    this.hidden = false;
                }
            }

            showhide.onmouseover = () => {
                showhide.style.opacity = 1.0;
            }
            showhide.onmouseleave = () => {
                showhide.style.opacity = 0.1;
            }

            this.canvas = document.getElementById(props.id+"canvas");
            this.ctx = this.canvas.getContext('2d');
            this.draw();
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
        this.loop = this.updateLoop();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        cancelAnimationFrame(this.loop);
        if(this.soundFX !== null){
            this.soundFX.osc[0].stop(0);
        }

        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.canvas.width = this.AppletHTML.node.clientWidth;
        this.canvas.height = this.AppletHTML.node.clientHeight;
        this.canvas.style.width = this.AppletHTML.node.clientWidth;
        this.canvas.style.height = this.AppletHTML.node.clientHeight;

        this.draw();
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    updateLoop = () => {
        if(this.looping){
            if(this.bci.atlas.settings.heg) {
                let ct = this.bci.atlas.data.heg[0].count;
                if(ct >= 2) {
                    let avg = 40; if(ct < avg) { avg = ct; }
                    let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
                    let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
                    this.angleChange = score;
                    this.draw();
                }
            }
            setTimeout(() => { this.loop = requestAnimationFrame(this.updateLoop); },16);
        }
    }

    draw = () => {
        let cWidth = this.canvas.width;
        let cHeight = this.canvas.height;
           // style the background
        var gradient = this.ctx.createRadialGradient(cWidth*0.5,cHeight*0.5,2,cWidth*0.5,cHeight*0.5,100*this.angle*this.angle);
        gradient.addColorStop(0,"purple");
        gradient.addColorStop(0.25,"dodgerblue");
        gradient.addColorStop(0.32,"skyblue");
        gradient.addColorStop(1,this.bgColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0,0,cWidth,cHeight);
        
        // draw the circle
        this.ctx.beginPath();

        if(((this.angle > 1.57) || (this.angleChange > 0)) && ((this.angle < 3.14) || (this.angleChange < 0))){ //generalize
            this.angle += this.angleChange*0.1;
            if(this.soundFX !== null){
                this.soundFX.osc[0].frequency.value += this.angleChange*100;
            }
        }

        var radius = cHeight*0.04 + (cHeight*0.46) * Math.abs(Math.cos(this.angle));
        this.ctx.arc(cWidth*0.5, cHeight*0.5, radius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        
        // color in the circle
        this.ctx.fillStyle = this.cColor;
        this.ctx.fill();
        //console.log(this.ctx, this.cColor, this.bgColor)
        
    }

} 