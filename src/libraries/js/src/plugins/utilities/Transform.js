export class Transform{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            value: {default: 0, options: null},
        }

        this.ports = {
            add: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            subtract: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            multiply: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            divide: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            mean: {
                types: {
                    in: 'array',
                    out: 'number',
                }
            },
            sum: {
                types: {
                    in: 'array',
                    out: 'number',
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}

    add = (userData) => {
        userData.forEach(u => {
            let wasArray = Array.isArray(u.data)
            if (!wasArray) u.data = [u.data]
            u.data = u.data.map(v => v += Number.parseFloat(this.params.value))
            if (!wasArray) u.data = u.data[0]
        })
        return userData
    }

    subtract = (userData) => {
        let wasArray = Array.isArray(u.data)
            if (!wasArray) u.data = [u.data]
            userData.forEach(u => {u.data = u.data.map(v => v -= Number.parseFloat(this.params.value))})
            if (!wasArray) u.data = u.data[0]
        return userData
    }

    multiply = (userData) => {
        let wasArray = Array.isArray(u.data)
        if (!wasArray) u.data = [u.data]
        userData.forEach(u => {u.data = u.data.map(v => v *= Number.parseFloat(this.params.value))})
        if (!wasArray) u.data = u.data[0]

        return userData
    }

    divide = (userData) => {
        let wasArray = Array.isArray(u.data)
        if (!wasArray) u.data = [u.data]
        userData.forEach(u => {u.data = u.data.map(v => v /= Number.parseFloat(this.params.value))})
        if (!wasArray) u.data = u.data[0]
        return userData
    }

    mean = (userData) => {
        userData.forEach(u.data = u.data.reduce((a,b) => a + b)/ u.data.length)
        return userData
    }

    sum = (userData) => {
        userData.forEach(u.data = u.data.reduce((a,b) => a + b))
        return userData
    }
}