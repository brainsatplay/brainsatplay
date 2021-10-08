import {Plugin} from '../Plugin'
export class Enumerate extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        super(label, session)
        this.label = label
        this.session = session


        this.props = {
            keys: []
        }
        

        this.ports = {
            default: {
                edit: false,
                input: {type: Object},
                output: {type: null},
                onUpdate: (user) => {
                        if (user.data != null){
                            // Objects
                            let newKeys = Object.keys(user.data)
                            if (JSON.stringify(this.props.keys) != JSON.stringify(newKeys)){
                                this.props.keys.forEach(k => this.session.graph.removePort(this, k))
                                this.props.keys = [...newKeys]
                                this.props.keys.forEach(k => {
                                    if (this.ports[k] == null && k != 'default'){
                                        let portInfo = {
                                            edit: false,
                                            data: user.data[k],
                                            input: {type: null},
                                            output: this.session.graph.getTypeDict(user.data[k]),
                                            onUpdate: (user) => {
                                                return user
                                            }
                                        }
                                        this.addPort(k,portInfo)
                                    }
                                    this.session.graph.runSafe(this,k, {data: user.data[k]})
                                })
                            }
                        }
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}