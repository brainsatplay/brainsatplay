
export class Enumerate {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        
        
        


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
                                this.props.keys.forEach(k => this.removePort(k))
                                this.props.keys = [...newKeys]
                                this.props.keys.forEach(k => {
                                    if (this.ports[k] == null && k != 'default'){
                                        let portInfo = {
                                            edit: false,
                                            data: user.data[k],
                                            input: {type: null},
                                            output: {type: 'auto'},
                                            onUpdate: (user) => {
                                                return user
                                            }
                                        }
                                        this.addPort(k,portInfo)
                                    }
                                    this.update(k, {data: user.data[k]})
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