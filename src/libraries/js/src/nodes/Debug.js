export class Debug{
    
    constructor(session) {
        this.output = 'debug'
        this.session = session
    }

    init = () => {}

    deinit = () => {}

    update = (input) => {
        let value = input.value
        console.log(value)
        return value
    }
}