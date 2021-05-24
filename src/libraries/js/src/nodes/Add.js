export class Add{
    
    constructor(session) {
        this.output = 'add'
        this.state = {value: 0}
        this.session = session
    }

    init = () => {}

    deinit = () => {}

    update = (input) => {
        let value = input.value
        this.state.value = value + 1
        return this.state
    }
}