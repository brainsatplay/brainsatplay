
export class cyton { //Contains structs and necessary functions/API calls to analyze serial data for the FreeEEG32

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
            [stop byte, start byte, counter byte, 32x3 channel data bytes (24 bit), 3x2 accelerometer data bytes, stop byte, start byte...]
            Total = 105 bytes/line
        */
		this.connected = false;
		this.subscribed = false;
        this.buffer = [];
        this.startByte = 160; // Start byte value
		this.stopByte = 192; // Stop byte value
		this.searchString = new Uint8Array([this.stopByte,this.startByte]); //Byte search string

		this.sps = 250; // Sample rate
		this.nChannels = 8;
		this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
		this.updateMs = 1000/this.sps; //even spacing
		this.stepSize = 1/(Math.pow(2,23)-1);
		this.vref = 4.50; //2.5V voltage ref +/- 250nV
		this.gain = 24;

		this.vscale = (this.vref/this.gain)*this.stepSize; //volts per step.
		this.uVperStep = 1000000 * ((this.vref/this.gain)*this.stepSize); //uV per step.
		this.scalar = 1/(1000000 / ((this.vref/this.gain)*this.stepSize)); //steps per uV.

		this.maxBufferedSamples = this.sps*60*5; //max samples in buffer this.sps*60*nMinutes = max minutes of data
		
		this.data = { //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.counter-1]
			counter: 0,
			ms: [],
			'A0': [],'A1': [],'A2': [],'A3': [],'A4': [],'A5': [],'A6': [],'A7': [], //Cyton 0
			'A8': [],'A9': [],'A10': [],'A11': [],'A12': [],'A13': [],'A14': [],'A15': [], //Cyton 1 (Stacked)
            'Ax': [], 'Ay': [], 'Az': [], //Peripheral data (accelerometer)
            'Ax2': [], 'Ay2': [], 'Az2': []  
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

		for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
			indices.push(i);
		}
		//console.log(indices);

		if(indices.length >= 2){
			var line = buffer.splice(indices[0],indices[1]+6-indices[0]); //Splice out this line to be decoded

			// line[0] = stop byte, line[1] = start byte, line[2] = counter, line[3:99] = ADC data 32x3 bytes, line[100-104] = Accelerometer data 3x2 bytes

            if(indices[1] - indices[0] !== 32) {
                let j = 0;
                while (j < 6) { //Cyton has 6 stop bytes possible
                    j++;
                    this.searchString = new Uint8Array([this.startByte,j]);
                    needle = this.searchString
                    haystack = buffer;
                    search = this.boyerMoore(needle);
                    skip = search.byteLength;
                    indices = [];

                    for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
                        indices.push(i);
                    }
                    if(indices.length >= 2){
                        line = buffer.splice(indices[0],indices[1]+6-indices[0]); //Splice out this line to be decoded
                        if(indices[1] - indices[0] === 32) { 
                            this.stopByte = j;
                            break;
                        }
                    }
                }
                if(indices[1] - indices[0] !== 32) { 
                    buffer.splice(0,indices[1]);
                    return false; //This is not a valid sequence going by size, drop sequence and return
                }
            }

			if(indices[0] !== 0){
				buffer.splice(0,indices[0]); // Remove any useless junk on the front of the buffer.
			}

			//line found, decode.
			if(this.data.counter < this.maxBufferedSamples){
				this.data.counter++;
			}

			if(this.data.counter-1 === 0) {this.data.ms[this.data.counter-1]= Date.now();}
			else {
				if(this.data.counter >= this.maxBufferedSamples && this.data.ms[this.data.counter-1] !== 0 ) {
					this.data.ms.push(this.data.ms[this.data.counter-1]+this.updateMs);
					this.data.ms.shift();
				}
				else{
					this.data.ms[this.data.counter-1]=this.data.ms[this.data.counter-2]+this.updateMs;
				}
			}//Assume no dropped samples
		
			for(var i = 3; i < 27; i+=3) {
				var channel = "A"+(i-3)/3;
				if(this.data.counter >= this.maxBufferedSamples) { 
					this.data[channel].push(this.bytesToInt24(line[i],line[i+1],line[i+2]));
					this.data[channel].shift();
				}
				else{
					this.data[channel][this.data.counter-1]=this.bytesToInt24(line[i],line[i+1],line[i+2]);
				}
			}

			this.data["Ax"][this.data.counter-1]=this.bytesToInt16(line[27],line[28]);
			this.data["Ay"][this.data.counter-1]=this.bytesToInt16(line[29],line[30]);
			this.data["Az"][this.data.counter-1]=this.bytesToInt16(line[31],line[32]);
			//console.log(this.data)

			return true;
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

		let newLines = 0;
		while (this.buffer.length > 209) {
			//console.log("decoding... ", this.buffer.length)
			this.decode(this.buffer);
			newLines++
		}
		this.onDecodedCallback(newLines);
	}

	async onPortSelected(port,baud=this.baudrate) {
		try{
			try {
				await port.open({ baudRate: baud, bufferSize: 2048 });
				this.onConnectedCallback();
				this.connected = true;
				this.subscribed = true;
				this.subscribe(port);//this.subscribeSafe(port);
		
			} //API inconsistency in syntax between linux and windows
			catch {
				await port.open({ baudrate: baud, buffersize: 2048 });
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
		while (this.port.readable && this.subscribed === true) {
			this.reader = port.readable.getReader();
			while(this.subscribed === true) {
				try {
					const { value, done } = await this.reader.read();
					if (done || this.subscribed === false) {
						// Allow the serial port to be closed later.
						await this.reader.releaseLock();
						break;
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
				} catch (error) {
					console.log(error);// TODO: Handle non-fatal read error.
					break;
				}
			}
		}
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