
export class Sine{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            amplitude: {default: 1, min: 0, max: 1000, step: 0.1},
            frequency: {default: 1},
            phase: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.01},
            rate: {default: 250, min: 0, max: 1000, step: .1},
            center: {default: 0, min: 0, max: 1000, step: .1},
            scale: {default: 1, min: 0, max: 10, step: .1}
        }

        this.ports = {
            default: {
                input: {type: null},
                output: {type: 'number'},
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
                this.session.graph.runSafe(this,'default',[{forceRun: true}])
                setTimeout(animate,1000/Number.parseFloat(this.params.rate))
            }
        }

        animate()
    }

    deinit = () => {
        this.props.looping = false
    }

    default = () => {
        let angularVelocity = 2*Math.PI*(Number.parseFloat(this.params.frequency))
        let t = Date.now()/1000
        let phase = Number.parseFloat(this.params.phase)
        let value = this.params.center + this.params.scale*Number.parseFloat(this.params.amplitude)*Math.sin(angularVelocity*t + phase)
        return [{data: value, meta: {label: this.label}}]
    }
}