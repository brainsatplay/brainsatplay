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
            element: {
                input: {type: null},
                output: {type: 'Element'},
                onUpdate: () => {
                    return [{data: this.props.container}]
                },
            },
             style: {
                 input: {type:'string'},
                 output: {type: null},
                 onUpdate: (userData) => {
                     this.params.style = userData[0].data
                 }
             },
             opacity: {
                input: {type:'number'},
                output: {type: null},
                onUpdate:(userData) => {
                    let val = userData[0].data
                    this.props.container.style.opacity = val
                }
             }
        }
    }

    init = () => {

        // Create ID Ports
        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = this.params.style
        this.props.container.insertAdjacentHTML(`beforeend`,this.params.html)
        var descendants = this.props.container.querySelectorAll("*");
        for (let node of descendants){
            if (node.id){
                this.ports[node.id] = {
                    input: {type: 'string'},
                    output: {type: null},
                    onUpdate: (userData) => {
                        node.innerHTML = userData[0].data
                    }
                }
            }
        }

        let HTMLtemplate = () => {
            return this.props.container
        }

        let setupHTML = (app) => {

            this.props.container = document.getElementById(`${this.props.id}`);

            // Set Default Port Output
            this.ports.element.default = this.props.container
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => {
    }

    responsive = () => {}
}