export class Transform{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            operator: {default: '', options: ['Add','Subtract', 'Multiply', 'Divide', 'Mean', 'Sum']},
            value: {default: 0, options: null},
        }
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {

        if (!Array.isArray(u.value)) u.value = [u.value]

        userData.forEach(u => {
            if (this.params.operator.toLowerCase() === 'Add'){
                u.value = u.value.map(v => v += this.params.value)
            } else if (this.params.operator.toLowerCase() === 'Subtract'){
                u.value = u.value.map(v => v -= this.params.value)
            } else if (this.params.operator.toLowerCase() === 'Multiply'){
                u.value = u.value.map(v => v *= this.params.value)
            } else if (this.params.operator.toLowerCase() === 'Divide'){
                u.value = u.value.map(v => v /= this.params.value)
            } else if (this.params.operator.toLowerCase() === 'Mean'){
                u.value = u.value.reduce((a,b) => a + b)/ u.value.length
            } else if (this.params.operator.toLowerCase() === 'Sum'){
                u.value = u.value.reduce((a,b) => a + b)
            }
        })

        return userData
    }
}