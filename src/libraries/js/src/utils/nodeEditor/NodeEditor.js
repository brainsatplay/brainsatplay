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
    }


    animatePort(nodeId, port, type){
        let nodes = this.graph.nodes
        let node = nodes[nodeId]

        if (node){
            let portEl = node.element.querySelector(`.${type}-ports`).querySelector(`.port-${port}`)
            if (portEl) {
                portEl.classList.add('updated')
                setTimeout(()=>{portEl.classList.remove('updated')}, 500)
            }
        }
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

        const resizeDisplay = () => {
            editor.style.height = `${250}px`
            editor.style.width = `${500}px`
        }

        resizeDisplay()
        window.addEventListener('resize', resizeDisplay)

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
                let element = document.createElement('div')
                element.classList.add(`brainsatplay-default-node-div`)
                let label = `${type}.${cls.name}`

                let labelDiv = document.createElement('div')
                labelDiv.classList.add("brainsatplay-option-node")
                labelDiv.innerHTML = `<p>${label}</p>`

                labelDiv.onclick = () => {

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

                element.insertAdjacentElement('beforeend',labelDiv)
                selectedType.insertAdjacentElement('beforeend',element)

                searchOptions.push({label, element})
            }
        }

        editor.insertAdjacentElement('beforeend',nodeDiv)
        editor.style.display='none'
        container.insertAdjacentElement('afterbegin',editor)
    }
}