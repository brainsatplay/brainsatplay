import { StateManager } from '../../ui/StateManager'


export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            device: {default: 'eeg', options: ['eeg', 'heg'], show: false}
        }

        this.ports = {
            default: {
                types: {
                    in: null,
                    out: 'DataAtlas'
                }
            }, 
            fft: {
                analysis: ['eegfft'],
                types: {
                    in: null,
                    out: Array
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
    }

    init = () => {
        this.props.toUnsubscribe = this.session.subscribeToNewDevices('eeg', (data) => {
            this.session.graph.triggerAllActivePorts(this)
        })
    }

    deinit = () => {
        for (let key in this.props.toUnsubscribe){
            this.session.state[this.props.toUnsubscribe[key].method](key,this.props.toUnsubscribe[key].idx)
        }
    }

    default = () => {
        // Add timestamp to force update an object passed by reference
        return [{data: this.session.atlas.data, meta: {label: `signal_${this.params.device}`}}]
    }

    fft = () => {
        let data = this.session.atlas.getLatestFFTData()[0];
        if(data) data = data.fft;
        else data= new Array(256).fill(0);
        return [{data, meta: {label: `signal_${this.params.device}_fft`}}]
    }
}