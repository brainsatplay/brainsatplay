import {Plugin} from '../../graph/Plugin'

export class HEG extends Plugin {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        

        this.props = {
            deviceSubscriptions: [],
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            }
        }

        this.ports = {
            atlas: {
                edit: false,
                input: {type:null},
                output: {type: Object, name: 'DataAtlas'},
                onUpdate: () =>{
                    return {data: this.session.atlas.data}
                }
            }, status: {
                edit: false,
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return {data: (this.session.getDevice('heg') != null)}
                }
            }
        }

        let keys = ['times','red', 'ir', 'ambient', 'ratio', 'temp']

        // Auto-Generate Ports
        keys.forEach(key => {
            this.ports[key] = {
                edit: false,
                data: [],
                input: {type:null},
                output: {type:Array},
                onUpdate: (user) => {
                    return {data: this.session.atlas.data.heg[0][key]}
                }
            }
        })
    }

    init = () => {
        this.props.toUnsubscribe = this.session.subscribeToDevices('heg', (data) => {
            this.updateAll()
        })
    }

    deinit = () => {
        for (let key in this.props.toUnsubscribe){
            this.session.state[this.props.toUnsubscribe[key].method](key,this.props.toUnsubscribe[key].idx)
        }
    }
}