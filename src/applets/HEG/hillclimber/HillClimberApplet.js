import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import {SoundJS} from '../../../platform/js/frontend/UX/Sound'
import * as settingsFile from './settings'


export class HillClimberApplet {

    
    
    
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

        this.mode = 1;
        this.lastValue = 0;
        this.feedback = 'ratio'; //hrv
        
        this.c=false;
        this.ctx=false;
        this.gradient=null;
        window.audio = null;
        this.hidden=false;

        this.updateInterval = 1000;
        this.allCapsReachBottom = false;
        this.meterWidth = 12;
        this.meterGap = 2;
        this.hillNum = 150; //count of the meters
        this.capHeight = 2;
        this.capStyle = '#fff';

        this.relativeWidth = this.hillNum*(this.meterWidth+this.meterGap);

        this.hillScore = [...Array(this.hillNum).fill(50)]; //
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
            <div id="`+props.id+`"> 
                <div id="`+props.id+`menu" style='position:absolute; z-index:4;'> 
                    <table> 
                        <tr><td><button id="`+props.id+`hillsRbutton">Reset</button></td></tr> 
                        <tr><td><button id="`+props.id+`hillsModebutton">Mode</button></td></tr> 
                        <tr><td><button id="`+props.id+`feedback">Ratio</button></td></tr>
                        <tr><td><button id="`+props.id+`hillsAudbutton">Audio</button></td></tr> 
                        <tr><td><input type="number" id="`+props.id+`speed" placeholder="Update (Sec)"></input></td></tr> 
                        <tr><td><button id="`+props.id+`hillsSpeedbutton">Set Speed</button></tr></td> 
                        <tr><td>Score: <span id='`+props.id+`score'>0</span></tr></td> 
                    </table> 
                </div> 
                <button id="`+props.id+`showhide" style='float:right; z-index:4;'>Hide UI</button>'
                <canvas id="`+props.id+`canvas" style='z-index:1;'></canvas>
            </div> 
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            this.c = document.getElementById(this.props.id+'canvas');
            this.ctx = this.c.getContext("2d");

            this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.c.height);
            this.gradient.addColorStop(1, 'dodgerblue');
            this.gradient.addColorStop(0.9, 'green');
            this.gradient.addColorStop(0.8, 'springgreen');
            this.gradient.addColorStop(0.65, 'sandybrown')
            this.gradient.addColorStop(0.45, 'slategray')
            this.gradient.addColorStop(0.35, 'silver')
            this.gradient.addColorStop(0.2, 'snow');
            this.gradient.addColorStop(0.1, 'white');
            this.gradient.addColorStop(0.00, 'gold');
                    
            document.getElementById(props.id+"hillsAudbutton").style.opacity = 0.3;

            document.getElementById(props.id+"feedback").onclick = () => {
              if(this.feedback === 'ratio') { 
                this.feedback = 'hrv'; 
                document.getElementById(props.id+"feedback").innerHTML = "HRV";
              }
              else {
                this.feedback = 'ratio';
                document.getElementById(props.id+"feedback").innerHTML = "Ratio";
              }
            }

            document.getElementById(props.id+"hillsRbutton").onclick = () => {
                this.hillScore = [...Array(this.hillNum).fill(50)];
            }
            document.getElementById(props.id+"hillsModebutton").onclick = () => {
                if(this.mode == 0) { this.mode = 1; }
                else{this.mode = 0;}
            }
            document.getElementById(props.id+"hillsAudbutton").onclick = () => {
                if(!window.audio){
                    window.audio = new SoundJS(); //Init on gesture
                    document.getElementById(props.id+"hillsAudbutton").style.opacity = 1.0;
                }
                else{
                    if(window.audio.gainNode.gain.value == 0){
                    window.audio.gainNode.gain.value = 1;
                    document.getElementById(props.id+"hillsAudbutton").style.opacity = 1.0;
                    }
                    else {
                    window.audio.gainNode.gain.value = 0;
                    document.getElementById(props.id+"hillsAudbutton").style.opacity = 0.3;
                    }
                }
            }
            document.getElementById(props.id+"hillsSpeedbutton").onclick = () => {
              this.updateInterval = document.getElementById(props.id+"speed").value*1000;
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


        //Add whatever else you need to initialize
        this.updateLoop();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.stop();
        if(window.audio){
            if(window.audio.osc[0] != undefined) {
              window.audio.osc[0].stop(0);
            }
          }
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

    onData(score){
        var newscore = this.hillScore[this.hillScore.length - 1]+score*20
        //if(newscore > this.c.height){
          this.hillScore[this.hillScore.length - 1] = newscore;
          if(this.hillScore[this.hillScore.length - 1] < 10) { // minimum score (prevents rendering outside viewport)
            this.hillScore[this.hillScore.length - 1] = 10;
          }
          if(score > 0) {
            this.hillScore[this.hillScore.length - 1] += 0.5;
          }
          if(score < 0) {
            this.hillScore[this.hillScore.length - 1] -= 0.3;
          }
        //}
        //else {
        //  this.hillScore[this.hillScore.length - 1] = this.c.height;
        //}
    }

    stop() {
        if(this.animationId != null){
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      }
    
    updateLoop = () => {
        if(this.bci.atlas.settings.heg) {
          if(this.feedback === 'ratio') {
            let ct = this.bci.atlas.data.heg[0].count;
            let avg = 40; if(ct < avg) { avg = ct; }
            let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
            let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
            this.onData(score);
          }
          else if (this.feedback === 'hrv') {
            let hr = this.bci.atlas.data.heg[0].beat_detect.beats;
            if(hr.length > 4) {
              let reducer = (a,c) => {return {hrv:a.hrv+c.hrv}};
              let hrv = hr.slice(hr.length-5).reduce(reducer).hrv * 0.20;
              let dhrv = hrv - this.lastValue;
              let score = 0;
              if(hrv >= 10 && dhrv <= 5) { score = 0.1;} //steady and high hrv
              else if (hrv < 10 || dhrv > 5) { score = -0.1; }
              this.onData(score);
            }
          }
          document.getElementById(this.props.id+'score').innerHTML = this.hillScore.toFixed(3);
        }
        this.draw();
        setTimeout(() => {this.animationId = requestAnimationFrame(this.updateLoop);}, this.updateInterval);
    }
   
    draw = () => {
        // Get data interval
        // Create background and bars
        // Change height of bars based on avg or rms. (all at 0 on fresh session)
        // Update last bar for every t time interval based on change
        if(window.audio != null){
          if(this.hillScore[this.hillScore.length - 1] > this.hillScore[this.hillScore.length - 2]) {
            window.audio.playFreq([650+this.hillScore[this.hillScore.length - 1]], 0.05);
          }
          else if(this.hillScore[this.hillScore.length - 1] < this.hillScore[this.hillScore.length - 2]){
            window.audio.playFreq([250+this.hillScore[this.hillScore.length - 1]], 0.05);
          }
        }
    
        var cwidth = this.c.width;
        var cheight = this.c.height;
        var capYPositionArray = [];
        
        var wscale = cwidth / this.relativeWidth;
        var xoffset = (this.meterWidth+this.meterGap)*wscale;
        var hscale = 1; //Height scalar
        if(this.hillScore[this.hillScore.length-1] > cheight) {hscale = cheight / this.hillScore[this.hillScore.length-1];}
        this.ctx.clearRect(0, 0, cwidth, cheight);
        if(this.mode == 0){ // bars
          for (var i = 0; i < this.hillNum; i++) {
              var value = this.hillScore[i]*hscale;
              if(value < 0){ value = 0;}
              if (capYPositionArray.length < Math.round(this.hillNum)) {
                  capYPositionArray.push(value);
              }
              this.ctx.fillStyle = this.capStyle;
              //draw the cap, with transition effect
              if (value < capYPositionArray[i]) {
                  this.ctx.fillRect(i * xoffset, (cheight - (--capYPositionArray[i])), this.meterWidth*wscale, this.capHeight);
              } else {
                  this.ctx.fillRect(i * xoffset, (cheight - value), this.meterWidth*wscale, this.capHeight);
                  capYPositionArray[i] = value;
              }
              this.ctx.fillStyle = this.gradient; 
              this.ctx.fillRect(i * xoffset /*meterWidth+gap*/ , (cheight - value + this.capHeight), this.meterWidth*wscale, cheight);
          }
        }
        if(this.mode == 1){ //gradient
          this.ctx.fillStyle = this.gradient;
          this.ctx.beginPath();
          this.ctx.moveTo(0,cheight - this.hillScore[0])
          for (var i = 0; i < this.hillNum; i++) {
            var value = this.hillScore[i]*hscale;
            if(value < 0){ value = 0; }
            this.ctx.lineTo(i*xoffset, (cheight - value))
            if (i == this.hillNum - 1){      
              this.ctx.lineTo(cwidth,(cheight - value));
            }
          }
          this.ctx.lineTo(cwidth,cheight);
          this.ctx.lineTo(0,cheight);
          this.ctx.closePath()
          this.ctx.fill();
        }
        this.hillScore.shift();
        this.hillScore.push(this.hillScore[this.hillScore.length - 1]);
    }

} 
