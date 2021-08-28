export class Line{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            color: {default: '#ffffff'},
            y: {default: 0.5, min: 0, max:1, step: 0.001},
            weight: {default: 1, min: 0, max:10, step: 1.0},
            scale: {default: 1},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            data: [],
            active: true,
        }

        this.props.function = {function: this._plotLines, active: this.props.active}

        this.ports = {
            default: {
                default: this.props.function,
                input: {type: null},
                output: {type: Object},
                onUpdate: () => {
                    return {data: this.props.function}
                }
            },
            set: {
                input: {type: Array},
                output: {type: null},
                onUpdate: (user) => {
                    this.props.data = user.data
                }
            }
        }

    }

    init = (app) => {}

    deinit = () => {
        this.props.function.active = false
    }

    _plotLines = (ctx) => {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        // var scale = 20;
        ctx.beginPath(); // Draw a new path
        let dx = width/(this.props.data.length - 1)
        this.props.data.forEach((y,i) => ctx.lineTo(dx*i,-Number.parseFloat(this.params.scale)*y + Number.parseFloat(height*this.params.y)))
        ctx.strokeStyle = this.params.color; // Pick a color
        ctx.lineWidth = Number.parseFloat(this.params.weight)
        ctx.stroke(); // Draw
    }
}