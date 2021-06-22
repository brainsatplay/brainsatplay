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

        userData.forEach(u => {
            let notArray = false
            if (!Array.isArray(u.data)) {
                u.data = [u.data]
                notArray = true
            }

            let transformer = Number.parseFloat(this.params.value)
            if (this.params.operator.toLowerCase() === 'add'){
                u.data = u.data.map(v => v += transformer)
            } else if (this.params.operator.toLowerCase() === 'subtract'){
                u.data = u.data.map(v => v -= transformer)
            } else if (this.params.operator.toLowerCase() === 'multiply'){
                u.data = u.data.map(v => v *= transformer)
            } else if (this.params.operator.toLowerCase() === 'divide'){
                u.data = u.data.map(v => v /= transformer)
            } else if (this.params.operator.toLowerCase() === 'mean'){
                u.data = u.data.reduce((a,b) => a + b)/ u.data.length
            } else if (this.params.operator.toLowerCase() === 'sum'){
                u.data = u.data.reduce((a,b) => a + b)
            }

            if (notArray && Array.isArray(u.data)) u.data = u.data[0]
        })

        return userData
    }
}