export class ERP {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(info, graph, params={}) {
        
        
        
        

        this.ports = {
            default: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {
                    
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}