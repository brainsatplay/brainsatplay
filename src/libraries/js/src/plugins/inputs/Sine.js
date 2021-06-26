
export class Sine{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            amplitude: {default: 1, min: 0, max: 1000, step: 0.1},
            frequency: {default: 1, mim: 0, max: 250, step: 0.1},
            rate: {default: 250, min: 0, max: 1000, step: .1}
        }

        this.ports = {
            default: {
                types: {
                    in: null,
                    out: 'number'
                }
            }
        }

        this.props = {
            looping: false,
        }
    }

    init = () => {
        this.props.looping = true

        let animate = () => {
            if (this.props.looping){
                this.session.graph.runSafe(this,'default',[{data:true}])
                setTimeout(animate,1000/Number.parseFloat(this.params.rate))
            }
        }

        animate()
    }

    deinit = () => {
        this.props.looping = false
    }

    default = () => {
        let value = Number.parseFloat(this.params.amplitude)*Math.sin(2*Math.PI*(Number.parseFloat(this.params.frequency))*Date.now()/1000)
        return [{data: value, meta: {label: this.label}}]
    }
}