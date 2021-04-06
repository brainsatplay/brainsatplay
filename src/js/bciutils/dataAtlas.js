
import {eegmath} from './eegmath'

//relies on eegworker (see implementation in public/index.html)

//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------

//Class for organizing data and automating analysis protcols.
export class dataAtlas {
    constructor(
		name="atlas",
		initialData={eegshared:{eegChannelTags:[{ch: 0, tag: 'FP1', analyze:true},{ch: 1, tag: 'FP2', analyze:true}],sps:512}},
		config='10_20', //'muse','big'
		useCoherence=true,
		useAnalyzer=false, //call atlas.analyzer()
		analysis=['eegfft'] //'eegfft','eegcoherence','bcijs_bandpowers','heg_pulse'
	) {
        this.name = name;
		this.config = config; 
		this.settings = { //Denotes active 
			analyzing: false,
			analysis: analysis, // ['eegfft']
			heg:false,
			eeg:false,
			coherence:false,
			eyetracker:false,
			accelerometer:false,
			hrv:false,
			fnirs:false,
			ecg:false,
			spo2:false,
			emg:false
		};

        this.data = {
			eegshared:{
				eegChannelTags:[], 
				sps:[], 
				startTime:0,
				frequencies:[], 
				bandFreqs:{scp:[[],[]], delta:[[],[]], theta:[[],[]], alpha1:[[],[]], alpha2:[[],[]], beta:[[],[]], lowgamma:[[],[]], highgamma:[[],[]]}
			},
			eeg:[],
			coherence:[],
			heg:[],
			fnirs:[],
			accelerometer:[],
			hrv:[],
			spo2:[],
			emg:[],
			ecg:[],
			eyetracker:[]
		};

        Object.assign(this.data,initialData);

		this.rolloverLimit = 51200; //Max samples allowed in arrays before rollover kicks in

        if(config === '10_20') {
			
			this.settings.eeg = true;
            this.data.eeg = this.gen10_20Atlas();//this.genBigAtlas();//
        }
		else if (config === 'muse') {
			
			this.settings.eeg = true;
			this.data.eeg = this.genMuseAtlas();// this.genBigAtlas();
		}
		else if (config === 'big') {
			
			this.settings.eeg = true;
			this.data.eeg = this.genBigAtlas();
		}
		else if (config === 'hegduino') {
			this.addHEGCoord(this.data.heg.length,0,60,60);
			this.settings.heg = true;
		}
		else if (config === 'eyetracker') {
			this.settings.eyetracker = true;
			this.addEyeTracker(this.data.eyetracker.length);
		}

        if(useCoherence === true) {
			this.settings.coherence = true;
            this.data.coherence = this.genCoherenceMap(this.data.eegshared.eegChannelTags);
			//console.log(this.data.coherence);
        }

		if(this.data.eegshared.eegChannelTags) { //add structs for non-specified channels
			this.data.eegshared.eegChannelTags.forEach((row,i) => {
				if( this.getEEGDataByTag(row.tag) === undefined ) {
					this.addEEGCoord(row.ch);
				}
			});
		}

		if(this.data.eegshared.sps) {
			this.data.eegshared.frequencies = this.bandpassWindow(0,128,this.data.eegshared.sps*0.5);
			this.data.eegshared.bandFreqs = this.getBandFreqs(this.data.eegshared.frequencies);
			//console.log(this.data.eegshared.bandFreqs)
		}
		
		this.analyzerOpts = []; //'eegfft','eegcoherence','bcijs_bandpower','bcijs_pca','heg_pulse'
		this.analyzerFuncs = [];
		this.workerPostTime = 0;
		this.workerWaiting = false;
		this.workerIdx = 0;

		if(useAnalyzer === true) {
			this.addDefaultAnalyzerFuncs();
			if(!window.workerResponses) { window.workerResponses = []; } //placeholder till we can get webworkers working outside of the index.html
			//this.workerIdx = window.addWorker(); // add a worker for this dataAtlas analyzer instance
			window.workerResponses.push(this.workeronmessage);
			//this.analyzer();
		}
    }

    genEEGCoordinateStruct(tag,x=0,y=0,z=0){
        let bands = {scp:[],delta:[],theta:[],alpha1:[],alpha2:[],beta:[],lowgamma:[],highgamma:[]} 
        let struct = {
            tag:tag, 
            position:{x:x,y:y,z:z}, 
            count:0,
            times:[], 
            raw:[], 
            filtered:[], 
			fftCount:0,
			fftTimes:[], //Separate timing for ffts on workers
            ffts:[], 
            slices:JSON.parse(JSON.stringify(bands)), 
            means:JSON.parse(JSON.stringify(bands)),
			lastReadFFT:0, // counter value when this struct was last read from (using get functions)
			lastRead:0
		};
        return struct;
    }
    
    addEEGCoord(tag,x=999,y=999,z=999){
		this.data.eeg.push(this.genEEGCoordinateStruct(tag,x,y,z));
	}

	genMuseAtlas() { //Muse coordinates (estimated)

		let eegmap = [];

		let c = [[-21.5,70.2,-0.1],[28.4,69.1,-0.4],[-54.8,33.9,-3.5],
		[56.6,30.8,-4.1]]; //FP1, FP2, F7, F8

		function mid(arr1,arr2) { //midpoint
			let midpoint = [];
			arr1.forEach((el,i) => {
				midpoint.push(0.5*(el+arr2[i]));
			});
			console.log(midpoint)
			return midpoint;
		}

		let tags = ['AF7','AF8','TP9','TP10'];
		let coords = [
			mid(c[0],c[2]), //estimated
			mid(c[1],c[3]), //estimated
			[-80.2,-31.3,-10.7], //estimated
			[81.9,-34.2,-8.2] //estimated
		];

		tags.forEach((tag,i) => {
            eegmap.push(this.genEEGCoordinateStruct(tag,coords[i][0],coords[i][1],coords[i][2]));
        });

        return eegmap;
	}

    gen10_20Atlas() { //19 channel EEG
        let eegmap = [];
        let tags = ["FP1","FP2","FPZ","F3","F4","F7","F8",
                    "CZ","C3","C4","T3","T4","T5","T6","PZ","P3","P4","O1","O2"];
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

	genBigAtlas() {

		const eegCoordinates = {

			FP1: [-21.2, 66.9, 12.1],
			FPZ: [1.4, 65.1, 11.3],
			FP2: [24.3, 66.3, 12.5],
			AF7: [-41.7, 52.8, 11.3],
			AF3: [-32.7, 48.4, 32.8],
			AFZ: [1.8, 54.8, 37.9],
			AF4: [35.1, 50.1, 31.1],
			AF8: [43.9, 52.7, 9.3],
			F5: [-51.4, 26.7, 24.7],
			F3: [-39.7, 25.3, 44.7],
			F1: [-22.1, 26.8, 54.9],
			FZ: [0.0, 26.8, 60.6],
			F2: [23.6, 28.2, 55.6],
			F4: [41.9, 27.5, 43.9],
			F6: [52.9, 28.7, 25.2],
			F7: [-52.1, 28.6, 3.8],
			F8: [53.2, 28.4, 3.1],
			FC5: [-59.1, 3.0, 26.1],
			FC3: [-45.5, 2.4, 51.3],
			FC1: [-24.7, 0.3, 66.4],
			FCZ: [1.0, 1.0, 72.8],
			FC2: [26.1, 3.2, 66.0],
			FC4: [47.5, 4.6, 49.7,],
			FC6: [60.5, 4.9, 25.5],
			FT9: [-53.8, -2.1, -29.1],
			FT7: [-59.2, 3.4, -2.1],
			FT8: [60.2, 4.7, -2.8],
			FT10: [55.0, -3.6, -31.0],
			T7: [-65.8, -17.8, -2.9],
			T5: [-61.5, -65.3, 1.1],
			T3: [-70.2, -21.3, -10.7],
			T4: [71.9,-25.2,-8.2],
			T6: [59.3, -67.6,  3.8],
			T8: [67.4, -18.5, -3.4],
			C5: [-63.6, -18.9, 25.8],
			C3: [-49.1, -20.7, 53.2],
			C1: [-25.1, -22.5, 70.1],
			CZ: [0.8, -21.9, 77.4],
			C2: [26.7, -20.9, 69.5],
			C4: [50.3, -18.8, 53.0],
			C6: [65.2, -18.0, 26.4],
			CP5: [-61.8, -46.2, 22.5],
			CP3: [-46.9, -47.7, 49.7],
			CP1: [-24.0, -49.1, 66.1],
			CPZ: [0.7, -47.9, 72.6],
			CP2: [25.8, -47.1, 66.0],
			CP4: [49.5, -45.5, 50.7],
			CP6: [62.9, -44.6, 24.4],
			TP9: [-73.6, -46.7, -4.0], // estimated
			TP7: [-63.6, -44.7, -4.0],
			TP8: [64.6, -45.4, -3.7],		
			TP10: [74.6, -47.4, -3.7], // estimated
			P9: [-50.8, -51.3, -37.7],
			P7: [-55.9, -64.8, 0.0],
			P5: [-52.7, -67.1, 19.9],
			P3: [-41.4, -67.8, 42.4],
			P1: [-21.6, -71.3, 52.6],
			PZ: [0.7, -69.3, 56.9],
			P2: [24.4, -69.9, 53.5],
			P4: [44.2, -65.8, 42.7],
			P6: [54.4, -65.3, 20.2],
			P8: [56.4, -64.4, 0.1],
			P10: [51.0, -53.9, -36.5],
			PO7: [-44.0, -81.7, 1.6],
			PO3: [-33.3, -84.3, 26.5],
			POZ: [0.0, -87.9, 33.5],
			PO4: [35.2, -82.6, 26.1],
			PO8: [43.3, -82.0, 0.7],
			O1: [-25.8, -93.3, 7.7],
			Oz: [0.3, -97.1, 8.7],
			O2: [25.0, -95.2, 6.2]
		}

		let eegmap = [];
		for(const prop in eegCoordinates) {
			eegmap.push(this.genEEGCoordinateStruct(prop,eegCoordinates[prop][0],eegCoordinates[prop][1],eegCoordinates[prop][2]));
		}

		return eegmap;
	}

	genCoherenceStruct(tag0,tag1,coord0,coord1) {
		var freqBins = {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []};
		
		return {
			tag: tag0+"_"+tag1,
			x0: coord0?.x,
			y0: coord0?.y,
			z0: coord0?.z,
			x1: coord1?.x,
			y1: coord1?.y,
			z1: coord1?.z,
			fftCount: 0,
			fftTimes:[],
			ffts:[],
			slices: JSON.parse(JSON.stringify(freqBins)),
			means: JSON.parse(JSON.stringify(freqBins)),  // counter value when this struct was last read from (for using get functions)
			lastRead:0
		}
	}

    genCoherenceMap(channelTags = this.data.eegshared.eegChannelTags, taggedOnly = true) {
		var cmap = [];
		var l = 1, k = 0;
		
		for( var i = 0; i < (channelTags.length*(channelTags.length + 1)/2)-channelTags.length; i++){
			if(taggedOnly === false || (taggedOnly === true && ((channelTags[k].tag !== null && channelTags[k+l].tag !== null)&&(channelTags[k].tag !== 'other' && channelTags[k+l].tag !== 'other')&&(channelTags[k].analyze === true && channelTags[k+l].analyze === true)))) {
				var coord0 = this.getEEGDataByTag(channelTags[k].tag);
				var coord1 = this.getEEGDataByTag(channelTags[k+l].tag);

				cmap.push(this.genCoherenceStruct(channelTags[k].tag,channelTags[k+l].tag,coord0.position,coord1.position))
			}
			l++;
			if (l + k === channelTags.length) {
				k++;
				l = 1;
			}
		}
		//console.log(cmap,channelTags);
		return cmap;
	}

	genHEGStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},count:0, times:[],red:[],ir:[],ambient:[],ratio:[],HR:[],lastRead:0, startTime:0}
	}

	addHEGCoord(tag="heg1",x,y,z) {
		this.data.heg.push(this.genHEGStruct(tag,x,y,z));
	}

	genFNIRSStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},count:0, times:[],red:[],ir:[],ir2:[],ambient:[],lastRead:0}
	}

	addFNIRSCoord(tag="banana1",x,y,z) {
		this.data.fnirs.push(this.genHEGStruct(tag,x,y,z));
	}

	genAccelerometerStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},count:0, times:[],Ax:[],Ay:[],Az:[],Gx:[],Gy:[],Gz:[],lastRead:0, startTime:0};
	}

	addAccelerometerCoord(tag="accel1",x,y,z){
		this.data.accelerometer.push(this.genAccelerometerStruct(tag,x,y,z));
	}

	genHRVStruct(tag){
		return {tag:tag, count:0, times:[], raw:[], filtered:[], bpm:[], hrv:[],lastRead:0, startTime:0};
	}

	addHRV(tag="hrv1") {
		this.data.hrv.push(genHRVStruct(tag));
	}

	genEyeTrackerStruct(tag) {
		return {tag:tag, count:0, times:[], x:[], y:[], smax:[], smay:[], lastRead:0, startTime:0};
	}

	addEyeTracker(tag="eyes") {
		this.data.eyetracker.push(this.genEyeTrackerStruct(tag));
	}

	//also do ecg,emg,eyetracker

	getDeviceDataByTag(device='eeg',tag='FP1') { //put eegshared for device to get shared info
		var found = undefined;
		if(typeof tag === 'number' && device === 'eeg') {
			let r = this.data[device+"shared"][device+"ChannelTags"].find((o,i) => {
				if(o.ch === tag && o.tag !== null) {
					tag = o.tag; //you can search for eeg data by channel number as well
					return true;
				}
			});
			//console.log(tag)
		}
		if(device.indexOf("shared") < 0) {
			let atlasCoord = this.data[device].find((o, i) => {
				if(o.tag === tag){
					found = o;
					return true;
				}
			});
			return found; //return shared data structs	
		}
		else if (tag === null || tag === 'all') {
			return this.data[device]; //return all device data structs	
		}
		else if (typeof tag === 'string' || typeof tag === 'number') {
			let r = this.data[device].find((o,i) => {
				if(o.tag === tag) {
					found = o; 	
					return true;
				}
			});
			return found;  //return tagged data struct
		}
		else {
			return found; //return undefined	
		}
	}

	getEEGDataByChannel(ch=0) {
		let found = undefined;
		let search = this.data.eegshared.eegChannelTags.find((o,i) => {
			if(o.ch === ch) {
				if(o.tag === null || o.tag === 'other') {
					found = this.getEEGDataByTag(o.ch);
				}
				else { 
					found = this.getEEGDataByTag(o.tag);
				}
				if(found !== false) return true;
			}
		});
		return found;
	}

    //Return the object corresponding to the atlas tag
	getEEGDataByTag(tag="FP1"){
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
	getCoherenceByTag(tag="FP1_FZ"){
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
	getCoordPositions(device='eeg') {
		var coords = [];
		for(var i = 0; i< this.data[device].length; i++) {
			coords.push([this.data[device][i].position.x,this.data[device][i].position.y,this.data[device][i].position.z]);
		}
		return coords;
	}

    //Get the latest data pushed to tagged channels
	getLatestFFTData() {
		let dat = [];
		this.data.eegshared.eegChannelTags.forEach((r, i) => {
			if(r.analyze === true) {
				let row = this.getEEGDataByTag(r.tag);
				if(row.fftCount === 0) {
					dat.push({
						tag:row.tag,
						fftCount:row.fftCount
					});
				}
				else {
					//console.log(row);
					let lastIndex = row.fftCount - 1;
					dat.push({
						tag:row.tag,
						fftCount:row.fftCount,
						time: row.fftTimes[lastIndex],
						fft: row.ffts[lastIndex],
						slice:{delta:row.slices.delta[lastIndex], theta:row.slices.theta[lastIndex], alpha1:row.slices.alpha1[lastIndex], alpha2:row.slices.alpha2[lastIndex], beta:row.slices.beta[lastIndex], lowgamma:row.slices.lowgamma[lastIndex], highgamma:row.slices.highgamma[lastIndex]},
						mean:{delta:row.means.delta[lastIndex], theta:row.means.theta[lastIndex], alpha1: row.means.alpha1[lastIndex], alpha2: row.means.alpha2[lastIndex], beta: row.means.beta[lastIndex], lowgamma:row.slices.lowgamma[lastIndex], highgamma: row.means.highgamma[lastIndex]}
					});
				}
			}
		});
		return dat;
	}

	getLatestCoherenceData() {
		let dat = [];
		this.data.coherence.forEach((row,i) => {
			let lastIndex = row.fftCount - 1;
			dat.push({
				tag:row.tag,
				fftCount:row.fftCount,
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

    getBandFreqs(frequencies) {//Returns an object with the frequencies and indices associated with the bandpass window (for processing the FFT results)
		var scpFreqs = [[],[]], deltaFreqs = [[],[]], thetaFreqs = [[],[]], alpha1Freqs = [[],[]], alpha2Freqs = [[],[]], betaFreqs = [[],[]], lowgammaFreqs = [[],[]], highgammaFreqs = [[],[]]; //x axis values and indices for named EEG frequency bands
		frequencies.forEach((item,idx) => {
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

    mapFFTData = (fft, lastPostTime, tag) => {
		let atlasCoord = this.data.eeg.find((o, i) => {
			if(o.tag === tag){
				o.fftCount++;
				o.fftTimes.push(lastPostTime);
				o.ffts.push(fft);
				if(this.data.eegshared.bandFreqs.scp[1].length > 0){
					var scp = fft.slice( this.data.eegshared.bandFreqs.scp[1][0], this.data.eegshared.bandFreqs.scp[1][this.data.eegshared.bandFreqs.scp[1].length-1]+1);
					o.slices.scp.push(scp);
					o.means.scp.push(eegmath.mean(scp));
				}
				if(this.data.eegshared.bandFreqs.scp[1].length > 0){
					var delta = fft.slice( this.data.eegshared.bandFreqs.delta[1][0], this.data.eegshared.bandFreqs.delta[1][this.data.eegshared.bandFreqs.delta[1].length-1]+1);
					o.slices.delta.push(delta);
					o.means.delta.push(eegmath.mean(delta));
				}
				if(this.data.eegshared.bandFreqs.theta[1].length > 0){
					var theta = fft.slice( this.data.eegshared.bandFreqs.theta[1][0], this.data.eegshared.bandFreqs.theta[1][this.data.eegshared.bandFreqs.theta[1].length-1]+1);
					o.slices.theta.push(theta);
					o.means.theta.push(eegmath.mean(theta));
				}
				if(this.data.eegshared.bandFreqs.alpha1[1].length > 0){
					var alpha1 = fft.slice( this.data.eegshared.bandFreqs.alpha1[1][0], this.data.eegshared.bandFreqs.alpha1[1][this.data.eegshared.bandFreqs.alpha1[1].length-1]+1);
					o.slices.alpha1.push(alpha1);
					o.means.alpha1.push(eegmath.mean(alpha1));
				}
				if(this.data.eegshared.bandFreqs.alpha2[1].length > 0){
					var alpha2 = fft.slice( this.data.eegshared.bandFreqs.alpha2[1][0], this.data.eegshared.bandFreqs.alpha2[1][this.data.eegshared.bandFreqs.alpha2[1].length-1]+1);
					o.slices.alpha2.push(alpha2);
					o.means.alpha2.push(eegmath.mean(alpha2));
				}
				if(this.data.eegshared.bandFreqs.beta[1].length > 0){
					var beta  = fft.slice( this.data.eegshared.bandFreqs.beta[1][0],  this.data.eegshared.bandFreqs.beta[1][this.data.eegshared.bandFreqs.beta[1].length-1]+1);
					o.slices.beta.push(beta);
					o.means.beta.push(eegmath.mean(beta));
				}
				if(this.data.eegshared.bandFreqs.lowgamma[1].length > 0){
					var lowgamma = fft.slice( this.data.eegshared.bandFreqs.lowgamma[1][0], this.data.eegshared.bandFreqs.lowgamma[1][this.data.eegshared.bandFreqs.lowgamma[1].length-1]+1);
					o.slices.lowgamma.push(lowgamma);
					o.means.lowgamma.push(eegmath.mean(lowgamma));
				}
				if(this.data.eegshared.bandFreqs.highgamma[1].length > 0){
					var highgamma = fft.slice( this.data.eegshared.bandFreqs.highgamma[1][0], this.data.eegshared.bandFreqs.highgamma[1][this.data.eegshared.bandFreqs.highgamma[1].length-1]+1);
					o.slices.highgamma.push(highgamma);
					o.means.highgamma.push(eegmath.mean(highgamma));
				}
				//console.timeEnd("slicing bands");
				return true;
			}
		});
	}

    mapCoherenceData = (data, lastPostTime) => { //Expects data in correct order
	  data.forEach((row,i) => {
		  this.data.coherence[i].fftCount++;
		  this.data.coherence[i].ffts.push(row);
		  this.data.coherence[i].fftTimes.push(lastPostTime);

		if(this.data.eegshared.bandFreqs.scp[1].length > 0){
		  var scp = row.slice( this.data.eegshared.bandFreqs.scp[1][0], this.data.eegshared.bandFreqs.scp[1][this.data.eegshared.bandFreqs.scp[1].length-1]+1);
		  this.data.coherence[i].slices.scp.push(scp);
		  this.data.coherence[i].means.scp.push(eegmath.mean(scp));
		}
		if(this.data.eegshared.bandFreqs.delta[1].length > 0){
		  var delta = row.slice( this.data.eegshared.bandFreqs.delta[1][0], this.data.eegshared.bandFreqs.delta[1][this.data.eegshared.bandFreqs.delta[1].length-1]+1);
		  this.data.coherence[i].slices.delta.push(delta);
		  this.data.coherence[i].means.delta.push(eegmath.mean(delta));
		}
		if(this.data.eegshared.bandFreqs.theta[1].length > 0){
		  var theta = row.slice( this.data.eegshared.bandFreqs.theta[1][0], this.data.eegshared.bandFreqs.theta[1][this.data.eegshared.bandFreqs.theta[1].length-1]+1);
		  this.data.coherence[i].slices.theta.push(theta);
		  this.data.coherence[i].means.theta.push(eegmath.mean(theta));
		}
		if(this.data.eegshared.bandFreqs.alpha1[1].length > 0){
		  var alpha1 = row.slice( this.data.eegshared.bandFreqs.alpha1[1][0], this.data.eegshared.bandFreqs.alpha1[1][this.data.eegshared.bandFreqs.alpha1[1].length-1]+1);
		  this.data.coherence[i].slices.alpha1.push(alpha1);
		  this.data.coherence[i].means.alpha1.push(eegmath.mean(alpha1));
		}
		if(this.data.eegshared.bandFreqs.alpha2[1].length > 0){
		  var alpha2 = row.slice( this.data.eegshared.bandFreqs.alpha2[1][0], this.data.eegshared.bandFreqs.alpha2[1][this.data.eegshared.bandFreqs.alpha2[1].length-1]+1);
		  this.data.coherence[i].slices.alpha2.push(alpha2);
		  this.data.coherence[i].means.alpha2.push(eegmath.mean(alpha2));
		}
		if(this.data.eegshared.bandFreqs.beta[1].length > 0){
		  var beta = row.slice( this.data.eegshared.bandFreqs.beta[1][0],  this.data.eegshared.bandFreqs.beta[1][this.data.eegshared.bandFreqs.beta[1].length-1]+1);
		  this.data.coherence[i].slices.beta.push(beta);
		  this.data.coherence[i].means.beta.push(eegmath.mean(beta));
		}
		if(this.data.eegshared.bandFreqs.lowgamma[1].length > 0){
		  var lowgamma = row.slice( this.data.eegshared.bandFreqs.lowgamma[1][0], this.data.eegshared.bandFreqs.lowgamma[1][this.data.eegshared.bandFreqs.lowgamma[1].length-1]+1);
		  this.data.coherence[i].slices.lowgamma.push(lowgamma);
		  this.data.coherence[i].means.lowgamma.push(eegmath.mean(lowgamma));
		}
		if(this.data.eegshared.bandFreqs.highgamma[1].length > 0){
		  var highgamma = row.slice( this.data.eegshared.bandFreqs.highgamma[1][0], this.data.eegshared.bandFreqs.highgamma[1][this.data.eegshared.bandFreqs.highgamma[1].length-1]+1);
		  this.data.coherence[i].slices.highgamma.push(highgamma);
		  this.data.coherence[i].means.highgamma.push(eegmath.mean(highgamma));
		}
	  });
	}
    
    //Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.
	bandpassWindow(freqStart,freqEnd,nSteps) {

		let diff = (freqEnd - freqStart)/nSteps;
		let fftwindow = [];
		let i = 0;
		while(i < freqEnd) {
			fftwindow.push(i);
			i += diff;
		}
		return fftwindow;
	}

	bufferEEGSignals = (seconds=1) => { //Buffers 1 second of all tagged eeg signals (unless null or 'other'). Data buffered in order of objects in the eeg array
		let nSamples = Math.floor(this.data.eegshared.sps * seconds);
		let buffer = [];
		let syncTime = null;
		for(var i = 0; i < this.data.eegshared.eegChannelTags.length; i++){
			if(this.data.eegshared.eegChannelTags[i].analyze === true && this.data.eegshared.eegChannelTags[i].tag !== null && this.data.eegshared.eegChannelTags[i].tag !== 'other') {
				let dat = this.getEEGDataByTag(this.data.eegshared.eegChannelTags[i].tag);
				//console.log(dat)
				if(dat !== undefined) {
					//console.log(dat);
					if(dat.filtered.length > 0) {buffer.push(dat.filtered.slice(dat.filtered.length-nSamples));}
					else if (dat.raw.length > 0) {buffer.push(dat.raw.slice(dat.raw.length-nSamples));}
					if(syncTime === null) {
						syncTime = dat.times[dat.times.length-1];
					}
				}
			}
		}
		if(this.settings.analyzing === true) { this.workerPostTime = syncTime; }
		return buffer;
	}
	
	toISOLocal(d) {
		var z  = n =>  ('0' + n).slice(-2);
		var zz = n => ('00' + n).slice(-3);
		var off = d.getTimezoneOffset();
		var sign = off < 0? '+' : '-';
		off = Math.abs(off);
	  
		return d.getFullYear() + '-' //https://stackoverflow.com/questions/49330139/date-toisostring-but-local-time-instead-of-utc
			   + z(d.getMonth()+1) + '-' +
			   z(d.getDate()) + 'T' +
			   z(d.getHours()) + ':'  + 
			   z(d.getMinutes()) + ':' +
			   z(d.getSeconds()) + '.' +
			   zz(d.getMilliseconds()) + 
			   "(UTC" + sign + z(off/60|0) + ':00)'
	}

	readyEEGDataForWriting = (from=0,to='end') => {
		
		  
		let header = ["TimeStamps","UnixTime"];
		let data = [];
		let mapidx = 0;
		let datums = [];
		this.data.eegshared.eegChannelTags.forEach((row,j) => {
			datums.push(this.getEEGDataByChannel(row.ch));
		});
		
		if(to === 'end') { to = datums[0].count; }

		for(let i = from; i<to; i++){
			let line=[];
			line.push(this.toISOLocal(new Date(datums[0].times[i])),datums[0].times[i]);
			//first get the raw/filtered
			datums.forEach((row,j) => {
				if(row.filtered.length > 0) {
					line.push(row.filtered[i].toFixed(0));
				} else if (row.raw.length > 0) {
					line.push(row.raw[i].toFixed(0));
				}
			});
			//then get the fft/coherence data
			datums.forEach((row,j) => {
				if(row.times[i] === row.fftTimes[mapidx]) {
					if(from === 0) {
						let bpfreqs = [...this.data.eegshared.frequencies].map((x,i) => x = x.toFixed(3));
							header.push(coord.tag+"; FFT Hz:",bpfreqs.join(","));
					}
					line.push(row.ffts[mapidx]);
				}
			});
			this.data.coherence.forEach((row,i) => {
				if(from===0) {
					let bpfreqs = [...this.data.eegshared.frequencies].map((x,i) => x = x.toFixed(3));
					header.push(coord.tag+"; FFT Hz:",bpfreqs.join(","));
				}
				if(row.times[i] === row.fftTimes[mapidx]) {
					line.push(row.ffts[mapidx]);
				}
			});
			if(row.fftTimes[mapidx] === this.datum[0].times[i]){
				mapidx++;
			}
			data.push(line.join(","));
		}
	
		//console.log(data)
		return [header.join(",")+"\n",data.join("\n")];
	}

	readyHEGDataForWriting = (from=0,to='end',hegIdx=0) => {
		let header = ["TimeStamps","UnixTime","Red","IR","Ambient","Ratio"];
		let data = [];
		let row = this.data.heg[hegIdx];
		if(to === 'end') to = row.times.length;
		for(let i = from; i < to; i++) {
			data.push([t,this.toISOLocal(t),row.red[i],row.ir[i],row.ambient[i],row.ratio[i]].join(','));
		};
		return [header.join(',')+"\n",data.join('\n')];
	}

	regenAtlasses(freqStart,freqEnd,sps=512) {
		this.data.eeg = this.makeAtlas10_20(); //reset atlas

		let bandPassWindow = this.bandPassWindow(freqStart,freqEnd,sps);

		this.data.eegshared.frequencies = bandPassWindow;//Push the x-axis values for each frame captured as they may change - should make this lighter
		this.data.eegshared.bandFreqs = this.getBandFreqs(bandPassWindow); //Update bands accessed by the atlas for averaging

		this.coherenceMap = this.genCoherenceMap();
	}

	workeronmessage = (msg) => {
		//console.log(msg);
		if(msg.origin === this.name) {
			if(msg.foo === "multidftbandpass" || msg.foo === "multidft") { 
				//parse data into atlas
				var ffts = [...msg.output[1]];
				let fftIdx = 0;
				this.data.eegshared.eegChannelTags.forEach((row,i) => {
					if(row.tag !== null && row.tag !== 'other' && row.analyze === true) {
						this.mapFFTData(ffts[fftIdx],this.workerPostTime,row.tag);
						fftIdx++;
						//console.log(o);
					}
				});
				
				this.checkRollover('eeg');
			}
			else if(msg.foo === "coherence"){ 
				var ffts = [...msg.output[1]];
				var coher = [...msg.output[2]];
				let fftIdx = 0;
				this.data.eegshared.eegChannelTags.forEach((row,i) => {
					if(row.tag !== null && row.tag !== 'other' && row.analyze === true) {
						this.mapFFTData(ffts[fftIdx],this.workerPostTime,row.tag);
						fftIdx++;
						//console.log(o);
					}
				});
				//coherence
				this.mapCoherenceData(coher,this.workerPostTime);
				
				this.checkRollover('eeg');
			}
			this.workerWaiting = false;
		}
	}

	addDefaultAnalyzerFuncs() {
		this.analyzerOpts.push('eegfft','eegcoherence');
		let fftFunc = () => {
			if(this.workerWaiting === false){
				let buf = this.bufferEEGSignals(1);
                if(buf.length > 0) {
                    if(buf[0].length >= this.data.eegshared.sps) {
                        window.postToWorker({foo:'multidftbandpass', input:[buf, 1, 0, 128, 1], origin:this.name}, this.workerIdx);
                        //window.postToWorker({foo:'gpucoh', input:[buf, 1, 0, this.data.eegshared.sps*0.5, 1], origin:this.name},this.workerIdx);
                        this.workerWaiting = true;
                    }
                }
			}
		}
		let coherenceFunc = () => {
			if(this.workerWaiting === false){
				let buf = this.bufferEEGSignals(1);
                if(buf.length > 0) {
                    if(buf[0].length >= this.data.eegshared.sps) {
                        window.postToWorker({foo:'coherence', input:[buf, 1, 0, 128, 1], origin:this.name}, this.workerIdx);
                        this.workerWaiting = true;
                    }
                }
			}
		}	

		this.analyzerFuncs.push(fftFunc,coherenceFunc);
		//'bcijs_bandpowers','bcijs_pca','heg_pulse'
	}

	addAnalyzerFunc(name='',foo=()=>{}) {
		let n = this.analyzerOpts.find((name,i) => {
			if(name === name) {
				this.analyzerFuncs[i] = foo;
				return true;
			}
		});
		if(n === undefined) {
			this.analyzerOpts.push(name);
			this.analyzerFuncs.push(foo);
		}
	}


	checkRollover(dataArr=null) { //'eeg','heg', etc
		if(dataArr === null) {
			for(const prop in this.data) {
				if(Array.isArray(this.data[prop])) {
					this.data[prop].forEach((row,i) => {
						for(const p in row) {
							if((!Array.isArray(row[p])) && typeof row[p] === 'object') { //e.g. {slices:{alpha1:[...]}}
								for(const pz in row[p]) {
									if(Array.isArray(row[p][pz])) {
										if(row[p][pz].length > this.rolloverLimit) {row[p][pz].splice(0,Math.floor(this.rolloverLimit*0.10));} //shave off 10% of the values
									}
								}
							}
							else if(Array.isArray(row[p])) { // e.g. {ffts:[...] fftCount:x}
								if(row[p].length > this.rolloverLimit) {
									row[p].splice(0,Math.floor(this.rolloverLimit*.1));
									if(p === 'ffts') { //adjust counters
										row.fftCount = row[p].length;
										row.lastReadFFT = row[p].length;
									}
									else if (p === 'times') {
										row.count = row[p].length;
										row.lastRead = row[p].length;
									}
								}
							}
							
						}
					});
				}
			}
		}
		else { //spaghetti
			if(Array.isArray(this.data[dataArr])) {
				this.data[dataArr].forEach((row,i) => {
					for(const p in row) {
						if((!Array.isArray(row[p])) && typeof row[p] === 'object') { //nested object with arrays
							for(const pz in row[p]) {
								if(Array.isArray(row[p][pz])) {
									if(row[p][pz].length > this.rolloverLimit) {row[p][pz].splice(0,Math.floor(this.rolloverLimit*.1));}
								}
							}
						}
						else if(Array.isArray(row[p])) { //arrays
							if(row[p].length > this.rolloverLimit) {row[p].splice(0,Math.floor(this.rolloverLimit*.1));}
						}
					}
				});
			}
		}
	}

	analyzer = () => { //Make this stop when streaming stops
		//fft,coherence,bcijs_bandpowers,bcijs_pca,heg_pulse
		if(this.settings.analyzing === true) {
			this.settings.analysis.forEach((run,i) => {
				this.analyzerOpts.forEach((opt,j) => {
					if(opt === run) {					
						this.analyzerFuncs[j]();
					}
				});
			});
			setTimeout(()=>{requestAnimationFrame(this.analyzer)},50);
		}	
	}
}
