export class Circle{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            active: true
        }

        this.props.function = {function: this._circleFunction, active: this.props.active}

        this.ports = {
            draw: {
                default: this.props.function,
                input: {type: null},
                output: {type: Object},
                onUpdate: () => {
                    return {data: this.props.function}
                }
            },
            radius: {
                default: 0.5,
                min: 0,
                max: 2,
                step: 0.001,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.radius = user.data
                },
            },
            x: {
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.001,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.x = Number.parseFloat(user.data)
                }
            },
            y: {
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.001,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.y = Number.parseFloat(user.data)
                }
            },
            dx: {
                default: 0,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.x = Number.parseFloat(this.params.x) + Number.parseFloat(user.data)
                }
            },
            dy: {
                default: 0,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.y = Number.parseFloat(this.params.y) + Number.parseFloat(user.data)
                }
            },
            color: {
                default: '#ffffff',
                input: {type: 'color'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.color = user.data
                }
            },
            radiusOffset: {
                default: 0.0,
                min: -1,
                max: 1,
                step: 0.001,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.radiusOffset = Number.parseFloat(user.data)
                }
            },
            offsetScale: {
                default: 1,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    this.params.offsetScale = user.data
                }
            }
        }

    }

    init = (app) => {}

    deinit = () => {
        this.props.function.active = false
    }

    _circleFunction = (ctx) => {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;

        let minDim = Math.min(width,height)
        let relRadiusBase = minDim/2

        ctx.beginPath();
        ctx.arc(
            width*this.params.x, 
            height*this.params.y, 
            Math.abs(relRadiusBase*Number.parseFloat(this.params.radius) + relRadiusBase*Number.parseFloat(this.params.radiusOffset)*Number.parseFloat(this.params.offsetScale)),
            0, 
            Math.PI*2
            );
        ctx.fillStyle = this.params.color;
        ctx.fill();
        ctx.closePath();
    }
}