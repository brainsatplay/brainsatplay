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
                    output: [{data: {}, meta: {label: `signal_${this.paramOptions.device.default}`}}]
                },
            }, 
            fft: {
                defaults: {
                    output: [{data: {}, meta: {label: `signal_${this.paramOptions.device.default}_fft`}}]
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
        this.states['default'].meta.label = `signal_${this.params.device}`
        return this.states['default']
    }

    fft = () => {
        let channel = this.session.atlas.getLatestFFTData()[0];
        if(channel) this.states['fft'].data = channel.fft;
        else this.states['fft'].data = new Array(256).fill(0);
        this.states['fft'].meta.label = `signal_${this.params.device}_fft`
        return this.states['fft']
    }


    _subscribeToDevices(arr) {
        arr.forEach(k => {
            if (k.includes('device')){

                let callbacks = []
                for (let port in this.ports){
                    if (this.ports[port].active) callbacks.push(this[port])
                }
                this.props.deviceSubscriptions[k] = this.session.subscribe(this.params.device, 'FP1', undefined, (data)=>{
                    callbacks.forEach(f => {
                        f()
                    })
                }, this.props.state)
            }
        })

    }
}