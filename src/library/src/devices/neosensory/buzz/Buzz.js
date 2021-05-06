// Garrett Flynn, MIT License

export class Buzz {
    constructor(ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {

        this.interface = null;
        this.readBuffer = []
        this.setupDevice(ondata,onconnect,ondisconnect);
    }


    setupDevice(ondata=()=>{},onconnect=()=>{},ondisconnect=()=>{}) {
        this.interface = new BuzzBLE();
        this.interface.onConnectedCallback = onconnect;
        this.interface.onDisconnectedCallback = ondisconnect;
        this.interface.onNotificationCallback = (e) => {
            var msg = this.interface.decoder.decode(e.target.value);
            ondata(msg);
        }
    }

    // Generic Command Function
    sendCommand(command='') {
        this.interface.sendMessage(command);
    }

    // Specific Buzz Commands
    requestDeveloperAuthorization(acceptTerms = false){
        this.sendCommand('auth as developer\n')
        if (acceptTerms){
            this.acceptDeveloperTerms()
        }
    }

    acceptDeveloperTerms(){
        this.sendCommand('accept\n')
    }

    battery(){
        this.sendCommand('device battery_soc\n')
    }

    info(){
        this.sendCommand('device info\n')
    }

    connect() {
        this.interface.connect();
        console.log('connecting')

        this.audio = {
            start: () => {
                this.sendCommand('audio start\n')
            }, 
            stop: () => {
                this.sendCommand('audio stop\n')
            }
        }

        this.motors = {
            clear: () => {
                this.sendCommand('motors clear_queue\n')
            },
            start: () => {
                this.sendCommand('motors start\n')
            },
            stop: () => {
                this.sendCommand('motors stop\n')
            },
            vibrate: (controlFrames) => {
                let base64String = btoa(String.fromCharCode(...new Uint8Array(controlFrames.flat())));
                this.sendCommand(`motors vibrate ${base64String}\n`)
            },
            threshold: {
                set: (feedbackType,threshold='') => {
                if (feedbackType == 'default') feedbackType = 0
                if (feedbackType == 'always') feedbackType = 1
                if (feedbackType == 'threshold') feedbackType = 2

                this.sendCommand(`motors config_threshold ${feedbackType} ${threshold}\n`)
                }, 
                get: () => {
                    this.sendCommand(`motors get_threshold\n`)
                }
            },
            configThreshold: (feedbackType,threshold='') => {
                if (feedbackType == 'default') feedbackType = 0
                if (feedbackType == 'always') feedbackType = 1
                if (feedbackType == 'threshold') feedbackType = 2

                this.sendCommand(`motors config_threshold ${feedbackType} ${threshold}\n`)
            },
            lra: {
                set: (mode) => {
                    if (mode == 'open') mode = 0
                    if (mode == 'closed') mode = 1

                    this.sendCommand(`motors config_lra_mode ${mode}\n`)

                }, 
                get: () => {
                    this.sendCommand(`motors get_lra_mode ${mode}\n`)
                }
            }
        }

        this.leds = {
            get: () => {
                this.sendCommand('leds get\n')

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
                  colors = colors.map(c => c = rgbToHex(...c))
                this.sendCommand(`leds set ${colors.join(' ')} ${intensities.map(i => i*50).join(' ')}\n`)
            },
        }

        this.button = {
            set: (feedback, sensitivity) => {
                if (feedback == true || feedback == 'true') feedback = 1
                if (feedback == false || feedback == 'false') feedback = 0
                if (sensitivity == true || sensitivity == 'true') sensitivity = 1
                if (sensitivity == false || sensitivity == 'false') sensitivity = 0

                this.sendCommand(`set_buttons_response ${feedback} ${sensitivity}\n`)
            }
        }
    }

    parseResponse(response) {
        let complete = false
        if (response.indexOf("{") != -1 && this.readBuffer.length == 0){
            if (response.lastIndexOf("}") != -1){
                this.readBuffer.push(response.substring(
                    response.indexOf("{"),
                    response.lastIndexOf("}")+1, 
                ))
                complete = true;
            } else {
                this.readBuffer.push(response.substring(response.indexOf("{")))
            }
        } else {
            if (response.lastIndexOf("}") != -1){
                this.readBuffer.push(response.substring(
                    0,
                    response.lastIndexOf("}")+1, 
                ))
                complete = true;
            } else if ( this.readBuffer.length != 0 ){
                this.readBuffer.push(response)
            }
        }

        if (complete) {
            console.log(this.readBuffer)
            let joinedBuffer = this.readBuffer.join('')
            this.readBuffer = []
            console.log(joinedBuffer)
            response = JSON.parse(joinedBuffer)
            this.readBuffer = []
            return response
        }
    }

    disconnect() {
        this.interface.disconnect();
        console.log('disconnecting')
        delete this.audio
        delete this.motors
        delete this.leds

    }
}

export class BuzzBLE { //This is formatted for the way the Neosensory Buzz sends/receives information. Other BLE devices will likely need changes to this to be interactive.
    constructor(
        serviceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e', rxUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e', txUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
        // serviceUUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', rxUUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', txUUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E', async = false 
        ){
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

 
     this.android = navigator.userAgent.toLowerCase().indexOf("android") > -1; //Use fast mode on android (lower MTU throughput)
 
     this.n; //nsamples  
    }

 
    //Typical web BLE calls
    connect = (serviceUUID = this.serviceUUID, rxUUID = this.rxUUID, txUUID = this.txUUID) => { //Must be run by button press or user-initiated call
     navigator.bluetooth.requestDevice({   
        filters: [
            {services: [serviceUUID]},
            {namePrefix: 'Buzz'}
          ],
       optionalServices: [serviceUUID] 
       })
       .then(device => {
           this.device = device;
           return device.gatt.connect(); //Connect to Buzz
       })
       .then(sleeper(100)).then(server => server.getPrimaryService(serviceUUID))
       .then(sleeper(100)).then(service => { 
         this.service = service;
         service.getCharacteristic(rxUUID).then(sleeper(100)).then(characteristic => {
           this.rxchar = characteristic;
           return true // tx.writeValue(this.encoder.encode("t")); // Send command to start HEG automatically (if not already started)
         });
         return service.getCharacteristic(txUUID) // Get stream source
       })
       .then(sleeper(1100)).then(characteristic => {
           this.txchar = characteristic;
           return this.txchar.startNotifications().then(() => {
               console.log('notifications started')
               this.txchar.addEventListener('characteristicvaluechanged', this.onNotificationCallback) //Update page with each notification
           }); // Subscribe to stream
       })
       .then(sleeper(100)).then(this.onConnectedCallback())
       .catch(err => {console.error(err); this.onErrorCallback(err);});
       
       function sleeper(ms) {
           return function(x) {
               return new Promise(resolve => setTimeout(() => resolve(x), ms));
           };
       }
    }
 
    onNotificationCallback = (e) => {
        // Set one level up
    }   
 
    onConnectedCallback = () => {
       // Set one level up
    }
 
    sendMessage = (msg) => {
    if (msg[msg.length - 2] != '\n') msg += '\n'
    console.log(msg)
     let encoded = this.encoder.encode(msg)
      this.rxchar.writeValue(encoded);
    }
 
     disconnect = () => {this.server?.disconnect(); this.onDisconnectedCallback()};
 
     onDisconnectedCallback = () => {
        // Set one level up
    }
 }