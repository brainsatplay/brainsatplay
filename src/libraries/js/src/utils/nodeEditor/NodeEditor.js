import {Graph} from './Graph'
import { DOMFragment } from '../../ui/DOMFragment'
import  {plugins} from '../../../brainsatplay'

export class NodeEditor{
    constructor(manager, applet, parentNode) {
        this.manager = manager
        this.plugins = this.manager.applets[applet.props.id]
        this.parentNode = parentNode
        this.element = null

        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
        }
    
        if (this.plugins){
            let template = () => {
                return `
                <div id="${this.props.id}nodeEditorMask" class="brainsatplay-default-container" style="
                z-index: 999;
                opacity: 0; 
                transition: opacity 1s;
                pointer-events: none;
                background: rgba(0,0,0,.7);
                padding: 0px;
                ">
                    <div id="${this.props.id}nodeViewer" class="brainsatplay-node-viewer">
                    </div>
                </div>
                `
            }
    
            let setup = () => {
                let container = document.getElementById(`${this.props.id}nodeEditorMask`)
                let viewer = document.getElementById(`${this.props.id}nodeViewer`)
                
                console.log(viewer)
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
                let node = this.manager.instantiateNode({class: plugins[type][key]}).instance
                let element = document.createElement('div')
                element.classList.add(`brainsatplay-default-node-div`)
                let label = `${type}.${node.constructor.name}`
                element.innerHTML = `
                <div class="brainsatplay-option-node">
                    <p>${label}</p>
                </div>`
                selectedType.insertAdjacentElement('beforeend',element)

                searchOptions.push({label, element})
            }
        }

        editor.insertAdjacentElement('beforeend',nodeDiv)
        editor.style.display='none'
        container.insertAdjacentElement('afterbegin',editor)
    }
}