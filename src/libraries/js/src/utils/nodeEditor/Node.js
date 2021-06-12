import * as dragUtils from './dragUtils'


export class Node{
    constructor(nodeInfo, parentNode=document.body) {     
        this.nodeInfo = nodeInfo
        this.parentNode = parentNode
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

        // Get Port Name
        let splitEdge = o.structure[type].split(':') 
        if (splitEdge.length < 2) splitEdge.push('default')

        // Grab Elements
        let portElement = o[`${type}Node`]
        let svg = o.svg

        let portDim = portElement.getBoundingClientRect()
        let parentDim = this.parentNode.getBoundingClientRect()
        let svgP = o.svgPoint(o.svg, portDim.left + portDim.width/2, portDim.top + portDim.height/2)
        // // Calculate New Position
        let cx = svg.viewBox.baseVal.width *(((portDim.left - parentDim.left)) / parentDim.width)
        let cy = svg.viewBox.baseVal.height *(((portDim.top - parentDim.top)) / parentDim.height)

        o.updateElement(
            o.node[className],
            {
                cx: svgP.x,
                cy: svgP.y
            }
        );
      
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
                let active = (node.ports[port].active) ? 'active' : ''

                html += `
                <div class="node-port port-${port} ${active}">
                    <div class="node-tooltip">
                        <p>${port}</p>
                    </div>
                </div>
                `
            }

            portContainer.innerHTML = html
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