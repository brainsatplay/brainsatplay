import { StateManager } from '../../ui/StateManager'

export class Buzz{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            device: null
        }

        this.props = {
            state: new StateManager(),
            deviceSubscriptions: {},
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            }
        }

        let added = (k) => {
            this._subscribeToDevices(k,['buzz'])
            this.status()
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
        else this.props.device = this.props.device.device
        this.status()
    }

    deinit = () => {

    }

    status() {
        return (this.session.getDevice('buzz') != null)
    }

    default = (userData) => {
        return userData
    }

    motors = (userData) => {     

        if (this.device){
            // Vibrate Wrist Based on Frequencies (Single User)
            let motorCommand = this.device.mapFrequencies(userData[0].data)
            buzz.device.vibrateMotors([motorCommand])
        }

        return userData
    }

    leds = (userData) => {

        if (this.device){
            // Fills the Lights (Multi User)
            let flattenedData = userData.map(u=> u.data)
            let mean = this.session.atlas.mean(flattenedData)

            let i1 = Math.min(mean/.33,1)
            let i2 = (i1 === 1 ? Math.min((mean-.33)/.33,1) : 0)
            let i3 = (i2 === 1 ? Math.min((mean-.66)/.33,1) : 0)
            this.device.setLEDs([[0,255,0],[0,255,0],[0,255,0]], [i1,i2,i3])
        }

        return userData
    }

    
    _subscribeToDevices(k, nameArray=[]) {
        if (k.includes('device')){
            let deviceInfo = this.session.state.data[k]
            if (nameArray.includes(deviceInfo.deviceName)){
            this.props.device = this.session.getDevice(deviceInfo.deviceName).device
        }
        }
     }

}