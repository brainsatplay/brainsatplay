export class Spacebar{
    
    constructor(session, params={}) {
        this.output = 'spacebar'
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
        if (e.code === 'Space' && this.state.value != true) this.state.value = true
    }
    
    handleKeyUp = (e) => {
        if (e.code === 'Space') this.state.value = false
    }
}