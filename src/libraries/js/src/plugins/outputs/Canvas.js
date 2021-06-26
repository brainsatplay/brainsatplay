export class Canvas{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            canvas: null,
            container: null,
            context: null,
            drawFunctions: {},
            looping: false
        }

        this.ports = {
            default: {
                types: {
                    in: 'function',
                    out: null
                }
            },
            element: {
                defaults: {
                    output: [{data: null, meta: {label: `${this.label}_element`}}]
                },
                types: {
                    in: null,
                    out: 'Element'
                }
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <canvas></canvas>
            </div>`
        }

        let setupHTML = (app) => {

            this.props.container = document.getElementById(`${this.props.id}`);
            this.props.canvas = this.props.container.querySelector(`canvas`);
            this.props.context = this.props.canvas.getContext("2d");

            // Set Default Port Output
            this.ports.element.defaults.output[0].data = this.props.canvas

            // Set Looping
            this.props.looping = true

            const animate = () => {

                if (this.props.looping){
                    setTimeout(() => {

                        this._clearCanvas()

                        // console.log(this.props.drawFunctions)
                        for (let key in this.props.drawFunctions) {
                            this.props.drawFunctions[key](this.props.context)
                        }

                        animate()
                    }, 1000/60)
                }
            }
            animate()
        }

        return { HTMLtemplate, setupHTML}
    }

    element = () => {
        return [{data: this.props.canvas, meta: {label: `${this.label}_element`}}]
    }

    deinit = () => {
        this.props.looping = false
    }

    responsive = () => {
        this.props.canvas.width = this.props.container.offsetWidth
        this.props.canvas.height = this.props.container.offsetHeight
    }

    default = (userData) => {
        userData.forEach(u => {
            this.props.drawFunctions[u.username + u.meta.label] = u.data
        })
    }


    _clearCanvas = () => {
        this.props.context.fillStyle = 'black';
        this.props.context.stokeStyle = 'white';
        this.props.context.fillRect(0, 0, this.props.canvas.width, this.props.canvas.height)
        this.props.context.strokeRect(0, 0, this.props.canvas.width, this.props.canvas.height)
    }
}