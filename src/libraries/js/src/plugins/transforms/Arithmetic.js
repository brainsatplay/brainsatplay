export class Arithmetic{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            input: []
        }

        this.ports = {
            input: {
                edit: false,
                default: 0,
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {
                    this.props.input = user
                    this.session.graph.runSafe(this,'sum',{forceRun: true})
                    this.session.graph.runSafe(this,'mean',{forceRun: true})
                    this.session.graph.runSafe(this,'add',{forceRun: true})
                    this.session.graph.runSafe(this,'subtract',{forceRun: true})
                    this.session.graph.runSafe(this,'multiply',{forceRun: true})
                    this.session.graph.runSafe(this,'divide',{forceRun: true})
                }
            },

            add: {
                default: 0,
                input: {type: 'number'},
                output: {type: 'number'},
                onUpdate: (user) => {
                    if (user.data) this.params.add = user.data
            
                    let inputCopy = this.session.graph.deeperCopy(this.props.input)
                    let wasArray = Array.isArray(inputCopy.data)
                    if (!wasArray) inputCopy.data = [inputCopy.data]
                    inputCopy.data = inputCopy.data.map(v => v += this._parseProperFormat(this.params.add))
                    if (!wasArray) inputCopy.data = inputCopy.data[0]
                    return inputCopy
                }
            },
            subtract: {
                default: 0,
                input: {type: 'number'},
                output: {type: 'number'},
            },
            multiply: {
                default: 0,
                input: {type: 'number'},
                output: {type: 'number'},
            },
            divide: {
                default: 0,
                input: {type: 'number'},
                output: {type: 'number'},
            },
            mean: {
                edit: false,
                input: {type: null},
                output: {type: 'number'},
            },
            sum: {
                edit: false,
                input: {type: null},
                output: {type: 'number'},
            }
        }
    }

    init = () => {}

    deinit = () => {}

    subtract = (user) => {
        if (user.data) this.params.subtract = user.data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)

            let wasArray = Array.isArray(inputCopy.data)
            if (!wasArray) inputCopy.data = [inputCopy.data]
            inputCopy.data = inputCopy.data.map(v => v -= this._parseProperFormat(this.params.subtract))
            if (!wasArray) inputCopy.data = inputCopy.data[0]

        return inputCopy
    }

    multiply = (user) => {
        if (user.data) this.params.multiply = user.data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        let wasArray = Array.isArray(inputCopy.data)
        if (!wasArray) inputCopy.data = [inputCopy.data]
        inputCopy.data = inputCopy.data.map(v => v *= this._parseProperFormat(this.params.multiply))
        if (!wasArray) inputCopy.data = inputCopy.data[0]
        return inputCopy
    }

    divide = (user) => {
        if (user.data) this.params.divide = user.data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
            let wasArray = Array.isArray(inputCopy.data)
            if (!wasArray) inputCopy.data = [inputCopy.data]
            inputCopy.data = inputCopy.data.map(v => v /= this._parseProperFormat(this.params.divide))
            if (!wasArray) inputCopy.data = inputCopy.data[0]
        return inputCopy
    }

    mean = () => {
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        if (Array.isArray(inputCopy.data)) {
            inputCopy.data = inputCopy.data.reduce((a,b) => a + b)/ inputCopy.data.length
            return inputCopy
        }
    }

    sum = () => {
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        if (Array.isArray(inputCopy.data)) {
            inputCopy.data = inputCopy.data.reduce((a,b) => a + b)
            return inputCopy
        }
    }

    _parseProperFormat = (val) => {
        if (typeof val === 'boolean') val = val ? 1 : 0;
        else val = Number.parseFloat(val)
        return val
    }
}