// Generic Event Trigger. Uses Key Presses by Default.

export class Event{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                default: false,
                meta: {label: `${this.params.keycode}`},
                input: {type: 'boolean'},
                output: {type: 'boolean'},
                onUpdate: (userData) => {
                    // console.log(userData)
                    // this.params.default = userData[0].data
                    return userData
                }
            },

            keycode: {
                default: 'Space',
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.keycode = userData[0].data
                }
            }
        }
    }

    init = () => {
        document.addEventListener('keydown',this.handleKeyDown)
        document.addEventListener('keyup',this.handleKeyUp)
    }

    deinit = () => {
        document.removeEventListener('keydown',this.handleKeyDown)
        document.removeEventListener('keyup',this.handleKeyUp)
    }

    handleKeyDown = (e) => {
        if (this.matchKey(e.code) && this.states['default'][0].data != true){
            this.session.graph.runSafe(this,'default',[{data: true, meta: {label: `key_${e.code}`}}])
            // let updateObj  = {}
            // updateObj[this.label] = true
            // this.stateUpdates.manager.setSequentialState(updateObj)
            // this.states['default'] = [{data: true, meta: {label: `key_${e.code}`}}]
        } 
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)){
                // let updateObj  = {}
                // updateObj[this.label] = true
                // this.stateUpdates.manager.setSequentialState(updateObj)
                // this.states['default'] = [{data: false, meta: {label: `key_${e.code}`}}]
                this.session.graph.runSafe(this,'default', [{data: false, meta: {label: `key_${e.code}`}}])
        }
    }

    matchKey(keycode){
        let regex = new RegExp(`(?:^|\W)${this.params.keycode}(?:$|\W)`,'i')
        return keycode.match(regex) || keycode.replace('Key', '').match(regex) || keycode.replace('Digit', '').match(regex)
    }
}