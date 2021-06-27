//Microphone-based Breath Capture
//Joshua Brewster - MIT License

import {SoundJS} from '../../../../platform/js/frontend/UX/Sound'
import { StateManager } from '../ui/StateManager';
/* How to use

let Capture = new BreathCapture();
Capture.analyze();
Capture.connectMic();

//Manually calibrate to correct the capture. Do this ~1 sec after breathing in.
Capture.calibrate();

//Outputs captured in this object as arrays
//More fine grained data are in the class
Capture.output = {
    belowThreshold: false,              //Are the detected breathing peaks below the mean threshold (too quiet?) //bool
    isHolding: false,                   //Is the user between an in and out breath?     //bool
    inVolumes: this.inPeakVolumes,      //summed fft volume of in-breath                //float array
    outVolumes: this.outPeakVolumes,    //summed fft volume of out-breath               //float array
    inTimes: this.inPeakTimes,          //timestamps of in-breaths                      //unix ms timestamp array
    outTimes: this.outPeakTimes,        //timestamps of out-breaths                     //unix ms timestamp array
    inToOutTimes: this.inToOutTimes,    //timeframe between out- and in-breaths         //ms int array
    fastTimes: this.fastPeakTimes,      //timestamps of the fast sma peaks              //unix ms timestamp array
    fastRate: this.fastPeakDt,          //For fast breathing look for coherent breaths  //ms int array
    breathRate: this.breathingRate,     //look for coherent breaths                     //ms int array
    brv: this.breathingRateVariability,  //Lower is better                               //ms int array
    audioFFT: this.output.audioFFT,
    fastSmoothedVolume: this.audSumSmoothedFast,
    slowSmoothedVolume: this.audSumSmoothedSlow,
    longSmoothedVolume: this.audSumSmoothedLong
};

*/

export class BreathCapture {
    constructor (onUpdate=()=>{},onBreath=()=>{}) {
        this.effects = [];
        this.fxStruct = {sourceIdx:undefined,source:undefined,playing:false,id:undefined};
        
        this.onUpdate = onUpdate;
        this.onBreath = onBreath;

        this.audsum = 0;
       
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
        this.audSpect = new Array(1024).fill(new Array(512).fill(0));
        this.audTime = new Array(1024).fill(0);

        this.lastInPeak = 0;
        this.lastOutPeak = 0;
        
        this.fastPeakTimes = [];
        this.fastPeakDt = [];
        this.slowPeakTimes = [];
        this.longPeakTimes = [];

        this.peakThreshold = 0;

        this.inPeakVolumes = [];
        this.outPeakVolumes = [];
        this.inPeakTimes = []; //Timestamp of in-breath
        this.outPeakTimes = []; //Timestamp of out=breath
        this.inToOutTimes = [];
        this.breathingRate = []; //Avg difference between most recent breathing peaks
        this.breathingRateVariability = []; //Difference between breathing rates

        //Simplified output reference.
        this.output = {
            belowThreshold: false,              //Are the detected breathing peaks below the mean threshold (too quiet?)
            isHolding: false,                   //Is the user between an in and out breath?
            inVolumes: this.inPeakVolumes,      //summed fft volume of in-breath
            outVolumes: this.outPeakVolumes,    //summed fft volume of out-breath
            inTimes: this.inPeakTimes,          //timestamps of in-breaths
            outTimes: this.outPeakTimes,        //timestamps of out-breaths
            inToOutTimes: this.inToOutTimes,    //timeframe between out- and in-breaths
            fastTimes: this.fastPeakTimes,      //timestamps of the fast sma peaks
            fastRate: this.fastPeakDt,          //For fast breathing look for coherent breaths
            breathRate: this.breathingRate,     //look for coherent breaths
            brv: this.breathingRateVariability,  //Lower is better
            audioFFT: [],
            fastSmoothedVolume: this.audSumSmoothedFast,
            slowSmoothedVolume: this.audSumSmoothedSlow,
            longSmoothedVolume: this.audSumSmoothedLong
        };

        this.state = new StateManager(this.output);

        this.analyzing = false;
    }

    analyze=() => {
        if(this.analyzing === false) {
            this.analyzing = true;
            this.loop();
        }
    }

    resetVars = () => {

        this.audsum = 0;
       
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
        this.audSpect = new Array(1024).fill(new Array(250).fill(0));
        this.audTime = new Array(1024).fill(0);

        this.lastInPeak = 0;
        this.lastOutPeak = 0;
        
        this.fastPeakTimes = [];
        this.fastPeakDt = [];
        this.slowPeakTimes = [];
        this.longPeakTimes = [];

        this.peakThreshold = 0;

        this.inPeakVolumes = [];
        this.outPeakVolumes = [];
        this.inPeakTimes = []; //Timestamp of in-breath
        this.outPeakTimes = []; //Timestamp of out=breath
        this.inToOutTimes = [];
        this.breathingRate = []; //Avg difference between most recent breathing peaks
        this.breathingRateVariability = []; //Difference between breathing rates

        this.resetOutput();
    }

    resetOutput = () => {
        //Simplified output reference.
        this.output = {
            belowThreshold: false,              //Are the detected breathing peaks below the mean threshold (too quiet?)
            isHolding: false,                   //Is the user between an in and out breath?
            inVolumes: this.inPeakVolumes,      //summed fft volume of in-breath
            outVolumes: this.outPeakVolumes,    //summed fft volume of out-breath
            inTimes: this.inPeakTimes,          //timestamps of in-breaths
            outTimes: this.outPeakTimes,        //timestamps of out-breaths
            inToOutTimes: this.inToOutTimes,    //timeframe between out- and in-breaths
            fastTimes: this.fastPeakTimes,      //timestamps of the fast sma peaks
            fastRate: this.fastPeakDt,          //For fast breathing look for coherent breaths
            breathRate: this.breathingRate,     //look for coherent breaths
            brv: this.breathingRateVariability,  //Lower is better
            audioFFT: [],
            fastSmoothedVolume: this.audSumSmoothedFast,
            slowSmoothedVolume: this.audSumSmoothedSlow,
            longSmoothedVolume: this.audSumSmoothedLong
        };

        this.state.data = this.output;
    }

    stop=()=>{
        this.analyzing = false;
    }

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
                }
            });

            this.effects.push(fx);

            try {
                window.audio.gainNode.disconnect(window.audio.analyserNode);
                window.audio.analyserNode.disconnect(window.audio.out);
                window.audio.gainNode.connect(window.audio.out);
            } catch (er) {}
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

            try{ 
                window.audio.gainNode.disconnect(window.audio.out);
                window.audio.gainNode.connect(window.audio.analyserNode);
                window.audio.analyserNode.connect(window.audio.out);
            } catch(er) {}
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
            for(let i = 0; i < ref.length; i++) {
                let val = ref[i];
                if(critical === 'peak') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                        break;
                    } else if (i > Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                        break;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                        break;
                    } else if (i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                        break;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                        break;
                    } else if ((i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                        break;
                    }
                } //|| (i < ref.length*.5 && val <= 0 ) || (i > ref.length*.5 && val > 0)
            }
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                for(let i = 0; i < ref.length; i++) {
                    let val = ref[i];
                    if((i <  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                        break;
                    } else if ((i >  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                        break;
                    }
                }
            }
            return pass;
        } else return undefined;
    }

    isCriticalPoint(arr,critical='peak') { //Checks if the middle point of the (odd-numbered) array is a critical point. options: 'peak','valley','tangent'. Even numbered arrays are popped
        let ref = [...arr];
		if(ref.length%2 === 0) ref.pop();
        if(arr.length > 1) { 
            let pass = true;
            for(let i = 0; i < ref.length; i++) {
                let val = ref[i];
                if(critical === 'peak') { //search first derivative
                    if(i < ref.length*.5 && val <= 0 ) {
                        pass = false;
                        break;
                    } else if (i > ref.length*.5 && val > 0) {
                        pass = false;
                        break;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < ref.length*.5 && val >= 0 ) {
                        pass = false;
                        break;
                    } else if (i > ref.length*.5 && val < 0) {
                        pass = false;
                        break;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < ref.length*.5 && val >= 0 )) {
                        pass = false;
                        break;
                    } else if ((i > ref.length*.5 && val < 0)) {
                        pass = false;
                        break;
                    }
                }
            }
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                for(let i = 0; i < ref.length; i++) {
                    let val = ref[i];
                    if((i < ref.length*.5 && val <= 0 )) {
                        pass = false;
                        break;
                    } else if ((i > ref.length*.5 && val > 0)) {
                        pass = false;
                        break;
                    }
                }
            }
            return pass;
        } else return undefined;
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
    getPeakThreshold(arr,peakIndices, thresholdVar=0) {
        let threshold;
        let filtered = arr.filter((o,i)=>{if(peakIndices.indexOf(i)>-1) return true;});
        if(thresholdVar === 0) {
            threshold = this.mean(filtered); 
        } else threshold = (thresholdVar+this.mean(filtered))*0.5;  
        
        return threshold;
    }

    //sets the in-breath to the latest slow peak
    calibrate = () => {
        if(this.slowPeakTimes.length > 0) {
            this.inPeakTimes = [this.slowPeakTimes[this.slowPeakTimes.length-1]];
            this.outPeakTimes = [];

            this.inPeakVolumes = [this.audSumSmoothedSlow[this.peaksslow[this.peaksslow.length-1]]];
            this.outPeakVolumes = [this.audSumSmoothedSlow[this.valsslow[this.valsslow.length-1]]];
            this.inToOutTimes = [];
            this.breathingRate = []; //Avg difference between most recent breathing peaks
            this.breathingRateVariability = []; //Difference between breathing rates

            this.resetOutput();

            this.output.isHolding = true;

        }
    }

    onUpdate = () => { //after each loop cycle (15ms)

    }

    onBreath = () => { //after an out-breath is detected

    }

    calcBreathing = () => {
        this.output.audioFFT = this.getAudioData().slice(6);
        this.audsum = this.sumAudioData();
        this.audSumGraph.shift(); this.audSumGraph.push(this.audsum);
        this.audSpect.shift(); this.audSpect.push(this.output.audioFFT);

        this.audTime.shift(); this.audTime.push(Date.now());

        let smoothedfast = this.mean(this.audSumGraph.slice(this.audSumGraph.length-5));
        this.audSumSmoothedFast.shift(); this.audSumSmoothedFast.push(smoothedfast);
        let smoothedslow = this.mean(this.audSumGraph.slice(this.audSumGraph.length-40));
        this.audSumSmoothedSlow.shift(); this.audSumSmoothedSlow.push(smoothedslow);
        let smoothed2 = this.mean(this.audSumGraph.slice(this.audSumGraph.length-120));
        this.audSumSmoothedLong.shift(); this.audSumSmoothedLong.push(smoothed2);
        
        this.peaksfast = this.peakDetect(this.audSumSmoothedFast,'peak',10);
        this.valsfast = this.peakDetect(this.audSumSmoothedFast,'valley',10);

        this.peaksslow = this.peakDetect(this.audSumSmoothedSlow,'peak',25);
        this.valsslow = this.peakDetect(this.audSumSmoothedSlow,'valley',25);

        this.peakslong = this.peakDetect(this.audSumSmoothedLong,'peak',80);
        this.valslong = this.peakDetect(this.audSumSmoothedLong,'valley',80);

        let l1 = this.longPeakTimes.length;
        let slowThreshold = 0;
        if(l1 > 1) {
            this.peakThreshold = this.getPeakThreshold(this.audSumSmoothedLong,this.peakslong,this.peakThreshold);
            slowThreshold = this.getPeakThreshold(this.audSumSmoothedSlow, this.peaksslow, 0);
        }
        
        //console.log(slowThreshold,this.peakThreshold);
        if((slowThreshold > this.peakThreshold) || (l1 < 2) || (this.inPeakTimes.length > 0)) { //volume check
            if(this.output.belowThreshold === true) this.output.belowThreshold = false;
            if(this.fastPeakTimes[this.fastPeakTimes.length-1] !== this.audTime[this.peaksfast[this.peaksfast.length-1]]) {
                this.fastPeakTimes.push(this.audTime[this.peaksfast[this.peaksfast.length-1]]); // 2 peaks = 1 breath, can't tell in vs out w/ mic though
                if(this.fastPeakTimes.length > 1) {
                    this.fastPeakDt.push(this.fastPeakTimes[this.fastPeakTimes.length-1] - this.fastPeakTimes[this.fastPeakTimes.length-2]);
                }
            }
            if(this.slowPeakTimes[this.slowPeakTimes.length-1] !== this.audTime[this.peaksslow[this.peaksslow.length-1]]) {
                this.slowPeakTimes.push(this.audTime[this.peaksslow[this.peaksslow.length-1]]); //2-3 peaks between two long peaks = 1 breath. Calibrate accordingly
            
                let l = this.longPeakTimes.length;
                let s = this.slowPeakTimes.length;

                let latestSlow = this.audSumSmoothedSlow[this.peaksslow[this.peaksslow.length-1]];
                let latestLong = this.audSumSmoothedLong[this.peakslong[this.peakslong.length-1]];

                if((l > 1 && s > 2) || this.inPeakTimes.length > 0) {
                    if ((latestSlow > latestLong && (this.longPeakTimes[l-1] <= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200)) || (this.inPeakTimes.length > 0 && this.outPeakTimes.length === 0)) {
                        if(this.inPeakTimes[this.inPeakTimes.length-1] > this.outPeakTimes[this.outPeakTimes.length-1] || (this.inPeakTimes.length > 0 && this.outPeakTimes.length === 0)) {
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.outPeakVolumes.push(latestSlow);
                            if(this.inPeakTimes.length > 0 ) this.inToOutTimes.push(this.slowPeakTimes[s-1]-this.inPeakTimes[this.inPeakTimes.length-1]);
                            if(this.inPeakTimes.length > 1 && this.outPeakTimes.length > 1) {
                                this.breathingRate.push(0.5*((this.inPeakTimes[this.inPeakTimes.length-1]-this.inPeakTimes[this.inPeakTimes.length-2])+(this.outPeakTimes[this.outPeakTimes.length-1]-this.outPeakTimes[this.outPeakTimes.length-2])))
                                if(this.breathingRate.length > 1) {
                                    this.breathingRateVariability.push(Math.abs(this.breathingRate[this.breathingRate.length-1]-this.breathingRate[this.breathingRate.length-2]))
                                } 
                            }
                            this.output.isHolding = false;
                            this.onBreath();
                        } else if (this.inPeakTimes[this.inPeakTimes.length-1] < this.outPeakTimes[this.outPeakTimes.length-1] && this.inPeakTimes[this.inPeakTimes.length-1] < this.longPeakTimes[l-1]) {
                            this.inPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.inPeakVolumes.push(latestSlow);
                            this.output.isHolding = true;
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

                let latestSlow = this.audSumSmoothedSlow[this.peaksslow[this.peaksslow.length-1]];
                let latestLong = this.audSumSmoothedLong[this.peakslong[this.peakslong.length-1]];

                if(l > 1 && s > 2 && (latestSlow > latestLong) && ((this.inPeakTimes.length === 0 && this.outPeakTimes.length === 0) || Date.now() - placeholder > 20000)) { //only check again if 20 seconds elapse with no breaths captured to not cause overlaps and false positives
                    if(((this.longPeakTimes[l-2] <= this.slowPeakTimes[s-2] || this.longPeakTimes[l-2]-this.slowPeakTimes[s-2] < 200) || this.longPeakTimes[l-2]-this.slowPeakTimes[s-2] < 200) && (this.longPeakTimes[l-1] >= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200)) {
                        if(this.longPeakTimes[l-2] < this.slowPeakTimes[s-3]){
                            this.inPeakTimes.push(this.slowPeakTimes[s-2]);
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.inPeakVolumes.push(this.audSumSmoothedSlow[this.peaksslow[this.peaksslow.length-2]])
                            this.outPeakVolumes.push(latestSlow);
                            this.inToOutTimes.push(this.slowPeakTimes[s-1]-this.slowPeakTimes[s-2]);
                            if(this.inPeakTimes.length > 1 && this.outPeakTimes.length > 1) {
                                this.breathingRate.push(0.5*((this.inPeakTimes[this.inPeakTimes.length-1]-this.inPeakTimes[this.inPeakTimes.length-2])+(this.outPeakTimes[this.outPeakTimes.length-1]-this.outPeakTimes[this.outPeakTimes.length-2])))
                                if(this.breathingRate.length > 1) {
                                    this.breathingRateVariability.push(Math.abs(this.breathingRate[this.breathingRate.length-1]-this.breathingRate[this.breathingRate.length-2]))
                                } 
                            }
                            this.onBreath();
                        } else {
                            this.inPeakTimes.push(this.slowPeakTimes[s-2]);
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.inPeakVolumes.push(this.audSumSmoothedSlow[this.peaksslow[this.peaksslow.length-2]])
                            this.outPeakVolumes.push(latestSlow);
                            this.inToOutTimes.push(this.slowPeakTimes[s-1]-this.slowPeakTimes[s-2]);
                            if(this.inPeakTimes.length > 1 && this.outPeakTimes.length > 1) {
                                this.breathingRate.push(0.5*((this.inPeakTimes[this.inPeakTimes.length-1]-this.inPeakTimes[this.inPeakTimes.length-2])+(this.outPeakTimes[this.outPeakTimes.length-1]-this.outPeakTimes[this.outPeakTimes.length-2])))
                                if(this.breathingRate.length > 1) {
                                    this.breathingRateVariability.push(Math.abs(this.breathingRate[this.breathingRate.length-1]-this.breathingRate[this.breathingRate.length-2]))
                                } 
                            }
                            this.onBreath();
                        }
                    } else if (this.longPeakTimes[l-1] <= this.slowPeakTimes[s-1] || this.longPeakTimes[l-1]-this.slowPeakTimes[s-1] < 200) {
                        if(this.inPeakTimes[this.inPeakTimes.length-1] > this.outPeakTimes[this.outPeakTimes.length-1]) {
                            this.outPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.outPeakVolumes.push(latestSlow);
                            if(this.inPeakTimes.length > 0 ) this.inToOutTimes.push(this.slowPeakTimes[s-1]-this.inPeakTimes[this.inPeakTimes.length-1]);
                            if(this.inPeakTimes.length > 1 && this.outPeakTimes.length > 1) {
                                this.breathingRate.push(0.5*((this.inPeakTimes[this.inPeakTimes.length-1]-this.inPeakTimes[this.inPeakTimes.length-2])+(this.outPeakTimes[this.outPeakTimes.length-1]-this.outPeakTimes[this.outPeakTimes.length-2])))
                                if(this.breathingRate.length > 1) {
                                    this.breathingRateVariability.push(Math.abs(this.breathingRate[this.breathingRate.length-1]-this.breathingRate[this.breathingRate.length-2]))
                                } 
                            }
                            this.onBreath();
                        } else if (this.inPeakTimes[this.inPeakTimes.length-1] < this.outPeakTimes[this.outPeakTimes.length-1] && this.inPeakTimes[this.inPeakTimes.length-1] < this.longPeakTimes[l-1]) {
                            this.inPeakTimes.push(this.slowPeakTimes[s-1]);
                            this.inPeakVolumes.push(latestSlow);
                            this.output.isHolding = true;
                        }
                    }
                }
            }
        } else if (slowThreshold < this.peakThreshold) {
            if(!this.output.belowThreshold) this.output.belowThreshold = true;
        }
        
        // //FIX
        // let foundidx = undefined;
        // let found = this.inPeakTimes.find((t,k)=>{if(t > this.audTime[0]) {foundidx = k; return true;}});
        // if(foundidx) {
        //     let inpeakindices = []; let intimes = this.audTime.filter((o,z)=>{if(this.inPeakTimes.slice(this.inPeakTimes.length-foundidx).indexOf(o)>-1) {inpeakindices.push(z); return true;}})
        //     this.inpeaks=inpeakindices;
        //     let foundidx2 = undefined;
        //     let found2 = this.outPeakTimes.find((t,k)=>{if(t > this.audTime[0]) {foundidx2 = k; return true;}});
        //     if(foundidx2){ 
        //         let outpeakindices = []; let outtimes = this.audTime.filter((o,z)=>{if(this.outPeakTimes.slice(this.outPeakTimes.length-foundidx2).indexOf(o)>-1) {outpeakindices.push(z); return true;}})
        //         this.outpeaks=outpeakindices;
        //     }
        // }
        // else { 
        //     let inpeakindices = []; let intimes = this.audTime.filter((o,z)=>{if(this.inPeakTimes.indexOf(o)>-1) {inpeakindices.push(z); return true;}})
        //     let outpeakindices = []; let outtimes = this.audTime.filter((o,z)=>{if(this.outPeakTimes.indexOf(o)>-1) {outpeakindices.push(z); return true;}})
        //     this.inpeaks = inpeakindices;
        //     this.outpeaks = outpeakindices
        // }

    }


    loop = () => {
        if(this.analyzing === true) {
            this.calcBreathing();
            this.onUpdate();
            setTimeout(()=>{this.loop()},15);
        }
    }


}