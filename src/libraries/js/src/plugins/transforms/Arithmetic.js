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
                onUpdate: (userData) => {
                    this.props.input = userData
                    // this.session.graph.runSafe(this,'not',[{forceRun: true}])
                    // this.session.graph.runSafe(this,'toFloat',[{forceRun: true}])
                    this.session.graph.runSafe(this,'sum',[{forceRun: true}])
                    this.session.graph.runSafe(this,'mean',[{forceRun: true}])
                    this.session.graph.runSafe(this,'add',[{forceRun: true}])
                    this.session.graph.runSafe(this,'subtract',[{forceRun: true}])
                    this.session.graph.runSafe(this,'multiply',[{forceRun: true}])
                    this.session.graph.runSafe(this,'divide',[{forceRun: true}])
                }
            },

            // not: {
            //     edit: false,
            //     default: 0,
            //     input: {type: null},
            //     output: {type: 'boolean'},
            //     onUpdate: () => {
            //         let inputCopy = this.session.graph.deeperCopy(this.props.input)
            //         return inputCopy.map(u => {
            //             u.data = !u.data
            //             return u
            //         })
            //     },
            // },

            // toFloat: {
            //     edit: false,
            //     default: 0,
            //     input: {type: null},
            //     output: {type: 'number'},
            //     onUpdate: () => {
            //         let inputCopy = this.session.graph.deeperCopy(this.props.input)
            //         return inputCopy.map(u => {
            //             u.data = this._parseProperFormat(u.data)
            //             return u
            //         })
            //     }
            // },

            add: {
                default: 0,
                input: {type: 'number'},
                output: {type: 'number'},
                onUpdate: (userData) => {
                    if (userData[0].data) this.params.add = userData[0].data
            
                    let inputCopy = this.session.graph.deeperCopy(this.props.input)
                    return inputCopy.map(u => {
                        let wasArray = Array.isArray(u.data)
                        if (!wasArray) u.data = [u.data]
                        u.data = u.data.map(v => v += this._parseProperFormat(this.params.add))
                        if (!wasArray) u.data = u.data[0]
                        return u
                    })
                }
            },
            subtract: {
                default: 0,
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            multiply: {
                default: 0,
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            divide: {
                default: 0,
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            mean: {
                edit: false,
                types: {
                    in: null,
                    out: 'number',
                }
            },
            sum: {
                edit: false,
                types: {
                    in: null,
                    out: 'number',
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}

    subtract = (userData) => {
        if (userData[0].data) this.params.subtract = userData[0].data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)

        inputCopy.forEach(u => {
            let wasArray = Array.isArray(u.data)
            if (!wasArray) u.data = [u.data]
            u.data = u.data.map(v => v -= this._parseProperFormat(this.params.subtract))
            if (!wasArray) u.data = u.data[0]
        })

        return inputCopy
    }

    multiply = (userData) => {
        if (userData[0].data) this.params.multiply = userData[0].data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        inputCopy.forEach(u => {
            let wasArray = Array.isArray(u.data)
            if (!wasArray) u.data = [u.data]
            u.data = u.data.map(v => v *= this._parseProperFormat(this.params.multiply))
            if (!wasArray) u.data = u.data[0]
        })
        return inputCopy
    }

    divide = (userData) => {
        if (userData[0].data) this.params.divide = userData[0].data
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        inputCopy.forEach(u => {
            let wasArray = Array.isArray(u.data)
            if (!wasArray) u.data = [u.data]
            u.data = u.data.map(v => v /= this._parseProperFormat(this.params.divide))
            if (!wasArray) u.data = u.data[0]
        })
        return inputCopy
    }

    mean = () => {
        let meaned = false
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        inputCopy.forEach(u => {
            if (Array.isArray(u.data)) {
                meaned = true
                u.data = u.data.reduce((a,b) => a + b)/ u.data.length
            }
        })
        if (meaned) return inputCopy
    }

    sum = () => {
        let summed = false
        let inputCopy = this.session.graph.deeperCopy(this.props.input)
        inputCopy.forEach(u => {
            summed = true
            if (Array.isArray(u.data)) u.data = u.data.reduce((a,b) => a + b)
        })
        if (summed) return inputCopy
    }

    _parseProperFormat = (val) => {
        if (typeof val === 'boolean') val = val ? 1 : 0;
        else val = Number.parseFloat(val)
        return val
    }
}