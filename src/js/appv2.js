/*

Data Streams
- Local hardware
  -- Serial
  -- BLE
  -- Sockets/SSEs
- Server
  -- Hardware and Game state data via Websockets

Data Processing 
- eegworker.js, eegmath, bcijs, etc.

Data State
- Sort raw/filtered data
- Sort processed data

UI Templating
- StateManager.js
- UIManager.js
- ObjectListener.js
- DOMFragment.js

Local Storage
- BrowserFS for IndexedDB
- CSV saving/parsing

Frontend Execution
- UI State
- Server State
- Game/App State(s)

*/

import {eeg32, eegmath} from './utils/eeg32'
import {Biquad, makeNotchFilter, makeBandpassFilter, DCBlocker} from '../utils/signal_analysis/BiquadFilters'


class biquadChannelFilterer {
    constructor(channel="A0",sps=512, filtering=true) {
        this.channel=channel; this.idx = 0; this.sps = sps;
        this.filtering=filtering;
        this.bplower = 3; this.bpupper = 45;

        State.data.filtered[this.channel] = [];//Add placeholder to state

        this.notch50 = [
                    makeNotchFilter(50,sps,1)
                ];
        this.notch60 = [
                    makeNotchFilter(60,sps,1)
                ];
        this.lp1 = [
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps)
                ];
        this.bp1 = [
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1)
                ];
        this.dcb = new DCBlocker(0.995);
    }

    reset(sps=this.sps) {
        this.notch50 = makeNotchFilter(50,sps,1);
        this.notch60 = makeNotchFilter(60,sps,1);
        this.lp1 = [
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps)
                ];
        this.bp1 = [
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75)
                ];
        this.dcb = new DCBlocker(0.995);
    }

    setBandpass(bplower=this.bplower,bpupper=this.bpupper) {
        this.bplower=bplower; this.bpupper = bpupper;
        this.bp1 = [
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps)
        ];
    }

    apply(idx=this.lastidx+1) {
        let out=EEG.data[this.channel][idx]; 
        if(this.filtering === true) {
            if(State.data.sma4 === true) {
                if(State.data.counter >= 4) { //Apply a 4-sample moving average
                    out = (State.data.filtered[this.channel][State.data.filtered[this.channel].length-3] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-2] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-1] + out)*.25;
                }
                else if(EEG.data.counter >= 4){
                    //console.log(State.data.counter, State.data.filtered[this.channel].length)
                    out = (EEG.data[this.channel][EEG.data.counter-4] + EEG.data[this.channel][EEG.data.counter-3] + EEG.data[this.channel][EEG.data.counter-2] + out)*.25;
                }
            }
            if(State.data.dcblocker === true) { //Apply a DC blocking filter
                out = this.dcb.applyFilter(out);
            }
            if(State.data.notch50 === true) { //Apply a 50hz notch filter
                this.notch50.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.notch60 === true) { //Apply a 60hz notch filter
                this.notch60.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            } 
            if(State.data.lowpass50 === true) { //Apply 4 50Hz lowpass filters
                this.lp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.bandpass === true) { //Apply 4 Bandpass filters
                this.bp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.uVScaling === true){
                out = out*EEG.uVperStep;
            }
        }
        this.lastidx=idx;
        //console.log(this.channel, out)
        return out;
    }
}


class deviceStream {
	constructor(device="FreeEEG32_2",location="local",useFilters="true",pipeTo=null,auth={}) {
		this.deviceObj = null;
		this.filters = [];
		if(device === "FreeEEG32_2") {
			let defaultTags = [
				{ch: 4, tag: "Fp2", viewing: true},
				{ch: 24, tag: "Fp1", viewing: true},
				{ch: 8, tag: "other", viewing: true}
			];
			
			this.deviceObj = new eeg32(
				(newLinesint) => {

				},
				()=>{},
				()=>{}
			);
			if(useFilters === true) {
				defaultTags.forEach((row,i) => {
					if(row.tag !== 'other') {
						State.data.filterers.push(new biquadChannelFilterer("A"+row.ch,this.deviceObj.sps,true));
					}
					else { 
						State.data.filterers.push(new biquadChannelFilterer("A"+row.ch,this.deviceObj.sps,false)); 
					}
				});
			}
			
		}
		else if(device === "FreeEEG32_19") {

		}
		else if(device === "muse") {

		}
	}
}


class dataAtlas {
    constructor(channelTags=[{ch: 0, tag: null},{ch: 1, tag: null}],name="atlas",use10_20=true,useCoherence=true) {
        this.name = name;
        this.tags = channelTags;
        this.data = {shared:{},eeg:[],coherence:[],heg:[]};
        if(use10_20 === true) {
            this.data.eeg = this.gen10_20Atlas();
        }
        if(useCoherence === true) {
            this.data.coherence = genCoherenceMap();
        }
    }

    genEEGCoordinateStruct(tag,x,y,z){
        let bands = {scp:[],delta:[],theta:[],alpha1:[],alpha2:[],beta:[],lowgamma:[],highgamma:[]} 
        let struct = {
            tag:tag, 
            position:{x:x,y:y,z:z}, 
            count:0,
            times:[], 
            raw:[], 
            filtered:[], 
            ffts:[], 
            slices:JSON.parse(JSON.stringify(bands)), 
            means:JSON.parse(JSON.stringify(bands))
        };
        return struct;
    }
    
    addToAtlas(tag,x,y,z){
		this.data.eeg.push(genEEGCoordinateStruct(tag,x,y,z));
	}

    gen10_20Atlas() {
        let eegmap = [];
        let tags = ["Fp1","Fp2","Fz","F3","F4","F7","F8",
                    "Cz","C3","C4","T3","T4","T5","T6","Pz","P3","P4","O1","O2"];
        let coords=[[-21.5,70.2,-0.1],[28.4,69.1,-0.4], //MNI coordinates
                    [0.6,40.9,53.9],[-35.5,49.4,32.4],
                    [40.2,47.6,32.1],[-54.8,33.9,-3.5],
                    [56.6,30.8,-4.1],[0.8,-14.7,73.9],
                    [-52.2,-16.4,57.8],[54.1,-18.0,57.5],
                    [-70.2,-21.3,-10.7],[71.9,-25.2,-8.2],
                    [-61.5,-65.3,1.1],[59.3,-67.6,3.8],
                    [0.2,-62.1,64.5],[-39.4,-76.3,47.4],
                    [36.8,-74.9,49.2],[-26.8,-100.2,12.8],
                    [24.1,-100.5,14.1]];

        tags.forEach((tag,i) => {
            eegmap.push(this.genEEGCoordinateStruct(tag,coords[i][0],coords[i][1],coords[i][2]));
        });

        return eegmap;
    }

    genCoherenceMap(channelTags = this.channelTags, taggedOnly = true) {
		var cmap = [];
		var l = 1, k = 0;
		var freqBins = {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []}
		
		for( var i = 0; i < (channelTags.length*(channelTags.length + 1)/2)-channelTags.length; i++){
			if(taggedOnly === false || taggedOnly === true && ((channelTags[k].tag !== null && channelTags[k+l].tag !== null)&&(channelTags[k].tag !== 'other' && channelTags[k+l].tag !== 'other'))) {
				var coord0 = this.getAtlasCoordByTag(channelTags[k].tag);
				var coord1 = this.getAtlasCoordByTag(channelTags[k+l].tag);

				cmap.push({
					tag: channelTags[k].tag+":"+channelTags[l+k].tag,
                    x0: coord0?.position.x,
                    y0: coord0?.position.y,
                    z0: coord0?.position.z,
                    x1: coord1?.position.x,
                    y1: coord1?.position.y,
                    z1: coord1?.position.z,
                    count: 0,
                    times:[],
                    ffts:[],
                    slices: JSON.parse(JSON.stringify(freqBins)),
                    means: JSON.parse(JSON.stringify(freqBins))
				});
			}
			l++;
			if (l + k === channelTags.length) {
				k++;
				l = 1;
			}
		}
		return cmap;
	}

    //Return the object corresponding to the atlas tag
	getDataByTag(tag="Fp1"){
		var found = undefined;
		let atlasCoord = this.data.eeg.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}

    //Return the object corresponding to the atlas tag
	getCoherenceByTag(tag="Fp1:Fpz"){
		var found = undefined;
		let atlasCoord = this.data.coherence.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}

    //Return an array of Array(3)s for each coordinate. Useful e.g. for graphics
	getCoordPositions() {
		var coords = [];
		for(var i = 0; i< this.data.eeg.length; i++) {
			coords.push([this.data.eeg[i].position.x,this.data.eeg[i].position.y,this.data.eeg[i].position.z]);
		}
		return coords;
	}

    //Get the latest data pushed to tagged channels
	getLatestData() {
		var dat = [];
		this.channelTags.forEach((r, i) => {
			var row = this.getDataByTag(r.tag);
			var lastIndex = row.count - 1;
			dat.push({
                tag:row.tag,
				count:row.count,
				time: row.times[lastIndex],
				fft: row.ffts[lastIndex],
				slice:{delta:row.slices.delta[lastIndex], theta:row.slices.theta[lastIndex], alpha1:row.slices.alpha1[lastIndex], alpha2:row.slices.alpha2[lastIndex], beta:row.slices.beta[lastIndex], gamma:row.slices.gamma[lastIndex]},
				mean:{delta:row.means.delta[lastIndex], theta:row.means.theta[lastIndex], alpha1: row.means.alpha1[lastIndex], alpha2: row.means.alpha2[lastIndex], beta: row.means.beta[lastIndex], gamma: row.means.gamma[lastIndex]}
                });
            });
		return dat;
	}

    setDefaultTags() {
		return [
			{ch: 0, tag: null},{ch: 1, tag: null},{ch: 2, tag: null},{ch: 3, tag: null},
			{ch: 4, tag: null},{ch: 5, tag: null},{ch: 6, tag: null},{ch: 7, tag: null},
			{ch: 8, tag: null},{ch: 9, tag: null},{ch: 10, tag: null},{ch: 11, tag: null},
			{ch: 12, tag: null},{ch: 13, tag: null},{ch: 14, tag: null},{ch: 15, tag: null},
			{ch: 16, tag: null},{ch: 17, tag: null},{ch: 18, tag: null},{ch: 19, tag: null},
			{ch: 20, tag: null},{ch: 21, tag: null},{ch: 22, tag: null},{ch: 23, tag: null},
			{ch: 24, tag: null},{ch: 25, tag: null},{ch: 26, tag: null},{ch: 27, tag: null},
			{ch: 28, tag: null},{ch: 29, tag: null},{ch: 30, tag: null},{ch: 31, tag: null}
		];
	}

    getBandFreqs(bandpassWindow) {//Returns an object with the frequencies and indices associated with the bandpass window (for processing the FFT results)
		var scpFreqs = [[],[]], deltaFreqs = [[],[]], thetaFreqs = [[],[]], alpha1Freqs = [[],[]], alpha2Freqs = [[],[]], betaFreqs = [[],[]], lowgammaFreqs = [[],[]], highgammaFreqs = [[],[]]; //x axis values and indices for named EEG frequency bands
		bandpassWindow.forEach((item,idx) => {
			if((item >= 0.1) && (item <= 1)){
				scpFreqs[0].push(item); scpFreqs[1].push(idx);
			}
			else if((item >= 1) && (item <= 4)){
				deltaFreqs[0].push(item); deltaFreqs[1].push(idx);
			}
			else if((item > 4) && (item <= 8)) {
				thetaFreqs[0].push(item); thetaFreqs[1].push(idx);
			}
			else if((item > 8) && (item <= 10)){
				alpha1Freqs[0].push(item); alpha1Freqs[1].push(idx);
			}
			else if((item > 10) && (item <= 12)){
				alpha2Freqs[0].push(item); alpha2Freqs[1].push(idx);
			}
			else if((item > 12) && (item <= 35)){
				betaFreqs[0].push(item); betaFreqs[1].push(idx);
			}
			else if((item > 35) && (item <= 48)) {
				lowgammaFreqs[0].push(item); lowgammaFreqs[1].push(idx);
			}
			else if(item > 48) {
				highgammaFreqs[0].push(item); highgammaFreqs[1].push(idx);
			}
		});
		return {scp: scpFreqs, delta: deltaFreqs, theta: thetaFreqs, alpha1: alpha1Freqs, alpha2: alpha2Freqs, beta: betaFreqs, lowgamma: lowgammaFreqs, highgamma: highgammaFreqs}
	}

    mapFFTData = (data, lastPostTime, channel, tag) => {
		let atlasCoord = this.data.eeg.find((o, i) => {
		if(o.tag === tag){
			this.data.eeg[i].count++;
			this.data.eeg[i].times.push(lastPostTime);
			this.data.eeg[i].ffts.push(data[channel]);
			if(this.data.shared.bandFreqs.scp[1].length > 0){
			var scp = data[channel].slice( this.data.shared.bandFreqs.scp[1][0], this.data.shared.bandFreqs.scp[1][this.data.shared.bandFreqs.scp[1].length-1]+1);
			this.data.eeg[i].data.slices.scp.push(scp);
			this.data.eeg[i].data.means.scp.push(eegmath.mean(scp));
			}
			if(this.data.shared.bandFreqs.scp[1].length > 0){
			var delta = data[channel].slice( this.data.shared.bandFreqs.delta[1][0], this.data.shared.bandFreqs.delta[1][this.data.shared.bandFreqs.delta[1].length-1]+1);
			this.data.eeg[i].slices.delta.push(delta);
			this.data.eeg[i].means.delta.push(eegmath.mean(delta));
			}
			if(this.data.shared.bandFreqs.theta[1].length > 0){
			var theta = data[channel].slice( this.data.shared.bandFreqs.theta[1][0], this.data.shared.bandFreqs.theta[1][this.data.shared.bandFreqs.theta[1].length-1]+1);
			this.data.eeg[i].slices.theta.push(theta);
			this.data.eeg[i].means.theta.push(eegmath.mean(theta));
			}
			if(this.data.shared.bandFreqs.alpha1[1].length > 0){
			var alpha1 = data[channel].slice( this.data.shared.bandFreqs.alpha1[1][0], this.data.shared.bandFreqs.alpha1[1][this.data.shared.bandFreqs.alpha1[1].length-1]+1);
			this.data.eeg[i].slices.alpha1.push(alpha1);
			this.data.eeg[i].means.alpha1.push(eegmath.mean(alpha1));
			}
			if(this.data.shared.bandFreqs.alpha2[1].length > 0){
			var alpha2 = data[channel].slice( this.data.shared.bandFreqs.alpha2[1][0], this.data.shared.bandFreqs.alpha2[1][this.data.shared.bandFreqs.alpha2[1].length-1]+1);
			this.data.eeg[i].slices.alpha2.push(alpha2);
			this.data.eeg[i].means.alpha2.push(eegmath.mean(alpha2));
			}
			if(this.data.shared.bandFreqs.beta[1].length > 0){
			var beta  = data[channel].slice( this.data.shared.bandFreqs.beta[1][0],  this.data.shared.bandFreqs.beta[1][this.data.shared.bandFreqs.beta[1].length-1]+1);
			this.data.eeg[i].slices.beta.push(beta);
			this.data.eeg[i].means.beta.push(eegmath.mean(beta));
			}
			if(this.data.shared.bandFreqs.lowgamma[1].length > 0){
			var lowgamma = data[channel].slice( this.data.shared.bandFreqs.lowgamma[1][0], this.data.shared.bandFreqs.lowgamma[1][this.data.shared.bandFreqs.lowgamma[1].length-1]+1);
			this.data.eeg[i].slices.lowgamma.push(lowgamma);
			this.data.eeg[i].means.lowgamma.push(eegmath.mean(lowgamma));
			}
			if(this.data.shared.bandFreqs.highgamma[1].length > 0){
			var highgamma = data[channel].slice( this.data.shared.bandFreqs.highgamma[1][0], this.data.shared.bandFreqs.highgamma[1][this.data.shared.bandFreqs.highgamma[1].length-1]+1);
			this.data.eeg[i].slices.highgamma.push(highgamma);
			this.data.eeg[i].means.highgamma.push(eegmath.mean(highgamma));
			}
			//console.timeEnd("slicing bands");
			return true;
		}
		});
	}

    mapCoherenceData = (data, lastPostTime) => { //Expects data in correct order
		data.forEach((row,i) => {
		  this.data.coherence[i].count++;
		  this.data.coherence[i].amplitudes.push(row);
		  this.data.coherence[i].times.push(lastPostTime);

		if(this.data.shared.bandFreqs.scp[1].length > 0){
		  var scp = row.slice( this.data.shared.bandFreqs.scp[1][0], this.data.shared.bandFreqs.scp[1][this.data.shared.bandFreqs.scp[1].length-1]+1);
		  this.data.coherence[i].slices.scp.push(scp);
		  this.data.coherence[i].means.scp.push(eegmath.mean(scp));
		}
		if(this.data.shared.bandFreqs.delta[1].length > 0){
		  var delta = row.slice( this.data.shared.bandFreqs.delta[1][0], this.data.shared.bandFreqs.delta[1][this.data.shared.bandFreqs.delta[1].length-1]+1);
		  this.data.coherence[i].slices.delta.push(delta);
		  this.data.coherence[i].means.delta.push(eegmath.mean(delta));
		}
		if(this.data.shared.bandFreqs.theta[1].length > 0){
		  var theta = row.slice( this.shared.bandFreqs.theta[1][0], this.data.shared.bandFreqs.theta[1][this.data.shared.bandFreqs.theta[1].length-1]+1);
		  this.data.coherence[i].slices.theta.push(theta);
		  this.data.coherence[i].means.theta.push(eegmath.mean(theta));
		}
		if(this.data.shared.bandFreqs.alpha1[1].length > 0){
		  var alpha1 = row.slice( this.shared.bandFreqs.alpha1[1][0], this.data.shared.bandFreqs.alpha1[1][this.data.shared.bandFreqs.alpha1[1].length-1]+1);
		  this.data.coherence[i].slices.alpha1.push(alpha1);
		  this.data.coherence[i].means.alpha1.push(eegmath.mean(alpha1));
		}
		if(this.data.shared.bandFreqs.alpha2[1].length > 0){
		  var alpha2 = row.slice( this.data.shared.bandFreqs.alpha2[1][0], this.data.shared.bandFreqs.alpha2[1][this.data.shared.bandFreqs.alpha2[1].length-1]+1);
		  this.data.coherence[i].slices.alpha2.push(alpha2);
		  this.data.coherence[i].means.alpha2.push(eegmath.mean(alpha2));
		}
		if(this.data.shared.bandFreqs.beta[1].length > 0){
		  var beta  = row.slice( this.data.shared.bandFreqs.beta[1][0],  this.data.shared.bandFreqs.beta[1][this.data.shared.bandFreqs.beta[1].length-1]+1);
		  this.data.coherence[i].slices.beta.push(beta);
		  this.data.coherence[i].means.beta.push(eegmath.mean(beta));
		}
		if(this.data.shared.bandFreqs.lowgamma[1].length > 0){
		  var lowgamma = row.slice( this.data.shared.bandFreqs.lowgamma[1][0], this.data.shared.bandFreqs.lowgamma[1][this.data.shared.bandFreqs.lowgamma[1].length-1]+1);
		  this.data.coherence[i].slices.lowgamma.push(lowgamma);
		  this.data.coherence[i].means.lowgamma.push(eegmath.mean(lowgamma));
		}
		if(this.data.shared.bandFreqs.highgamma[1].length > 0){
		  var highgamma = row.slice( this.data.shared.bandFreqs.highgamma[1][0], this.data.shared.bandFreqs.highgamma[1][this.data.shared.bandFreqs.highgamma[1].length-1]+1);
		  this.data.coherence[i].slices.highgamma.push(highgamma);
		  this.data.coherence[i].means.highgamma.push(eegmath.mean(highgamma));
		}
		});
	}
    
    //Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.
	bandpassWindow(freqStart,freqEnd,nSteps) {

		var freqEnd_nyquist = freqEnd*2;
		var fftwindow = [];
		  for (var i = 0; i < Math.ceil(0.5*nSteps); i++){
			  fftwindow.push(freqStart + (freqEnd_nyquist-freqStart)*i/(nSteps));
		  }
		return fftwindow;
	}
}


