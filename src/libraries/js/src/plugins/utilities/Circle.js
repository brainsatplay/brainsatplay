export class Circle{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
        }

        this.ports = {
            draw: {
                defaults: {
                    output: [{data: this._circleFunction, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'function',
                },
                onUpdate: () => {
                    return [{data: this._circleFunction, meta: {label: this.label, params: this.params}}]
                }
            },
            radius: {
                default: 100,
                min: 0,
                max: 1000,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.radius = Math.abs(Number.parseFloat(userData[0].data))
                }
            },
            x: {
                default: 0,
                min: 0,
                max: 1000,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.x = Number.parseFloat(userData[0].data)
                }
            },
            y: {
                default: 0,
                min: 0,
                max: 1000,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.y = Number.parseFloat(userData[0].data)
                }
            },
            dx: {
                default: 0,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.x = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
                }
            },
            dy: {
                default: 0,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.y = Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
                }
            },
            color: {
                default: '#ffffff',
                input: {type: 'color'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.color = userData[0].data
                }
            },
            minRadius: {
                default: 0,
                min: 0,
                max: 1000,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.minRadius = userData[0].data
                }
            },
            scaleRadius: {
                default: 1,
                min: 0,
                max: 1000,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.scaleRadius = userData[0].data
                }
            }
        }

    }

    init = (app) => {}

    deinit = () => {}

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