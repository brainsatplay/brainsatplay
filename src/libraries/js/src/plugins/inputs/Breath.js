import {BreathCapture} from '../../utils/BreathCapture'
import {StateManager} from '../../ui/StateManager'

export class Breath{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            calibrate: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: () => {
                    this.props.capture.calibrate()
                }
            },
            belowThreshold: {
                default: false,
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.belowThreshold}]
                }
            },
            isHolding: {
                default: false,
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.isHolding}]
                }
            },
            inVolumes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.inVolumes}]
                }
            },
            outVolumes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.outVolumes}]
                }
            },
            inTimes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.inTimes}]
                }
            },
            outTimes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.outTimes}]
                }
            },
            inToOutTimes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.inToOutTimes}]
                }
            },
            fastTimes: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.fastTimes}]
                }
            },
            fastRate: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.fastTimes}]
                }
            },
            breathRate: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.breathRate}]
                }
            },
            brv: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.capture.output.brv}]
                }
            }
        }

        this.props = {
            capture: new BreathCapture(),
            state: new StateManager()
        }
    }

    init = () => {
        this.props.capture.analyze()
        this.props.capture.connectMic()

        // Fire on State Updates
        let customPorts = ['calibrate']
        for (let port in this.ports){
            if (!customPorts.includes(port)){
                this.props.state.addToState(port, this.props.capture.output[port], () => {
                    this.session.graph.runSafe(this, port, [{data: true}])
                })
            }
        }
    }

    deinit = () => {}
}