export class Add{
    
    constructor(session) {
        this.output = 'add'
        this.session = session
    }

    init = () => {}

    deinit = () => {}

    filter = (input) => {
        return input + 1
    }
}