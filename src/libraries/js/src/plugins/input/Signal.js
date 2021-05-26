export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {}
    }

    init = () => {

        // Auto-Start a Synthetic Stream
        if (this.session.deviceStreams.length === 0) {
            this.session.connectDevice(undefined, undefined, undefined, {device: 'Synthetic', variant: '', analysis: ['eegcoherence']})
        }
    }

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = () => {
        return {value: this.session.atlas.data}
    }
}