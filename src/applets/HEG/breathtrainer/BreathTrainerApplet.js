import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as settingsFile from './settings'
import {SoundJS} from '../../../platform/js/frontend/UX/Sound'
import { BreathCapture } from '../../../libraries/js/src/utils/BreathCapture'
import ts from 'typescript'


//Example Applet for integrating with the UI Manager
export class BreathTrainerApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.canvas;
        this.ctx;

        this.canvas2;
        this.ctx2;

        this.offscreen = null;
		this.offscreenctx = null;

        this.mode = 'dvb'; //dvb, rlx, jmr, wmhf
        this.animation = 'sine'; //sine, circle;
        
        
        this.fs = 10;
        this.amplitudes = [];
        this.startTime = undefined;

        this.lastFrame = 0;
        this.currentFrame = 0;
        this.time = 0;
        this.fps = 60;
        this.thisFrame = Date.now();

        this.frequencyMaps = [
            {type:"diaphragmatic",map:[{frequency:0.1,amplitude:2,duration:60}]},
            {type:"breathhold",map:[{frequency:0.1,amplitude:2,duration:5},{frequency:0.0,amplitude:2,duration:10},{frequency:0.1,amplitude:2,duration:5}]},
            {type:"wimhof",map:[{frequency:.01,amplitude:1,duration:30},{frequency:0.1,amplitude:2,duration:30}]},
            {type:"relaxation",map:[{frequency:0.08,amplitude:2,duration:60}]},
            {type:"jacobsons",map:[{frequency:0.08,amplitude:2,duration:60}]}
        ];

        this.currentFrequencyMap = {type:"diaphragmatic",map:[{frequency:0.1,amplitude:2,duration:60}]};

        this.currentFrequency = 0.1;
        this.currentMapIndex = 0;
        this.lastAmplitude = 0;
        this.timeScaled = 0;
        this.amplitudesY = new Array(1024).fill(0);
        this.amplitudesX = new Array(1024).fill(0);
        
        this.scaling = 10;
        this.animating = false;
        this.step=-4;

        this.Capture = new BreathCapture();
        

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the applet with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='${props.id}menu'>
                    <button id='${props.id}startmic'>Start Mic</button>
                    <button id='${props.id}stopmic'>Stop Mic</button>
                    <button id='${props.id}calibrate'>Calibrate (Breathe-in then click after ~1 sec)</button>
                    <select id='${props.id}select'>
                        <option value='none'>None</option>
                        <option value='diaphragmatic' selected>Diaphragmatic</option>
                        <option value='breathhold'>Breath Hold</option>
                        <option value='relaxation'>Relaxation Breathing</option>
                        <option value='jacobsons'>Jacobson's Muscular Relaxation</option>
                        <option value='wimhof'>Wim Hof Method</option>
                    </select>
                </div> 
                <canvas id='${props.id}sinecanvas' style='position:absolute;width:100%;height:100%;'></canvas>
                <canvas id='${props.id}canvas' style='width:100%;height:100%;background-color:rgba(0,0,0,0);'></canvas>
            </div>`;
        }

        /*
            <select id='${props.id}select'>
                <option value='dvb' selected>Diaphragmatic</option>
                <option value='rlx'>Relaxation</option>
                <option value='jmr'>Jacobson's Muscular Relaxation</option>
                <option value='wmhf'>Wim Hof Method</option>
            </select>

        */

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.canvas = document.getElementById(props.id+'canvas');
            this.ctx = this.canvas.getContext("2d");

            this.canvas2 = document.getElementById(props.id+'sinecanvas');
            this.ctx2 = this.canvas2.getContext("2d");

            this.offscreen = new OffscreenCanvas(this.canvas.width,this.canvas.height);
		    this.offscreenctx = this.offscreen.getContext("2d");

            this.yscaling = this.canvas.height*0.2;
            this.xscaling = this.canvas.width*0.1;

            document.getElementById(props.id+'select').onchange = (event) => {
                let t = event.target.value;
                if(t === 'none') { this.canvas2.style.display = 'none'; }
                else { 
                    this.canvas2.style.display = '';
                    let found = this.frequencyMaps.find((o)=> {
                        if(o.type === t)
                            return true;
                    });
                    if(found) this.currentFrequencyMap = found
                }
            }

            document.getElementById(props.id+'startmic').onclick = () => {
                this.Capture.analyze();
                this.Capture.connectMic();
            }

            document.getElementById(props.id+'stopmic').onclick = () => {
                this.Capture.stopMic();
            }
            
            document.getElementById(props.id+'calibrate').onclick = () => {
                this.Capture.calibrate();
            }

            //console.log("drawing...")
            this.animating = true;
            this.animate();
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

    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.animating = false;
        this.Capture.stop();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        this.canvas.width = this.AppletHTML.node.clientWidth;
        this.canvas.height = this.AppletHTML.node.clientHeight;
        this.canvas2.width = this.AppletHTML.node.clientWidth;
        this.canvas2.height = this.AppletHTML.node.clientHeight;
        this.offscreen.width = this.AppletHTML.node.clientWidth;
        this.offscreen.height = this.AppletHTML.node.clientHeight;
        this.yscaling = this.canvas.height*0.2;
        this.xscaling = this.canvas.width*0.1;

        this.amplitudesY = new Array(1024).fill(this.canvas2.height*0.5);
        this.amplitudesX = new Array(1024).fill(0);
        this.amplitudesX.forEach((x,i) => {
            this.amplitudesX[i] = (i/1023) * this.canvas2.width;
        });
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //Make an array of size n from a to b 
    makeArr(startValue, stopValue, nSteps) {
        var arr = [];
        var step = (stopValue - startValue) / (nSteps - 1);
        for (var i = 0; i < nSteps; i++) {
            arr.push(startValue + (step * i));
        }
        return arr;
    }

    drawAudio = () => {

        this.lastFrame = this.currentFrame;
        this.currentFrame = performance.now();
        this.fps = (this.currentFrame - this.lastFrame)*0.001;

        let height = this.canvas.height;
        let width = this.canvas.width;

        let audInterval = this.fps;
        //if(this.Capture.audTime[this.Capture.audTime.length-2]>0) audInterval = 0.001*(this.Capture.audTime[this.Capture.audTime.length-1] - this.Capture.audTime[this.Capture.audTime.length-2]);


        //Generate sine wave at time with current frequency
        //when current frequency timer ends, transition to next frequency gradually
        //rotate, rinse, and repeat
        //console.log(this.currentFrequencyMap,this.currentMapIndex);

        if(this.currentFrequency < this.currentFrequencyMap.map[this.currentMapIndex].frequency) {
            this.latentTime += this.fps;
            this.currentFrequency += this.fps*this.currentFrequencyMap.map[this.currentMapIndex].frequency;
            if (this.currentFrequency > this.currentFrequencyMap.map[this.currentMapIndex].frequency) 
                this.currentFrequency = this.currentFrequencyMap.map[this.currentMapIndex].frequency;
        } else if (this.currentFrequency > this.currentFrequencyMap.map[this.currentMapIndex].frequency) {
            this.latentTime += this.fps;
            this.currentFrequency -= this.fps*this.currentFrequencyMap.map[this.currentMapIndex].frequency;
            if (this.currentFrequency < this.currentFrequencyMap.map[this.currentMapIndex].frequency) 
                this.currentFrequency = this.currentFrequencyMap.map[this.currentMapIndex].frequency;
        }

        this.timeScaled += audInterval+(width/1024 - this.fps);
        this.time += this.fps;
        //console.log(this.time);
        if(this.currentFrequency === this.currentFrequencyMap.map[this.currentMapIndex].frequency) {
            let timeaccum = 0;
            for(let i = 0; i<this.currentMapIndex; i++) {
                timeaccum += this.currentFrequencyMap.map[i].duration;
            }
            if(this.time > timeaccum+this.latentTime) {
                this.currentMapIndex++;
                if(this.currentMapIndex > this.currentFrequencyMap.map.length) this.currentMapIndex = 0;
            }
        }
        let freq = this.currentFrequencyMap.map[this.currentMapIndex].frequency;
        let amp = this.currentFrequencyMap.map[this.currentMapIndex].amplitude+height/4;

        //let window = width * (audInterval);


        // var tempCanvasContext = this.offscreenctx;
		// var tempCanvas = tempCanvasContext.canvas;
        //this.offscreenctx.canvas.clearRect(0,0,width,height);

		// tempCanvasContext.drawImage(this.canvas2, 0, 0, width, height);

        this.ctx2.clearRect(0,0,width,height);

        let x = width-1;
        let amplitude = (height/2 + amp * Math.sin((x+this.timeScaled+width)/(width*freq)));
        this.amplitudesY.shift(); this.amplitudesY.push(amplitude);

        this.ctx2.strokeStyle = 'limegreen';
        this.ctx2.beginPath();
        this.ctx2.moveTo(0,this.amplitudesY[0]);

        this.amplitudesY.forEach((a,i)=>{
            if(i>0) {
                this.ctx2.lineTo(this.amplitudesX[i],a);
            }
        });
        //console.log('stroked',this.amplitudesX[this.amplitudesX.length-1],this.amplitudesY[this.amplitudesY.length-1])
        this.ctx2.stroke();
        
        
        // this.ctx2.fillStyle = 'limegreen';
        // this.ctx2.fillRect(width - 1, amplitude, 1, 1);

        // this.ctx2.translate(-1, 0);
        // // draw prev canvas before translation
        // this.ctx2.drawImage(tempCanvas, 0, 0);
        // // reset transformation matrix
        // this.ctx2.setTransform(1, 0, 0, 1, 0, 0);

        //FIX
        let foundidx = undefined;
        let found = this.Capture.inPeakTimes.find((t,k)=>{if(t > this.Capture.audTime[0]) {foundidx = k; return true;}});
        if(foundidx) {
            let inpeakindices = []; let intimes = this.Capture.audTime.filter((o,z)=>{if(this.Capture.inPeakTimes.slice(this.Capture.inPeakTimes.length-foundidx).indexOf(o)>-1) {inpeakindices.push(z); return true;}})
            this.inpeaks=inpeakindices;
            let foundidx2 = undefined;
            let found2 = this.Capture.outPeakTimes.find((t,k)=>{if(t > this.Capture.audTime[0]) {foundidx2 = k; return true;}});
            if(foundidx2){ 
                let outpeakindices = []; let outtimes = this.Capture.audTime.filter((o,z)=>{if(this.Capture.outPeakTimes.slice(this.Capture.outPeakTimes.length-foundidx2).indexOf(o)>-1) {outpeakindices.push(z); return true;}})
                this.outpeaks=outpeakindices;
            }
        }
        else { 
            let inpeakindices = []; let intimes = this.Capture.audTime.filter((o,z)=>{if(this.Capture.inPeakTimes.indexOf(o)>-1) {inpeakindices.push(z); return true;}})
            let outpeakindices = []; let outtimes = this.Capture.audTime.filter((o,z)=>{if(this.Capture.outPeakTimes.indexOf(o)>-1) {outpeakindices.push(z); return true;}})
            this.inpeaks = inpeakindices;
            this.outpeaks = outpeakindices;
        }

        let xaxis = this.makeArr(0,this.canvas.width,this.Capture.output.audioFFT.length);
        let xaxis2 = this.makeArr(0,this.canvas.width,this.Capture.audSumGraph.length);
        //let xaxis3 = this.makeArr(0,this.canvas.width,this.audhist.length);


        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        //---------------------------------------------------------- Audio FFT
        this.ctx.linewidth = 2;
        
        this.ctx.moveTo(0,this.canvas.height-this.Capture.output.audioFFT[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'royalblue';
        this.Capture.output.audioFFT.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis[i],this.canvas.height-amp*(this.canvas.height/255));       
            }
        });
        this.ctx.stroke();

        //------------------------------------------------------------- Audio FFT Sum

        this.ctx.linewidth = 3;
        
        this.ctx.moveTo(0,this.canvas.height-this.Capture.audSumGraph[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red"; 
                
        this.Capture.audSumGraph.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.Capture.audSumGraph)));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------- Audio FFT Sum Smoothed
        
        this.ctx.moveTo(0,this.canvas.height-this.Capture.audSumSmoothedFast[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "orange"; 
                
        this.Capture.audSumSmoothedFast.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.Capture.audSumGraph)));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------- Audio FFT Sum More Smoothed

        this.ctx.moveTo(0,this.canvas.height-this.Capture.audSumSmoothedSlow[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "gold"; 
                
        this.Capture.audSumSmoothedSlow.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.Capture.audSumGraph)));       
            }
        });
        this.ctx.stroke();

        //------------------------------------------------------------- Audio FFT Sum More Smoothed
        
        this.ctx.moveTo(0,this.canvas.height-this.Capture.audSumSmoothedLong[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "yellow"; 
                
        this.Capture.audSumSmoothedLong.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.Capture.audSumGraph)));       
            }
        });
        this.ctx.stroke();

        //------------------------------------------------------------- SMA 1 peaks
        
        this.ctx.fillStyle = 'chartreuse';
        this.inpeaks.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedSlow[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 1 valleys

        this.ctx.fillStyle = 'green';
        this.outpeaks.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedSlow[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 2 peaks
        this.ctx.fillStyle = 'pink';
        this.Capture.peakslong.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedLong[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 2 valleys

        this.ctx.fillStyle = 'purple';
        this.Capture.valslong.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedLong[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA fast peaks
        this.ctx.fillStyle = 'red';
        this.Capture.peaksfast.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedFast[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA fast valleys

        this.ctx.fillStyle = 'crimson';
        this.Capture.valsfast.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.Capture.audSumSmoothedFast[pidx]*(this.canvas.height/Math.max(...this.Capture.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });

        if(this.session.atlas.data.heg[0]) {
            let heg = this.session.atlas.data.heg[0];
            if(heg.count > 0 ) {
                let ratio = [];
                let tidx = undefined;
                let found = heg.times.find((t,k) => {
                    if(t <= this.Capture.audTime[0]) {
                        tidx=k;
                        return true;
                    }
                });
                if(!found) {
                    //find first non-zero audtime, translate ratio x relatively
                    let tfound = this.Capture.audTime.find((t,ti) => {
                        if(t !== 0) {
                            tidx = ti;
                            return true;
                        }
                    });
                    
                }
                this.ctx.beginPath();

                let logScale = Math.ceil(Math.log10(Math.max(...ratio)+1));

                let xoffset;

                if(found) {
                    this.ctx.moveTo(0,ratio[0]);
                } else if(!found) {
                    let leftmostTime = this.Capture.audTime[tidx];
                    let nearestAudidx = 0;
                    this.Capture.audTime.find((t, jk) => {
                        if(t < heg.times[0]) {
                            nearestAudidx = jk;
                        }
                    });
                    xoffset = jk/1024 * width;
                }

                ratio.forEach((r,k) => {
                    if(k>0) {
                        if(found)
                            this.ctx.lineTo((k/ratio.length)*width,(r/(10*logScale))*height);
                        else {
                            this.ctx.lineTo((k/ratio.length)*width+xoffset,(r/(10*logScale))*height);
                        }
                    } else {
                        if(!found) {
                            this.ctx.moveTo(xoffset,(r/(10*logScale))*height);
                        }
                    }
                });

                this.ctx.stroke();
            }
        }

    }
    
    animate = () => {

        this.drawAudio();

        if(this.animating)
            setTimeout(()=>{this.animate();},15);
    }

   
} 
