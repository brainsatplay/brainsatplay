export class HTML{

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
            <div id='${this.props.id}' style='background: transparent; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                ${this.params.html}
            </div>`
        }

        let setupHTML = (app) => {

            this.props.container = document.getElementById(`${this.props.id}`);

            // Set Default Port Output
            this.ports.element.defaults.output[0].data = this.props.container
        }

        return { HTMLtemplate, setupHTML}
    }

    element = () => {
        return [{data: this.props.container, meta: {label: `${this.label}_element`}}]
    }

    deinit = () => {
    }

    responsive = () => {}

    default = (userData) => {
        // userData.forEach(u => {
        //     this.props.drawFunctions[u.username + u.meta.label] = u.data
        // })
    }
}