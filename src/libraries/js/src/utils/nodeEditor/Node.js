import * as dragUtils from './dragUtils'
import {Edge} from './Edge'

export class Node{
    constructor(nodeInfo, graph) {     
        this.graph = graph
        this.nodeInfo = nodeInfo
        this.parentNode = this.graph.parentNode ?? document.body
        this.element = this.createElement(this.nodeInfo)
        this.edges = []
    }

    registerEdge(edge){
        this.edges.push(edge)
    }

    updateEdge(edge){
        let o = this.edges.find(o => o === edge)
        // Derive Queries
        let type = (o.structure.source.split(':')[0].includes(this.nodeInfo.id)) ? 'source' : 'target'
        let className = (type === 'source') ? 'p1' : 'p2'

        // Grab Elements
        let portElement = o[`${type}Node`]
        portElement.classList.add('active') // Label Active Node

        let portDim = portElement.getBoundingClientRect()
        let svgP = o.svgPoint(o.svg, portDim.left + portDim.width/2, portDim.top + portDim.height/2)

        
        // Update Edge Anchor
        o.updateElement(
            o.node[className],
            {
                cx: svgP.x,
                cy: svgP.y
            }
        );

        // Grab Other Side of Edge
        let otherType = (type == 'source') ? 'target': 'source'
        let otherElement = o[`${otherType}Node`]
        let otherDim = otherElement.getBoundingClientRect()
        let svgO = o.svgPoint(o.svg, otherDim.left + otherDim.width/2, otherDim.top + otherDim.height/2)

        // Update Control Points
        let sP = (type == 'source') ? svgP : svgO
        let tP = (type == 'source') ? svgO : svgP

        o.updateControlPoints(sP, tP)
      
        o.drawCurve();
    }

    updateAllEdges = () => {
        this.edges.forEach(o => {
            this.updateEdge(o)
        })
    }

    createElement (nodeInfo) {
        let node = nodeInfo.instance
        let nodeDiv = document.createElement(`div`)
        nodeDiv.classList.add("brainsatplay-default-node-div")

        let element = document.createElement(`div`)
        element.classList.add("brainsatplay-display-node")

        // for (let param in node.params){
        let portTypes = ['target','source']
        portTypes.forEach(s => {

            let portContainer = document.createElement('div')
            portContainer.classList.add(`node-port-container`)
            portContainer.classList.add(`${s}-ports`)
            let html = ``

            for (let port in node.ports){

                let portElement = document.createElement('div')
                portElement.classList.add(`node-port`)
                portElement.classList.add(`port-${port}`)
                portElement.setAttribute('data-node', this.nodeInfo.id)
                portElement.setAttribute('data-port', port)

                portElement.innerHTML = `
                    <div class="node-tooltip">
                        <p>${port}</p>
                    </div>
                `
                portContainer.insertAdjacentElement('beforeend',portElement)


                let controlSVG = (e) => {
                    // console.log('moving')
                }

                let checkNodeBelow = (e) => {

                    if (e.target.classList.contains('node-port')){

                        let belowStructure  = `${e.target.getAttribute('data-node')}:${e.target.getAttribute('data-port')}`
                        let source = (s === 'source')? `${this.nodeInfo.id}:${port}` : belowStructure
                        let target = (s === 'target')? `${this.nodeInfo.id}:${port}` : belowStructure

                        let edgeStructure = {
                            source,
                            target
                        }

                        let edge = new Edge(edgeStructure, this.graph.nodes)
                        edge.insert(this.parentNode)
                    } else {
                        // console.log('remove half-done svg')
                    }
                    window.removeEventListener('pointermove', controlSVG)
                    window.removeEventListener('pointerup', checkNodeBelow)
                }

                // Listen for clicks to draw SVG edge
                portElement.onpointerdown = (e) => {
                    // Start drawing edge
                    window.addEventListener('pointermove', controlSVG)
                    window.addEventListener('pointerup', checkNodeBelow)
                }

            }

            element.insertAdjacentElement('beforeend',portContainer)
        })

        element.insertAdjacentHTML('beforeend', `
        <div class="node-text">
            <h3>${node.constructor.name}</h3>
        </div>
        `)   

        nodeDiv.insertAdjacentElement('beforeend',element)
        this.parentNode.insertAdjacentElement('beforeend',nodeDiv)
        dragUtils.dragElement(this.parentNode,nodeDiv, () => {this.updateAllEdges()})
        return nodeDiv
    }
}