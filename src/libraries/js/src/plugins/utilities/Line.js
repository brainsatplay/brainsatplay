export class Line{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            color: {default: '#ffffff'},
            y: {default: 0, min: 0, max:1, step: 0.001},
            weight: {default: 1, min: 0, max:10, step: 1.0},
            scale: {default: 1},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            data: []
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this._plotLines, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'function',
                }
            },
            set: {
                types: {
                    in: Array,
                    out: null,
                }
            }
        }

    }

    init = (app) => {}

    deinit = () => {}

    default = () => {
        return [{data: this._plotLines, meta: {label: this.label, params: this.params}}]
    }

    set = (userData) => {
        this.props.data = userData[0].data
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