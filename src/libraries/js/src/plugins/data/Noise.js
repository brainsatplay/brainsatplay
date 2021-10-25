import {Noise as NoiseJS} from 'noisejs'



export class Noise {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        
        
        
        

        this.ports = {
            default: {
                input: {type: null},
                output: {type: 'number'},
                onUpdate: () => {
                    let value = Number.parseFloat(this.ports.delta.data)
                    this.update('delta', {value})
                    if (!isNaN(this.ports.delta.data)) this.props.pointer += value
                    if (Date.now() - this.props.lastTime >= this.ports.interval.data){
                        if (this.ports.type.data === 'random') this.props.lastSample = 2*Math.random() - 1
                        if (this.ports.type.data === 'perlin') this.props.lastSample = this.props.noise.perlin2(this.props.pointer, 1)
                        if (this.ports.type.data === 'simplex') this.props.lastSample = this.props.noise.simplex2(this.props.pointer, 1);
                        this.props.lastSample*=Number.parseFloat(this.ports.intensity.data)
                        this.props.lastTime = Date.now()
                    }
                    return {data: this.props.lastSample}
                }
            },
            type: {
                data: 'perlin',
                options: ['random', 'perlin', 'simplex'],
                input: {type: 'string'},
                output: {type: null}
            },
            intensity: {
                data: 1,
                input: {type: 'number'},
                output: {type: null}
            },
            interval: {
                data: 1000/60,
                input: {type: 'number'},
                output: {type: null},
            },
            delta: {
                data: 0.01,
                input: {type: 'number'},
                output: {type: null}
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
                this.update('default',{})
                setTimeout(animate, Math.min(100, this.ports.interval.data))
            }
        }

        animate()
    }

    deinit = () => {
        this.props.looping = false
    }
}