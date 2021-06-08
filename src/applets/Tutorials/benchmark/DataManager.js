export class DataManager{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {}

        this.ports = {}

        this.props = {}
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        this.log(userData)
    }

    log = (userData) => {
        let u = userData[0]
        this.session.atlas.makeNote(`${u.meta.label} ${u.data}`)
    }
}