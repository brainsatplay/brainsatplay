import {Noise as NoiseJS} from 'noisejs'

export class Noise{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'random', options: ['random', 'perlin', 'simplex']},
            intensity: {default: 1},
            interval: {default: 1000/60},
            delta: {default: .01}
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
            lastSample: 0,
            pointer: 0,
            lastTime: Date.now(),
            looping: false,
            noise: new NoiseJS(Math.random())
        }
    }

    init = () => {
        this.props.looping = true

        let animate = () => {
            if (this.props.looping){
                this.session.graph.runSafe(this,'default',[{forceRun: true}])
                setTimeout(animate, Math.min(100, this.params.interval))
            }
        }

        animate()
    }

    deinit = () => {
        this.props.looping = false
    }

    default = () => {
        this.params.delta = Number.parseFloat(this.params.delta)
        if (!isNaN(this.params.delta)) this.props.pointer += Number.parseFloat(this.params.delta)
        if (Date.now() - this.props.lastTime >= this.params.interval){
            if (this.params.type === 'random') this.props.lastSample = 2*Math.random() - 1
            if (this.params.type === 'perlin') this.props.lastSample = this.props.noise.perlin2(this.props.pointer, 1)
            if (this.params.type === 'simplex') this.props.lastSample = this.props.noise.simplex2(this.props.pointer, 1);
            this.props.lastSample*=Number.parseFloat(this.params.intensity)
            this.props.lastTime = Date.now()
        }
        return [{data: this.props.lastSample, meta: {label: this.label}}]
    }
}