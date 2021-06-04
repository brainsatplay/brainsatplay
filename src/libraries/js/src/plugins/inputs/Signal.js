import { StateManager } from '../../ui/StateManager'


export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            autoconnect: {default: false, show: false},
            device: {default: 'eeg', options: ['eeg', 'heg'], show: false}
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: {}, meta: {label: 'signal'}}]
                }
            }
        }

        this.props = {
            state: new StateManager(),
            deviceSubscriptions: {}
        }

        let added = (arr) => {
            this._subscribeToDevices(arr)
        }

        let removed = (arr) => {
            arr.forEach(k => {
                if (k.includes('device')){
                    this.props.state.removeState(`${this.params.device}_FP1`)
                }
            })
        }

        this.session.state.addUpdateFunction(added,removed)
        // this.prevAtlas = null
    }

    init = () => {

        // Auto-Start a Synthetic Stream
        if (this.params.autoconnect && this.session.deviceStreams.length === 0 && this.params.device === 'eeg') {
            this.session.connectDevice(undefined, undefined, undefined, {device: 'Synthetic', variant: '', analysis: ['eegcoherence']})
        } else {
            this._subscribeToDevices(Object.keys(this.session.state.data))
        }
    }

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = () => {
        this.states['default'].data = this.session.atlas.data
        return this.states['default']
    }


    _subscribeToDevices(arr) {
       arr.forEach(k => {
            if (k.includes('device')){
                this.props.deviceSubscriptions[k] = this.session.subscribe(this.params.device, 'FP1', undefined, (data)=>{
                    this.default()
                }, this.props.state)
            }
        })
    }
}