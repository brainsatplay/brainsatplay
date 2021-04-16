import {brainsatplay} from '../../brainsatplay'
import {DOMFragment} from '../../frontend/utils/DOMFragment'
import {SoundJS} from '../../frontend/UX/Sound'

export class AudioApplet {

    static devices = ['heg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }

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
        this.c = null; 
        this.ctx = null;
        this.gradient = null;

        this.hidden = false;
        
        this.maxVol = 0.5;
        this.file = null; //the current file
        this.fileName = null; //the current file name

        this.audio = null;

        this.info = null;
        this.menu = null;

        this.infoUpdateId = null; //to sotore the setTimeout ID and clear the interval
        this.animationId = null;
        this.status = 0; //flag for sound is playing 1 or stopped 0
        this.forceStop = false;
        this.allCapsReachBottom = false;

        this.useVol = true;

        this.meterWidth = 14; //relative width of the meters in the spectrum
        this.meterGap = 2; //relative gap between meters
        this.capHeight = 2; //relative cap height
        this.capStyle = '#fff';
        this.meterNum = 256; //count of the meters
        this.capYPositionArray = []; //store the vertical position of the caps for the previous frame

        this.relativeWidth = this.meterNum*(this.meterWidth+this.meterGap); //Width of the meter (px)
        
        this.mode = 2;

        this.coh_ref_ch = undefined;
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
                <div id='`+props.id+`menu' style='position:absolute; z-index:2;'> 
                    <button id='`+props.id+`showhide' style='z-index:2; opacity:0.2;'>Hide UI</button> 
                    <div id='`+props.id+`fileWrapper' style='font-size:10px;'> 
                        <div id='`+props.id+`fileinfo'></div> 
                        <input type="file" id='`+props.id+`uploadedFile'></input> 
                    </div> 
                    <table id='`+props.id+`table' style='color:white;'>
                        <tr><td>Feedback: </td></tr> 
                        <tr><td><button id='`+props.id+`useVol'>Volume</button></td></tr> 
                        <tr><td><button id='`+props.id+`modebutton'>Mode</button></td></tr> 
                    </table>
                    <input type="range" id='`+props.id+`volSlider' min="0" max="100" value='`+(this.maxVol*100)+`'> 
                </div> 
                <canvas id='`+props.id+`canvas' style='z-index:1;'></canvas> 
            </div> 
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            this.c = document.getElementById(props.id+"canvas");
            this.ctx = this.c.getContext("2d");
            
            this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.c.height);
            this.gradient.addColorStop(1, 'springgreen');
            this.gradient.addColorStop(0.75, 'yellow');
            this.gradient.addColorStop(0, 'red');
        

            //Add whatever else you need to initialize
            this.info = document.getElementById(this.props.id+'fileinfo').innerHTML; //this used to upgrade the UI information
            this.menu = document.getElementById(this.props.id+'menu');
       
            
            document.getElementById(props.id+"useVol").onclick = () => {
                if(this.useVol == false) {
                    this.useVol = true;
                    document.getElementById(props.id+"useVol").style.opacity = "1.0";
                }
                else{
                    this.useVol = false;
                    this.maxVol = document.getElementById(props.id+"volSlider").value * 0.01;
                    if(this.audio.gainNode != null) {
                        this.audio.gainNode.gain.setValueAtTime(this.maxVol, this.audio.ctx.currentTime);
                    }
                    document.getElementById(props.id+"useVol").style.opacity = "0.3";
                }
            }

            document.getElementById(props.id+"volSlider").oninput = () => {
                this.maxVol = document.getElementById(props.id+"volSlider").value * 0.01;
                if(this.audio.gainNode != null) {
                    this.audio.gainNode.gain.setValueAtTime(this.maxVol, this.audio.ctx.currentTime);
                }
            }

            document.getElementById(props.id+"modebutton").onclick = () => {
                if(this.mode == 0) { this.mode = 1;}
                else if (this.mode == 1){this.mode = 2;}
                else{ this.mode = 0; }
            }

            let showhide = document.getElementById(props.id+'showhide');
            showhide.onclick = () => {
                if(this.hidden == false) {
                    this.hidden = true;
                    document.getElementById(props.id+"showhide").innerHTML = "Show UI";
                    document.getElementById(props.id+'table').style.display = "none";
                    document.getElementById(props.id+'volSlider').style.display = "none";
                    document.getElementById(props.id+'fileWrapper').style.display = "none";
                }
                else{
                    this.hidden = false;
                    document.getElementById(props.id+"showhide").innerHTML = "Hide UI";
                    document.getElementById(props.id+'table').style.display = "";
                    document.getElementById(props.id+'volSlider').style.display = "";
                    document.getElementById(props.id+'fileWrapper').style.display = "";
                }
            }

            showhide.onmouseover = () => {
                showhide.style.opacity = 1.0;
            }
            showhide.onmouseleave = () => {
                showhide.style.opacity = 0.2;
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
        this.initVisualizer();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.stopAudio();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
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
    
    stopAudio(){
        //stop the previous sound if any
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        if(this.audio !== null){
            if (this.audio.sourceList.length > 0) {
                this.audio.sourceList[0].stop(0);
            }
        }
    }

    createVisualizer(buffer){
        this.audio.finishedLoading([buffer]);

        this.audio.sourceList[0].start(0);
        this.audio.gainNode.gain.setValueAtTime(this.maxVol, this.audio.ctx.currentTime);
        this.status = 1;
        this.audio.sourceList[0].onended = () => {
            this.endAudio();
        };
        this.updateInfo('Playing ' + this.fileName, false);
        this.info = 'Playing ' + this.fileName;
        document.getElementById(this.props.id+'fileWrapper').style.opacity = 0.2;
        this.draw();
    }    

    onData(score){
        if(this.useVol == true) {
            var newVol = this.audio.gainNode.gain.value + score;
            if(newVol > this.maxVol){
                newVol = this.maxVol;
            }
            if(newVol < 0){
             newVol = 0;
            }
            if(this.defaultUI == true) {
              document.getElementById(this.props.id+"volSlider").value = newVol * 100;
            }
            this.audio.gainNode.gain.value = newVol;
        }
    }

    endAudio(){
        if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        };
        this.status = 0;
        var text = 'Song ended...';
        let div = document.getElementById(this.props.id+'fileWrapper');
        if(div){
            document.getElementById(this.props.id+'fileWrapper').style.opacity = 1;
            document.getElementById(this.props.id+'fileinfo').innerHTML = text;
            this.info = text;
            document.getElementById(this.props.id+'uploadedFile').value = '';
        }
    }

    updateInfo(text, processing) {
        var infoBar = document.getElementById(this.props.id+'fileinfo'),
        dots = '...',
        i = 0;
        infoBar.innerHTML = text + dots.substring(0, i++);
        if (this.infoUpdateId !== null) {
            clearTimeout(this.infoUpdateId);
        };
        if (processing) {
            //animate dots at the end of the info text
            var animateDot = () => {
                if (i > 3) {
                    i = 0
                };
                infoBar.innerHTML = text + dots.substring(0, i++);
                this.infoUpdateId = setTimeout(animateDot, 250);
            }
            this.infoUpdateId = setTimeout(animateDot, 250);
        };
    }

    decodeAudio(){
        //read and decode the file into audio array buffer 
        var file = this.file;
        var fr = new FileReader();
        fr.onload = (e) => {
            var fileResult = e.target.result;
            if (this.audio.ctx === null) {
                return;
            };
            this.updateInfo('Decoding the audio', true);
            this.audio.ctx.decodeAudioData(fileResult, (buffer) => {
            this.updateInfo('Decode successful, starting the visualizer', true);
            this.createVisualizer(buffer);
            }, (e) => {
                this.updateInfo('Failed to decode the file!', false);
                console.error(e);
            });
        };
        fr.onerror = function(e) {
            this.updateInfo('Failed to read the file!', false);
            console.error(e);
        };
        //assign the file to the reader
        this.updateInfo('Starting read the file', true);
        fr.readAsArrayBuffer(file);
    }

    initVisualizer(){

        var audioInput = document.getElementById(this.props.id+'uploadedFile');
        var dropContainer = document.getElementById(this.props.id+"canvas");
        //listen the file upload
        audioInput.onchange = () => {
        this.audio = new SoundJS();
        if (this.audio.ctx===null) {return;};
        
        //the if statement fixes the file selection cancel, because the onchange will trigger even if the file selection has been cancelled
        if (audioInput.files.length !== 0) {
            //only process the first file
            this.file = audioInput.files[0];
            this.fileName = this.file.name;
            if (this.status === 1) {
                //the sound is still playing but we uploaded another file, so set the forceStop flag to true
                this.forceStop = true;
            };
            document.getElementById(this.props.id+'fileWrapper').style.opacity = 1;
            this.updateInfo('Uploading', true);
            //once the file is ready, start the visualizer
            this.decodeAudio();
        };
        };
        //listen the drag & drop
        dropContainer.addEventListener("dragenter", () => {
            document.getElementById(this.props.id+'fileWrapper').style.opacity = 1;
            this.updateInfo('Drop it on the page', true);
        }, false);
        dropContainer.addEventListener("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            //set the drop mode
            e.dataTransfer.dropEffect = 'copy';
        }, false);
        dropContainer.addEventListener("dragleave", () => {
            document.getElementById(this.props.id+'fileWrapper').style.opacity = 0.2;
            this.updateInfo(this.info, false);
        }, false);
        dropContainer.addEventListener("drop", (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (this.audio.ctx===null) {return;};
            document.getElementById(this.props.id+'fileWrapper').style.opacity = 1;
            this.updateInfo('Uploading', true);
            //get the dropped file
            this.file = e.dataTransfer.files[0];
            if (this.status === 1) {
                document.getElementById(this.props.id+'fileWrapper').style.opacity = 1;
                this.forceStop = true;
            };
            this.fileName = this.file.name;
            //once the file is ready, start the visualizer
            this.decodeAudio();
        }, false);
    }

    drawMeter = () => {
        var cwidth = this.c.width;
        var cheight = this.c.height;

        var meterWidthScale = cwidth/this.relativeWidth;

        var array = new Uint8Array(this.audio.analyserNode.frequencyBinCount);
        this.audio.analyserNode.getByteFrequencyData(array);
        if (this.status === 0) {
            //fix when some sounds stop and the value is still not back to zero
            for (var i = array.length - 1; i >= 0; i--) {
                array[i] = 0;
            };
            this.allCapsReachBottom = true;
            for (var i = this.capYPositionArray.length - 1; i >= 0; i--) {
            this.allCapsReachBottom = this.allCapsReachBottom && (this.capYPositionArray[i] === 0);
            };
            if (this.allCapsReachBottom) {
                cancelAnimationFrame(this.animationId); //since the sound is stopped and animation finished, stop the requestAnimation to prevent potential memory leak.
                return;
            };
        };
        var step = Math.round((array.length*0.75) / this.meterNum); //sample limited data from the total array
        this.ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < this.meterNum; i++) {
            var value = array[i * step];
            if (this.capYPositionArray.length < this.meterNum) {
            this.capYPositionArray.push(value);
            };
            this.capYPositionArray[i] = this.capYPositionArray[i] - 0.5;
            this.ctx.fillStyle = this.capStyle;
            //draw the cap, with transition effect
            var xoffset = (this.meterWidth*meterWidthScale + this.meterGap*meterWidthScale);
            if (value < this.capYPositionArray[i]) {
            this.ctx.fillRect(i * xoffset, cheight - this.capYPositionArray[i], this.meterWidth*meterWidthScale, this.capHeight);
            } else {
            this.ctx.fillRect(i * xoffset, cheight - value, this.meterWidth*meterWidthScale, this.capHeight);
            this.capYPositionArray[i] = value;
            };
            this.ctx.fillStyle = this.gradient; //set the fillStyle to gradient for a better look
            this.ctx.fillRect(i * xoffset /*meterWidth+gap*/ , cheight - value + this.capHeight, this.meterWidth*meterWidthScale, cheight); //the meter
        }
    }

    drawLine = () => {
        var cwidth = this.c.width;
        var cheight = this.c.height;

        var meterWidthScale = cwidth/this.relativeWidth;

        var array = new Uint8Array(this.audio.analyserNode.frequencyBinCount);
        this.audio.analyserNode.getByteFrequencyData(array);
        if (this.status === 0) {
            //fix when some sounds stop and the value is still not back to zero
            for (var i = array.length - 1; i >= 0; i--) {
                array[i] = 0;
            };
            this.allCapsReachBottom = true;
            for (var i = this.capYPositionArray.length - 1; i >= 0; i--) {
            this.allCapsReachBottom = this.allCapsReachBottom && (this.capYPositionArray[i] === 0);
            };
            if (this.allCapsReachBottom) {
                cancelAnimationFrame(this.animationId); //since the sound is stopped and animation finished, stop the requestAnimation to prevent potential memory leak.
                return;
            };
        };
        var step = Math.round((array.length*0.75) / this.meterNum); //sample limited data from the total array

        this.ctx.clearRect(0, 0, cwidth, cheight);
        this.ctx.beginPath();
        this.ctx.moveTo(0, cheight - this.capYPositionArray[0]*2);
        for (var i = 0; i < this.meterNum; i++) {
        var value = array[i * step];
        this.capYPositionArray[i]=value;
        var xoffset = (this.meterWidth + this.meterGap)*meterWidthScale;
        this.ctx.lineTo(i*xoffset,cheight - this.capYPositionArray[i]*2);
        }
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
    }

    drawCircle = () => { //Based on: https://www.kkhaydarov.com/audio-visualizer/
        
        // find the center of the window
        var center_x = this.c.width * 0.5;
        var center_y = this.c.height * 0.5;
        var radius = 150;
        
        var array = new Uint8Array(this.audio.analyserNode.frequencyBinCount);
        this.audio.analyserNode.getByteFrequencyData(array);

        // style the background
        var gradient = this.ctx.createRadialGradient(center_x,center_y,2,center_x,center_y,600+array[100]);
        gradient.addColorStop(0,"blue");
        gradient.addColorStop(0.25,"purple");
        gradient.addColorStop(1,"rgba(255,69,0,0)");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0,0,this.c.width,this.c.height);

        var gradient2 = this.ctx.createRadialGradient(center_x*0.2,center_y*1.7,1,center_x*0.2,center_y*1.7,2+array[2]*0.5);
        gradient2.addColorStop(0,"yellow");
        gradient2.addColorStop(0.2,"greenyellow");
        gradient2.addColorStop(1,"rgba(255,69,0,0)");
        this.ctx.fillStyle = gradient2;
        this.ctx.fillRect(0,0,this.c.width,this.c.height);

        var gradient3 = this.ctx.createRadialGradient(center_x*0.2,center_y*0.3,1,center_x*0.2,center_y*0.3,2+array[200]*0.5);
        gradient3.addColorStop(0,"red");
        gradient3.addColorStop(0.2,"crimson");
        gradient3.addColorStop(1,"rgba(255,69,0,0)");
        this.ctx.fillStyle = gradient3;
        this.ctx.fillRect(0,0,this.c.width,this.c.height);

        var gradient4 = this.ctx.createRadialGradient(center_x*1.8,center_y*0.3,1,center_x*1.8,center_y*0.3,2+array[100]*0.5);
        gradient4.addColorStop(0,"hotpink");
        gradient4.addColorStop(0.2,"magenta");
        gradient4.addColorStop(1,"rgba(255,69,0,0)");
        this.ctx.fillStyle = gradient4;
        this.ctx.fillRect(0,0,this.c.width,this.c.height);

        var gradient5 = this.ctx.createRadialGradient(center_x*1.8,center_y*1.7,1,center_x*1.8,center_y*1.7,2+array[50]*0.5);
        gradient5.addColorStop(0,"deepskyblue");
        gradient5.addColorStop(0.2,"skyblue");
        gradient5.addColorStop(1,"rgba(255,69,0,0)");
        this.ctx.fillStyle = gradient5;
        this.ctx.fillRect(0,0,this.c.width,this.c.height);

        /*
        //draw a circle
        this.ctx.beginPath();
        this.ctx.arc(center_x,center_y,radius,0,2*Math.PI);
        this.ctx.stroke();
        */
        for(var i = 0; i < this.meterNum; i++){
            
            //divide a circle into equal parts
            var rads = Math.PI * 2 / this.meterNum;
            
            var bar_height = array[i];
            
            // set coordinates
            var x = center_x + Math.cos(rads * i) * (radius);
            var y = center_y + Math.sin(rads * i) * (radius);
            var x_end = center_x + Math.cos(rads * i)*(radius + bar_height);
            var y_end = center_y + Math.sin(rads * i)*(radius + bar_height);
            
            //draw a bar
            var lineColor = "rgb(" + array[i] + ", " + array[i] + ", " + 205 + ")";
    
            this.ctx.strokeStyle = lineColor;
            this.ctx.lineWidth = this.capHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(x,y);
            this.ctx.lineTo(x_end,y_end);
            this.ctx.stroke();
        
        }
    } 

    draw = () => {
        if(this.looping === true) {
            if(this.bci.atlas.settings.heg) {
                let ct = this.bci.atlas.data.heg[0].count;
                if(ct > 1) {
                    let avg = 40; if(ct < avg) { avg = ct; }
                    let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
                    let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
                    this.onData(score);
                }
            }
            else if (this.bci.atlas.analyzing && this.bci.atlas.settings.coherence && this.coh_ref_ch !== undefined) {
                let ct = this.coh_ref_ch.fftCount;
                if(ct > 1) {
                    let avg = 20; if(ct < avg) { avg = ct; }
                    let slice = this.coh_ref_ch.means.alpha1.slice(ct-avg);
                    let score = this.coh_ref_ch.means.alpha1[ct-1] - this.mean(slice);
                    this.onData(score);
                }
            }

            if(this.mode == 0){
            this.drawMeter(); 
            }
            else if(this.mode == 1){
            this.drawLine();
            }
            else if(this.mode == 2){
            this.drawCircle();
            }
            setTimeout(()=>{this.animationId = requestAnimationFrame(this.draw)},15);
        }
    }
    
} 