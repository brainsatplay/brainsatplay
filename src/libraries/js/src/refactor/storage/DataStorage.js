export class DataStorage{
    constructor(session){
        this.format = 'common'

        this.nParticipants = 0
        this.device = null
        this.experimentalConditions = {}
        this.pipeline = {
            acquisition: {parameters: {}},
            preprocessing: {parameters: {}},
            featureExtraction: {parameters: {}},
            classification: {parameters: {}},
            interface: {parameters: {}},
        }
    }
}