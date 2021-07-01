import { StateManager } from '../../ui/StateManager'


export class EEG{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            state: new StateManager(),
            deviceSubscriptions: [],
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            },
            deviceState: null,
            sps: null,
            tags: null
        }

        this.ports = {}

        let keys = ['raw','filtered', 'position']

        // Auto-Generate Ports
        keys.forEach(key => {
            this.ports[key] = {
                input: {type:null},
                output: {type:null},
                onUpdate: (userData) => {
                    return [{data: this.session.atlas.data.eeg[0][key]}]
                }
            }

            if (key === 'position') this.ports[key].output.type = 'position'
            else this.ports[key].output.type = Array
        })

        let added = (k) => {
            this._subscribeToDevices([k])
        }

        let removed = (k) => {
            if (k.includes('device')){
                this.props.state.removeState(this.props.subscribedTag)
            }
        }

        this.props.toUnsubscribe['stateAdded'].push(this.session.state.subscribeSequential('stateAdded', added))
        this.props.toUnsubscribe['stateRemoved'].push(this.session.state.subscribeSequential('stateRemoved', removed))
    }

    init = () => {
        this._subscribeToDevices(Object.keys(this.session.state.data))
    }

    deinit = () => {
        for (let key in this.props.toUnsubscribe){
            this.props.toUnsubscribe[key].forEach(idx => {
                this.session.state.unsubscribeSequential(key,idx)
            })
        }
    }

    _subscribeToDevices(arr) {
        arr.forEach(k => {
            let pass = /^device[.+]*/.test(k)
            if (pass){
                let callbacks = []
                if (this.session.state.data[k].deviceType === 'eeg'){
                    for (let port in this.ports){
                        callbacks.push(() => {
                            if (this.ports[port].active.out > 0) {
                                this.session.graph.runSafe(this,port, [{data:true, force: true}])
                            }
                        })
                    }
                    this.props.sps = this.session.atlas.data.eegshared.sps
                    this.props.tags = this.session.atlas.data.eegshared.eegChannelTags.map(o => o.tag)
                    let firstTag = this.session.state.data[k].eegChannelTags[0].tag
                    this.props.subscribedTag = `${this.params.device}_${firstTag}`
    
                    this.props.deviceSubscriptions[k] = this.session.subscribe(this.params.device, firstTag, undefined, (data)=>{
                        callbacks.forEach(f => {f()})
                    }, this.props.state)
                }
            }
        })
    }
}