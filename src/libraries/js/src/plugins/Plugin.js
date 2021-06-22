export class Plugin{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            number: {default: 10, min: 0, max: 100, step: 0.01}
        }

        this.ports = {
            default: {}
        }

        this.props = {}

    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        console.log(userData, this.params.number)
    }
}