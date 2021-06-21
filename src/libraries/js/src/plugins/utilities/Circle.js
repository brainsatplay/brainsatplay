export class Circle{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            radius: {default: 100, min: 0, max:1000, step: 0.01},
            x: {default: 0, min: 0, max:1000, step: 0.01},
            y: {default: 0, min: 0, max:1000, step: 0.01},
            color: {default: 'white', options:['white','red']},
            minRadius: {default: 0, min: 0, max:1000, step: 0.01},
            scaleRadius: {default: 1, min: 0, max:1000, step: 0.01},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this._circleFunction, meta: {label: this.label}}]
                }
            },
            radius: {},
            dx: {},
            dy: {},
            color: {}
        }

    }

    init = () => {}

    deinit = () => {}

    default = () => {
        return [{data: this._circleFunction, meta: {label: this.label, params: this.params}}]
    }

    radius = (userData) => {
        this.params.radius = Number.parseFloat(userData[0].data)
        this.session.graph.runSafe(this,'default',[{data:true}])
    }

    dx = (userData) => {
        this.params.x = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        this.session.graph.runSafe(this,'default',[{data:true}])
    }

    dy = (userData) => {
        this.params.y = Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        this.session.graph.runSafe(this,'default',[{data:true}])
    }

    color = (userData) => {
        this.params.color = (userData[0].data) ? 'red' : 'white'
        this.session.graph.runSafe(this,'default',[{data:true}])
    }

    _circleFunction = (ctx) => {
        ctx.beginPath();
        ctx.arc(
            this.params.x, 
            this.params.y, 
            Number.parseFloat(this.params.minRadius) + Number.parseFloat(this.params.radius)*Number.parseFloat(this.params.scaleRadius),
            0, 
            Math.PI*2
            );
        ctx.fillStyle = this.params.color;
        ctx.fill();
        ctx.closePath();
    }
}