export class Debug{
    
    constructor(session) {
        this.output = 'debug'
        this.session = session
    }

    init = () => {}

    deinit = () => {}

    filter = (input) => {
        console.log(input)
    }
}