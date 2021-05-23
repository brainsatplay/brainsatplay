export class Spacebar{
    
    constructor(session) {
        this.id = 'spacebar'
        this.output = {value: false}; // Initialize object to subscribe to
        this.session = session
    }

    init(){
        document.addEventListener('keydown',this.handleKeyDown)
        document.addEventListener('keyup',this.handleKeyUp)
    }

    deinit() {
        document.removeEventListener('keydown',this.handleKeyDown)
        document.removeEventListener('keyup',this.handleKeyDown)
    }


    handleKeyDown = (e) => {
        console.log(e)
        if (e.code === 'Space' && this.output.value != true) this.output.value = true
    }
    
    handleKeyUp = (e) => {
        if (e.code === 'Space') this.output.value = false
    }
}