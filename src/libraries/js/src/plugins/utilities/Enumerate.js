export class Enumerate{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                input: {type: Object},
                output: {type: null},
                onUpdate: (userData) => {
                    userData.forEach(u => {
                        if (u.data != null){
                            // Objects
                            let keys = Object.keys(u.data)
                            keys.forEach(k => {
                                if (this.ports[k] == null){
                                    let portInfo = {
                                        default: u.data[k],
                                        input: {type: null},
                                        output: this.session.graph.getTypeDict(u.data[k]),
                                        onUpdate: (userData) => {
                                            return userData
                                        }
                                    }
                                    this.session.graph.addPort(this,k,portInfo)
                                }
                                this.session.graph.runSafe(this,k, [{data: u.data[k]}])
                            })
                        }
                    })
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}