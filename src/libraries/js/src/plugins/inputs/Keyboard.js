

export class Keyboard{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            keycode: {default: 'Space', options: null},
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: false, meta: {label: 'keycode'}}]
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
        document.removeEventListener('keyup',this.handleKeyDown)
    }

    handleKeyDown = (e) => {
        if (this.matchKey(e.code) && this.states['default'][0].data != true){
            let updateObj  = {}
            updateObj[this.label] = true
            this.stateUpdates.manager.setSequentialState(updateObj)
            this.states['default'] = [{data: true, meta: {label: `key_${e.code}`}}]
        } 
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)){
                let updateObj  = {}
                updateObj[this.label] = true
                this.stateUpdates.manager.setSequentialState(updateObj)
                this.states['default'] = [{data: false, meta: {label: `key_${e.code}`}}]
        }
    }

    matchKey(keycode){
        let regex = new RegExp(`(?:^|\W)${this.params.keycode}(?:$|\W)`,'i')
        return keycode.match(regex) || keycode.replace('Key', '').match(regex) || keycode.replace('Digit', '').match(regex)
    }
}