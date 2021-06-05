export class Audio{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            file: {default: 'None', options: ['None']}
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: {}, meta: {label: `audio`}}]
                },
            }, 
            fft: {
                defaults: {
                    output: [{data: {}, meta: {label: `audio_fft`}}]
                }
            }
        }

        this.props = {}
    }

    init = () => {}

    deinit = () => {}

    default = () => {
        this.states['default'].data = true // Play Music
        this.states['default'].meta.label = `audio`
        return this.states['default']
    }

    fft = () => {
        let channel = undefined // Get FFT Data
        if(channel) this.states['fft'].data = channel.fft;
        else this.states['fft'].data = new Array(256).fill(0);
        this.states['fft'].meta.label = `audio_fft`
        return this.states['fft']
    }
}