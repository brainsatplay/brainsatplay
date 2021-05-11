import {Session} from '../../../library/src/Session'
import {DOMFragment} from '../../../library/src/ui/DOMFragment'
import {Boids} from '../../../platform/js/frontend/UX/Particles'
import * as settingsFile from './settings'


export class BoidsApplet {

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
        this.class = null;
        this.looping = false;
        this.loop = null;

        this.hidden = true;
        this.score=0;

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
                <div id='`+props.id+`menu' height='100%' width='100%' style='position:absolute; z-index:3; '>
                    <div>Score: <span id='`+props.id+`score'>0</span></div>
                    <button id='`+props.id+`showhide' style='opacity:0.2; z-index:2;'>Show UI</button><br>
                    <table id='`+props.id+`table' style='z-index:99; display:none;'>
                        <tr><td>Cohesion:</td><td><input type='range' id='`+props.id+`cohesion' min="0" max="0.1" value="0.0001" step="0.0001"></td><td><button id='`+props.id+`cohesionreset'>Reset</button></td></tr>
                        <tr><td>Separation:</td><td><input type='range' id='`+props.id+`separation' min="0" max="10" value="1" step="0.1"></td><td><button id='`+props.id+`separationreset'>Reset</button></td></tr>
                        <tr><td>Alignment:</td><td><input type='range' id='`+props.id+`align' min="0" max="0.9" value="0.5" step="0.01"></td><td><button id='`+props.id+`alignreset'>Reset</button></td></tr>
                        <tr><td>Swirl:</td><td><input type='range' id='`+props.id+`swirl' min="0" max="0.01" value="0.0001" step="0.0001" ></td><td><button id='`+props.id+`swirlreset'>Reset</button></td></tr>
                        <tr><td>Anchor:</td><td><input type='range' id='`+props.id+`anchor' min="0" max="0.05" value="0.003" step="0.001" ></td><td><button id='`+props.id+`anchorreset'>Reset</button></td></tr>
                        <tr><td>Max Speed:</td><td><input type='range' id='`+props.id+`speed' min="0" max="10" value="1" step="0.1" ></td><td><button id='`+props.id+`speedreset'>Reset</button></td></tr>
                        <tr><td>Gravity:</td><td><input type='range' id='`+props.id+`gravity' min="0" max="10" value="0" step="0.1"></td><td><button id='`+props.id+`gravityreset'>Reset</button></td></tr>
                    </table>
                </div>
                <canvas id='`+props.id+`canvas' height='100%' width='100%' style='width:100%; height:100%;'></canvas>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
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
                showhide.style.opacity = 0.2;
            }

            document.getElementById(props.id+'cohesion').onchange = () => {
                this.class.cohesionMul = document.getElementById(props.id+'cohesion').value;
            }
            document.getElementById(props.id+'cohesionreset').onclick = () => {
                this.class.cohesionMul = 0.001;
                document.getElementById(props.id+'cohesion').value = 0.001;
            }
            document.getElementById(props.id+'separation').onchange = () => {
                this.class.separationMul = document.getElementById(props.id+'separation').value;
            }
            document.getElementById(props.id+'separationreset').onclick = () => {
                this.class.separationMul = 1;
                document.getElementById(props.id+'separation').value = 1;
            }
            document.getElementById(props.id+'align').onchange = () => {
                this.class.alignmentMul = document.getElementById(props.id+'align').value;
            }
            document.getElementById(props.id+'alignreset').onclick = () => {
                this.class.alignmentMul = 0.5;
                document.getElementById(props.id+'align').value = 0.5;
            }
            document.getElementById(props.id+'swirl').onchange = () => {
                this.class.swirlMul = document.getElementById(props.id+'swirl').value;
            }
            document.getElementById(props.id+'swirlreset').onclick = () => {
                this.class.swirlMul = 0.0001;
                document.getElementById(props.id+'swirl').value = 0.0001;
            }
            document.getElementById(props.id+'anchor').onchange = () => {
                this.class.attractorMul = document.getElementById(props.id+'anchor').value;
            }
            document.getElementById(props.id+'anchorreset').onclick = () => {
                this.class.attractorMul = 0.003;
                document.getElementById(props.id+'anchor').value = 0.003;
            }
            document.getElementById(props.id+'speed').onchange = () => {
                this.class.particleClass.settings.maxSpeed = document.getElementById(props.id+'speed').value;
            }
            document.getElementById(props.id+'speedreset').onclick = () => {
                this.class.particleClass.settings.maxSpeed = 1;
                document.getElementById(props.id+'speed').value = 1;
            }
            document.getElementById(props.id+'gravity').onchange = () => {
                this.class.particleClass.settings.gravity = document.getElementById(props.id+'gravity').value;
            }
            document.getElementById(props.id+'gravityreset').onclick = () => {
                this.class.particleClass.settings.gravity = 0;
                document.getElementById(props.id+'gravity').value = 0;
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


        //Add whatever else you need to initialize
        this.class = new Boids(200,this.props.id+'canvas');
        this.looping = true;
        this.updateLoop();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        cancelAnimationFrame(this.loop);
        this.class.stop();
        this.class = null;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let canvas = document.getElementById(this.props.id+"canvas");
        canvas.width = this.AppletHTML.node.clientWidth;
        canvas.height = this.AppletHTML.node.clientHeight;

        canvas.style.width = this.AppletHTML.node.clientWidth;
        canvas.style.height = this.AppletHTML.node.clientHeight;
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
                    this.class.onData(score);
                    this.score += score;
                    document.getElementById(this.props.id+'score').innerHTML = this.score.toFixed(3);
                }
            }
            setTimeout(() => { this.loop = requestAnimationFrame(this.updateLoop); },16);
        }
    }



   
} 
