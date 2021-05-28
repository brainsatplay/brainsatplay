

export class Keyboard{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            key: {default: 'Space', options: null},
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
        if (this.matchKey(e.code) && this.state.data != true) this.state.data = true
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)) this.state.data = false
    }

    matchKey(code){
        let regex = new RegExp(`(?:^|\W)${this.params.key}(?:$|\W)`,'i')
        return code.match(regex) || code.replace('Key', '').match(regex) || code.replace('Digit', '').match(regex)
    }
}