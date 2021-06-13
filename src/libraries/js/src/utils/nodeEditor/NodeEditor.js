import {Graph} from './Graph'
import { DOMFragment } from '../../ui/DOMFragment'
import  {plugins} from '../../../brainsatplay'

export class NodeEditor{
    constructor(manager, applet, parentNode) {
        this.manager = manager
        this.app = applet.props.id
        this.plugins = this.manager.applets[this.app]
        this.parentNode = parentNode
        this.element = null
        this.graph=null
        this.shown = false
        this.scale = 1

        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
        }
    
        if (this.plugins){
            let template = () => {
                return `
                <div id="${this.props.id}nodeEditorMask" class="brainsatplay-default-container brainsatplay-node-editor">
                    <div id="${this.props.id}nodeViewer" class="brainsatplay-node-viewer">
                    </div>
                </div>
                `
            }
    
            let setup = () => {
                let container = document.getElementById(`${this.props.id}nodeEditorMask`)
                let viewer = document.getElementById(`${this.props.id}nodeViewer`)

                viewer.addEventListener('wheel', (e)=>{
                    this.scale += 0.01*-e.deltaY
                    if (this.scale < 0.3) this.scale = 0.3 // clamp
                    if (this.scale > 1.5) this.scale = 1.5 // clamp

                    viewer.style['-moz-transform'] = `scale(${this.scale}, ${this.scale})`; /* Moz-browsers */
                    viewer.style['zoom'] = this.scale; /* Other non-webkit browsers */
                    viewer.style['zoom'] = `${this.scale*100}%` /* Webkit browsers */

                    for (let key in this.graph.nodes){
                        this.graph.nodes[key].updateAllEdges()
                    }
                })
                
                this.createPluginSearch(container)

                // Populate Used Nodes and Edges
                this.graph = new Graph(this.plugins, viewer)
            }
    
            this.element = new DOMFragment(
                template,
                parentNode,
                undefined,
                setup
            )
        }


        window.addEventListener('resize', this.responsive)

    }

    toggleDisplay(){
        // console.log('toggling')
        if (this.element.node.style.opacity == 0){
            this.element.node.style.opacity = 1
            this.element.node.style.pointerEvents = 'auto'
            this.shown = true
            this.activate()
        } else {
            this.element.node.style.opacity = 0
            this.element.node.style.pointerEvents = 'none'
            this.shown = false
            this.deactivate()
        }
    }

    deactivate(){

    }

    activate() {
        for (let key in this.graph.nodes) {
            let n = this.graph.nodes[key]
            n.edges.forEach(e => {
                e.node['curve'].onmouseover = () => {
                    e.node['curve'].style.opacity = 0.3
                }
                
                e.node['curve'].onmouseout = () => {
                    e.node['curve'].style.opacity = 1
                }
            
                e.node['curve'].onclick = () => {
                    this.removeEdge(e)
                }
            })
        }
    }

    removeEdge(e){
        let types = ['source','target']
        types.forEach(t => {
            let deactivate = true
            e[t].edges.forEach((o,i) => {
                if (o[`${t}Node`].isSameNode(e[`${t}Node`]) && o !== e) deactivate = false
                else if (o === e) e[t].edges.splice(i,1)
            })
            if (deactivate) e[`${t}Node`].classList.remove('active')
        })
        e.element.remove()
        this.manager.removeEdge(this.app, e.structure)
    }


    animate(source,target){
        if (this.shown){
            this.animateNode(source,'source')
            this.animateNode(target,'target')
            this.animateEdge(source,target)
        }
    }

    animateNode(node,type){
        let instance = this.graph.nodes[node.label]
        if (instance){
            let portEl = instance.element.querySelector(`.${type}-ports`).querySelector(`.port-${node.port}`)
            if (portEl) {
                portEl.classList.add('updated')
                setTimeout(()=>{portEl.classList.remove('updated')}, 500)
            }
        }
    }

    animateEdge(source,target){
        let instance = this.graph.nodes[source.label]
        instance.edges.forEach(e=>{
            if(e.structure.source.split(':')[0] ===source.label){
                if (e.structure.target.split(':')[0] === target.label){
                    e.node.curve.classList.add('updated')
                    setTimeout(()=>{e.node.curve.classList.remove('updated')}, 500)
                }
            }
        })
    }

    addNode(nodeInfo){
        this.graph.createNode(nodeInfo)
    }

    createPluginSearch(container){

        let editor = document.createElement('div')
        editor.id = `${this.props.id}nodeEditor`
        editor.classList.add(`brainsatplay-node-selector`)

        container.addEventListener('dblclick', () => {
            if (editor.style.display === 'none'){
                editor.style.display = ''
            } else {
                editor.style.display = 'none'
            }
        })

        this.responsive()

        // Populate Available Nodes
        let nodeDiv = document.createElement('div')
        editor.insertAdjacentHTML('beforeend',`<input type="text"></input><div class="node-options"></div>`)
        let options = editor.getElementsByClassName(`node-options`)[0]
        let search = editor.getElementsByTagName(`input`)[0]


        // Allow Search of Plugins
        let searchOptions = []
        search.oninput = (e) => {
            let regexp = new RegExp(e.target.value, 'i')
            searchOptions.forEach(o => {
                let test = regexp.test(o.label)
                if (test) {
                    o.element.style.display = ''
                } else {
                    o.element.style.display = 'none'
                }
            })
        }

        for (let type in plugins){
            let nodeType = plugins[type]

            options.insertAdjacentHTML('beforeend',`
            <div class="nodetype-${type}">
            </div>
            `)

            let selectedType = options.getElementsByClassName(`nodetype-${type}`)[0]

            for (let key in nodeType){
                let cls = plugins[type][key]
                // let element = document.createElement('div')
                // element.classList.add(`brainsatplay-default-node-div`)
                let label = `${type}.${cls.name}`

                let element = document.createElement('div')
                element.classList.add("brainsatplay-option-node")
                element.innerHTML = `<p>${label}</p>`

                element.onclick = () => {

                    // Add Node to Manager
                    this.manager.addNode(this.app, {class:cls})

                    // Close Selector
                    var event = new MouseEvent('dblclick', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                      });
                      container.dispatchEvent(event);
                }

                // element.insertAdjacentElement('beforeend',labelDiv)
                selectedType.insertAdjacentElement('beforeend',element)

                searchOptions.push({label, element})
            }
        }

        editor.insertAdjacentElement('beforeend',nodeDiv)
        editor.style.display='none'
        container.insertAdjacentElement('afterbegin',editor)
    }



    responsive = () => {
        let editor = document.getElementById(`${this.props.id}nodeEditor`)

        if (editor){
            editor.style.height = `${250}px`
            editor.style.width = `${500}px`
        }

        if(this.graph){
            for (let key in this.graph.nodes){
                this.graph.nodes[key].updateAllEdges()
            }
        }
    }
}