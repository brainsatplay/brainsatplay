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

        if (!Array.isArray(u.data)) u.data = [u.data]

        userData.forEach(u => {
            if (this.params.operator.toLowerCase() === 'Add'){
                u.data = u.data.map(v => v += this.params.data)
            } else if (this.params.operator.toLowerCase() === 'Subtract'){
                u.data = u.data.map(v => v -= this.params.data)
            } else if (this.params.operator.toLowerCase() === 'Multiply'){
                u.data = u.data.map(v => v *= this.params.data)
            } else if (this.params.operator.toLowerCase() === 'Divide'){
                u.data = u.data.map(v => v /= this.params.data)
            } else if (this.params.operator.toLowerCase() === 'Mean'){
                u.data = u.data.reduce((a,b) => a + b)/ u.data.length
            } else if (this.params.operator.toLowerCase() === 'Sum'){
                u.data = u.data.reduce((a,b) => a + b)
            }
        })

        return userData
    }
}