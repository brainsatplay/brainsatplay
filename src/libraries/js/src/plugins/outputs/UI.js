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
            element: {
                input: {type: null},
                output: {type: 'Element'},
                onUpdate: () => {
                    return [{data: this.props.container}]
                },
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

                        // Insert Fragment
                        this.props.fragments[u.meta.source] = new DOMFragment(
                            dict.HTMLtemplate,
                            this.props.ui.node,
                            undefined,
                            dict.setupHTML
                        )

                        console.log(this.app)
                        this.session.graph._resizeAllNodeFragments(this.app)
                    }
                }
             }
        }

        // Dynamically Add Ports
        let ports = [
            {key: 'html', input: {type: 'string'}, output: {type: null}, default: ``}, 
            {key: 'parentNode', input: {type: 'Element'}, output: {type: null}, default: document.body}, 
            {key: 'style', input: {type: 'string'}, output: {type: null}}, 

            {key: 'deinit', input: {type: Function}, output: {type: null}, default: ()=>{}}, 
            {key: 'responsive',input: {type: Function}, output: {type: null}, default: ()=>{}}
        ]

        ports.forEach(o => {
            this.ports[o.key] = {
                input: o.input,
                output: o.output,
                default: o.default,
                onUpdate: (userData) => {
                    this.params[o.key] = userData[0].data
                },
            }
        })
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
                    if (this.params.setupHTML instanceof Function) this.params.setupHTML()
                },
            )
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => { 
        if (this.params.deinit instanceof Function) this.params.deinit()
        // this.props.ui.deleteNode() 
    }

    responsive = () => {
        if (this.params.responsive instanceof Function) this.params.responsive()
    }
}