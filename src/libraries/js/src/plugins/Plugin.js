export class Plugin{
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
                edit: false,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    console.log(user, this.params.number)
                    return user
                }
            },
            number: {
                input: {type: 'number'},
                output: {type: null},
                default: 10,
                meta: {label: `${this.label}_number`},
                // min: 0,
                // max: 100,
                // step: 0.01,
                onUpdate: (user) => {
                    this.params.number = user.data // Auto-assigned parameter
                }
            },
            element: {
                edit: false,
                input: {type: null},
                output: {type: Element},
                default: this.props.container,
                onUpdate: () => {
                    this.params.element = this.props.container
                    return {data: this.params.element}
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}