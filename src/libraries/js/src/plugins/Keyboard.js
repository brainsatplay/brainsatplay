export class Keyboard{
    
    constructor(id, session, params={}) {
        this.output = id
        this.state = {value: false}; // Initialize object to subscribe to
        this.session = session
        this.params = params
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
        if (this.matchKey(e.code) && this.state.value != true) this.state.value = true
    }
    
    handleKeyUp = (e) => {
        if (this.matchKey(e.code)) this.state.value = false
    }

    matchKey(code){
        let regex = new RegExp(`(?:^|\W)${this.params.key}(?:$|\W)`,'i')
        return code.match(regex) || code.replace('Key', '').match(regex) || code.replace('Digit', '').match(regex)
    }
}