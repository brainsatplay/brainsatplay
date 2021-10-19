import {BreathCapture} from '../../utils/signal_processing/BreathCapture'
import {StateManager} from '../../ui/StateManager'
import {Plugin} from '../../graph/Plugin'

export class Breath extends Plugin {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        

        this.ports = {
            calibrate: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: () => {
                    this.props.capture.calibrate()
                }
            },
        }

        this.props = {
            capture: new BreathCapture(),
            state: new StateManager()
        }

        for (let port in this.props.capture.output){
            let type
            let isArray = Array.isArray(this.props.capture.output[port])
            if (isArray) type = Array
            else type = typeof this.props.capture.output[port]

            this.ports[port] = {
                input: {type: null},
                output: {type},
                onUpdate: () => {
                    return {data: this.props.capture.output[port]}
                }
            }

            this.props.capture.state.subscribe(port, (data) => {
                this.update( port, {data: true})
            })
        }
    }

    init = () => {
        this.props.capture.analyze()
        this.props.capture.connectMic()
    }

    deinit = () => {
        this.props.capture.stop()
    }
}