
import { StateManager } from './ui/StateManager'

export class EventRouter{
    constructor(){
        this.device = null
        this.state = new StateManager()

        this.routes = ['clicks']
    }

    init(device){
        this.device = device
        this.state.addToState(this.device.mode, this.device.info.states)
        this.routes.forEach(str => {
            if (this.device.info.states){
                let states = this.device.info.states[str]
                if (states != null){
                    if (!Array.isArray(states)) states = [states]
                    states.forEach((state,i) => {
                        this.device.atlas.data.states[str].push(state)
                        this.state.addToState(str+i, state)
                        let deviceCallback = (o) => {this.update(o, this.device.atlas.data.states[str][i])}
                        this.state.subscribe(str+i, deviceCallback)
                    })
                }
            }
        })
    }

    deinit = () => {}

    // Route Events to Atlas
    update(o,target) {
        let newState = o.data
        target = newState
    }

    assign(state,){

    }
}