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
            color: {default: '#ffffff'},
            minRadius: {default: 0, min: 0, max:1000, step: 0.01},
            scaleRadius: {default: 1, min: 0, max:1000, step: 0.01},
            boundX: {default: true},
            boundY: {default: true},
        }

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
                }
            },
            radius: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dx: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dy: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            color: {
                types: {
                    in: 'color',
                    out: null,
                }
            },
        }

    }

    init = (app) => {}

    deinit = () => {}

    draw = () => {
        return [{data: this._circleFunction, meta: {label: this.label, params: this.params}}]
    }
    
    radius = (userData) => {
        this.params.radius = Math.abs(Number.parseFloat(userData[0].data))
        // this.session.graph.runSafe(this,'default',[{data:true}])
    }

    dx = (userData) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        if (desiredX > 0){
            this.params.x = desiredX
            // this.session.graph.runSafe(this,'default',[{data:true}])
        }
    }

    dy = (userData) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        if (desiredY > 0){
            this.params.y = desiredY
            // this.session.graph.runSafe(this,'default',[{data:true}])
        }
    }

    color = (userData) => {
        this.params.color = userData[0].data
        // this.session.graph.runSafe(this,'default',[{data:true}])
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