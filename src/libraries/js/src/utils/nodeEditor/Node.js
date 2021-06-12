import * as dragUtils from './dragUtils'


export class Node{
    constructor(nodeInfo, parentNode=document.body) {     
        this.nodeInfo = nodeInfo
        this.parentNode = parentNode
        this.element = this.createElement(this.nodeInfo)
    }

    createElement (nodeInfo) {
        let node = nodeInfo.instance
        let nodeDiv = document.createElement(`div`)
        nodeDiv.classList.add("brainsatplay-default-node-div")

        let element = document.createElement(`div`)
        element.classList.add("brainsatplay-display-node")

        // for (let param in node.params){
        let portTypes = ['input','output']
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
        // dragUtils.dragElement(this.parentNode,nodeDiv)
        dragUtils.dragElement(this.parentNode,element)
        return nodeDiv
    }
}