export class Coherence{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.state = {value: 0}
        this.params = params
    }

    init = () => {}


    deinit = () => {}

    default = () => {
        this.state.value = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')
        return this.state
    }

}