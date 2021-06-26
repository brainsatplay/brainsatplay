import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as settingsFile from './settings'
import {SoundJS} from '../../../platform/js/frontend/UX/Sound'


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

        this.effects = [];
        this.fxStruct = {sourceIdx:undefined,source:undefined,playing:false,id:undefined};
        
        this.audfft = [];
        this.audsum = 0;
        this.audhist = [];
        this.peaksfast = [];
        this.valsfast = [];
        this.peaksslow = [];
        this.valsslow = [];
        this.peakslong = [];
        this.valslong = [];
        
        this.audSumGraph = new Array(1024).fill(0);
        this.audSumSmoothedFast = new Array(1024).fill(0);
        this.audSumSmoothedSlow = new Array(1024).fill(0);
        this.audSumSmoothedLong = new Array(1024).fill(0);
        this.audSpect = new Array(1024).fill(new Array(256).fill(0));
        this.audHistSpect = new Array(1024).fill(new Array(8).fill(0));
        this.audTime = new Array(1024).fill(0);

        this.lastInPeak = 0;
        this.lastOutPeak = 0;
        this.inPeakTimes = [];
        this.outPeakTimes = [];
        
        this.fastPeakTimes = [];
        this.slowPeakTimes = [];
        this.longPeakTimes = [];

        this.peakThreshold = 0;

        this.mode = 'dvb'; //dvb, rlx, jmr, wmhf
        this.animation = 'sine'; //sine, circle;
        
        
        this.fs = 10;
        this.amplitudes = [];
        this.startTime = undefined;

        this.lastFrame = Date.now();
        this.thisFrame = Date.now();

        this.scaling = 10;
        this.animating = false;
        this.step=-4;

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
                   
                </div>
                <canvas id='${props.id}canvas' style='width:100%;height:100%;'></canvas>
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

            this.yscaling = this.canvas.height*0.2;
            this.xscaling = this.canvas.width*0.1;
            console.log(this.canvas)
            //console.log("gen amplitudes");
            this.genBreathingAmplitudes(this.mode);

            // document.getElementById(props.id+'select').onchange = () => {
            //     this.genBreathingAmplitudes(document.getElementById(props.id+'select').value);
            // }

            document.getElementById(props.id+'startmic').onclick = () => {
                this.connectMic();
            }

            document.getElementById(props.id+'stopmic').onclick = () => {
                this.stopMic();
            }
            
            document.getElementById(props.id+'calibrate').onclick = () => {
                if(this.slowPeakTimes.length > 0) {
                    this.inPeakTimes = [this.slowPeakTimes[this.slowPeakTimes.length-1]];
                    this.outPeakTimes = [];
                }
                
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
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        this.canvas.width = this.AppletHTML.node.clientWidth;
        this.canvas.height = this.AppletHTML.node.clientHeight;
        this.yscaling = this.canvas.height*0.2;
        this.xscaling = this.canvas.width*0.1;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    connectMic() {
        if(this.effects.length === 0) {
            if(!window.audio) window.audio = new SoundJS();
            if (window.audio.ctx===null) {return;};

            let fx = JSON.parse(JSON.stringify(this.fxStruct));

            fx.sourceIdx = window.audio.record(undefined,undefined,null,null,false,()=>{
                if(fx.sourceIdx !== undefined) {
                    fx.source = window.audio.sourceList[window.audio.sourceList.length-1];
                    //window.audio.sourceGains[fx.sourceIdx].gain.value = 0;
                    fx.playing = true;
                    fx.id = 'Micin';
                    //fx.source.mediaStream.getTracks()[0].enabled = false;
                    this.hostSoundsUpdated = false;
                }
            });

            this.effects.push(fx);

            window.audio.gainNode.disconnect(window.audio.analyserNode);
            window.audio.analyserNode.disconnect(window.audio.out);
            window.audio.gainNode.connect(window.audio.out);
        
            return fx;
        }
    }

    stopMic() {
        if(this.effects.length === 1) {
            let idx;
            let found = this.effects.find((o,i) => {
                if(o.id === 'Micin') {
                    idx=i;
                    return true;
                }
            });
            if(found) {
                found.source.mediaStream.getTracks()[0].stop();
                this.effects.splice(idx,1);
            }

            window.audio.gainNode.disconnect(window.audio.out);
            window.audio.gainNode.connect(window.audio.analyserNode);
            window.audio.analyserNode.connect(window.audio.out);
        }
    }

    getAudioData() {
        let audioDat = [];
        if(window.audio){
            var array = new Uint8Array(window.audio.analyserNode.frequencyBinCount); //2048 samples
            window.audio.analyserNode.getByteFrequencyData(array);
            audioDat = this.reduceArrByFactor(Array.from(array),4);
        } else {
            audioDat = new Array(512).fill(0);
        }

        return audioDat;
    }

    sum(arr=[]){
		if (arr.length > 0){
			var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum;
		} else {
			return 0;
		}
	}


    mean(arr=[]){
		if (arr.length > 0){
			var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
		} else {
			return 0
		}
	}

    reduceArrByFactor(arr,factor=2) { //faster than interpolating
        let x = arr.filter((element, index) => {
            return index % factor === 0;
        });
        return x;
    }

    //Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)
    sma(arr, window) {
		var smaArr = []; //console.log(arr);
		for(var i = 0; i < arr.length; i++) {
			if((i == 0)) {
				smaArr.push(arr[0]);
			}
			else if(i < window) { //average partial window (prevents delays on screen)
				var arrslice = arr.slice(0,i+1);
				smaArr.push(arrslice.reduce((previous,current) => current += previous ) / (i+1));
			}
			else { //average windows
				var arrslice = arr.slice(i-window,i);
				smaArr.push(arrslice.reduce((previous,current) => current += previous) / window);
			}
		}
		//console.log(temp);
		return smaArr;
	}

    //Sum the FFT (gets envelope)
    sumAudioData() {
        let audioDat = this.getAudioData();
        let sum = this.sum(audioDat);
        return sum;
    }

    //Make an array of size n from a to b 
    makeArr(startValue, stopValue, nSteps) {
        var arr = [];
        var step = (stopValue - startValue) / (nSteps - 1);
        for (var i = 0; i < nSteps; i++) {
          arr.push(startValue + (step * i));
        }
        return arr;
    }

    isExtrema(arr,critical='peak') { //Checks if the middle point of the (odd-numbered) array is a local extrema. options: 'peak','valley','tangent'. Even numbered arrays are popped
        let ref = [...arr];
		if(ref.length%2 === 0) ref.pop();
        if(arr.length > 1) { 
            let pass = true;
            ref.forEach((val,i) => {
                if(critical === 'peak') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                    } else if (i > Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                    } else if (i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                    } else if ((i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                    }
                } //|| (i < ref.length*.5 && val <= 0 ) || (i > ref.length*.5 && val > 0)
            });
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                ref.forEach((val,i) => { 
                    if((i <  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                    } else if ((i >  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                    }
                });
            }
            return pass;
        }
    }

    isCriticalPoint(arr,critical='peak') { //Checks if the middle point of the (odd-numbered) array is a critical point. options: 'peak','valley','tangent'. Even numbered arrays are popped
        let ref = [...arr];
		if(ref.length%2 === 0) ref.pop();
        if(arr.length > 1) { 
            let pass = true;
            ref.forEach((val,i) => {
                if(critical === 'peak') { //search first derivative
                    if(i < ref.length*.5 && val <= 0 ) {
                        pass = false;
                    } else if (i > ref.length*.5 && val > 0) {
                        pass = false;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < ref.length*.5 && val >= 0 ) {
                        pass = false;
                    } else if (i > ref.length*.5 && val < 0) {
                        pass = false;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < ref.length*.5 && val >= 0 )) {
                        pass = false;
                    } else if ((i > ref.length*.5 && val < 0)) {
                        pass = false;
                    }
                }
            });
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                ref.forEach((val,i) => { 
                    if((i < ref.length*.5 && val <= 0 )) {
                        pass = false;
                    } else if ((i > ref.length*.5 && val > 0)) {
                        pass = false;
                    }
                });
            }
            return pass;
        }
    }

    //returns array of indices of detected peaks/valleys
    peakDetect = (smoothedArray,type='peak',window=49) => {
        let mid = Math.floor(window*.5);
        let peaks = [];
        //console.log(smoothedArray.length-window)
        for(let i = 0; i<smoothedArray.length-window; i++) {
            let isPeak = this.isExtrema(smoothedArray.slice(i,i+window),type);
            if(isPeak) {
                peaks.push(i+mid-1);
            }
        }
        return peaks;
    }

    //Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	interpolateArray(data, fitCount, normalize=1) {

		var norm = normalize;

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*norm;
		};

		var newData = new Array();
		var springFactor = new Number((data.length - 1) / (fitCount - 1));
		newData[0] = data[0]; // for new allocation
		for ( var i = 1; i < fitCount - 1; i++) {
			var tmp = i * springFactor;
			var before = new Number(Math.floor(tmp)).toFixed();
			var after = new Number(Math.ceil(tmp)).toFixed();
			var atPoint = tmp - before;
			newData[i] = linearInterpolate(data[before], data[after], atPoint);
		}
		newData[fitCount - 1] = data[data.length - 1]; // for new allocation
		return newData;
	};

    //sets a threshold to avoid false positives at low volume
    getPeakThreshold(arr,peakIndices, thresholdVar) {
        let threshold;
        let filtered = arr.filter((o,i)=>{if(peakIndices.indexOf(i)>-1) return true;});
        if(thresholdVar === 0) {
            threshold = this.mean(filtered); 
        } else threshold = (thresholdVar+this.mean(filtered))*0.5;  
        
        return threshold;
    }

    calcBreathing = () => {
        this.audfft = this.getAudioData().slice(6);
        this.audsum = this.sumAudioData();
        this.audSumGraph.shift(); this.audSumGraph.push(this.audsum);
        this.audSpect.shift(); this.audSpect.push(this.audfft);

        this.audTime.shift(); this.audTime.push(Date.now());

        let smoothedfast = this.mean(this.audSumGraph.slice(this.audSumGraph.length-5));
        this.audSumSmoothedFast.shift(); this.audSumSmoothedFast.push(smoothedfast);
        let smoothedslow = this.mean(this.audSumGraph.slice(this.audSumGraph.length-30));
        this.audSumSmoothedSlow.shift(); this.audSumSmoothedSlow.push(smoothedslow);
        let smoothed2 = this.mean(this.audSumGraph.slice(this.audSumGraph.length-120));
        this.audSumSmoothedLong.shift(); this.audSumSmoothedLong.push(smoothed2);

        this.audhist = this.interpolateArray(this.audfft,12);
        this.audHistSpect.shift(); this.audHistSpect.push(this.audhist);

        
        this.peaksfast = this.peakDetect(this.audSumSmoothedFast,'peak',10);
        this.valsfast = this.peakDetect(this.audSumSmoothedFast,'valley',10);

        this.peaksslow = this.peakDetect(this.audSumSmoothedSlow,'peak',25);
        this.valsslow = this.peakDetect(this.audSumSmoothedSlow,'valley',25);

        this.peakslong = this.peakDetect(this.audSumSmoothedLong,'peak',100);
        this.valslong = this.peakDetect(this.audSumSmoothedLong,'valley',100);

        let l1 = this.longPeakTimes.length;
        let slowThreshold = 0;
        if(l1 > 1) {
            this.peakThreshold = this.getPeakThreshold(this.audSumSmoothedLong,this.peakslong,this.peakThreshold);
            slowThreshold = this.getPeakThreshold(this.audSumSmoothedSlow, this.peaksslow, 0);
        }
        
        //console.log(slowThreshold,this.peakThreshold);
        if((slowThreshold > this.peakThreshold) || (l1 < 2) || (this.inPeakTimes.length > 0)) { //volume check
            
            if(this.fastPeakTimes[this.fastPeakTimes.length-1] !== this.audTime[this.peaksfast[this.peaksfast.length-1]]) {
                this.fastPeakTimes.push(this.audTime[this.peaksfast[this.peaksfast.length-1]]); // 2 peaks = 1 breath, can't tell in vs out w/ mic though
            }
            if(this.slowPeakTimes[this.slowPeakTimes.length-1] !== this.audTime[this.peaksslow[this.peaksslow.length-1]]) {
                this.slowPeakTimes.push(this.audTime[this.peaksslow[this.peaksslow.length-1]]); //2-3 peaks between two long peaks = 1 breath. Calibrate accordingly
            
                let l = this.longPeakTimes.length;
                let s = this.slowPeakTimes.length;

                if((l > 1 && s > 2) || this.inPeakTimes.length > 0) {
                    if ((this.longPeakTimes[l-1] <= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200) || (this.inPeakTimes.length > 0 && this.outPeakTimes.length === 0)) {
                        if(this.inPeakTimes[this.inPeakTimes.length-1] > this.outPeakTimes[this.outPeakTimes.length-1] || (this.inPeakTimes.length > 0 && this.outPeakTimes.length === 0)) {
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                        } else if (this.inPeakTimes[this.inPeakTimes.length-1] < this.outPeakTimes[this.outPeakTimes.length-1] && this.inPeakTimes[this.inPeakTimes.length-1] < this.longPeakTimes[l-1]) {
                            this.inPeakTimes.push(this.slowPeakTimes[s-1]);
                        }
                    }
                }
            }
            if(this.longPeakTimes[this.longPeakTimes.length-1] !== this.audTime[this.peakslong[this.peakslong.length-1]]) {

                this.longPeakTimes.push(this.audTime[this.peakslong[this.peakslong.length-1]]); //1 big peak per breath, some smaller peaks
                let placeholder = this.inPeakTimes[this.inPeakTimes.length-1];
                if(placeholder == undefined) placeholder = Date.now();
                let l = this.longPeakTimes.length;
                let s = this.slowPeakTimes.length;
                if(l > 1 && s > 2 && ((this.inPeakTimes.length === 0 && this.outPeakTimes.length === 0) || Date.now() - placeholder > 20000)) { //only check again if 20 seconds elapse with no breaths captured to not cause overlaps and false positives
                    if((this.longPeakTimes[l-2] <= this.slowPeakTimes[s-2] || this.longPeakTimes[l-2]-this.slowPeakTimes[s-2] < 200) && (this.longPeakTimes[l-1] >= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200)) {
                        if(this.longPeakTimes[l-2] < this.slowPeakTimes[s-3]){
                            this.inPeakTimes.push(this.slowPeakTimes[s-2]);
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                        } else {
                            this.inPeakTimes.push(this.slowPeakTimes[s-2]);
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                        }
                    } else if (this.longPeakTimes[l-1] <= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200) {
                        if(this.inPeakTimes[this.inPeakTimes.length-1] > this.outPeakTimes[this.outPeakTimes.length-1]) {
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                        } else if (this.inPeakTimes[this.inPeakTimes.length-1] < this.outPeakTimes[this.outPeakTimes.length-1] && this.inPeakTimes[this.inPeakTimes.length-1] < this.longPeakTimes[l-1]) {
                            this.inPeakTimes.push(this.slowPeakTimes[s-1]);
                        }
                    }
                }
            }
        }
        
        //FIX
        let foundidx = undefined;
        let found = this.inPeakTimes.find((t,k)=>{if(t > this.audTime[0]) {foundidx = k; return true;}});
        if(foundidx) {
            let inpeakindices = []; let intimes = this.audTime.filter((o,z)=>{if(this.inPeakTimes.slice(this.inPeakTimes.length-foundidx).indexOf(o)>-1) {inpeakindices.push(z); return true;}})
            this.inpeaks=inpeakindices;
            let foundidx2 = undefined;
            let found2 = this.outPeakTimes.find((t,k)=>{if(t > this.audTime[0]) {foundidx2 = k; return true;}});
            if(foundidx2){ 
                let outpeakindices = []; let outtimes = this.audTime.filter((o,z)=>{if(this.outPeakTimes.slice(this.outPeakTimes.length-foundidx2).indexOf(o)>-1) {outpeakindices.push(z); return true;}})
                this.outpeaks=outpeakindices;
            }
        }
        else { 
            let inpeakindices = []; let intimes = this.audTime.filter((o,z)=>{if(this.inPeakTimes.indexOf(o)>-1) {inpeakindices.push(z); return true;}})
            let outpeakindices = []; let outtimes = this.audTime.filter((o,z)=>{if(this.outPeakTimes.indexOf(o)>-1) {outpeakindices.push(z); return true;}})
            this.inpeaks = inpeakindices;
            this.outpeaks = outpeakindices
        }

    }

    drawAudio = () => {

        this.calcBreathing();

        let xaxis = this.makeArr(0,this.canvas.width,this.audfft.length);
        let xaxis2 = this.makeArr(0,this.canvas.width,this.audSumGraph.length);
        let xaxis3 = this.makeArr(0,this.canvas.width,this.audhist.length);


        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        //---------------------------------------------------------- Audio FFT
        this.ctx.linewidth = 2;
        
        this.ctx.moveTo(0,this.canvas.height-this.audfft[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'royalblue';
        this.audfft.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis[i],this.canvas.height-amp*(this.canvas.height/255));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------ Audio FFT Histogram
        
        this.ctx.beginPath();
        this.ctx.moveTo(0,this.canvas.height-this.audhist[0]);
        this.ctx.strokeStyle = 'turquoise';
        this.audhist.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis3[i],this.canvas.height-amp*(this.canvas.height/255));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------- Audio FFT Sum

        this.ctx.linewidth = 3;
        
        this.ctx.moveTo(0,this.canvas.height-this.audSumGraph[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red"; 
                
        this.audSumGraph.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.audSumGraph)));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------- Audio FFT Sum Smoothed
        
        this.ctx.moveTo(0,this.canvas.height-this.audSumSmoothedFast[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "orange"; 
                
        this.audSumSmoothedFast.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.audSumGraph)));       
            }
        });
        this.ctx.stroke();
        //------------------------------------------------------------- Audio FFT Sum More Smoothed

        this.ctx.moveTo(0,this.canvas.height-this.audSumSmoothedSlow[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "gold"; 
                
        this.audSumSmoothedSlow.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.audSumGraph)));       
            }
        });
        this.ctx.stroke();

        //------------------------------------------------------------- Audio FFT Sum More Smoothed
        
        this.ctx.moveTo(0,this.canvas.height-this.audSumSmoothedLong[0]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "yellow"; 
                
        this.audSumSmoothedLong.forEach((amp,i)=>{
            if(i > 0) {
                this.ctx.lineTo(xaxis2[i],this.canvas.height-amp*(this.canvas.height/Math.max(...this.audSumGraph)));       
            }
        });
        this.ctx.stroke();

        //------------------------------------------------------------- SMA 1 peaks
        
        this.ctx.fillStyle = 'chartreuse';
        this.inpeaks.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedSlow[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 1 valleys

        this.ctx.fillStyle = 'green';
        this.outpeaks.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedSlow[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 2 peaks
        this.ctx.fillStyle = 'pink';
        this.peakslong.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedLong[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA 2 valleys

        this.ctx.fillStyle = 'purple';
        this.valslong.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedLong[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA fast peaks
        this.ctx.fillStyle = 'red';
        this.peaksfast.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedFast[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
        //------------------------------------------------------------- SMA fast valleys

        this.ctx.fillStyle = 'crimson';
        this.valsfast.forEach((pidx)=> {
            this.ctx.beginPath();
            this.ctx.arc(xaxis2[pidx],this.canvas.height-this.audSumSmoothedFast[pidx]*(this.canvas.height/Math.max(...this.audSumGraph)),5,0,Math.PI*2,true);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }
    
    animate = () => {

        this.drawAudio();

        if(this.animating)
            setTimeout(()=>{this.animate();},15);
    }

























    //Generate sinewave, you can add a noise frequency in too. Array length will be Math.ceil(fs*nSec)
	genSineWave(freq=20,peakAmp=1,nSec=1,fs=512,freq2=0,peakAmp2=1,offsetx=0,offsetx2=0){
		var sineWave = [];
		var t = [];
		var incscaled = 1/fs; //x-axis time incscaled based on sample rate
		for (var ti = 0; ti < nSec; ti+=incscaled){
			var amplitude = Math.sin(2*Math.PI*freq*(ti+offsetx))*peakAmp;
			amplitude += Math.sin(2*Math.PI*freq2*(ti+offsetx2))*peakAmp2; //Add interference
			sineWave.push(amplitude);
			t.push(ti);
		}
		return [t,sineWave]; // [[times],[amplitudes]]
	}

    genBreathingAmplitudes=(mode='dvb')=>{
        this.startTime = Date.now();
        let amplitudes = [];
        if(mode === 'dvb') {
            amplitudes = this.genSineWave(1/20,1,60,this.fs);
        } else if (mode === 'rlx') {
            let sine = this.genSineWave(1/28,1,7,this.fs,0,1,7);
            let sine2 = this.genSineWave(1/12,1,3,this.fs,0,1,3);
            let amps = [...sine[1],...sine2[1]];
            let t = new Array(amps.length).fill(0);
            t = t.map((x,i)=>{return i/this.fs;})
            amplitudes = [t, amps];
           
        } else if (mode === 'jmr') {
            amplitudes = this.genSineWave(1/24,1,24*3,this.fs);
        } else if (mode === 'wmhf') {
            let sine = this.genSineWave(0.5,1,30,this.fs,0,1,1);
            let sine2 = this.genSineWave(1/20,1,15,this.fs);
            let hold1 = new Array(this.fs*10).fill(-1);
            let sine3 = this.genSineWave(1/20,1,10,this.fs,0,1,15);
            let hold2 = new Array(this.fs*10).fill(1);
            let amps = [...sine[1],...sine2[1],...hold1,...sine3[1],...hold2];
            let t = new Array(amps.length).fill(0);
            t = t.map((x,i)=>{return i/this.fs;})
            amplitudes = [t,amps];
           
        }
        
        this.amplitudes = amplitudes;
                
        // this.x = [...this.amplitudes[0],...this.amplitudes[0].map((x)=> {return x+this.amplitudes[0][this.amplitudes[0].length-1]})];
        // this.y = [...this.amplitudes[1],...this.amplitudes[1]];

        // this.xi0=0;
        // this.xi1=this.x.length-1;
        // this.x.find((xn,i)=>{
        //     if(xn > this.canvas.width || i === this.xi1-1) {
        //         this.xi1 = i;
        //         return true;
        //     }
        // });

        // this.xDiff = undefined;

        // //console.log(amplitudes);
    }

    showAxes = (ctx=this.ctx,xOffset=0,yOffset=0) => {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        var xMin = 0;
        
        ctx.beginPath();
        ctx.strokeStyle = "rgba(128,128,128,0.3)";
        
        // X-Axis
        ctx.moveTo(xMin, height/2 + xOffset);
        ctx.lineTo(width, height/2 + xOffset);
        
        // Y-Axis
        ctx.moveTo(width/2 + yOffset, 0);
        ctx.lineTo(width/2 + yOffset, height);

        // Starting line
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        
        ctx.stroke();
    }
    drawPoint = (ctx=this.ctx, y) => {            
        var radius = 3;
        ctx.beginPath();

        // Hold x constant at 4 so the point only moves up and down.
        ctx.arc(this.canvas.width*0.5, y, radius, 0, 2 * Math.PI, false);

        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    plotSine = (ctx=this.ctx, xOffset, yOffset, amplitude=40, frequency=20) => {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        var scale = 20;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(66,44,255)";

        // console.log("Drawing point...");
        // drawPoint(ctx, yOffset+this.step);
        
        var x = 0;
        var y = this.canvas.height*0.5;
        //ctx.moveTo(x, y);
        let set = false;
        while (x < width) {
            y = height/2 + amplitude * Math.sin((x+xOffset)/frequency);
            if(!set) { set = true; ctx.moveTo(x, y); }
            ctx.lineTo(x, y);
            x++;
            // console.log("x="+x+" y="+y);
        }
        ctx.stroke();
        ctx.save();

        //console.log("Drawing point at y=" + y);
        ctx.stroke();
        ctx.restore();

        return y;
    }

    drawLatest = () => {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
       
        this.ctx.save();            
        
        let y = this.plotSine(this.ctx, this.step, 0, 40, 20);
        this.showAxes(this.ctx,y-this.canvas.height*0.5,0);
        this.drawPoint(this.ctx, y);
        this.ctx.restore();

        this.thisFrame = Date.now();
        this.step += 0.001*(this.thisFrame - this.lastFrame);
        this.lastFrame=this.thisFrame;
        
        if(this.animating)
            window.requestAnimationFrame(this.draw);

    }

    spirograph(canvasid) {            
        var canvas = document.getElementById(canvasid);
        var context = canvas.getContext("2d");
        
        this.showAxes(context);
        context.save();
        // var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var step = 4;
        for (var i = -4; i < canvas.height; i += step) {
            // context.putImageData(imageData, 0, 0);
            this.plotSine(context, i, 54 + i);
        }
    }

   
} 
