export class Plugin{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {}
        }
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        console.log(userData)
    }
}