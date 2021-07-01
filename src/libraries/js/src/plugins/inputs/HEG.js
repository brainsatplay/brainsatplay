import { StateManager } from '../../ui/StateManager'


export class HEG{
    
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
            }
        }

        this.ports = {}

        let keys = ['times','red', 'ir', 'ambient', 'ratio', 'temp']

        // Auto-Generate Ports
        keys.forEach(key => {
            this.ports[key] = {
                input: {type:null},
                output: {type:Array},
                onUpdate: (userData) => {
                    return [{data: this.session.atlas.data.heg[0][key]}]
                }
            }
        })

        let added = (k) => {
            this._subscribeToDevices([k])
        }

        let removed = (k) => {
            if (k.includes('device')){
                // if (this.session.state.data[k].deviceType === 'heg'){
                    this.props.state.removeState(`heg_0`)
                // }
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
                if (this.session.state.data[k].deviceType === 'heg'){
                    for (let port in this.ports){
                        callbacks.push(() => {
                            if (this.ports[port].active.out > 0) {
                                this.session.graph.runSafe(this,port, [{data:true, force: true}])
                            }
                        })
                    }
                    this.props.deviceSubscriptions[k] = this.session.subscribe('heg', 0, undefined, (data)=>{
                        callbacks.forEach(f => {f()})
                    }, this.props.state)
                }
            }
        })
    }
}