export class MathPlugin{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.state = {value: 0} // Processing nodes cannot broadcast state
        this.session = session
        this.params = params
        this.paramOptions = {
            value: {default: 0, options: null},
            operator: {default: '', options: ['add','subtract', 'multiply', 'divide', 'mean']}
        }

        for (let param in this.paramOptions){
            if (this.params[param] == null) this.params[param] = this.paramOptions[param].default
        }
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {

        userData.forEach(u => {
            if (this.params.operator.toLowerCase() === 'add'){
                if (Array.isArray(u.value)) u.value = u.value.map(v => v += this.params.value)
                else u.value += this.params.value
            } else if (this.params.operator.toLowerCase() === 'subtract'){
                if (Array.isArray(u.value)) u.value = u.value.map(v => v -= this.params.value)
                else u.value -= this.params.value
            } else if (this.params.operator.toLowerCase() === 'multiply'){
                if (Array.isArray(u.value)) u.value = u.value.map(v => v *= this.params.value)
                else u.value *= this.params.value
            } else if (this.params.operator.toLowerCase() === 'divide'){
                if (Array.isArray(u.value)) u.value = u.value.map(v => v /= this.params.value)
                else u.value /= this.params.value
            } else if (this.params.operator.toLowerCase() === 'mean'){
                if (Array.isArray(u.value)) u.value = u.value.reduce((a,b) => a + b)/ u.value.length
                else u.value = this.params.value
            }
        })

        this.state.value = userData
        this.state.timestamp = Date.now()

        return this.state
    }
}