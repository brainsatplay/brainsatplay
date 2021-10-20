
export class Threshold {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        
        
        
        
        

        this.ports = {
            default: {
                data: false,
                input: {type: 'number'},
                output: {type: 'boolean'},
                onUpdate: (user) => {
                    user.data = user.data > this.ports.threshold.data
                    return user
                }
            },

            threshold: {
                data: 0.5,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.ports.threshold.data = user.data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}