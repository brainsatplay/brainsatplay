import {Plugin} from '../Plugin'

export class Arithmetic extends Plugin {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        super(label, session)
        this.label = label
        this.session = session
        

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
                    let inputCopy = this.session.graph.deeperCopy(user)
                    console.log(inputCopy)           

                    let wasArray = Array.isArray(inputCopy.data)
                    if (!wasArray) inputCopy.data = [inputCopy.data]
                    inputCopy.data = inputCopy.data.map(v => v += this._parseProperFormat(this.ports.modifier.data))
                    if (!wasArray) inputCopy.data = inputCopy.data[0]

                    console.log(inputCopy)
                    return inputCopy
                }            
            },
            subtract: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    let inputCopy = this.session.graph.deeperCopy(user)
            
                        let wasArray = Array.isArray(inputCopy.data)
                        if (!wasArray) inputCopy.data = [inputCopy.data]
                        inputCopy.data = inputCopy.data.map(v => v -= this._parseProperFormat(this.ports.modifier.data))
                        if (!wasArray) inputCopy.data = inputCopy.data[0]
            
                    return inputCopy
                }
            },
            multiply: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    let inputCopy = this.session.graph.deeperCopy(user)
                    let wasArray = Array.isArray(inputCopy.data)
                    if (!wasArray) inputCopy.data = [inputCopy.data]
                    inputCopy.data = inputCopy.data.map(v => v *= this._parseProperFormat(this.ports.modifier.data))
                    if (!wasArray) inputCopy.data = inputCopy.data[0]
                    return inputCopy
                }
            },
            divide: {
                data: 0,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    let inputCopy = this.session.graph.deeperCopy(user)
                        let wasArray = Array.isArray(inputCopy.data)
                        if (!wasArray) inputCopy.data = [inputCopy.data]
                        inputCopy.data = inputCopy.data.map(v => v /= this._parseProperFormat(this.ports.modifier.data))
                        if (!wasArray) inputCopy.data = inputCopy.data[0]
                    return inputCopy
                }
            },
            mean: {
                edit: false,
                input: {type: Array},
                output: {type: 'number'},
                onUpdate: (user) => {
                    let inputCopy = this.session.graph.deeperCopy(user)
                    inputCopy.data = inputCopy.data.reduce((a,b) => a + b)/ inputCopy.data.length
                    return inputCopy
                }
            },
            sum: {
                edit: false,
                input: {type: Array},
                output: {type: 'number'},
                onUpdate: (user) => {
                    let inputCopy = this.session.graph.deeperCopy(user)
                    inputCopy.data = inputCopy.data.reduce((a,b) => a + b)
                    return inputCopy
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