export class Brainstorm{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        return userData
    }
}