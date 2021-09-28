import { StateManager } from '../../ui/StateManager'

export class Buzz{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session

        this.props = {
            state: new StateManager(),
            deviceSubscriptions: {},
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            },
            device: null
        }

        this.ports = {
            motors: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => { 
                    console.log(this.props.device)
                    if (this.props.device){   
                        // Check User Requests
                        if (user.data == true && user.meta.username === this.session.info.auth.id){ // Run if you
                            let motorCommand = [this.ports.motor1.data,this.ports.motor2.data,this.ports.motor3.data,this.ports.motor4.data]
                            this.props.device.vibrateMotors([motorCommand,[0,0,0,0]])
                        }
                    }
                }

            },
            leds: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (this.props.device){
            
                        // Check User Requests
                        let c1 = [0,0,0]
                        let c2 = [0,0,0]
                        let c3 = [0,0,0]
                        if (user.data == true){
                            c1 = this._hexToRgb(this.ports.led1color.data)
                            c2 = this._hexToRgb(this.ports.led2color.data)
                            c3 = this._hexToRgb(this.ports.led3color.data)
                        }
                        
                        let ledColors = [c1,c2,c3]
                        let ledIntensities = [this.ports.led1intensity.data,this.ports.led2intensity.data,this.ports.led3intensity.data]
                        ledIntensities = ledIntensities.map(i => Number.parseFloat(i))
                        this.props.device.setLEDs(ledColors, ledIntensities)
                    }
                }
            },
            audioToMotors: {
                input: {type: Array}, // FFT
                output: {type: null},
                onUpdate: (user) => {
                    if (this.props.device)this.props.device.vibrateMotors([this.props.device.mapFrequencies(user.data)])
                }
            },
            mapOnBand: {
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    if (this.props.device){
                        if (user.data != false){
                            let position = (user.data == true) ? this.ports.position.data : user.data
                            this.props.device.vibrateMotors([this.props.device.getIllusionActivations(position)])
                        } else {
                            this.props.device.vibrateMotors([0,0,0,0])
                        }
                    }
                }
            },
            fillLEDs: {
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    if (this.props.device){
            
                        let c1 = this._hexToRgb(this.ports.led1color.data)
                        let c2 = this._hexToRgb(this.ports.led2color.data)
                        let c3 = this._hexToRgb(this.ports.led3color.data)
                        
                        // Fills the Lights (Multi User)
                        let mean = user.data
            
                        let i1 = Math.min(mean/.33,1)
                        let i2 = (i1 === 1 ? Math.min((mean-.33)/.33,1) : 0)
                        let i3 = (i2 === 1 ? Math.min((mean-.66)/.33,1) : 0)
            
                        let ledColors = [c1,c2,c3]
                        let ledIntensities = [i1,i2,i3]
                        ledIntensities = ledIntensities.map(i => Number.parseFloat(i))
                        this.props.device.setLEDs(ledColors, ledIntensities)
                    }
                }
            },
            status: {
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return {data: (this.session.getDevice('buzz') != null), meta:{}}
                }
            },

            motor1: {data: 255, min:0, max: 255, step: 1.0, onUpdate: (user) => {this.ports.motor1.data = user.data; this.session.graph.runSafe(this, 'motors', {data: true, forceRun: true})}},
            motor2: {data: 255, min:0, max: 255, step: 1.0, onUpdate: (user) => {this.ports.motor2.data = user.data; this.session.graph.runSafe(this, 'motors', {data: true, forceRun: true})}},
            motor3: {data: 255, min:0, max: 255, step: 1.0, onUpdate: (user) => {this.ports.motor3.data = user.data; this.session.graph.runSafe(this, 'motors', {data: true, forceRun: true})}},
            motor4: {data: 255, min:0, max: 255, step: 1.0, onUpdate: (user) => {this.ports.motor4.data = user.data; this.session.graph.runSafe(this, 'motors', {data: true, forceRun: true})}},
            led1color: {data: `#00ff00`, input: {type: 'color'}, output: {type: 'color'}, onUpdate: (user) => {this.ports.led1color.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            led2color: {data: `#00ff00`, input: {type: 'color'}, output: {type: 'color'}, onUpdate: (user) => {this.ports.led2color.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            led3color: {data: `#00ff00`, input: {type: 'color'}, output: {type: 'color'}, onUpdate: (user) => {this.ports.led3color.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            led1intensity: {data: 0, min:0, max: 1, step: 0.01, onUpdate: (user) => {this.ports.led1intensity.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            led2intensity: {data: 0, min:0, max: 1, step: 0.01, onUpdate: (user) => {this.ports.led2intensity.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            led3intensity: {data: 0, min:0, max: 1, step: 0.01, onUpdate: (user) => {this.ports.led3intensity.data = user.data; this.session.graph.runSafe(this, 'leds', {data: true, forceRun: true})}},
            position: {data: 0, min: 0, max: 1, step: 0.01, onUpdate: (user) => {this.ports.position.data = user.data; this.session.graph.runSafe(this, 'mapOnBand', {data: true, forceRun: true})}},
        }

        let added = (k) => {
            this._subscribeToDevices(k,['buzz'])
            this.session.graph.runSafe(this,'status',{forceRun: true})
        }

        let removed = (k) => {
            if (k.includes('device')){
                // Update Internal Device State
                this.props.device = this.session.getDevice('buzz')
                if (this.props.device)  this.props.device = this.props.device.device
            }
            this.status()
        }

        this.props.toUnsubscribe['stateAdded'].push(this.session.state.subscribeSequential('stateAdded', added))
        this.props.toUnsubscribe['stateRemoved'].push(this.session.state.subscribeSequential('stateRemoved', removed))
    }

    init = () => {

        // Check if Buzz Exists
        this.props.device = this.session.getDevice('buzz')
        if (!this.props.device)  console.log('Must connect your Buzz first')
        else this.props.device = this.props.device.device.device
        this.session.graph.runSafe(this,'status',{forceRun: true})
    }

    deinit = () => {

    }

    
    _subscribeToDevices(k, nameArray=[]) {
        if (k.includes('device')){
            let deviceInfo = this.session.state.data[k]
            if (nameArray.includes(deviceInfo.deviceName)){
            this.props.device = this.session.getDevice(deviceInfo.deviceName).device.device
        }
        }
     }

    _hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : [0,0,0];
    }

}