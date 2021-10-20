

export class Performance {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(info, graph, params={}) {
        
        
        
        

        this.props = {
            history: []
        }

        this.ports = {
            default: {
                input: {type: null},
                output: {type: 'number'},
                onUpdate: (user) => {
                    let accuracy
                    switch (this.ports.method.data){
                        case 'accuracy': 
                            accuracy = 1 - this.session.atlas.mean(this.props.history)
                            break
                        case 'MCC':
                            console.log('not supported')
                            accuracy = 1
                            break
                    }
                    return {data: accuracy}
            }
            },
            error: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    this.props.history.push(user.data)
                    // console.log( this.props.history)
                    this.update( 'default', {})
                }
            },
            method: {
                default: 'accuracy',
                options: ['accuracy', 'MCC'],
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (user) => {
                    this.ports.method.data = user.data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}