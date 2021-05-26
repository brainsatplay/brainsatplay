export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.state = {value: []}
        this.session = session
        this.params = params
        this.paramOptions = {
            type: {default: 'synthetic', options: ['synthetic','eeg', 'heg']},
            synthetic: {show: false, default: true, options: [true, false]},
            frequency: {default: 0.5, min: 0, max: 100, step: 0.1},
            amplitude: {default: 200, min:0, max: 1000, step: 1}
        }

        for (let param in this.paramOptions){
            if (this.params[param] == null) this.params[param] = this.paramOptions[param].default
        }
    }

    init = () => {
        if (this.params.synthetic === true){
            this.session.connectDevice(undefined, undefined, undefined, {device: 'synthetic', variant: '', analysis: ['eegcoherence']})
        } 
    }

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = () => {

        let data = []
        
        if (this.params.type === 'eeg'){
            let channel = this.session.atlas.data.eeg[0]
            data = channel.raw.slice(channel.raw.length - 100)
        } else if (this.params.type === 'heg') {
            let channel = this.session.atlas.data.heg[0]
            data = channel.raw.slice(channel.raw.length - 100)
        } else {
            data = [this.params.amplitude*Math.sin(2*Math.PI*(this.params.frequency)*Date.now()/1000)]
        }

        // Declare Update to State
        this.state.timestamp = Date.now()
        this.state.value = data 

        return this.state
    }
}