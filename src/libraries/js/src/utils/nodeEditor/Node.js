import * as dragUtils from './dragUtils'


export class Node{
    constructor(nodeInfo, parentNode=document.body) {     
        this.nodeInfo = nodeInfo
        this.parentNode = parentNode
        this.element = this.createElement(this.nodeInfo)
    }

    createElement (nodeInfo) {
        let node = nodeInfo.instance
        let ports = ``
        // for (let param in node.params){
        for (let port in node.ports){
            let active = (node.ports[port].active) ? 'active' : ''
            ports += `
            <div class="node-port port-${port} ${active}">
                <div class="node-tooltip">
                    <p>${port}</p>
                </div>
            </div>
            `
        }

        // Source Node Creation
        let element = document.createElement(`div`)
        element.classList.add("brainsatplay-display-node")
        element.innerHTML = `
        <div class="node-text">
            <h3>${node.constructor.name}</h3>
        </div>
        ${ports}
        `      

        this.parentNode.insertAdjacentElement('beforeend',element)
        dragUtils.dragElement(this.parentNode,element)
        return element
    }
}