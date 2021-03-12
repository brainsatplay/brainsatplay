//Joshua Brewster, AGPL (copyleft)

import 'regenerator-runtime/runtime' //For async functions on node\\

export class eeg32 { //Contains structs and necessary functions/API calls to analyze serial data for the FreeEEG32

    constructor(
		onDecodedCallback = this.onDecodedCallback,
		onConnectedCallback = this.onConnectedCallback,
		onDisconnectedCallback = this.onDisconnectedCallback,
		CustomDecoder = this.decode,
		baudrate = 115200
		) {
		this.onDecodedCallback = onDecodedCallback;
		this.onConnectedCallback = onConnectedCallback;
		this.onDisconnectedCallback = onDisconnectedCallback;
		this.decode = CustomDecoder;
		//Free EEG 32 data structure:
        /*
            [stop byte, start byte, counter byte, 32x3 channel data bytes (24 bit), 3x2 accelerometer data bytes, stop byte, start byte...] Gyroscope not enabled yet but would be printed after the accelerometer..
            Total = 105 bytes/line
        */
		this.connected = false;
		this.subscribed = false;
        this.buffer = [];
        this.startByte = 160; // Start byte value
		this.stopByte = 192; // Stop byte value
		this.searchString = new Uint8Array([this.stopByte,this.startByte]); //Byte search string
		this.readRate = 16.666667; //Throttle EEG read speed. (1.953ms/sample min @103 bytes/line)
		this.readBufferSize = 2000; //Serial read buffer size, increase for slower read speeds (~1030bytes every 20ms) to keep up with the stream (or it will crash)

		this.sps = 512; // Sample rate
		this.nChannels = 32;
		this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
		this.updateMs = 1000/this.sps; //even spacing
		this.stepSize = 1/Math.pow(2,24);
		this.vref = 2.50; //2.5V voltage ref +/- 250nV
		this.gain = 8;

		this.vscale = (this.vref/this.gain)*this.stepSize; //volts per step.
		this.uVperStep = 1000000 * ((this.vref/this.gain)*this.stepSize); //uV per step.
		this.scalar = 1/(1000000 / ((this.vref/this.gain)*this.stepSize)); //steps per uV.

		this.maxBufferedSamples = this.sps*60*5; //max samples in buffer this.sps*60*nMinutes = max minutes of data
		
		this.data = { //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.counter-1]
			counter: 0,
			startms: 0,
			ms: [],
			'A0': [],'A1': [],'A2': [],'A3': [],'A4': [],'A5': [],'A6': [],'A7': [], //ADC 0
			'A8': [],'A9': [],'A10': [],'A11': [],'A12': [],'A13': [],'A14': [],'A15': [], //ADC 1
			'A16': [],'A17': [],'A18': [],'A19': [],'A20': [],'A21': [],'A22': [],'A23': [], //ADC 2
			'A24': [],'A25': [],'A26': [],'A27': [],'A28': [],'A29': [],'A30': [],'A31': [], //ADC 3
			'Ax': [], 'Ay': [], 'Az': [], 'Gx': [], 'Gy': [], 'Gz': []  //Peripheral data (accelerometer, gyroscope)
		};

		this.resetDataBuffers();

		//navigator.serial utils
		if(!navigator.serial){
			console.error("`navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')")
		}
		this.port = null;
		this.reader = null;
		this.baudrate = baudrate;

	}
	
	resetDataBuffers(){
		this.data.counter = 0;
		this.data.startms = 0;
		for(const prop in this.data) {
			if(typeof this.data[prop] === "object"){
				this.data[prop] = new Array(this.maxBufferedSamples).fill(0);
			}
		}
	}

	setScalar(gain=24,stepSize=1/(Math.pow(2,23)-1),vref=4.50) {
        this.stepSize = stepSize;
		this.vref = vref; //2.5V voltage ref +/- 250nV
		this.gain = gain;

		this.vscale = (this.vref/this.gain)*this.stepSize; //volts per step.
		this.uVperStep = 1000000 * ((this.vref/this.gain)*this.stepSize); //uV per step.
		this.scalar = 1/(1000000 / ((this.vref/this.gain)*this.stepSize)); //steps per uV.
    }

    bytesToInt16(x0,x1){
		return x0 * 256 + x1;
    }

    int16ToBytes(y){ //Turns a 24 bit int into a 3 byte sequence
        return [y & 0xFF , (y >> 8) & 0xFF];
    }

    bytesToInt24(x0,x1,x2){ //Turns a 3 byte sequence into a 24 bit int
        return x0 * 65536 + x1 * 256 + x2;
    }

    int24ToBytes(y){ //Turns a 24 bit int into a 3 byte sequence
        return [y & 0xFF , (y >> 8) & 0xFF , (y >> 16) & 0xFF];
    }

    decode(buffer = this.buffer) { //returns true if successful, returns false if not

		var needle = this.searchString
		var haystack = buffer;
		var search = this.boyerMoore(needle);
		var skip = search.byteLength;
		var indices = [];
		let newLines = 0;

		for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
			indices.push(i);
		}
		//console.log(indices);
		if(indices.length >= 2){
			for(let k = 1; k < indices.length; k++) {
				if(indices[k] - indices[k-1] !== 105) {
					
				} //This is not a valid sequence going by size, drop sequence and return
				else {
					var line = buffer.slice(indices[k-1],indices[k]+1); //Splice out this line to be decoded
					
					// line[0] = stop byte, line[1] = start byte, line[2] = counter, line[3:99] = ADC data 32x3 bytes, line[100-104] = Accelerometer data 3x2 bytes

					//line found, decode.
					if(this.data.counter < this.maxBufferedSamples){
						this.data.counter++;
					}

					if(this.data.counter-1 === 0) {this.data.ms[this.data.counter-1]= Date.now(); this.data.startms = this.data.ms[0];}
					else {
						this.data.ms[this.data.counter-1]=this.data.ms[this.data.counter-2]+this.updateMs;
						
						if(this.data.counter >= this.maxBufferedSamples) {
							this.data.ms.splice(0,5120);
							this.data.ms.push(new Array(5120).fill(0));
						}
					}//Assume no dropped samples
				
					for(var i = 3; i < 99; i+=3) {
						var channel = "A"+(i-3)/3;
						this.data[channel][this.data.counter-1]=this.bytesToInt24(line[i],line[i+1],line[i+2]);
						if(this.data.counter >= this.maxBufferedSamples) { 
							this.data[channel].splice(0,5120);
							this.data[channel].push(new Array(5120).fill(0));//shave off the last 10 seconds of data if buffer full (don't use shift())
						}
							//console.log(this.data[channel][this.data.counter-1],indices[k], channel)
					}

					this.data["Ax"][this.data.counter-1]=this.bytesToInt16(line[99],line[100]);
					this.data["Ay"][this.data.counter-1]=this.bytesToInt16(line[101],line[102]);
					this.data["Az"][this.data.counter-1]=this.bytesToInt16(line[103],line[104]);

					
					if(this.data.counter >= this.maxBufferedSamples) { 
						this.data["Ax"].splice(0,5120);
						this.data["Ay"].splice(0,5120);
						this.data["Az"].splice(0,5120);
						this.data["Ax"].push(new Array(5120).fill(0))
						this.data["Ay"].push(new Array(5120).fill(0))
						this.data["Az"].push(new Array(5120).fill(0))
						this.data.counter -= 5120;
					}
					//console.log(this.data)
					newLines++;
					//console.log(indices[k-1],indices[k])
					//console.log(buffer[indices[k-1],buffer[indices[k]]])
					//indices.shift();
				}
				
			}
			if(newLines > 0) buffer.splice(0,indices[indices.length-1]);
			return newLines;
			//Continue
		}
		//else {this.buffer = []; return false;}
	}

	//Callbacks
	onDecodedCallback(newLinesInt){
		//console.log("new samples:", newLinesInt);
	}

	onConnectedCallback() {
		console.log("port connected!");
	}

	onDisconnectedCallback() {
		console.log("port disconnected!");
	}

	onReceive(value){
		this.buffer.push(...value);

		let newLines = this.decode(this.buffer);
		//console.log(this.data)
		//console.log("decoding... ", this.buffer.length)
		if(newLines !== false && newLines !== 0 && !isNaN(newLines) ) this.onDecodedCallback(newLines);
	}

	async onPortSelected(port,baud=this.baudrate) {
		try{
			try {
				await port.open({ baudRate: baud, bufferSize: this.readBufferSize });
				this.onConnectedCallback();
				this.connected = true;
				this.subscribed = true;
				this.subscribe(port);//this.subscribeSafe(port);
		
			} //API inconsistency in syntax between linux and windows
			catch {
				await port.open({ baudrate: baud, buffersize: this.readBufferSize });
				this.onConnectedCallback();
				this.connected = true;
				this.subscribed = true;
				this.subscribe(port);//this.subscribeSafe(port);
			}
		}
		catch(err){
			console.log(err);
			this.connected = false;
		}
	}

	async subscribe(port){
		if (this.port.readable && this.subscribed === true) {
			this.reader = port.readable.getReader();
			const streamData = async () => {
				try {
					const { value, done } = await this.reader.read();
					if (done || this.subscribed === false) {
						// Allow the serial port to be closed later.
						await this.reader.releaseLock();
						
					}
					if (value) {
						//console.log(value.length);
						try{
							this.onReceive(value);
						}
						catch (err) {console.log(err)}
						//console.log("new Read");
						//console.log(this.decoder.decode(value));
					}
					if(this.subscribed === true) {
						setTimeout(()=>{streamData();}, this.readRate);//Throttled read 1/512sps = 1.953ms/sample @ 103 bytes / line or 1030bytes every 20ms
					}
				} catch (error) {
					console.log(error);// TODO: Handle non-fatal read error.
					
				}
			}
			streamData();
		}
	}

	//Unfinished
	async subscribeSafe(port) { //Using promises instead of async/await to cure hangs when the serial update does not meet tick requirements
		var readable = new Promise((resolve,reject) => {
			while(this.port.readable && this.subscribed === true){
				this.reader = port.readable.getReader();
				var looper = true;
				var prom1 = new Promise((resolve,reject) => {
					return this.reader.read();
				});

				var prom2 = new Promise((resolve,reject) => {
					setTimeout(resolve,100,"readfail");
				});
				while(looper === true ) {
					//console.log("reading...");
					Promise.race([prom1,prom2]).then((result) => {
						console.log("newpromise")
						if(result === "readfail"){
							console.log(result);
						}
						else{
							const {value, done} = result;
							if(done === true || this.subscribed === true) { var donezo = new Promise((resolve,reject) => {
								resolve(this.reader.releaseLock())}).then(() => {
									looper = false;
									return;
								});
							}
							else{
								this.onReceive(value);
							}
						}
					});
				}
			}
			resolve("not readable");
		});
	}

	async closePort(port=this.port) {
		//if(this.reader) {this.reader.releaseLock();}
		if(this.port){
			this.subscribed = false;
			setTimeout(async () => {
				if (this.reader) {
					this.reader = null;
				}
				await port.close();
				this.port = null;
				this.connected = false;
				this.onDisconnectedCallback();
			}, 100);
		}
	}

	async setupSerialAsync(baudrate=this.baudrate) { //You can specify baudrate just in case

		const filters = [
			{ usbVendorId: 0x10c4, usbProductId: 0x0043 } //CP2102 filter (e.g. for UART via ESP32)
		];

		this.port = await navigator.serial.requestPort();
		navigator.serial.addEventListener("disconnect",(e) => {
			this.closePort(this.port);
		});
		this.onPortSelected(this.port,baudrate);

		//navigator.serial.addEventListener("onReceive", (e) => {console.log(e)});//this.onReceive(e));

	}


	//Boyer Moore fast byte search method copied from https://codereview.stackexchange.com/questions/20136/uint8array-indexof-method-that-allows-to-search-for-byte-sequences
	asUint8Array(input) {
		if (input instanceof Uint8Array) {
			return input;
		} else if (typeof(input) === 'string') {
			// This naive transform only supports ASCII patterns. UTF-8 support
			// not necessary for the intended use case here.
			var arr = new Uint8Array(input.length);
			for (var i = 0; i < input.length; i++) {
			var c = input.charCodeAt(i);
			if (c > 127) {
				throw new TypeError("Only ASCII patterns are supported");
			}
			arr[i] = c;
			}
			return arr;
		} else {
			// Assume that it's already something that can be coerced.
			return new Uint8Array(input);
		}
	}

	boyerMoore(patternBuffer) {
		// Implementation of Boyer-Moore substring search ported from page 772 of
		// Algorithms Fourth Edition (Sedgewick, Wayne)
		// http://algs4.cs.princeton.edu/53substring/BoyerMoore.java.html
		/*
		USAGE:
			// needle should be ASCII string, ArrayBuffer, or Uint8Array
			// haystack should be an ArrayBuffer or Uint8Array
			var search = boyerMoore(needle);
			var skip = search.byteLength;
			var indices = [];
			for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
				indices.push(i);
			}
		*/
		var pattern = this.asUint8Array(patternBuffer);
		var M = pattern.length;
		if (M === 0) {
			throw new TypeError("patternBuffer must be at least 1 byte long");
		}
		// radix
		var R = 256;
		var rightmost_positions = new Int32Array(R);
		// position of the rightmost occurrence of the byte c in the pattern
		for (var c = 0; c < R; c++) {
			// -1 for bytes not in pattern
			rightmost_positions[c] = -1;
		}
		for (var j = 0; j < M; j++) {
			// rightmost position for bytes in pattern
			rightmost_positions[pattern[j]] = j;
		}
		var boyerMooreSearch = (txtBuffer, start, end) => {
			// Return offset of first match, -1 if no match.
			var txt = this.asUint8Array(txtBuffer);
			if (start === undefined) start = 0;
			if (end === undefined) end = txt.length;
			var pat = pattern;
			var right = rightmost_positions;
			var lastIndex = end - pat.length;
			var lastPatIndex = pat.length - 1;
			var skip;
			for (var i = start; i <= lastIndex; i += skip) {
				skip = 0;
				for (var j = lastPatIndex; j >= 0; j--) {
				var c = txt[i + j];
				if (pat[j] !== c) {
					skip = Math.max(1, j - right[c]);
					break;
				}
				}
				if (skip === 0) {
				return i;
				}
			}
			return -1;
		};
		boyerMooreSearch.byteLength = pattern.byteLength;
		return boyerMooreSearch;
	}
	//---------------------end copy/pasted solution------------------------

}


export class eegAtlas {

	constructor(channelTags = this.setDefaultTags()) {

		this.fftMap = this.makeAtlas10_20(); //this.makeAtlas10_20();
		this.channelTags = channelTags; //Format: [{ch:0, tag:"Fp1", viewing:true},{etc}];
		this.coherenceMap = this.genCoherenceMap();
	}

	//EEG Atlas generator
	newAtlasData(x,y,z, count=0, times=[], amplitudes=[], slices= {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []}, means={scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma:[], highgamma: []}){
		return {x: x, y:y, z:z, counts:count, times:times, amplitudes:amplitudes, slices:slices, means:means};
	}

	//Input arrays of corresponding tags, xyz coordinates as Array(3) objects, and DFT amplitudes (optional).
	newAtlas(tags=["Fp1","Fp2"], coords = [[-21.5, 70.2,-0.1],[28.4,69.1,-0.4]],times=undefined,amplitudes=undefined,slices=null, means=null){
		var newLayout = {shared: {sps: this.sps, bandPassWindows:[]}, map:[]}
		tags.forEach((tag,i) => {
			if (amplitudes === undefined) {
				newLayout.map.push({tag: tag, data: this.newAtlasData(coords[i][0],coords[i][1],coords[i][2],counts[i],undefined,undefined,undefined,undefined)});
			}
			else {
				newLayout.map.push({tag: tag, data: this.newAtlasData(coords[i][0],coords[i][1],coords[i][2],counts[i],times[i],amplitudes[i],slices[i],means[i])});
			}
		});
		return newLayout;
	}

	//Return the object corresponding to the atlas tag
	getAtlasCoordByTag(tag="Fp1"){
		var found = undefined;
		let atlasCoord = this.fftMap.map.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}

	//Return the object corresponding to the atlas tag
	getAtlasCoherenceCoordByTag(tag="Fp1:Fpz"){
		var found = undefined;
		let atlasCoord = this.coherenceMap.map.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}

	//Return an array of Array(3)s for each coordinate. Useful e.g. for graphics
	getAtlasCoordsList() {
		var coords = [];
		for(var i = 0; i< this.fftMap.length; i++) {
			coords.push([this.fftMap.map[i].data.x,this.fftMap.map[i].data.y,this.fftMap.map[i].data.z]);
		}
		return coords;
	}

	//Get the latest data pushed to tagged channels
	getLatestDataFromAtlas() {
		var dat = [];

		this.channelTags.forEach((r, i) => {
			var row = this.getAtlasCoordByTag(r.tag);
			var lastIndex = row.data.count - 1;
			dat.push({tag:row.tag, data:{
				count:row.data.count,
				time: row.data.times[lastIndex],
				amplitude: row.data.amplitudes[lastIndex],
				slice:{delta:row.data.slices.delta[lastIndex], theta:row.data.slices.theta[lastIndex], alpha1:row.data.slices.alpha1[lastIndex], alpha2:row.data.slices.alpha2[lastIndex], beta:row.data.slices.beta[lastIndex], gamma:row.data.slices.gamma[lastIndex]},
				mean:{delta:row.data.means.delta[lastIndex], theta:row.data.means.theta[lastIndex], alpha1: row.data.means.alpha1[lastIndex], alpha2: row.data.means.alpha2[lastIndex], beta: row.data.means.beta[lastIndex], gamma: row.data.means.gamma[lastIndex]}}});
		});
		return dat;
	}

	//Gets raw data associated with the channelTags, since we assume these are the only channels you are using
	getTaggedRawData(nSamples) {
		var raw = [];
		this.channelTags.forEach((row,i) => {
			var ch = 'A' + row.ch;
			raw.push(this.data[ch].slice(this.data[ch][this.data.counter-1]-nSamples,this.data[ch].length));
		});
		return raw;
	}

	//Returns a 10_20 atlas object with structure { "Fp1": {x,y,z,amplitudes[]}, "Fp2" : {...}, ...}
	makeAtlas10_20(){
		// 19 channel coordinate space spaghetti primitive.
		// Based on MNI atlas.
		var freqBins = {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []};

		return {shared: {sps: 512, bandPassWindow:[], bandFreqs:{scp:[[],[]], delta:[[],[]], theta:[[],[]], alpha1:[[],[]], alpha2:[[],[]], beta:[[],[]], lowgamma:[[],[]], highgamma:[[],[]]} //x axis values and indices for named EEG frequency bands
		}, map:[
			{tag:"Fp1", data: { x: -21.5, y: 70.2,   z: -0.1,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"Fp2", data: { x: 28.4,  y: 69.1,   z: -0.4,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"Fz",  data: { x: 0.6,   y: 40.9,   z: 53.9,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"F3",  data: { x: -35.5, y: 49.4,   z: 32.4,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"F4",  data: { x: 40.2,  y: 47.6,   z: 32.1,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"F7",  data: { x: -54.8, y: 33.9,   z: -3.5,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"F8",  data: { x: 56.6,  y: 30.8,   z: -4.1,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"Cz",  data: { x: 0.8,   y: -14.7,  z: 73.9,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"C3",  data: { x: -52.2, y: -16.4,  z: 57.8,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"C4",  data: { x: 54.1,  y: -18.0,  z: 57.5,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"T3",  data: { x: -70.2, y: -21.3,  z: -10.7, count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"T4",  data: { x: 71.9,  y: -25.2,  z: -8.2,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"Pz",  data: { x: 0.2,   y: -62.1,  z: 64.5,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"P3",  data: { x: -39.5, y: -76.3,  z: 47.4,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"P4",  data: { x: 36.8,  y: -74.9,  z: 49.2,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"T5",  data: { x: -61.5, y: -65.3,  z: 1.1,   count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"T6",  data: { x: 59.3,  y: -67.6,  z: 3.8,   count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"O1",  data: { x: -26.8, y: -100.2, z: 12.8,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
			{tag:"O2",  data: { x: 24.1,  y: -100.5, z: 14.1,  count:0,  times: [], amplitudes: [], slices: JSON.parse(JSON.stringify(freqBins)), means: JSON.parse(JSON.stringify(freqBins))}},
		]};
	}

	addToAtlas(tag,x,y,z){
		this.fftMap.map.push({ tag: tag, data: this.newAtlasData(x,y,z) });
	}

	genCoherenceMap(channelTags = this.channelTags, taggedOnly = true) {
		var coherenceMap = {shared:{bandPassWindow:[],bandFreqs:{scp:[[],[]], delta:[[],[]], theta:[[],[]], alpha1:[[],[]], alpha2:[[],[]], beta:[[],[]], lowgamma:[[],[]], highgamma:[[],[]]}},map:[]};
		var l = 1, k = 0;
		var freqBins = {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []}
		
		for( var i = 0; i < (channelTags.length*(channelTags.length + 1)/2)-channelTags.length; i++){
			if(taggedOnly === false || taggedOnly === true && ((channelTags[k].tag !== null && channelTags[k+l].tag !== null)&&(channelTags[k].tag !== 'other' && channelTags[k+l].tag !== 'other'))) {
				var coord0 = this.getAtlasCoordByTag(channelTags[k].tag);
				var coord1 = this.getAtlasCoordByTag(channelTags[k+l].tag);

				coherenceMap.map.push({
					tag: channelTags[k].tag+":"+channelTags[l+k].tag,
					data: {
						x0: coord0?.data.x,
						y0: coord0?.data.y,
						z0: coord0?.data.z,
						x1: coord1?.data.x,
						y1: coord1?.data.y,
						z1: coord1?.data.z,
						count: 0,
						times:[],
						amplitudes:[],
						slices: JSON.parse(JSON.stringify(freqBins)),
						means: JSON.parse(JSON.stringify(freqBins))
					}
				});
			}

			l++;
			if (l + k === channelTags.length) {
				k++;
				l = 1;
			}
		}
		return coherenceMap;
	}

	regenAtlasses(freqStart,freqEnd,sps=512) {
		this.fftMap = this.makeAtlas10_20(); //reset atlas

		let bandPassWindow = this.bandPassWindow(freqStart,freqEnd,sps);

		this.fftMap.shared.bandPassWindow = bandPassWindow;//Push the x-axis values for each frame captured as they may change - should make this lighter
		this.fftMap.shared.bandFreqs = this.getBandFreqs(bandPassWindow); //Update bands accessed by the atlas for averaging

		this.coherenceMap = this.genCoherenceMap(this.channelTags);
		this.coherenceMap.bandPasswindow = bandPassWindow;
		this.coherenceMap.shared.bandFreqs = this.fftMap.shared.bandFreqs;
	
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

	getBandFreqs(bandPassWindow) {//Returns an object with the frequencies and indices associated with the bandpass window (for processing the FFT results)
		var scpFreqs = [[],[]], deltaFreqs = [[],[]], thetaFreqs = [[],[]], alpha1Freqs = [[],[]], alpha2Freqs = [[],[]], betaFreqs = [[],[]], lowgammaFreqs = [[],[]], highgammaFreqs = [[],[]]; //x axis values and indices for named EEG frequency bands
		bandPassWindow.forEach((item,idx) => {
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
		let atlasCoord = this.fftMap.map.find((o, i) => {
		if(o.tag === tag){
			this.fftMap.map[i].data.count++;
			this.fftMap.map[i].data.times.push(lastPostTime);
			this.fftMap.map[i].data.amplitudes.push(data[channel]);
			if(this.fftMap.shared.bandFreqs.scp[1].length > 0){
			var scp = data[channel].slice( this.fftMap.shared.bandFreqs.scp[1][0], this.fftMap.shared.bandFreqs.scp[1][this.fftMap.shared.bandFreqs.scp[1].length-1]+1);
			this.fftMap.map[i].data.slices.scp.push(scp);
			this.fftMap.map[i].data.means.scp.push(eegmath.mean(scp));
			}
			if(this.fftMap.shared.bandFreqs.scp[1].length > 0){
			var delta = data[channel].slice( this.fftMap.shared.bandFreqs.delta[1][0], this.fftMap.shared.bandFreqs.delta[1][this.fftMap.shared.bandFreqs.delta[1].length-1]+1);
			this.fftMap.map[i].data.slices.delta.push(delta);
			this.fftMap.map[i].data.means.delta.push(eegmath.mean(delta));
			}
			if(this.fftMap.shared.bandFreqs.theta[1].length > 0){
			var theta = data[channel].slice( this.fftMap.shared.bandFreqs.theta[1][0], this.fftMap.shared.bandFreqs.theta[1][this.fftMap.shared.bandFreqs.theta[1].length-1]+1);
			this.fftMap.map[i].data.slices.theta.push(theta);
			this.fftMap.map[i].data.means.theta.push(eegmath.mean(theta));
			}
			if(this.fftMap.shared.bandFreqs.alpha1[1].length > 0){
			var alpha1 = data[channel].slice( this.fftMap.shared.bandFreqs.alpha1[1][0], this.fftMap.shared.bandFreqs.alpha1[1][this.fftMap.shared.bandFreqs.alpha1[1].length-1]+1);
			this.fftMap.map[i].data.slices.alpha1.push(alpha1);
			this.fftMap.map[i].data.means.alpha1.push(eegmath.mean(alpha1));
			}
			if(this.fftMap.shared.bandFreqs.alpha2[1].length > 0){
			var alpha2 = data[channel].slice( this.fftMap.shared.bandFreqs.alpha2[1][0], this.fftMap.shared.bandFreqs.alpha2[1][this.fftMap.shared.bandFreqs.alpha2[1].length-1]+1);
			this.fftMap.map[i].data.slices.alpha2.push(alpha2);
			this.fftMap.map[i].data.means.alpha2.push(eegmath.mean(alpha2));
			}
			if(this.fftMap.shared.bandFreqs.beta[1].length > 0){
			var beta  = data[channel].slice( this.fftMap.shared.bandFreqs.beta[1][0],  this.fftMap.shared.bandFreqs.beta[1][this.fftMap.shared.bandFreqs.beta[1].length-1]+1);
			this.fftMap.map[i].data.slices.beta.push(beta);
			this.fftMap.map[i].data.means.beta.push(eegmath.mean(beta));
			}
			if(this.fftMap.shared.bandFreqs.lowgamma[1].length > 0){
			var lowgamma = data[channel].slice( this.fftMap.shared.bandFreqs.lowgamma[1][0], this.fftMap.shared.bandFreqs.lowgamma[1][this.fftMap.shared.bandFreqs.lowgamma[1].length-1]+1);
			this.fftMap.map[i].data.slices.lowgamma.push(lowgamma);
			this.fftMap.map[i].data.means.lowgamma.push(eegmath.mean(lowgamma));
			}
			if(this.fftMap.shared.bandFreqs.highgamma[1].length > 0){
			var highgamma = data[channel].slice( this.fftMap.shared.bandFreqs.highgamma[1][0], this.fftMap.shared.bandFreqs.highgamma[1][this.fftMap.shared.bandFreqs.highgamma[1].length-1]+1);
			this.fftMap.map[i].data.slices.highgamma.push(highgamma);
			this.fftMap.map[i].data.means.highgamma.push(eegmath.mean(highgamma));
			}
			//console.timeEnd("slicing bands");
			return true;
		}
		});
	}

	mapCoherenceData = (data, lastPostTime) => { //Expects data in correct order
		data.forEach((row,i) => {
		  this.coherenceMap.map[i].data.count++;
		  this.coherenceMap.map[i].data.amplitudes.push(row);
		  this.coherenceMap.map[i].data.times.push(lastPostTime);

		if(this.coherenceMap.shared.bandFreqs.scp[1].length > 0){
		  var scp = row.slice( this.coherenceMap.shared.bandFreqs.scp[1][0], this.coherenceMap.shared.bandFreqs.scp[1][this.coherenceMap.shared.bandFreqs.scp[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.scp.push(scp);
		  this.coherenceMap.map[i].data.means.scp.push(eegmath.mean(scp));
		}
		if(this.coherenceMap.shared.bandFreqs.delta[1].length > 0){
		  var delta = row.slice( this.coherenceMap.shared.bandFreqs.delta[1][0], this.coherenceMap.shared.bandFreqs.delta[1][this.coherenceMap.shared.bandFreqs.delta[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.delta.push(delta);
		  this.coherenceMap.map[i].data.means.delta.push(eegmath.mean(delta));
		}
		if(this.coherenceMap.shared.bandFreqs.theta[1].length > 0){
		  var theta = row.slice( this.coherenceMap.shared.bandFreqs.theta[1][0], this.coherenceMap.shared.bandFreqs.theta[1][this.coherenceMap.shared.bandFreqs.theta[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.theta.push(theta);
		  this.coherenceMap.map[i].data.means.theta.push(eegmath.mean(theta));
		}
		if(this.coherenceMap.shared.bandFreqs.alpha1[1].length > 0){
		  var alpha1 = row.slice( this.coherenceMap.shared.bandFreqs.alpha1[1][0], this.coherenceMap.shared.bandFreqs.alpha1[1][this.coherenceMap.shared.bandFreqs.alpha1[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.alpha1.push(alpha1);
		  this.coherenceMap.map[i].data.means.alpha1.push(eegmath.mean(alpha1));
		}
		if(this.coherenceMap.shared.bandFreqs.alpha2[1].length > 0){
		  var alpha2 = row.slice( this.coherenceMap.shared.bandFreqs.alpha2[1][0], this.coherenceMap.shared.bandFreqs.alpha2[1][this.coherenceMap.shared.bandFreqs.alpha2[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.alpha2.push(alpha2);
		  this.coherenceMap.map[i].data.means.alpha2.push(eegmath.mean(alpha2));
		}
		if(this.coherenceMap.shared.bandFreqs.beta[1].length > 0){
		  var beta  = row.slice( this.coherenceMap.shared.bandFreqs.beta[1][0],  this.coherenceMap.shared.bandFreqs.beta[1][this.coherenceMap.shared.bandFreqs.beta[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.beta.push(beta);
		  this.coherenceMap.map[i].data.means.beta.push(eegmath.mean(beta));
		}
		if(this.coherenceMap.shared.bandFreqs.lowgamma[1].length > 0){
		  var lowgamma = row.slice( this.coherenceMap.shared.bandFreqs.lowgamma[1][0], this.coherenceMap.shared.bandFreqs.lowgamma[1][this.coherenceMap.shared.bandFreqs.lowgamma[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.lowgamma.push(lowgamma);
		  this.coherenceMap.map[i].data.means.lowgamma.push(eegmath.mean(lowgamma));
		}
		if(this.coherenceMap.shared.bandFreqs.highgamma[1].length > 0){
		  var highgamma = row.slice( this.coherenceMap.shared.bandFreqs.highgamma[1][0], this.coherenceMap.shared.bandFreqs.highgamma[1][this.coherenceMap.shared.bandFreqs.highgamma[1].length-1]+1);
		  this.coherenceMap.map[i].data.slices.highgamma.push(highgamma);
		  this.coherenceMap.map[i].data.means.highgamma.push(eegmath.mean(highgamma));
		}
		});
	}

	//Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.
	bandPassWindow(freqStart,freqEnd,nSteps) {

		var freqEnd_nyquist = freqEnd*2;
		var fftwindow = [];
		  for (var i = 0; i < Math.ceil(0.5*nSteps); i++){
			  fftwindow.push(freqStart + (freqEnd_nyquist-freqStart)*i/(nSteps));
		  }
		return fftwindow;
	}

}

export class eegmath {
	constructor() {

	}

	//----------------------------------------------------------------
	//-------------------- Static Functions --------------------------
	//----------------------------------------------------------------

	//Generate sinewave, you can add a noise frequency in too. Array length will be Math.ceil(fs*nSec)
	static genSineWave(freq=20,peakAmp=1,nSec=1,fs=512,freq2=0,peakAmp2=1){
		var sineWave = [];
		var t = [];
		var increment = 1/fs; //x-axis time increment based on sample rate
		for (var ti = 0; ti < nSec; ti+=increment){
			var amplitude = Math.sin(2*Math.PI*freq*ti)*peakAmp;
			amplitude += Math.sin(2*Math.PI*freq2*ti)*peakAmp2; //Add interference
			sineWave.push(amplitude);
			t.push(ti);
		}
		return [t,sineWave]; // [[times],[amplitudes]]
	}

	static mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

	static variance(arr1) { //1D input arrays of length n
		var mean1 = this.mean(arr1);
		var vari = [];
		for(var i = 0; i < arr1.length; i++){
			vari.push((arr1[i] - mean1)/(arr1.length-1));
		}
		return vari;
	}

	static transpose(mat){
		return mat[0].map((_, colIndex) => mat.map(row => row[colIndex]));
	}

	//Matrix multiplication from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
	static matmul(a, b) {
		var aNumRows = a.length, aNumCols = a[0].length,
			bNumRows = b.length, bNumCols = b[0].length,
			m = new Array(aNumRows);  // initialize array of rows
		for (var r = 0; r < aNumRows; ++r) {
		  m[r] = new Array(bNumCols); // initialize the current row
		  for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
			  m[r][c] += a[r][i] * b[i][c];
			}
		  }
		}
		return m;
	  }

	//2D matrix covariance (e.g. for lists of signals). Pretty fast!!!
	static cov2d(mat) { //[[x,y,z,w],[x,y,z,w],...] input list of vectors of the same length
		//Get variance of rows and columns
		//console.time("cov2d");
		var mattransposed = this.transpose(mat);
		//console.log(mattransposed)
		var matproducts = [];

		var rowmeans = [];
		var colmeans = [];

		mat.forEach((row, idx) => {
			rowmeans.push(this.mean(row));
		});

		mattransposed.forEach((col,idx) => {
			colmeans.push(this.mean(col));
		});

		mat.forEach((row,idx) => {
			matproducts.push([]);
			for(var col = 0; col < row.length; col++){
				matproducts[idx].push((mat[idx][col]-rowmeans[idx])*(mat[idx][col]-colmeans[col])/(row.length - 1));
			}
		});

		/*
			mat[y][x] = (x - rowAvg)*(x - colAvg) / (mat[y].length - 1);
		*/

		console.log(matproducts);
		//Transpose matrix
		var matproductstransposed = this.transpose(matproducts);

		//Matrix multiplication, stolen from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
		var aNumRows = matproducts.length, aNumCols = matproducts[0].length,
			bNumRows = matproductstransposed.length, bNumCols = matproductstransposed[0].length,
			m = new Array(aNumRows);  // initialize array of rows
		for (var r = 0; r < aNumRows; ++r) {
		  m[r] = new Array(bNumCols); // initialize the current row
		  for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
			  m[r][c] += matproducts[r][i] * matproductstransposed[i][c] / (mat[0].length - 1); //divide by row length - 1
			}
		  }
		}
		//console.timeEnd("cov2d");
		return m; //Covariance matrix
	}

	//Covariance between two 1D arrays
	static cov1d(arr1,arr2) {
		return this.cov2d([arr1,arr2]);
	}

	//Simple cross correlation.
	static crosscorrelation(arr1,arr2) {

		//console.time("crosscorrelation");
		var arr2buf = [...arr2,...Array(arr2.length).fill(0)];
		var mean1 = this.mean(arr1);
		var mean2 = this.mean(arr2);

		//Estimators
		var arr1Est = arr1.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr1Est = Math.sqrt(arr1Est);
		var arr2Est = arr2.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr2Est = Math.sqrt(arr2Est);

		var _arrEstsMul = 1/(arr1Est * arr2Est);
		var correlations = new Array(arr1.length).fill(0);

		for(var delay = 0; delay < arr1.length; delay++) {
			var r = arr1.reduce((sum,item,i) => sum += (item - mean1)*(arr2buf[delay+i]-mean2));
			correlations[delay] = r*_arrEstsMul;
		}

		//console.timeEnd("crosscorrelation");
		return correlations;
	}

	//Simple autocorrelation. Better method for long series: FFT[x1] .* FFT[x2]
	static autocorrelation(arr1) {
		var delaybuf = [...arr1,...Array(arr1.length).fill(0)];
		var mean1 = this.mean(arr1);

		//Estimators
		var arr1Est = arr1.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr1Est = Math.sqrt(arr1Est);

		var _arr1estsqrd = 1/(arr1Est * arr1Est);
		var correlations = new Array(arr1.length).fill(0);

		for(var delay = 0; delay < arr1.length; delay++) {
			var r = arr1.reduce((sum,item,i) => sum += (item - mean1)*(delaybuf[delay+i]-mean1));
			correlations[delay] = r*_arr1estsqrd;
		}

		return correlations;
	}

	//Compute correlograms of the given array of arrays (of equal length). Input array of equal length arrays of latest raw data (use dat = eeg32instance.getTaggedRawData())
	static correlograms(dat) {//Coherence network math for data pushed to the atlas
		var correlograms = []; //auto and cross correlations for each channel
		dat.forEach((row1,i) => {
			dat.forEach((row2,j) => {
				if(j >= i) {
					correlograms.push(eegmath.crosscorrelation(row1,row2));
				}
			})
		});
		return correlograms; //Output ordered like (tag1:tag1, tag1:tag2 ... tag2:tag2, tag2:tag3 ... tagn:tagn) where autocorrelograms are also included
	}


	//Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)
	static sma(arr, window) {
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

	//Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	interpolateArray(data, fitCount) {

		var norm = this.canvas.height/data.length;

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

}
