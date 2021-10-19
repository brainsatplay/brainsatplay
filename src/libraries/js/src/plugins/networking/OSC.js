// import * as oscHelper from 'osc'
import {Plugin} from '../../graph/Plugin'

export class OSC extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        


        // console.log(oscHelper)
        this.ports = {
            // default: {
            //     input: {type: undefined},
            //     output: {type: null},
            //     onUpdate: (userData) => {
            //         userData.forEach((u,i) => {
            //             console.log(u.username,u.data,u.meta,u)
            //         })
            //     }
            // }
        }
    }

    init = () => {
        
    }

    deinit = () => {}
}