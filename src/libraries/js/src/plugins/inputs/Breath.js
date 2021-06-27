import {SoundJS} from '../../../../../platform/js/frontend/UX/Sound'
import {eegmath} from '../../utils/eegmath'
import {BreathCapture} from '../../utils/BreathCapture'


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
            holding: {
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
        }
    }

    init = () => {
        this.props.capture.analyze()

        // On Update Callbacks
        // this.session.graph.runSafe(this,'belowThreshold', [{data: true}])
        // this.session.graph.runSafe(this,'isHolding', [{data: true}])
        // this.session.graph.runSafe(this,'inVolumes', [{data: true}])
        // this.session.graph.runSafe(this,'outVolumes', [{data: true}])
        // this.session.graph.runSafe(this,'inTimes', [{data: true}])
        // this.session.graph.runSafe(this,'outTimes', [{data: true}])
        // this.session.graph.runSafe(this,'inToOutTimes', [{data: true}])
        // this.session.graph.runSafe(this,'fastTimes', [{data: true}])
        // this.session.graph.runSafe(this,'fastRate', [{data: true}])
        // this.session.graph.runSafe(this,'breathRate', [{data: true}])
        // this.session.graph.runSafe(this,'brv', [{data: true}])

    }

    deinit = () => {}
}