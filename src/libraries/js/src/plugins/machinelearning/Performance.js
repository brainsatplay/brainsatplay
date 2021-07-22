export class Performance{

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            history: []
        }

        this.ports = {
            default: {
                input: {type: null},
                output: {type: 'number'},
                onUpdate: () => {
                    let accuracy
                    switch (this.params.method){
                        case 'accuracy': 
                            accuracy = 1 - this.session.atlas.mean(this.props.history)
                            break
                        case 'MCC':
                            console.log('not supported')
                            accuracy = 1
                            break
                    }
                    return [{data: accuracy}]
            }
            },
            error: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    this.props.history.push(u.data)
                    // console.log( this.props.history)
                    this.session.graph.runSafe(this, 'default', [{forceRun: true}])
                }
            },
            method: {
                default: 'accuracy',
                options: ['accuracy', 'MCC'],
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.method = userData[0].data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}