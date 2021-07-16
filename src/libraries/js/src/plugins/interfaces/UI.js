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
            fragments: {},
            onload: [],
            onresize: {}
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
                default: 1,
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
                            this.props.container,
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
            {key: 'html', input: {type: 'HTML'}, output: {type: null}, default: `<div id='content'></div>`, onUpdate: (userData) => {
                this.props.container.innerHTML = userData[0].data

                // Create ID Ports
                var descendants = this.props.container.querySelectorAll("*");
                for (let node of descendants){
                    if (node.id){
                        this.session.graph.addPort(this,node.id, {
                            input: {type: undefined},
                            output: {type: null},
                            onUpdate: (userData) => {
                                let data = userData[0].data
                                if (data instanceof Function) data = data()

                                node.innerHTML = ''
                                if (
                                    typeof data === "object" ? data instanceof HTMLElement : //DOM2
                                    data && typeof data === "object" && data !== null && data.nodeType === 1 && typeof data.nodeName==="string"
                                ) {
                                    node.insertAdjacentElement('beforeend', data)
                                    setTimeout(() => {
                                        if (data.onload instanceof Function) data.onload()
                                        if (data.onresize instanceof Function) {
                                            this.props.onresize[node.id] = data.onresize
                                            this.responsive()
                                        }
                                    },250) // Wait a bit for onload functions to ensure element has been added
                                }
                                else node.insertAdjacentHTML('beforeend', String(data))
                            }
                        })

                        // Fill Width/Height by Default
                        if (!this.params.style.includes(`#${node.id}`)) {
                            this.session.graph.runSafe(this, 'style', [{data: this.params.style + `\n\n#${node.id} {\n\twidth: 100%;\n\theight: 100%;\n}`}])
                        }
                    }
                }
            }}, 
            // {key: 'parentNode', input: {type: Element}, output: {type: null}, default: document.body}, 
            {key: 'style', input: {type: 'CSS'}, output: {type: null}, default: `.brainsatplay-ui-container {\n\twidth: 100%;\n\theight: 100%;\n}`, onUpdate: (userData) => {
                
                if (this.app.AppletHTML){ // Wait for HTML to Exist
                    if (this.props.style == null){
                        this.props.style = document.createElement('style')
                        this.props.style.id = `${this.props.id}style`
                        this.props.style.type = 'text/css';
                        this.app.AppletHTML.appendStylesheet(() => {return this.props.style});
                    }

                    // Scope the CSS (add ID scope)
                    let styleArray = userData[0].data.split(/[{}]/).filter(String).map(function(str){
                        return str.trim(); 
                    });

                    let newStyle = ``
                    for (let i = 0; i < styleArray.length - 1; i+=2){
                        if (styleArray[i].includes('.brainsatplay-ui-container')) newStyle += `[id='${this.props.id}']` // styleArray[i+1]
                        else newStyle += `[id='${this.props.id}'] ${styleArray[i]} `
                        newStyle +=`{\n\t${styleArray[i+1]}\n}\n\n`
                    }

                    this.props.style.innerHTML = newStyle
                }
            }}, 
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
                    o.onUpdate(userData)
                }
            }
            
            if (o.edit === false) this.ports[o.key].edit = false
        })

    }

    init = () => {

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.classList.add('brainsatplay-ui-container')
        this.props.container.style = this.params.containerStyle
        this.session.graph.runSafe(this,'html', [{data: this.params.html}])

        // Create Stylesheet
        let HTMLtemplate = this.props.container

        let setupHTML = () => {
                if (this.params.setupHTML instanceof Function) this.params.setupHTML()

                // Wait to Reference AppletHTML
                setTimeout(() => {
                    this.session.graph.runSafe(this,'style', [{data: this.params.style}])
                }, 250)
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => { 
        if (this.params.deinit instanceof Function) this.params.deinit()
        this.props.style.remove()
    }

    responsive = () => {
        if (this.params.responsive instanceof Function) this.params.responsive()
       for (let key in this.props.onresize){
        //    console.log(key, this.ports[key])
        //    if (this.ports[key].active.in > 0) 
           this.props.onresize[key]()
        //    else delete this.props.onresize[key]
       }
    }
}