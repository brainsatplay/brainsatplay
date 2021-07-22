export class Threshold{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                default: false,
                input: {type: 'number'},
                output: {type: 'boolean'},
                onUpdate: (userData) => {
                    userData.forEach(u => {
                        u.data = u.data > this.params.threshold
                    })
                    return userData
                }
            },

            threshold: {
                default: 0.5,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.threshold = userData[0].data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}