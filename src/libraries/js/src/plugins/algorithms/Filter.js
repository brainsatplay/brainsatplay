import {BiquadChannelFilterer} from '../../utils/signal_processing/BiquadFilters'
import {Plugin} from '../Plugin'

export class Filter extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(label, session, params={}) {
        super(label, session)
        this.label = label
        this.session = session
        

        let uvPerStep = 1e6;
        let sps = 256

        this.props = {
            filter: new BiquadChannelFilterer(0,sps,true,uvPerStep)
        }
        // this.props.filter.useScaling = true; 
        // this.props.filter.notch60.pop();

        this.ports = {
            default: {
                input: {type: Array},
                output: {type: Array},
                onUpdate: (user) => {
                    user.data = user.data.map(d => {
                        data.push(this.props.filter.apply(d))
                    })
                    return user
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}