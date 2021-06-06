//Joshua Brewster, GPL (copyleft)

import 'regenerator-runtime/runtime' //For async functions on node\\

export class industryKiller { //Contains structs and necessary functions/API calls to analyze serial data for the FreeEEG32

    constructor(
		onDecodedCallback = this.onDecodedCallback,
		onConnectedCallback = this.onConnectedCallback,
		onDisconnectedCallback = this.onDisconnectedCallback,
		CustomDecoder = this.decode,
		baudrate = 10000000
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
        this.buffer = "";
        this.startByte = 160; // Start byte value
		this.stopByte = 192; // Stop byte value
		this.searchString = new Uint8Array([this.stopByte,this.startByte]); //Byte search string
		this.readRate = 1; //Throttle EEG read speed. (1.953ms/sample min @103 bytes/line)
		this.readBufferSize = 2000; //Serial read buffer size, increase for slower read speeds (~1030bytes every 20ms) to keep up with the stream (or it will crash)
        this.decoder = new TextDecoder();

		this.sps = 500; // Sample rate
		this.nChannels = 32;
		this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
		this.updateMs = 1000/this.sps; //even spacing
		this.stepSize = 1/Math.pow(2,24);
		this.vref = 1.20; //2.5V voltage ref +/- 250nV
		this.gain = 32;

		this.vscale = (this.vref/this.gain)*this.stepSize; //volts per step.
		this.uVperStep = 1000000 * ((this.vref/this.gain)*this.stepSize); //uV per step.
		this.scalar = 1/(1000000 / ((this.vref/this.gain)*this.stepSize)); //steps per uV.

		this.maxBufferedSamples = this.sps*60*2; //max samples in buffer this.sps*60*nMinutes = max minutes of data
		
		this.data = { //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.count-1]
			count: 0,
			startms: undefined,
			ms: [],
			'A0': [],'A1': [],'A2': [],'A3': [],'A4': [],'A5': [],'A6': [],'A7': [], //ADC 0
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
		this.data.count = 0;
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

	getLatestData(channel="A0",count=1) { //Return slice of specified size of the latest data from the specified channel
		let ct = count;
		if(ct <= 1) {
			return this.data[channel][this.data.count-1];
		}
		else {
			if(ct > this.data.count) {
				ct = this.data.count;
			}
			return this.data[channel].slice(this.data.count-ct,this.data.count);
		}
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

    // onReceiveAsync(value) {
    //     this.encodedBuffer += this.decoder.decode(value);
    //     var index;
    //     while ((index = this.encodedBuffer.indexOf('\n')) >= 0) {
    //         var line = this.encodedBuffer.substr(0, index + 1);
    //         if(this.recordData == true) {
    //             this.recorded.push(line);
    //         }
    //         if(this.monitoring = true){
    //             this.newSamples++;
    //             this.monitorData.push(line);
    //         }
    //         this.onReadLine(line);
    //         this.encodedBuffer = this.encodedBuffer.substr(index + 1);
    //     }
    // }

    decode() { //returns true if successful, returns false if not

        
        var index;
        while ((index = this.buffer.indexOf('\n')) >= 0) {
            var line = this.buffer.substr(0, index + 1).split('|');
            if(line.length > 6) {
                this.data.count++;
                if(this.startms === undefined) {
					this.startms = Date.now();//this.data.ms[0]; Use timestamp instead of device timer
					this.data.ms[0] = this.startms;
				} else {
					this.data.ms[this.data.count-1] = this.data.ms[this.data.count-2]+this.updateMs;
				}
                this.data.A0[this.data.count-1] = parseInt(line[0]);
                this.data.A1[this.data.count-1] = parseInt(line[1]);
                this.data.A2[this.data.count-1] = parseInt(line[2]);
                this.data.A3[this.data.count-1] = parseInt(line[3]);
                this.data.A4[this.data.count-1] = parseInt(line[4]);
                this.data.A5[this.data.count-1] = parseInt(line[5]);
                this.data.A6[this.data.count-1] = parseInt(line[6]);
                this.data.A7[this.data.count-1] = parseInt(line[7]);
    
                if(this.data.count > this.maxBufferedSamples) {
                    for(let prop in this.data) {
                        if(Array.isArray(this.data[prop])) {
                            this.data[prop].splice(0,5120);
                            this.data[prop].push(new Array(5120).fill(0));
                        }
                    }
                    this.data.count -= 5120;
                }
    
                this.onDecodedCallback(this.data.count);
            }
            this.buffer = this.buffer.substr(index + 1);
        }
        //console.log(this.data.count,this.data.A0);
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
		this.buffer += this.decoder.decode(value);
		this.decode();
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
                    if(error.message.includes('framing') || error.message.includes('overflow') || error.message.includes('Overflow') || error.message.includes('break')) {
                        this.subscribed = false;
                        setTimeout(async ()=>{
							try{
                            if (this.reader) {
                                await this.reader.releaseLock();
                                this.reader = null;
                            }
							} catch (er){ console.error(er);}
                            this.subscribed = true; 
                            this.subscribe(port);
                            //if that fails then close port and reopen it
                        },30); //try to resubscribe 
                    } else if (error.message.includes('parity') || error.message.includes('Parity') || error.message.includes('overrun')) {
                        console.log(this.port);
						if(this.port){
                            this.subscribed = false;
                            setTimeout(async () => {
								try{
                                if (this.reader) {
                                    await this.reader.releaseLock();
                                    this.reader = null;
                                }
                                await port.close();
								} catch (er){ console.error(er);}
								//this.port = null;
                                this.connected = false;
                                setTimeout(()=>{this.onPortSelected(this.port)},100); //close the port and reopen
                            }, 50);
                        }
                    }
                     else {
                        this.closePort();	
                    }	
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
				try{
				if (this.reader) {
					await this.reader.releaseLock();
					this.reader = null;
				}
				await port.close();
				} catch (er){ console.error(er);}
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

