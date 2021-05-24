export class Coherence{
    constructor(session) {
        this.output = 'coherence'
        this.session = session
        this.state = {value: 0}
    }

    init = () => {}


    deinit = () => {}

    update = (input) => {
        // let value = input.value
        this.state.value = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')
        return this.state
    }

}