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
            deviceSubscriptions: [],
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            }
        }

        let added = (k) => {
            this._subscribeToDevices([k])
        }

        let removed = (k) => {
            if (k.includes('device')){
                this.props.state.removeState(`${this.params.device}_FP1`)
            }
        }

        this.props.toUnsubscribe['stateAdded'].push(this.session.state.subscribeSequential('stateAdded', added))
        this.props.toUnsubscribe['stateRemoved'].push(this.session.state.subscribeSequential('stateRemoved', removed))
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
        for (let key in this.props.toUnsubscribe){
            this.props.toUnsubscribe[key].forEach(idx => {
                this.session.state.unsubscribeSequential(key,idx)
            })
        }
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