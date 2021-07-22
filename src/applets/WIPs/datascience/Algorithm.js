export class Algorithm{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
        }
        
        // Data May Be Passed Through Ports (automatically assigned to an parameter)
        this.ports = {
            default: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (userData) => {
                    return userData
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}