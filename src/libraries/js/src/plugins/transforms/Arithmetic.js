

export class Arithmetic {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        
        
        
        

        this.props = {
            input: []
        }

        this.ports = {
            modifier: {
                data: 0,
                input: {type: 'number'},
                output: {type: null},
            },

            add: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => { 
                    console.log(user, this.ports.modifier.data)           

                    let wasArray = Array.isArray(user.data)
                    if (!wasArray) user.data = [user.data]
                    user.data = user.data.map(v => v += this._parseProperFormat(this.ports.modifier.data))
                    if (!wasArray) user.data = user.data[0]

                    console.log(user)
                    return user
                }            
            },
            subtract: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
            
                        let wasArray = Array.isArray(user.data)
                        if (!wasArray) user.data = [user.data]
                        user.data = user.data.map(v => v -= this._parseProperFormat(this.ports.modifier.data))
                        if (!wasArray) user.data = user.data[0]
            
                    return user
                }
            },
            multiply: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    let wasArray = Array.isArray(user.data)
                    if (!wasArray) user.data = [user.data]
                    user.data = user.data.map(v => v *= this._parseProperFormat(this.ports.modifier.data))
                    if (!wasArray) user.data = user.data[0]
                    return user
                }
            },
            divide: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                        let wasArray = Array.isArray(user.data)
                        if (!wasArray) user.data = [user.data]
                        user.data = user.data.map(v => v /= this._parseProperFormat(this.ports.modifier.data))
                        if (!wasArray) user.data = user.data[0]
                    return user
                }
            },
            mean: {
                edit: false,
                input: {type: Array},
                output: {type: 'number'},
                onUpdate: (user) => {
                    user.data = user.data.reduce((a,b) => a + b)/ user.data.length
                    return user
                }
            },
            sum: {
                edit: false,
                input: {type: Array},
                output: {type: 'number'},
                onUpdate: (user) => {
                    user.data = user.data.reduce((a,b) => a + b)
                    return user
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}

    _parseProperFormat = (val) => {
        if (typeof val === 'boolean') val = val ? 1 : 0;
        else val = Number.parseFloat(val)
        return val
    }
}