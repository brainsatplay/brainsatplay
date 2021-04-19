//Joshua Brewster, MIT License

import 'regenerator-runtime/runtime' //for async calls

export class hegduino {
    constructor(mode='usb',ondata=(newline)=>{},onconnect=()=>{},ondisconnect=()=>{},hostURL='http://192.168.4.1/') {

        this.interface = null;
        this.mode = mode;

        if(mode === 'usb' || mode === 'serial') {
            this.setupSerialDevice(ondata,onconnect,ondisconnect);
        }
        else if(mode === 'ble' || mode === 'bt') {
            this.setupBLEDevice(ondata,onconnect,ondisconnect);
        }
        else if(mode === 'wifi' || mode === 'events' || mode === 'sse') {
            this.setupSSEDevice(hostURL,ondata,onconnect,ondisconnect);
        }

    }

    setupSerialDevice(ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {
        this.interface = new webSerial();
        this.interface.onConnectedCallback = onconnect;
        this.interface.onReadLine = ondata;
        this.interface.onDisconnectedCallback = ondisconnect;
    }

    setupBLEDevice(ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {
        this.interface = new hegBLE();
        this.interface.onConnectedCallback = onconnect;
        this.interface.onDisconnectedCallback = ondisconnect;
        this.interface.onNotificationCallback = (e) => {
            var line = this.interface.decoder.decode(e.target.value);
            ondata(line);
        }
    }

    //Change hostURL if device is on main net and has a new IP
    setupSSEDevice(hostURL='http://192.168.4.1/',ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {
        let onheg = (e) => {
            ondata(e.data);
        }
        this.interface = new EventSourceUtil(hostURL+"events",onconnect,ondisconnect,undefined,[{tag:'heg',callback:onheg}])
        this.interface.newPostFunction('sendCommand',hostURL+"command");
    }

    sendCommand(command='') {
        if(this.mode === 'usb' || this.mode === 'serial') {
            this.interface.sendMessage(command);
        }
        else if(this.mode === 'ble' || this.mode === 'bt') {
            this.interface.sendMessage(command);
        }
        else if(this.mode === 'wifi' || this.mode === 'events' || this.mode === 'sse') {
            this.interface.sendCommand(command);
        }
    }

    connect(path) { //chrome serial requires a path be specified (e.g. 'COM3')
        if(this.mode === 'usb' || this.mode === 'serial') {
            if(navigator.serial) this.interface.setupSerialAsync();
            else if(chrome.serial) this.interface.connectSelected(true,path);
            else {
                console.error("ERROR: Cannot locate navigator.serial. Enable #experimental-web-platform-features in chrome://flags");
                alert("Serial support not found. Enable #experimental-web-platform-features in chrome://flags or use a chrome extension")
            }
        }
        else if(this.mode === 'ble' || this.mode === 'bt') {
            this.interface.connect();
        }
        else if(this.mode === 'wifi' || this.mode === 'events' || this.mode === 'sse') {
            this.interface.open();
        }
    }

    disconnect() {
        if(this.mode === 'usb' || this.mode === 'serial') {
            if(navigator.serial) this.interface.closePort();
            else  this.interface.connectSelected(false);
        }
        else if(this.mode === 'ble' || this.mode === 'bt') {
            this.interface.disconnect();
        }
        else if(this.mode === 'wifi' || this.mode === 'events' || this.mode === 'sse') {
            this.interface.close();
        }
    }
}

//alternatively use heg-connection.ts by Dovydas (@Giveback007 on Github)
export class hegBLE { //This is formatted for the way the HEG sends/receives information. Other BLE devices will likely need changes to this to be interactive.
    constructor(serviceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e', rxUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e', txUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e', defaultUI = false, parentId="main_body" , buttonId = "blebutton", async = false ){
     this.serviceUUID = serviceUUID;
     this.rxUUID      = rxUUID; //characteristic that can receive input from this device
     this.txUUID      = txUUID; //characteristic that can transmit input to this device
     this.encoder     = new TextEncoder("utf-8");
     this.decoder     = new TextDecoder("utf-8");
 
     this.device  = null;
     this.server  = null;
     this.service = null;
     this.rxchar  = null; //receiver on the BLE device (write to this)
     this.txchar  = null; //transmitter on the BLE device (read from this)
 
     this.parentId = parentId;
     this.buttonId = buttonId;
 
     this.async = async;
 
     this.android = navigator.userAgent.toLowerCase().indexOf("android") > -1; //Use fast mode on android (lower MTU throughput)
 
     this.n; //nsamples
 
     if(defaultUI === true){
       this.initUI(parentId, buttonId);
     }
     
    }
 
    initUI(parentId, buttonId) {
     if(this.device !== null){
       if (this.device.gatt.connected) {
         this.device.gatt.disconnect();
         console.log("device disconnected")
       }
     }
     var HTMLtoAppend = '<button id="'+buttonId+'">BLE Connect</button>';
     HEGwebAPI.appendFragment(HTMLtoAppend,parentId);
     document.getElementById(buttonId).onclick = () => { 
       if(this.async === false) {
         this.connect();
       } 
       else{
         this.initBLEasync();
       } 
     }
    }
 
    //Typical web BLE calls
    connect = (serviceUUID = this.serviceUUID, rxUUID = this.rxUUID, txUUID = this.txUUID) => { //Must be run by button press or user-initiated call
     navigator.bluetooth.requestDevice({   
       acceptAllDevices: true,
       optionalServices: [serviceUUID] 
       })
       .then(device => {
           //document.getElementById("device").innerHTML += device.name+ "/"+ device.id +"/"+ device.gatt.connected+"<br>";
           this.device = device;
           return device.gatt.connect(); //Connect to HEG
       })
       .then(sleeper(100)).then(server => server.getPrimaryService(serviceUUID))
       .then(sleeper(100)).then(service => { 
         this.service = service;
         service.getCharacteristic(rxUUID).then(sleeper(100)).then(tx => {
           this.rxchar = tx;
           return tx.writeValue(this.encoder.encode("t")); // Send command to start HEG automatically (if not already started)
         });
         if(this.android == true){
           service.getCharacteristic(rxUUID).then(sleeper(1000)).then(tx => {
             return tx.writeValue(this.encoder.encode("o")); // Fast output mode for android
           });
         }
         return service.getCharacteristic(txUUID) // Get stream source
       })
       .then(sleeper(1100)).then(characteristic=>{
           this.txchar = characteristic;
           return characteristic.startNotifications(); // Subscribe to stream
       })
       .then(sleeper(100)).then(characteristic => {
           characteristic.addEventListener('characteristicvaluechanged',
                                           this.onNotificationCallback) //Update page with each notification
       }).then(sleeper(100)).then(this.onConnectedCallback())
       .catch(err => {console.error(err); this.onErrorCallback(err);});
       
       function sleeper(ms) {
           return function(x) {
               return new Promise(resolve => setTimeout(() => resolve(x), ms));
           };
       }
    }
 
    onNotificationCallback = (e) => { //Customize this with the UI (e.g. have it call the handleScore function)
      var val = this.decoder.decode(e.target.value);
      console.log("BLE MSG: ",val);
    }   
 
    onConnectedCallback = () => {
       //Use this to set up the front end UI once connected here
    }
 
    sendMessage = (msg) => {
      this.rxchar.writeValue(this.encoder.encode(msg));
    }
 
    //Async solution fix for slower devices (android). This is slower than the other method on PC. Credit Dovydas Stirpeika
    async connectAsync() {
         this.device = await navigator.bluetooth.requestDevice({
             filters: [{ namePrefix: 'HEG' }],
             optionalServices: [this.serviceUUID]
         });
 
         console.log("BLE Device: ", this.device);
         
         const btServer = await this.device.gatt?.connect();
         if (!btServer) throw 'no connection';
         this.device.addEventListener('gattserverdisconnected', onDisconnected);
         
         this.server = btServer;
         
         const service = await this.server.getPrimaryService(this.serviceUUID);
         
         // Send command to start HEG automatically (if not already started)
         const tx = await service.getCharacteristic(this.rxUUID);
         await tx.writeValue(this.encoder.encode("t"));
 
         if(this.android == true){
           await tx.writeValue(this.encoder.encode("o"));
         }
         
         this.characteristic = await service.getCharacteristic(this.txUUID);
          this.onConnectedCallback();
         return true;
     }
 
     disconnect = () => {this.server?.disconnect(); this.onDisconnectedCallback()};
 
     onDisconnectedCallback = () => {
       console.log("BLE device disconnected!");
     }
 
     async readDeviceAsync () {
         if (!this.characteristic) {
             console.log("HEG not connected");
             throw "error";
         }
 
         // await this.characteristic.startNotifications();
         this.doReadHeg = true;
         
         var data = ""
         while (this.doReadHeg) {
             const val = this.decoder.decode(await this.characteristic.readValue());
             if (val !== this.data) {
                 data = val;
                 console.log(data);
                 //data = data[data.length - 1];
                 //const arr = data.replace(/[\n\r]+/g, '')
                 this.n += 1;
                 this.onReadAsyncCallback(data);
             }
         }
     }
 
     onReadAsyncCallback = (data) => {
       console.log("BLE Data: ",data)
     }
 
     stopReadAsync = () => {
         this.doReadHeg = false;
         tx.writeValue(this.encoder.encode("f"));
     }
 
     spsinterval = () => {
       setTimeout(() => {
         console.log("SPS", this.n + '');
         this.n = 0;
         this.spsinterval();
       }, 1000);
     }
 
     async initBLEasync() {
       await this.connectAsync();
       this.readDeviceasync();
       this.spsinterval();
     }
       
 }


 export class EventSourceUtil {
    constructor(hostUrl='http://192.168.4.1/events', onOpen=this.onOpen, onError=this.onError, onMsg=this.onMsg, customCallbacks=[]) { //Add custom callbacks like [{tag:'heg',callback:(e) => {console.log(e.data);}}]
        this.hostUrl = hostUrl;

        this.onOpen = onOpen;
        this.onError = onError;
        this.onMsg = onMsg;

        this.source = null;

        this.customCallbacks = customCallbacks;

        this.createEventListeners(hostUrl, custom);
        
    }

    onOpen = (e) => {
        console.log("Events Connected!", e.data);
    }

    onError = (e) => {
        console.log("event source error:", e.data);
        if (e.target.readyState !== EventSource.OPEN) {
            console.log("Events Disconnected");
        }
    }

    onMsg = (e) => {
        console.log("event source:", e.data);
    }

    open = () => {
        this.createEventListeners();
    }

    close = () => {
        this.removeEventListeners();
    }

    createEventListeners(hostUrl=this.hostUrl, customCallbacks=this.customCallbacks, source=this.source){
        if(source !== null) {
            this.removeEventListeners(customCallbacks, source);
        }
        if(window.EventSource) {
            source = new EventSource(hostUrl);
            source.addEventListener('open', this.onOpen, false);
            source.addEventListener('error', this.onError, false);
            source.addEventListener('message', this.onMsg, false);
            if(customCallbacks.length > 0){
                customCallbacks.forEach((item,i) => {
                    source.addEventListener(item.tag, item.callback, false);
                })
            }
        }
    }

    removeEventListeners(customCallbacks=this.custom, source=this.source) {
        if (window.EventSource) {
            source.close();
            source.removeEventListener('open', this.openEvent, false);
            source.removeEventListener('error', this.errorEvent, false);
            source.removeEventListener('message', this.messageEvent, false);
            if(customCallbacks.length > 0){
                customCallbacks.forEach((item,i) => {
                    source.removeEventListener(item.tag, item.callback, false);
                });
            }
            source = null;
        }
    }

    //create a function to post to URLS with optional data, usernames, and passwords
    newPostFunction(name="post",url=this.hostUrl,data=undefined,user=undefined,pass=undefined) {
        const newPostFunction = () => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true, user, pass);
            xhr.send(data); //Accepts: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>
            xhr.onerror = function() { xhr.abort(); };
        }
        this[name] = newPostFunction;

        return newPostFunction;
    }
}

//Utils developed by Diego Schmaedech (MIT License) for chrome. Modified/Generalized and updated for web Serial by Joshua Brewster (MIT License) 
export class webSerial {
    constructor(defaultUI=false, parentId='serialmenu', streamMonitorId="serialmonitor") {
        this.displayPorts = [];
        this.defaultUI = defaultUI;

        this.encodedBuffer = "";
        this.connectionId = -1;

        this.recordData = false;
        this.recorded = [];

        this.port = null;
        this.decoder = null;
        this.subscribed = false;
        this.reader = null;
        this.writer = null;

        this.monitoring = false;
        this.newSamples = 0;
        this.monitorSamples = 10000; //Max 10000 samples visible in stream monitor by default
        this.monitorData = [];
        this.monitorIdx = 0;

        if (chrome.serial) {
            if(defaultUI === true) {
                this.setupSelect(parentId,false);
            }
            this.setupSerial();
        }
        else if (navigator.serial) {
            this.decoder = new TextDecoder();
            if(defaultUI === true) {
                this.setupSelect(parentId,true);
            }
        }  
        else {
            console.log("ERROR: Cannot locate navigator.serial. Enable #experimental-web-platform-features in chrome://flags");
            alert("Serial support not found. Enable #experimental-web-platform-features in chrome://flags or use a chrome extension")
        }
        
    }

    setupSelect(parentId, useAsync = true) {
        if(chrome.serial){
            var displayOptions = document.createElement('select'); //Element ready to be appended
            displayOptions.setAttribute('id','serialports')
            var frag = document.createDocumentFragment();
            frag.appendChild(displayOptions);
            document.getElementById(parentId).innerHTML = '<button id="refreshSerial">Get</button><button id="connectSerial">Set</button>';
            document.getElementById(parentId).appendChild(frag);
            document.getElementById('connectSerial').onclick = () => {
                if(useAsync) {
                    this.setupSerialAsync();
                }
                else {
                    if(this.connectionId !== -1 ) {this.connectSelected(false)}; // Disconnect previous
                    this.connectSelected(true, document.getElementById('serialports').value); 
                }
            }
        }
        else if(navigator.serial){
            var frag = document.createDocumentFragment();
            document.getElementById(parentId).innerHTML = '<button id="refreshSerial">Set USB Device</button>';
            document.getElementById(parentId).appendChild(frag);
        }
            document.getElementById('refreshSerial').onclick = () => {
                if(useAsync){
                    this.setupSerialAsync();
                }
                else {
                    this.setupSerial();
                }
        }
      
    }

    setupMonitor(parentId) {

        if(this.monitorData.length > this.monitorSamples){ 
            this.monitorData.splice(0, this.monitorData.length - this.monitorSamples);
        }

        var div = document.createElement('div');
        div.setAttribute('id','streamMonitor');
        this.monitorData.forEach((item,idx)=>{
            div.innerHTML += '<div id='+this.monitorIdx+'>'+item+'</div>';
            this.monitorIdx++;
        });
        this.newSamples = 0;
        var frag = document.createDocumentFragment();
        frag.appendChild(div);
        
        document.getElementById(parentId).appendChild(frag);

        var monitorAnim = () => {
            if(this.newSamples > 0){
                if(this.monitorData.length > this.monitorSamples){ 
                    //Remove old samples if over the limit
                    for(var i = this.monitorIdx - this.monitorSamples - (this.monitorData.length - this.monitorSamples); i > this.monitorIdx - this.monitorSamples; i++){
                        document.getElementById(i).remove();
                    }
                    this.monitorData.splice(0, this.monitorData.length - this.monitorSamples);
                }
                //Load new samples
                for(var i = 0; i < newSamples; i++) {
                    var newdiv = document.createElement('div');
                    newdiv.innerHTML = '<div id="'+this.monitorIdx+'">'+this.monitorData[this.monitorData.length - 1 - i]+'</div>';
                    var frag = document.createDocumentFragment();
                    frag.appendChild(newdiv);        
                    document.getElementById(parentId).appendChild(frag);
                    this.monitorIdx++;

                    var elem = document.getElementById('streamMonitor');
                    elem.scrollTop = elem.scrollHeight;
                }
                setTimeout(requestAnimationFrame(monitorAnim),15);
            }
        }
        requestAnimationFrame(monitorAnim);
    }

    onGetDevices = (ports) => { //leftover from chrome.serial
        document.getElementById('serialports').innerHTML = '';
        var paths = [];
        for (var i = 0; i < ports.length; i++) {
            console.log(ports[i].path);
        }
        ports.forEach((port) => {
            var displayName = port["displayName"] + "(" + port.path + ")";
            console.log("displayName " + displayName);
            if (!displayName)
                displayName = port.path;  
            paths.push({'option':displayName, 'value':port.path});
            console.log(this.defaultUI);
            if(this.defaultUI == true) {
                var newOption = document.createElement("option");
                newOption.text = displayName;
                newOption.value = port.path;
                console.log('option', newOption);
                document.getElementById('serialports').appendChild(newOption);
            }
        });
        this.displayPorts = paths;
    }

    onReceive = (receiveInfo) => {
        //console.log("onReceive");
        if (receiveInfo.connectionId !== this.connectionId) {
            console.log("ERR: Receive ID:", receiveInfo.connectionId);
            return;
        }
        var bufView = new Uint8Array(receiveInfo.data);
        var encodedString = String.fromCharCode.apply(null, bufView);

        this.encodedBuffer += decodeURIComponent(escape(encodedString));
        console.log(this.encodedBuffer.length);
        

        var index;
        while ((index = this.encodedBuffer.indexOf('\n')) >= 0) {
            var line = this.encodedBuffer.substr(0, index + 1);
            if(this.recordData == true) {
                this.recorded.push(line);
            }
            if(this.monitoring = true){
                this.newSamples++;
                this.monitorData.push(line);
            }
            this.onReadLine(line);
            this.encodedBuffer = this.encodedBuffer.substr(index + 1);
        }
    }

    onReceiveError(errorInfo) {
        console.log("onReceiveError");
        if (errorInfo.connectionId === this.connectionId) {
            console.log("Error from ID:", errorInfo.connectionId)
            this.onError.dispatch(errorInfo.error);
            console.log("Error: " + errorInfo.error);
        }
    }

    onConnectedCallback() { //Customize this one for the front end integration after the device is successfully connected.
        console.log("USB device Ready!")
    }

    onDisconnectedCallback() {
        console.log("USB device disconnected!");
    }

    onConnectComplete = (connectionInfo) => {
        this.connectionId = connectionInfo.connectionId;
        console.log("Connected! ID:", this.connectionId);

        chrome.serial.onReceive.addListener(this.onReceive);
        chrome.serial.onReceiveError.addListener(this.onReceiveError);

        this.onConnectedCallback();
    }

    sendMessage(msg) {
        msg+="\n";
        var encodedString = unescape(encodeURIComponent(msg));
        var bytes = new Uint8Array(encodedString.length);
        for (var i = 0; i < encodedString.length; ++i) {
            bytes[i] = encodedString.charCodeAt(i);
        }
        if (chrome.serial) {
            if (this.connectionId > -1) {
                
                chrome.serial.send(this.connectionId, bytes.buffer, this.onSendCallback);
                console.log("Send message:", msg);
            } else {
                console.log("Device is disconnected!");
            }
        }
        else if (navigator.serial) {
            if(this.port.writable){
                this.sendMessageAsync(bytes.buffer);
            }
        }
    }

    onSendCallback(sendInfo) {
        console.log("sendInfo", sendInfo);
    }

    onReadLine(line) {
        console.log(line);
    }

    connectSelected(connect=true, devicePath='') { //Set connect to false to disconnect  
        if ((connect == true) && (devicePath !== '')) {
            console.log("Connecting", devicePath);
            chrome.serial.connect(devicePath, {bitrate: 115200}, this.onConnectComplete);
        } else {
            console.log("Disconnect" + devicePath);
            if (this.connectionId < 0) {
                console.log("connectionId", this.connectionId);
                return;
            }
            this.encodedBuffer = "";
            chrome.serial.onReceive.removeListener(this.onReceive);
            chrome.serial.onReceiveError.removeListener(this.onReceiveError);
            chrome.serial.flush(this.connectionId, function () {
                console.log("chrome.serial.flush", this.connectionId);
            });
            chrome.serial.disconnect(this.connectionId, function () {
                console.log("chrome.serial.disconnect", this.connectionId);
            });
        }
    }

    setupSerial() {
        chrome.serial.getDevices(this.onGetDevices);
    }

    async sendMessageAsync(msg) {
        const writer = this.port.writable.getWriter();
        await writer.write(msg);
        writer.releaseLock();
    }

    async onPortSelected(port) {
        try {await port.open({ baudRate: 115200, bufferSize: 1000 }); }
        catch (err) { await port.open({ baudrate: 115200, buffersize: 1000 }); }
        this.onConnectedCallback();
        this.subscribed = true;
        this.subscribe(port);
    }

    onReceiveAsync(value) {
        this.encodedBuffer += this.decoder.decode(value);
        var index;
        while ((index = this.encodedBuffer.indexOf('\n')) >= 0) {
            var line = this.encodedBuffer.substr(0, index + 1);
            if(this.recordData == true) {
                this.recorded.push(line);
            }
            if(this.monitoring = true){
                this.newSamples++;
                this.monitorData.push(line);
            }
            this.onReadLine(line);
            this.encodedBuffer = this.encodedBuffer.substr(index + 1);
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
							this.onReceiveAsync(value);
                            
					        if(this.subscribed === true) {
                                setTimeout(()=>{streamData();}, 33);
                            }
						}
						catch (err) {console.log(err)}
						//console.log("new Read");
						//console.log(this.decoder.decode(value));
					}
				} catch (error) {
					console.log(error);// TODO: Handle non-fatal read error.
                    if(error.includes('parity') || error.includes('overflow')) {
                        this.subscribed = false;
                        setTimeout(()=>{this.subscribe(port)},33); //try to resubscribe 
                    } else {
                        this.closePort();	
                    }
                }
			}
			streamData();
		}
	}

	async closePort(port=this.port) {
		//if(this.reader) {this.reader.releaseLock();}
		if(this.port){
			this.subscribed = false;
			setTimeout(async () => {
				if (this.reader) {
                    await this.reader.releaseLock();
					this.reader = null;
				}
				await port.close();
				this.port = null;
				this.connected = false;
				this.onDisconnectedCallback();
			}, 100);
		}
	}

    async setupSerialAsync() {

        const filters = [
            { usbVendorId: 0x10c4, usbProductId: 0x0043 } //CP2102 filter
        ];

        
        this.port = await navigator.serial.requestPort();
        navigator.serial.addEventListener("disconnect",(e) => {
            this.closePort();
        })
        this.onPortSelected(this.port);
        
    }

    saveCsv(data=this.recorded, name=new Date().toISOString(),delimiter="|",header="Header\n"){
        var csvDat = header;
        data.forEach((line) => {
            csvDat += line.split(delimiter).join(",")+"\n";
        });

        var hiddenElement = document.createElement('a');
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvDat);
        hiddenElement.target = "_blank";
        if(name !== ""){
            hiddenElement.download = name+".csv";
        }
        else{
            hiddenElement.download = new Date().toISOString()+".csv";
        }
        hiddenElement.click();
    }

    openFile(delimiter=",") {
        var input = document.createElement('input');
        input.type = 'file';
    
        input.onchange = e => {
        this.csvDat = [];
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = event => {
          var tempcsvData = event.target.result;
          var tempcsvArr = tempcsvData.split("\n");
          tempcsvArr.pop();
          tempcsvArr.forEach((row,i) => {
            if(i==0){ var temp = row.split(delimiter); }
            else{
              var temp = row.split(delimiter);
              this.csvDat.push(temp);
            }
          });
          this.onOpen();
         }
         input.value = '';
        }
        input.click();
    } 

    onOpen() { // Customize this function in your init script, access data with ex. console.log(serialMonitor.csvDat), where var serialMonitor = new chromeSerial(defaultUI=false)
        alert("CSV Opened!");
    }
}
