
// Garrett Flynn, Apache 2.0 License
import 'regenerator-runtime/runtime' //For async functions on node\\

/** @module neosensory 
 * @description A JavaScript SDK to help streamline controlling Neosensory devices over Bluetooth Low Energy.
 * 
*/

export class Buzz {

    /** @constructor 
     * @alias module:neosensory.Buzz 
     * @description A class to manage connections to the Neosensory Buzz
     * @param {callback} ondata Callback function to handle app logic
    */
    constructor(ondata = () => { }) {

        this.interface = null;

        this.minIntensity = 15;
        this.maxIntensity = 255;

        this.interface = new BuzzBLE();
        this.interface.onNotificationCallback = (e) => {
            ondata(e);
        }

        let disconnectOnRefresh = () => {
            this.disconnect()
            window.removeEventListener('beforeunload', disconnectOnRefresh)
        }
        window.addEventListener('beforeunload', disconnectOnRefresh)
    }

    /**
     * @method module:neosensory.Buzz.sendCommand
     * @alias sendCommand
     * @description A function to encode command strings and send to the device
     * @params {string} Command to send to the device
     */
    sendCommand = (command='') => {
        // return new Promise(async (resolve, reject) => {
            this.interface.sendMessage(command);
        // })
    }

    /**
     * @method module:neosensory.Buzz.requestAuthorization
     * @alias requestAuthorization
     * @description Request developer authorization (https://neosensory.com/legal/dev-terms-service)
     */
    requestAuthorization = () => {
        this.sendCommand('auth as developer\n')
    }

    /**
     * @method module:neosensory.Buzz.acceptTerms
     * @alias acceptTerms
     * @description Accept developer terms of the Neosensory Developer API License (https://neosensory.com/legal/dev-terms-service) after calling [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization}. Successfully calling
     * this unlocks the following commands: audio start, audio stop, motors_clear_queue, motors start,
     * motors_stop, motors vibrate.
     */

    acceptTerms = () => {
        this.sendCommand('accept\n')
        this.pauseDeviceAlgorithm()
    }

    /**
     * @method module:neosensory.Buzz.pauseDeviceAlgorithm
     * @alias pauseDeviceAlgorithm
     * @description Pause the default Neosensory algorithm on the device to accept developer commands. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */
    pauseDeviceAlgorithm = () => {
        this.stopAudio()
        this.enableMotors()
        this.clearMotorQueue()
    }

    /**
     * @method module:neosensory.Buzz.resumeDeviceAlgorithm
     * @alias resumeDeviceAlgorithm
     * @description Restart the default Neosensory algorithm. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */
    resumeDeviceAlgorithm = () => {
        this.startAudio()
    }

    /**
     * @method module:neosensory.Buzz.battery
     * @alias battery
     * @description Request the current battery level from the device.
     */
    battery = () => {
        this.sendCommand('device battery_soc\n')
    }

    /**
     * @method module:neosensory.Buzz.info
     * @alias info
     * @description Obtain device and firmware information.
     */
    info = () => {
        this.sendCommand('device info\n')
    }

    /**
     * @method module:neosensory.Buzz.connect
     * @alias connect
     * @description Setup BLE interface.
     */

    connect = async () => {
        let res = await this.interface.connect();
        return res
    }

    /**
     * @method module:neosensory.Buzz.disconnect
     * @alias disconnect
     * @description Disconnect the device.
     */
    disconnect = () =>  {
        this.interface.disconnect();
    }


    /**
     * @method module:neosensory.Buzz.startAudio
     * @alias startAudio
     * @description Starts the device’s microphone audio acquisition. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */
    startAudio = () => {
        this.sendCommand('audio start\n')
    }

    /**
     * @method module:neosensory.Buzz.stopAudio
     * @alias stopAudio
     * @description Stops the device’s microphone audio acquisition. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */
    stopAudio = () => {
        this.sendCommand('audio stop\n')
    }

    /**
     * @method module:neosensory.Buzz.clearMotorQueue
     * @alias clearMotorQueue
     * @description Clear any vibration commands sitting the device’s motor FIFO queue. This should be called prior
     * to streaming control frames using [vibrateMotors]{@link module:neosensory.Buzz.vibrateMotors}. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    clearMotorQueue = () => {
        this.sendCommand('motors clear_queue\n')
    }

    /**
     * @method module:neosensory.Buzz.enableMotors
     * @alias enableMotors
     * @description Initialize and start the motors interface. The motors can then accept motors vibrate commands. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    enableMotors = () => {
        this.sendCommand('motors start\n')
    }

    /**
     * @method module:neosensory.Buzz.disableMotors
     * @alias disableMotors
     * @description Clear the motors command queue and shut down the motor drivers. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    disableMotors = () => {
        this.sendCommand('motors stop\n')
    }

    /**
     * @method module:neosensory.Buzz.vibrateMotors
     * @alias vibrateMotors
     * @description Set the actuators amplitudes on a connected Neosensory device. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
    * @param {array} controlFrames Nested arrays with a length matching the number of motors of the target device (Buzz: 4). Element values should between 0 and 255. 
    * @example buzz.vibrateMotors([[155,0,0,0]])
     */
    vibrateMotors = (controlFrames) => {
        let base64String = btoa(String.fromCharCode(...new Uint8Array(controlFrames.flat())));
        this.sendCommand(`motors vibrate ${base64String}\n`)
    }

    /**
     * @method module:neosensory.Buzz.setThreshold
     * @alias setThreshold
     * @description Configure how the device responds to the [vibrateMotors()]{@link module:neosensory.Buzz.vibrateMotors} command. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
    * @param {string} feedbackType Integer between 0-2. 0 = Default; 1 = Always Respond; 2 = Threshold Response.
    * @param {float} threshold Float between 0 - 64.
     */

    setThreshold = (feedbackType, threshold = '') => {
        if (feedbackType == 'default') feedbackType = 0
        if (feedbackType == 'always') feedbackType = 1
        if (feedbackType == 'threshold') feedbackType = 2

        this.sendCommand(`motors config_threshold ${feedbackType} ${threshold}\n`)
    }

    /**
 * @method module:neosensory.Buzz.getThreshold
 * @alias getThreshold
 * @description Return the current [vibrateMotors()]{@link module:neosensory.Buzz.vibrateMotors} command queue configuration. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
 */

    getThreshold = () => {
        this.sendCommand(`motors get_threshold\n`)
    }

    /**
     * @method module:neosensory.Buzz.setLRA
     * @alias setLRA
     * @description This command sets the LRA operation mode. This setting is not persistent, and will reset to the default (open loop) if the band is reset. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    setLRA = (mode) => {
        if (mode == 'open') mode = 0
        if (mode == 'closed') mode = 1

        this.sendCommand(`motors config_lra_mode ${mode}\n`)

    }

    /**
     * @method module:neosensory.Buzz.getLRA
     * @alias getLRA
     * @description This command allows you to read the current LRA vibration mode. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    getLRA = () => {
        this.sendCommand(`motors get_lra_mode ${mode}\n`)
    }

    /**
     * @method module:neosensory.Buzz.getLEDs
     * @alias getLEDs
     * @description Read the current RGB and intensity calues of the device's LEDs. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     */

    getLEDs = () => {
        this.sendCommand('leds get\n')
    }

    /**
     * @method module:neosensory.Buzz.setLEDs
     * @alias setLEDs
     * @description Control the color and intensity of the device's 3 LEDs. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     * @param {array} colors Three nested arrays each containing the rgb values (0-255) for an LED.
     * @param {array} intensities An array of length 3 containing the LED intensity (0-50).
     * @example buzz.setLEDS([[255,0,0],[0,255,0],[0,0,255]],[50,50,50])
     */

    setLEDs = (colors = [], intensities = []) => {

        let rgbToHex = (r, g, b) => {
            return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        colors = colors.map(c => c = rgbToHex(...c))
        this.sendCommand(`leds set ${colors.join(' ')} ${intensities.map(i => i * 50).join(' ')}\n`)
    }

        /**
     * @method module:neosensory.Buzz.setButton
     * @alias setButton
     * @description Set button response and sensitivity. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
     * @param {boolean} feedback Allow the device to send a response when any button is pressed.
     * @param {boolean} sensitivity Allow sensitivity changes to the microphone.
     */
    setButton = (feedback, sensitivity) => {
        if (feedback == true || feedback == 'true') feedback = 1
        if (feedback == false || feedback == 'false') feedback = 0
        if (sensitivity == true || sensitivity == 'true') sensitivity = 1
        if (sensitivity == false || sensitivity == 'false') sensitivity = 0

        this.sendCommand(`set_buttons_response ${feedback} ${sensitivity}\n`)
    }

    // Advanced Methods
    /**
     * @method module:neosensory.Buzz.getIllusionActivations
     * @alias getIllusionActivations
     * @description Get activations. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
    * @param {float} linearIntensity Between 0-1 
    * @param {float} location Between 0-1 
     */
    
    getIllusionActivations(linearIntensity, location){
        let motorIntensity = this.getMotorIntensity(linearIntensity, this.minIntensity, this.maxIntensity);
        let motor1 = Math.floor(location / .25)
        let motor2 = Math.ceil(location / .25)
        let ratio = 4*(location%0.25)
        let values = Array(4).fill(0)
        values[motor1] = 255*motorIntensity*Math.sqrt((1 - ratio))
        values[motor2] = 255*motorIntensity*Math.sqrt(ratio)
        return values
    }

    /**
     * @method module:neosensory.Buzz.getMotorIntensity
     * @alias getMotorIntensity
     * @description Get motor intensity. Requires users to [requestAuthorization()]{@link module:neosensory.Buzz.requestAuthorization} and [acceptTerms()]{@link module:neosensory.Buzz.acceptTerms}.
    * @param {float} linearIntensity Between 0-1 
    * @param {float} minIntensity Between 0-255
    * @param {float} maxIntensity Between 0-255
     */
    
    getMotorIntensity(linearIntensity, minIntensity, maxIntensity){
        if (linearIntensity <= 0) return minIntensity
        if (linearIntensity >= 1) return maxIntensity
        return Math.expm1(linearIntensity) / (Math.E - 1) * (maxIntensity - minIntensity) + minIntensity;
    }

    mapFrequencies(fft){
        function indexOfMax(arr) {
            if (arr.length === 0) {
                return -1;
            }
        
            var max = arr[0];
            var maxIndex = 0;
        
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] > max) {
                    maxIndex = i;
                    max = arr[i];
                }
            }
        
            return maxIndex;
        }

        // Store running mean
        let i = indexOfMax(fft)
        let location = i/fft.length
        return this.getIllusionActivations(1,location)
    }
}

export class BuzzBLE { //This is formatted for the way the Neosensory Buzz sends/receives information. Other BLE devices will likely need changes to this to be interactive.
    constructor(
        serviceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e', rxUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e', txUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
        // serviceUUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', rxUUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', txUUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E', async = false 
    ) {
        this.serviceUUID = serviceUUID;
        this.rxUUID = rxUUID; //characteristic that can receive input from this device
        this.txUUID = txUUID; //characteristic that can transmit input to this device
        this.encoder = new TextEncoder("utf-8");
        this.decoder = new TextDecoder("utf-8");

        this.device = null;
        this.server = null;
        this.service = null;
        this.rxchar = null; //receiver on the BLE device (write to this)
        this.txchar = null; //transmitter on the BLE device (read from this)

        this.queue = []
        this.readBuffer = []

        this.android = navigator.userAgent.toLowerCase().indexOf("android") > -1; //Use fast mode on android (lower MTU throughput)

        this.n; //nsamples  
    }


    //Typical web BLE calls
    connect = async (serviceUUID = this.serviceUUID, rxUUID = this.rxUUID, txUUID = this.txUUID) => { //Must be run by button press or user-initiated call
        return await navigator.bluetooth.requestDevice({
            filters: [
                { services: [serviceUUID] },
                { namePrefix: 'Buzz' }
            ],
            optionalServices: [serviceUUID]
        })
            .then(async device => {
                this.device = device;
                this.server = await this.device.gatt.connect()
                this.service = await this.server.getPrimaryService(serviceUUID);
                this.rxchar = await this.service.getCharacteristic(rxUUID);
                this.txchar = await this.service.getCharacteristic(txUUID) // Get stream source
                this.txchar.startNotifications().then(() => { this.txchar.addEventListener('characteristicvaluechanged', this._onNotificationCallback) }); // Subscribe to stream
                this.onConnectedCallback()
                return this.device
            })
            .catch(err => { console.error(err); this.onErrorCallback(err); });
    }

    onNotificationCallback = (e) => { } // Defined by user

    _onNotificationCallback = (e) => { // Ensure that there is no GATT write overlap
        
        let res = this.decoder.decode(e.target.value)
        let completed = this.parseResponse(res)
        let noQueueItem = 'motor queue full'
        if (completed && (completed.data != null || !completed.message.includes(noQueueItem))){ // Only run on completed responses
            let lastItem = this.queue.shift()
            if (lastItem){
                lastItem.callback()

                if (this.queue.length !== 0){
                    let nextItem = this.queue.slice(0,1)[0]
                    this.writeValue(nextItem.msg);
                }
            } else {
                // console.log(completed.command)
            }

            this.onNotificationCallback(completed)
        } else {
            if (completed && completed?.message?.includes(noQueueItem)) console.log(noQueueItem)
        }
    }

    writeValue = (val) => {
        return new Promise(resolve => {
            this.rxchar.writeValue(this.encoder.encode(val))
            resolve()
            setTimeout(()=>{resolve()}, 50) // Throttle Write Commands
        });
    }


    /**
     * @method module:neosensory.Buzz.parseResponse
     * @alias parseResponse
     * @description Parse JSON response from the device.
     * @param {utf8} response UTF-8 byte array.
     */

    parseResponse = (response) =>  {
        let complete = false
        if (response.indexOf("{") != -1 && this.readBuffer.length == 0) {
            this.lastCommand = response.slice(0, response.indexOf("{"))
            if (response.lastIndexOf("}") != -1) {
                this.readBuffer.push(response.substring(
                    response.indexOf("{"),
                    response.lastIndexOf("}") + 1,
                ))
                complete = true;
            } else {
                this.readBuffer.push(response.substring(response.indexOf("{")))
            }
        } else {
            if (response.lastIndexOf("}") != -1) {
                this.readBuffer.push(response.substring(
                    0,
                    response.lastIndexOf("}") + 1,
                ))
                complete = true;
            } else if (this.readBuffer.length != 0) {
                this.readBuffer.push(response)
            }
        }

        if (complete) {
            let joinedBuffer = this.readBuffer.join('')
            this.readBuffer = []
            response = JSON.parse(joinedBuffer)
            response.command = this.lastCommand
            this.readBuffer = []
            return response
        }
    }

    onConnectedCallback = () => { }
    onErrorCallback = () => { }

    sendMessage = (msg,callback=()=>{}) => {
        if (msg[msg.length - 2] != '\n') msg += '\n'
        let noResponseExpected = 'motors vibrate'
        if (!msg.includes(noResponseExpected)) this.queue.push({msg,callback})
        if (this.queue.length <= 1 || msg.includes(noResponseExpected)) {
            this.writeValue(msg);
        }

    }

    disconnect = () => { 
        this.queue = []
        setTimeout(() => {this.sendMessage('audio start\n', () => {this.device.gatt.disconnect();this.onDisconnectedCallback()})}, 50) // Resume device algorithm
    };

    onDisconnectedCallback = () => { }
}