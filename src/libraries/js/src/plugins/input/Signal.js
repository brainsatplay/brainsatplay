export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            autoconnect: {default: false, show: false}
        }
    }

    init = () => {

        // Auto-Start a Synthetic Stream
        if (this.params.autoconnect && this.session.deviceStreams.length === 0) {
            this.session.connectDevice(undefined, undefined, undefined, {device: 'Synthetic', variant: '', analysis: ['eegcoherence']})
        }
    }

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = () => {
        return {data: this.session.atlas.data, meta: {}}
    }
}