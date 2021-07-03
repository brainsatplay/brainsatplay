import {DOMFragment} from '../../ui/DOMFragment'

export class UI{

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
            looping: false,
            fragments: {}
        }

        this.ports = {
            html: {
                input: {type: 'string'},
                output: {type: null},
                default: ``,
                onUpdate: (userData) => {
                    this.params.html = userData[0].data
                },
            },
            parentNode: {
                input: {type: 'Element'},
                output: {type: null},
                default: document.body,
                onUpdate: (userData) => {
                    this.params.parentNode = userData[0].data
                },
            },
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
             },
             add: {
                input: {type:Object},
                output: {type: null},
                onUpdate:(userData) => {
                    let u = userData[0]
                    let dict = u.data

                    if (dict.HTMLtemplate && u.meta.source && this.props.fragments[u.meta.source] == null){
                        this.props.fragments[u.meta.source] = new DOMFragment(
                            dict.HTMLtemplate,
                            this.props.ui.node,
                            undefined,
                            dict.setupHTML
                        )
                    }
                }
             }
        }
    }

    init = () => {

        // Create ID Ports
        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = this.params.style
        this.props.container.insertAdjacentHTML(`beforeend`, this.params.html)

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

        let HTMLtemplate = ``

        let setupHTML = (app) => {
            this.props.ui = new DOMFragment(
                () => {return this.props.container},
                app.id,
                ()=>{
                    console.log('creating')
                },
                undefined,
                undefined,
                undefined,
                undefined,
                this.responsive
            )
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => { 
        // this.props.ui.deleteNode() 
    }

    responsive = () => {}
}