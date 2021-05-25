export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.state = {value: []}
        this.session = session
        this.params = params
        this.paramOptions = {
            type: {default: 'eeg', options: ['eeg', 'heg']},
            synthetic: {default: true, options: [true, false]},
            frequencies: {default: [10], options: null},
            amplitudes: {default: [200], options: null}
        }

        for (let param in this.paramOptions){
            if (this.params[param] == null) this.params[param] = this.paramOptions[param].default
        }
    }

    init = () => {
        if (this.params.synthetic === true){
            console.log('connected')
            // HAVE NOT SET APPROPRIATE ONCONNECT CALLS
            this.session.connect('synthetic',['eegcoherence'])
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
          console.log('not supported yet')  
        }

        // Declare Update to State
        this.state.timestamp = Math.sin(Date.now()/1000)
        this.state.value = data 

        return this.state
    }
}