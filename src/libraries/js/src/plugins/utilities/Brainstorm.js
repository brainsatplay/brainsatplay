export class Brainstorm{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {},
            send: {},
            get: {}
        }
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        let returned = this.session.graph.runSafe(this,'get',userData)
        return returned
    }

    send = (userData) => {
        let label = userData[0].meta.source.replace('brainstorm_','')
        this.session.state.data[label] = userData
        return userData
    }

    get = (userData) => {
        let label = userData[0].meta.source.replace('brainstorm_','')
        let sessionId = userData[0].meta.session
        if (sessionId && label){
            let brainstorm = this.session.getBrainstormData(sessionId,[label], 'app', 'plugin')
            return brainstorm
        }
    }
}