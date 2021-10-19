import {Plugin} from '../Plugin'

export class SSVEP extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        

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