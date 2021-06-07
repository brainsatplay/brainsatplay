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
        if (userData[0].meta.route){
            let brainstorm = this.session.getBrainstormData(userData[0].meta.app,[userData[0].meta.route.replace('brainstorm_','')], 'app', 'plugin')
            console.log(this.session.state.data)

            return brainstorm

        } else {
            // console.log('loose')
        }
    }

    initialize = () => {

    }
}