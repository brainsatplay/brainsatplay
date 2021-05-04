// Garrett Flynn, MIT License

export class Buzz {
    constructor(ondata=(newline)=>{},onconnect=()=>{},ondisconnect=()=>{}) {

        this.interface = null;
        this.setupDevice(ondata,onconnect,ondisconnect);
    }


    setupDevice(ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {
        this.interface = new BuzzBLE();
        this.interface.onConnectedCallback = onconnect;
        this.interface.onDisconnectedCallback = ondisconnect;
        this.interface.onNotificationCallback = (e) => {
            var line = this.interface.decoder.decode(e.target.value);
            ondata(line);
        }
    }

    // Generic Command Function
    sendCommand(command='') {
        this.interface.sendMessage(command);
    }

    // Specific Buzz Commands
    requestDeveloperAuthorization(acceptTerms = false){
        this.sendCommand('auth as developer')
        if (acceptTerms){
            this.acceptDeveloperTerms()
        }
    }

    acceptDeveloperTerms(){
        this.sendCommand('accept')
    }

    battery(){
        this.sendCommand('device battery_soc')
    }

    info(){
        this.sendCommand('device info')
    }

    connect() {
        this.interface.connect();

        this.audio = {
            start: () => {
                this.sendCommand('audio start')
            }, 
            stop: () => {
                this.sendCommand('audio stop')
            }
        }

        this.motors = {
            clear: () => {
                this.sendCommand('motors clear_queue')
            },
            start: () => {
                this.sendCommand('motors start')
            },
            stop: () => {
                this.sendCommand('motors stop')
            },
            vibrate: (controlFrames) => {
                this.sendCommand(`motors vibrate ${controlFrames}`)
            },
            threshold: {
                set: (feedbackType,threshold='') => {
                if (feedbackType == 'default') feedbackType = 0
                if (feedbackType == 'always') feedbackType = 1
                if (feedbackType == 'threshold') feedbackType = 2

                this.sendCommand(`motors config_threshold ${feedbackType} ${threshold}`)
                }, 
                get: () => {
                    this.sendCommand(`motors get_threshold `)
                }
            },
            configThreshold: (feedbackType,threshold='') => {
                if (feedbackType == 'default') feedbackType = 0
                if (feedbackType == 'always') feedbackType = 1
                if (feedbackType == 'threshold') feedbackType = 2

                this.sendCommand(`motors config_threshold ${feedbackType} ${threshold}`)
            },
            lra: {
                set: (mode) => {
                    if (mode == 'open') mode = 0
                    if (mode == 'closed') mode = 1

                    this.sendCommand(`motors config_lra_mode ${mode}`)

                }, 
                get: () => {
                    this.sendCommand(`motors get_lra_mode ${mode}`)
                }
            }
        }

        this.leds = {
            get: () => {
                this.sendCommand('leds get')

                // let hexToRgb = (hex) => {
                //     let shorthandRegex = /^0x?([a-f\d])([a-f\d])([a-f\d])$/i;
                //     hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                //       return r + r + g + g + b + b;
                //     });
                //     let result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                //     return result ? {
                //       r: parseInt(result[1], 16),
                //       g: parseInt(result[2], 16),
                //       b: parseInt(result[3], 16)
                //     } : null;
                //   }
            },
            set: (colors=[],intensities=[]) => {

                let rgbToHex = (r, g, b) => {
                    return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                  }

                this.sendCommand(`leds set ${rgbToHex(...colors).join(' ')} ${intensities.map(i => i*50).join(' ')}`)
            },
        }

        this.button = {
            set: (feedback, sensitivity) => {
                if (feedback == true || feedback == 'true') feedback = 1
                if (feedback == false || feedback == 'false') feedback = 0
                if (sensitivity == true || sensitivity == 'true') sensitivity = 1
                if (sensitivity == false || sensitivity == 'false') sensitivity = 0

                this.sendCommand(`set_buttons_response ${feedback} ${sensitivity}`)
            }
        }
    }

    disconnect() {
        this.interface.disconnect();

        delete this.audio
        delete this.motors
        delete this.leds

    }
}

export class BuzzBLE { //This is formatted for the way the Neosensory Buzz sends/receives information. Other BLE devices will likely need changes to this to be interactive.
    constructor(serviceUUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', rxUUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', txUUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E', async = false ){
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

     this.async = async;
 
     this.android = navigator.userAgent.toLowerCase().indexOf("android") > -1; //Use fast mode on android (lower MTU throughput)
 
     this.n; //nsamples  
    }

 
    //Typical web BLE calls
    connect = (serviceUUID = this.serviceUUID, rxUUID = this.rxUUID, txUUID = this.txUUID) => { //Must be run by button press or user-initiated call
     navigator.bluetooth.requestDevice({   
       acceptAllDevices: true,
       optionalServices: [serviceUUID] 
       })
       .then(device => {
           this.device = device;
           return device.gatt.connect(); //Connect to Buzz
       })
       .then(sleeper(100)).then(server => server.getPrimaryService(serviceUUID))
       .then(sleeper(100)).then(service => { 
         this.service = service;
         service.getCharacteristic(rxUUID).then(sleeper(100)).then(tx => {
           this.rxchar = tx;
           return true // tx.writeValue(this.encoder.encode("t")); // Send command to start HEG automatically (if not already started)
         });
         if(this.android == true){
           service.getCharacteristic(rxUUID).then(sleeper(1000)).then(tx => {
             return true // tx.writeValue(this.encoder.encode("o")); // Fast output mode for android
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
 
    onNotificationCallback = (e) => { //Customize this with the UI
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
             filters: [{ namePrefix: 'Buzz' }],
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
        //  await truetx.writeValue(this.encoder.encode("t"));
 
        //  if(this.android == true){
        //    await tx.writeValue(this.encoder.encode("o"));
        //  }
         
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
             console.log("Buzz not connected");
             throw "error";
         }
 
         // await this.characteristic.startNotifications();
         this.doReadBuzz = true;
         
         var data = ""
         while (this.doReadBuzz) {
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
         this.doReadBuzz = false;
        //  tx.writeValue(this.encoder.encode("f"));
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