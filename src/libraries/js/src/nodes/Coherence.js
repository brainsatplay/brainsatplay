export class Coherence{
    constructor(session) {
        this.output = 'coherence'
        this.session = session

        this.stream = () => {
            return this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')
        }
    }

    init = () => {}


    deinit = () => {}

}