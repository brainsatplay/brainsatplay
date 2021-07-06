export class Plugin{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        // Data May Be Passed Through Ports (automatically assigned to an parameter)
        this.ports = {
            default: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (userData) => {
                    console.log(userData, this.params.number)
                    return userData
                }
            },
            number: {
                input: {type: 'number'},
                output: {type: null},
                default: 10,
                meta: {label: `${this.label}_number`},
                min: 0,
                max: 100,
                step: 0.01,
                onUpdate: (userData) => {
                    let u = userData[0]
                    this.params.number = u.data // Auto-assigned parameter
                }
            }
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
        }

    }

    init = () => {
        let HTMLtemplate = () => {return `<div id='${this.props.id}'></div>`}

        let setupHTML = (app) => {}

        return {HTMLtemplate, setupHTML}
    }

    deinit = () => {}
}