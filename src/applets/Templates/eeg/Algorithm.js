export class Algorithm{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
        }
        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.innerHTML = 'Hello World'

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
            },
            element: {
                input: {type: null},
                output: {type: Element},
                default: this.props.container,
                onUpdate: () => {
                    this.params.element = this.props.container
                    return [{data: this.params.element}]
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}