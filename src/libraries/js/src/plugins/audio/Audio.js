export class Audio{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            files: {}, 
            fft: {}
        }

        this.props = {}
    }

    init = () => {}

    deinit = () => {}
}