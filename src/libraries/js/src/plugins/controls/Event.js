// Generic Event Trigger. Uses Key Presses by Default.

import {Plugin} from '../../graph/Plugin'

export class Event extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        super(info, graph)
        
        this.ports = {}

            // // Set type of control
            // type: {
            //     edit: false,
            //     default: 'event',
            //     options: ['event', 'p300', 'ssvep'],
            //     input: {type: null},
            //     output: {type: null},
            //     onUpdate: (user) => {
            //         this.ports.type.data = user.data
            //     }
            // },

            // // Pass commands to downstream element
            // command: {
            //     edit: false,
            //     input: {type: null},
            //     output: {type: 'boolean'},
            //     onUpdate: (user) => {
            //         return user
            //     }
            // },

            this.ports.keycode =  {
                data: 'Space',
                input: {type: 'string'},
                output: {type: null}
            }
            
            this.ports.default = {
                data: false,
                input: {type: 'boolean'},
                output: {type: 'boolean'}
            }
    }

    init = () => {
        document.addEventListener('keydown',this.handleKeyDown)
        document.addEventListener('keyup',this.handleKeyUp)
    }

    deinit = () => {
        document.removeEventListener('keydown',this.handleKeyDown)
        document.removeEventListener('keyup',this.handleKeyUp)
    }

    handleKeyDown = (e) => {
        if (this.matchKey(e.code)){
            this.update('default',{data: true})
        } 
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)){
            this.update('default', {data: false})
        }
    }

    matchKey(keycode){
        let regex = new RegExp(`(?:^|\W)${this.ports.keycode.data}(?:$|\W)`,'i')
        return keycode.match(regex) || keycode.replace('Key', '').match(regex) || keycode.replace('Digit', '').match(regex)
    }
}