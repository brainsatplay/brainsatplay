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
                    <div id="${this.props.id}nodeEditor" class="brainsatplay-node-sidebar">
                        <div >
                            <div class='node-sidebar-header'>
                                <h4>Project Info</h4>
                            </div>
                            <div class='node-sidebar-content'>
                                <div>
                                    <div>
                                        <p>Name</p>
                                    </div>
                                    <div>
                                        <input type="text" id="${this.props.id}name"></input>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <p>Author</p>
                                    </div>
                                    <div>
                                        <input type="text" id="${this.props.id}author"></input>
                                    </div>
                                </div>
                            </div>
                            <div class='node-sidebar-header'>
                                <h4>Parameters</h4>
                            </div>
                            <div id="${this.props.id}params" class='node-sidebar-content'>
                            <p>Select a node</p>
                            </div>
                        </div>
                        <div style="display: flex; height: 100px;">
                            <button id="${this.props.id}edit" class="brainsatplay-default-button">Edit Node</button>
                            <button id="${this.props.id}delete" class="brainsatplay-default-button">Delete Node</button>
                        </div>
                    </div>
                </div>
                `
            }
    
            let setup = () => {
                let container = document.getElementById(`${this.props.id}nodeEditorMask`)
                let viewer = document.getElementById(`${this.props.id}nodeViewer`)
                document.getElementById(`${this.props.id}name`).value = applet.info.name
                document.getElementById(`${this.props.id}author`).value = applet.info.author
                document.getElementById(`${this.props.id}edit`).style.display = 'none'


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

                // Add Click Events
                for (let key in this.graph.nodes){
                    let node = this.graph.nodes[key]
                    this.addPortEvents(node)
                    this.addNodeEvents(node)
                }
                // this.graph.nodes[Object.keys(this.graph.nodes)[0]].element.querySelector('.brainsatplay-display-node').click()

                this.addEdgeReactivity()
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

    _onMouseOverEdge = (e) => {
        e.node['curve'].style.opacity = 0.3
    }

    _onMouseOutEdge = (e) => {
        e.node['curve'].style.opacity = 1
    }
    _onClickEdge = (e) => {
        this.removeEdge(e)
    }

    addEdgeReactivity = () => {
        for (let key in this.graph.edges) {
            let e = this.graph.edges[key]
            e.node['curve'].addEventListener('mouseover', () => {this._onMouseOverEdge(e)})
            e.node['curve'].addEventListener('mouseout', () => {this._onMouseOutEdge(e)})
            e.node['curve'].addEventListener('click', () => {this._onClickEdge(e)})
        }
    }

    toggleDisplay(){
        // console.log('toggling')
        if (this.element.node.style.opacity == 0){
            this.element.node.style.opacity = 1
            this.element.node.style.pointerEvents = 'auto'
            this.shown = true
        } else {
            this.element.node.style.opacity = 0
            this.element.node.style.pointerEvents = 'none'
            this.shown = false
        }
    }

    removeEdge(e, ignoreManager=false){
        this.graph.removeEdge(e)
        if (!ignoreManager) this.manager.removeEdge(this.app, e.structure)
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
            let splitSource = e.structure.source.split(':')
            if (splitSource.length < 2 ) splitSource.push('default')
            if(splitSource[1] === source.port){
                let splitTarget = e.structure.target.split(':')
                if (splitTarget.length < 2 ) splitTarget.push('default')
                if (splitTarget[0] === target.label && splitTarget[1] == target.port){
                    e.node.curve.classList.add('updated')
                    setTimeout(()=>{e.node.curve.classList.remove('updated')}, 500)
                }
            }
        })
    }


    drawEdge = (p1,p2) => {
        if (p2.classList.contains('node-port')){
            let source = `${p1.getAttribute('data-node')}:${p1.getAttribute('data-port')}`
            let target  = `${p2.getAttribute('data-node')}:${p2.getAttribute('data-port')}`
            this.addEdge({source,target})
        } else {
            // console.log('remove half-done svg')
        }
        // window.removeEventListener('pointermove', controlSVG)
        window.removeEventListener('pointerup', this.drawEdge)
    }

    addEdge(e){
        this.manager.addEdge(this.app,e)
        this.graph.addEdge(e)
    }

    addNode(cls){
        let nodeInfo = this.manager.addNode(this.app, {class:cls})
        this.graph.addNode(nodeInfo)
        this.addNodeEvents(this.graph.nodes[nodeInfo.id])
        this.addPortEvents(this.graph.nodes[nodeInfo.id])
    }

    addNodeEvents(node){
        let nodeElement = node.element.querySelector('.brainsatplay-display-node')
        nodeElement.onclick = () => {
            let clickedNode = this.graph.parentNode.querySelector('.clicked')
            if (clickedNode) clickedNode.classList.remove('clicked')
            nodeElement.classList.add('clicked')

            let selectedParams = document.getElementById(`${this.props.id}params`)
            selectedParams.innerHTML = ''
            let plugin = node.nodeInfo.instance
            for (let key in plugin.paramOptions){
                selectedParams.insertAdjacentHTML('beforeend',  `
                <div>
                    <div>
                        <p>${key}</p>
                    </div>
                    <div>
                        <input type="text" value=${plugin.params[key]}></input>
                    </div>
                </div>
                `)
            }
            
            document.getElementById(`${this.props.id}delete`).onclick = () => {
                this.removeNode(node.nodeInfo)
            }

            // document.getElementById(`${this.props.id}edit`).onclick = () => {
            // }
        }
    }

    addPortEvents(node){
        let portElements = node.element.querySelectorAll('.node-port')

        for (let portElement of portElements){
            // Listen for clicks to draw SVG edge
            portElement.onpointerdown = (e) => {
                // window.addEventListener('pointermove', controlSVG)
                window.addEventListener('pointerup', (e) => {this.drawEdge(portElement, e.target)})
            }
        }
    }

    removeNode = (nodeInfo) => {
        this.manager.remove(this.app, nodeInfo.class.id, nodeInfo.instance.label)
        this.graph.removeNode(nodeInfo)
    }
 

    createPluginSearch(container){
        let selector = document.createElement('div')
        selector.id = `${this.props.id}nodeSelector`
        selector.classList.add(`brainsatplay-node-selector`)

        container.addEventListener('dblclick', () => {
            if (selector.style.display === 'none'){
                selector.style.display = ''
            } else {
                selector.style.display = 'none'
            }
        })

        // Populate Available Nodes
        let nodeDiv = document.createElement('div')
        selector.insertAdjacentHTML('beforeend',`<input type="text"></input><div class="node-options"></div>`)
        let options = selector.getElementsByClassName(`node-options`)[0]
        let search = selector.getElementsByTagName(`input`)[0]


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
                    this.addNode(cls)

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

        selector.insertAdjacentElement('beforeend',nodeDiv)
        selector.style.display='none'
        container.insertAdjacentElement('afterbegin',selector)
        this.responsive()
    }



    responsive = () => {
        let selector = document.getElementById(`${this.props.id}nodeSelector`)

        if (selector){
            selector.style.height = `${250}px`
            selector.style.width = `${500}px`
        }

        if(this.graph){
            for (let key in this.graph.nodes){
                this.graph.nodes[key].updateAllEdges()
            }
        }
    }

    deinit(){
        this.element.node.remove()
    }
}