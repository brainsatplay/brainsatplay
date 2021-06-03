

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
        if (this.matchKey(e.code) && this.states['default'].data != true){
            this.states['default'].data = true
        } 
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)) this.states['default'].data = false
    }

    matchKey(keycode){
        let regex = new RegExp(`(?:^|\W)${this.params.keycode}(?:$|\W)`,'i')
        return keycode.match(regex) || keycode.replace('Key', '').match(regex) || keycode.replace('Digit', '').match(regex)
    }
}