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
                output: {type: Element},
                default: document.createElement('div'),
                onUpdate: () => {
                    return [{data: this.props.container}]
                },
            },
             opacity: {
                input: {type:'number'},
                output: {type: null},
                default: 0,
                min: 0,
                max: 1,
                step: 0.01,
                onUpdate:(userData) => {
                    let val = userData[0].data
                    this.props.container.style.opacity = val
                }
             },
             add: {
                input: {type:Object},
                output: {type: null},
                default: {},
                onUpdate:(userData) => {
                    let u = userData[0]
                    let dict = u.data

                    if (dict.HTMLtemplate && u.meta.source && this.props.fragments[u.meta.source] == null){

                        // Insert Fragment
                        this.props.fragments[u.meta.source] = new DOMFragment(
                            dict.HTMLtemplate,
                            this.app.AppletHTML.node,
                            undefined,
                            dict.setupHTML
                        )
                        this.session.graph._resizeAllNodeFragments(this.app.props.id)
                    }
                }
             }
        }

        // Dynamically Add Ports
        let ports = [
            {key: 'html', input: {type: 'HTML'}, output: {type: null}, default: ``, onUpdate: (userData) => {
                this.props.content.innerHTML = userData[0].data

                // Create ID Ports
                var descendants = this.props.content.querySelectorAll("*");
                for (let node of descendants){
                    if (node.id){
                        this.session.graph.addPort(this,node.id, {
                            input: {type: 'string'},
                            output: {type: null},
                            onUpdate: (userData) => {
                                console.log(node, userData[0].data)
                                node.innerHTML = userData[0].data
                            }
                        })
                    }
                }
            }}, 
            {key: 'parentNode', input: {type: Element}, output: {type: null}, default: document.body}, 
            {key: 'style', input: {type: 'CSS'}, output: {type: null}, default: ``, onUpdate: (userData) => {
                if (this.props.style == null){
                    this.props.style = document.createElement('style')
                    this.props.style.id = `${this.props.id}style`
                    this.props.style.type = 'text/css';
                    this.app.AppletHTML.appendStylesheet(() => {return this.props.style});
                }

                this.props.style.innerHTML = userData[0].data
            }}, 
            {key: 'deinit', input: {type: Function}, output: {type: null}, default: ()=>{}}, 
            {key: 'responsive',input: {type: Function}, output: {type: null}, default: ()=>{}}
        ]

        ports.forEach(o => {
            this.session.graph.addPort(this,o.key, {
                input: o.input,
                output: o.output,
                default: o.default,
                onUpdate: (userData) => {
                    this.params[o.key] = userData[0].data
                    o.onUpdate(userData)
                },
            })
        })
    }

    init = () => {

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.content = document.createElement('div')
        this.props.content.id = `${this.props.id}content`
        this.props.container.insertAdjacentElement('beforeend', this.props.content)
        // Create Stylesheet

        let HTMLtemplate = this.props.container

        let setupHTML = () => {
                if (this.params.setupHTML instanceof Function) this.params.setupHTML()

                // Wait to Reference AppletHTML
                this.session.graph.runSafe(this,'html', [{data: this.params.html}])
                setTimeout(() => {
                    this.session.graph.runSafe(this,'style', [{data: this.params.style}])
                }, 100)
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => { 
        if (this.params.deinit instanceof Function) this.params.deinit()
    }

    responsive = () => {
        if (this.params.responsive instanceof Function) this.params.responsive()
    }
}