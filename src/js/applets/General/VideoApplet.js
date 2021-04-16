import {brainsatplay} from '../../brainsatplay'
import {DOMFragment} from '../../frontend/utils/DOMFragment'
import placeholderImg from './../../../assets/placeholderImg.png'

export class VideoApplet {

    static devices = ['heg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "HEG ratio and EEG Coherence feedback."
    static image=placeholderImg

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

        this.looping = false;

        this.playRate = 1;
        this.alpha = 0;
        this.volume = 0.5;

        this.useAlpha = true;
        this.useRate = true;
        this.useVol = true;
        this.useTime = false;

        this.ampScore = 0;
        this.ampThreshold = 0;
        this.diff = 0;

        this.enableControls = false;
        this.animationId = null;

        this.vidQuery;
        this.c;
        this.gl;

        this.sliderfocus = false;
        this.hidden = false;

        this.coh_ref_ch = undefined; //for getting coherence

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
                <div id="`+props.id+`menu" style='position:absolute; z-index:2;'>
                    <button id="`+props.id+`showhide" style='' >Hide UI</button>
                    <input id="`+props.id+`fs" type="file" accept="video/*"/>
                    <div id="`+props.id+`timeDiv"><input id="`+props.id+`timeSlider" type="range" min="0" max="1000" value="0"><br><br> 
                    <div id="`+props.id+`vidbar"><button id="`+props.id+`minus1min">--</button><button id="`+props.id+`minus10sec">-</button><button id="`+props.id+`play">||</button><button id="`+props.id+`plus10sec">+</button><button id="`+props.id+`plus1min">++</button></div></div> 
                    <div id="`+props.id+`vidbuttons">
                        <table> 
                                <tr><td>Feedback:</td></tr> 
                                <tr><td><button id="`+props.id+`useAlpha">Fade</button></td></tr> 
                                <tr><td><button id="`+props.id+`useRate">Speed</button></td></tr> 
                                <tr><td><button id="`+props.id+`useVol">Volume</button></td></tr> 
                                <tr><td><button id="`+props.id+`useTime">Time</button></td></tr> 
                        </table>
                    </div>
                </div> 
                <video id="`+props.id+`video" src="https://vjs.zencdn.net/v/oceans.mp4" style="z-index:1;" type="video/mp4" height=100% width=100% autoplay loop muted></video> 
                <canvas id="`+props.id+`canvas"></canvas>
            </div> 
          `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
        
            this.vidQuery = document.getElementById(this.props.id+'video');
            this.c = document.getElementById(this.props.id+'canvas');
            this.gl = this.c.getContext("webgl");
            this.timeSlider = document.getElementById(props.id+"timeSlider");
                
            //document.getElementById(props.id+"startbutton").addEventListener('click', this.startVideo, false);
            
            //document.getElementById(props.id+"stopbutton").addEventListener('click', this.stopVideo, false);
            
            document.getElementById(props.id+"play").onclick = () => {
                if(this.vidQuery.playbackRate == 0){
                    if(this.useRate == true){
                    this.vidQuery.playbackRate = this.playRate;
                    }
                    else {
                    this.playRate = 1;
                    this.vidQuery.playbackRate = 1;
                    }
                    document.getElementById(props.id+"play").innerHTML = "||";
                }
                else{
                    this.vidQuery.playbackRate = 0;
                    document.getElementById(props.id+"play").innerHTML = ">";
                }
            }
            
            document.getElementById(props.id+"useAlpha").onclick = () => {
                if(this.useAlpha == true){
                this.useAlpha = false;
                this.alpha = 0;
                document.getElementById(props.id+"useAlpha").style.opacity = "0.3";
                }
                else{ this.useAlpha = true; document.getElementById(props.id+"useAlpha").style.opacity = "1.0";}
            }

            document.getElementById(props.id+"useRate").onclick = () => {
                if(this.useRate == true){
                this.useRate = false;
                this.playRate = 1;
                this.vidQuery.playbackRate = 1;
                document.getElementById(props.id+"useRate").style.opacity = "0.3";
                }
                else{ 
                this.useTime = false; 
                this.useRate = true; 
                this.playRate = 1; 
                this.vidQuery.playbackRate = 1;
                document.getElementById(props.id+"useRate").style.opacity = "1.0";
                document.getElementById(props.id+"useTime").style.opacity = "0.3";
                }
            }

            document.getElementById(props.id+"useVol").onclick = () => {
                if(this.useVol == true){
                this.vidQuery.muted = true;
                this.useVol = false;
                this.volume = 0;
                this.vidQuery.volume = 0;
                document.getElementById(props.id+"useVol").style.opacity = "0.3";
                }
                else{ 
                this.useVol = true; 
                this.vidQuery.muted = false; 
                this.volume = 0.5; 
                this.vidQuery.volume = 0.5;
                document.getElementById(props.id+"useVol").style.opacity = "1.0";
                }
            }

            document.getElementById(props.id+"useTime").onclick = () => {
                if(this.useTime == true){
                    this.useTime = false;
                    this.playRate = 1;
                    this.vidQuery.playbackRate = 1;
                    document.getElementById(props.id+"useTime").style.opacity = "0.3";
                }
                else {
                    this.useRate = false;
                    this.useTime = true;
                    this.playRate = 0;
                    this.vidQuery.playbackRate = 0;
                    document.getElementById(props.id+"useRate").style.opacity = "0.3";
                    document.getElementById(props.id+"useTime").style.opacity = "1.0";
                }
            }

            this.timeSlider.addEventListener("change", () => {
            // Calculate the new time
                var time = this.vidQuery.duration * (this.timeSlider.value / 1000);
            
            // Update the video time
                this.vidQuery.currentTime = time;
            });

            this.timeSlider.onmousedown = () => {
                this.sliderfocus = true;
            }

            this.timeSlider.ontouchstart = () => {
                this.sliderfocus = true;
            }

            this.timeSlider.onchange = () => {
                this.sliderfocus = false;
            }

            document.getElementById(props.id+"minus1min").onclick = () => {
                this.vidQuery.currentTime -= 60;
            }
            document.getElementById(props.id+"plus1min").onclick = () => {
                this.vidQuery.currentTime += 60;
            }
            document.getElementById(props.id+"minus10sec").onclick = () => {
                this.vidQuery.currentTime -= 10;
            }
            document.getElementById(props.id+"plus10sec").onclick = () => {
                this.vidQuery.currentTime += 10;
            }

            document.getElementById(props.id+"showhide").onclick = () => {
                if(this.hidden == false) {
                    this.hidden = true;
                    document.getElementById(props.id+"showhide").innerHTML = "Show UI";
                    document.getElementById(props.id+"vidbuttons").style.display = "none";
                    document.getElementById(props.id+"timeDiv").style.display = "none";
                    document.getElementById(props.id+"fs").style.display = "none";
                }
                else{
                    this.hidden = false;
                    document.getElementById(props.id+"showhide").innerHTML = "Hide UI";
                    document.getElementById(props.id+"vidbuttons").style.display = "";
                    document.getElementById(props.id+"timeDiv").style.display = "";
                    document.getElementById(props.id+"fs").style.display = "";
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

        this.looping = true;
        this.initVideo();
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
      this.looping = false;
      this.stopVideo();
      //document.getElementById(this.props.id+"startbutton").removeEventListener('click', this.startVideo);
      //document.getElementById(this.props.id+"stopbutton").removeEventListener('click', this.stopVideo);
      cancelAnimationFrame(this.animationId);
      this.AppletHTML.deleteNode();
      //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.vidQuery.width = this.AppletHTML.node.clientWidth;
        this.vidQuery.height = this.AppletHTML.node.clientHeight;
        this.c.width = this.AppletHTML.node.clientWidth;
        this.c.height = this.AppletHTML.node.clientHeight;

        if(this.bci.atlas.settings.coherence) {
          this.coh_ref_ch = this.bci.atlas.getFrontalCoherenceData();
        }
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

    
    startVideo = () => {
        if(this.playRate < 0.1){ this.vidQuery.playbackRate = 0; }
        else{ this.vidQuery.playbackRate = this.playRate; }
    }

    stopVideo = () => {
        this.vidQuery.playbackRate = 0;
    }
   
    
    localFileVideoPlayer() {
        'use strict'
        var URL = window.URL || window.webkitURL;
        var displayMessage = function (message, isError) {
          var element = document.querySelector('#message');
          element.innerHTML = message;
          element.className = isError ? 'error' : 'info';
        }
        var playSelectedFile = function (event) {
          var file = this.files[0];
          var type = file.type;
          var videoNode = document.getElementById(this.props.id+'video');
          var canPlay = videoNode.canPlayType(type);
          if (canPlay === ''){ canPlay = 'no';}
          var message = 'Can play type "' + type + '": ' + canPlay;
          var isError = canPlay === 'no';
          displayMessage(message, isError)
          if (isError) {
            return;
          }
          var fileURL = URL.createObjectURL(file);
          videoNode.src = fileURL;
        }
        var inputNode = document.getElementById(this.props.id+'fs');
        inputNode.addEventListener('change', playSelectedFile, false);
      }
  
      onData(score){
        if(this.useAlpha == true) {
          if(((this.alpha < 0.8) || (score > 0)) && ((this.alpha > 0)||(score < 0))){
            if(this.alpha - score < 0){
              this.alpha = 0;
            }
            else if(this.alpha - score > 0.8){
              this.alpha = 0.8;
            }
            else{
              this.alpha -= score;
            }
          }
        }
        if(this.useRate == true){
          if(((this.vidQuery.playbackRate < 3) || (score < 0)) && ((this.vidQuery.playbackRate > 0) || (score > 0)))
          { 
            this.playRate = this.vidQuery.playbackRate + score*0.5;
            if((this.playRate < 0.05) && (this.playRate > 0)){
              this.vidQuery.playbackRate = 0;
            }
            else if(this.playRate < 0) {
              this.vidQuery.currentTime += score;
            }
            else if((this.playRate > 0.05) && (this.playRate < 0.1)){
              this.vidQuery.playbackRate = 0.1;
            }
            else{
              this.vidQuery.playbackRate = this.playRate;
            }
          }
        }
        if(this.useVol == true){
          if(((this.vidQuery.volume < 1) || (score < 0)) && ((this.vidQuery.volume > 0) || (score > 0)))
          {
            this.volume = this.vidQuery.volume + score*0.5;
            if(this.volume < 0){
              this.vidQuery.volume = 0;
            }
            else if(this.volume > 1){
              this.vidQuery.volume = 1;
            }
            else {
              this.vidQuery.volume = this.volume;
            }
          }
        }
        if(this.useTime == true){
          this.vidQuery.currentTime += score*10;
        }
      }
      
      animateRect = () => {
        if(this.looping === true) {
          if((this.sliderfocus == false)) {
            this.timeSlider.value = Math.floor(1000 * this.vidQuery.currentTime / this.vidQuery.duration);
          }

          if(this.bci.atlas.settings.heg) {
            let ct = this.bci.atlas.data.heg[0].count;
            if(ct > 1) {
              let avg = 40; if(ct < avg) { avg = ct; }
              let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
              let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
              this.onData(score);
            }
          }
          else if (this.bci.atlas.settings.coherence && this.coh_ref_ch !== undefined) {
            let ct = this.coh_ref_ch.fftCount;
            if(ct > 1) {
              let avg = 20; if(ct < avg) { avg = ct; }
              let slice = this.coh_ref_ch.means.alpha1.slice(ct-avg);
              let score = this.coh_ref_ch.means.alpha1[ct-1] - this.mean(slice);
              this.onData(score);
            }
          }

          this.gl.clearColor(0,0,0.1,this.alpha);
          this.gl.clear(this.gl.COLOR_BUFFER_BIT);
          setTimeout(()=>{this.animationId = requestAnimationFrame(this.animateRect);},15); 
        }
      }

  
      initVideo() {
            if(this.useVol == true){
              this.vidQuery.muted = false;
              this.vidQuery.volume = 0.5;
              this.volume = 0.5;
            } 

            this.c.width = this.vidQuery.width;
            this.c.height = this.vidQuery.height;
            var rect = this.vidQuery.getBoundingClientRect();
            this.c.style.top = rect.top + 'px';
            this.c.style.height = (rect.bottom - rect.top) + 'px';
            this.gl.clearColor(0,0,0.1,0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
            this.animateRect();
       }
} 