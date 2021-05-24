export class Debug{
    
    constructor(id, session, params={}) {
        this.output = id
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