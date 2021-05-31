
import { StateManager } from './ui/StateManager'

export class EventRouter{
    constructor(){
        this.state = new StateManager()
    }

    start(device, targetState){
        let deviceStates = device.info.states

        console.log(device.atlas)
        // Bind Available Non-Device Events to Clicks
        let keysToBind = Object.keys(targetState.data)
        keysToBind = keysToBind.filter(k => !k.includes('device') && !this.clicks.includes(k))
        for (let idx = 0; idx < deviceStates.clicks.length; idx++){
            if (keysToBind.length > idx){
                let key = keysToBind[idx]
                this.clicks.push({key, idx})
            } else {
                console.log('all events have been bound to clicks')
            }
        }

        let deviceCallback = (o) => {this.update(o,targetState.data)}

        this.state.addToState('clicks', device.info.states.clicks)
        this.state.subscribe('clicks', deviceCallback) // On New Device State, Update Clicks in Target State Object
    }

    // Route Events
    update(deviceInfo,targetState) {

        // Update Clicks
        this.clicks.forEach(d => {
            let newState = deviceInfo.states.clicks[d.idx]
            if (typeof newState === "boolean"){
                targetState.data[d.key].data = newState
                if (newState === true) { // Only on change
                    console.log(d.key + '!')
                }
            } else {
                console.log('invalid click type')
            }
        })
    }
}