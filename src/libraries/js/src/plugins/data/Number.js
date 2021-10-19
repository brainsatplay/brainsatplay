import {Plugin} from '../../graph/Plugin'

export class Number extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        

        this.ports = {
            value: {
                data: 5,
                input: {type: 'number'},
                output: {type: 'number'},
                onUpdate: (user) => {
                    this.ports.value.data = user.data
                    return user
                }
            }
        }
    }

    init = () => {
        // this.update( 'default',{data: this.ports.default.data, forceUpdate: true})
    }

    deinit = () => {}
}