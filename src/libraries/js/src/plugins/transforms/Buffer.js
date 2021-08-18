
export class Buffer{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            size: {default: 500, min: 1, max: 2500, step: 1},
        }

        this.ports = {
            default: {
                input: {type: undefined},
                output: {type: Array},
            }
        }

        this.props = {
            looping: false,
            buffer: []
        }
    }

    init = () => {
        this.props.buffer = []
    }

    deinit = () => {
        this.props.looping = false
    }

    default = (user) => {
        this.props.buffer.push(user.data)
        if (this.props.buffer.length > this.params.size) this.props.buffer.shift()
        user.data = this.props.buffer
        user.meta.label = this.label
        return user
    }
}