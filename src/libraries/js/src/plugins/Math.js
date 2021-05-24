export class MathPlugin{
    
    constructor(id, session, params={}) {
        this.output = id
        this.state = {value: 0}
        this.session = session
        this.params = params

        if (this.params.value == null) this.params.value = 0
        if (this.params.operator == null) this.params.operator = ''
    }

    init = () => {}

    deinit = () => {}

    update = (input) => {
        let value = input.value

        if (this.params.operator.toLowerCase() === 'add'){
            this.state.value = value + this.params.value
        } else if (this.params.operator.toLowerCase() === 'subtract'){
            this.state.value = value - this.params.value
        } else if (this.params.operator.toLowerCase() === 'multiply'){
            this.state.value = value * this.params.value
        } else if (this.params.operator.toLowerCase() === 'divide'){
            this.state.value = value / this.params.value
        }

        return this.state
    }
}