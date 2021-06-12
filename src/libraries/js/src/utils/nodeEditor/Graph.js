import * as dragUtils from './dragUtils'
import * as connect from './connect'
import {Node} from './Node'

export class Graph{
    constructor(graph, parentNode) {
        this.nodes = {}
        this.edges = {}
        this.parentNode = parentNode

        let i = 0
        let length = Object.keys(graph.nodes).length
        for (let key in graph.nodes){  
            this.nodes[key] = this.createNode(graph.nodes[key]) 

            // Default Positioning
            this.nodes[key].element.style.top = `${(i/length)*100}%`
            this.nodes[key].element.style.left = '40%'
            // this.nodes[key].element.style.transform =  `translate(-50%,50%)`

            i++
        }

        for (let key in graph.edges){
            let edge = graph.edges[key]

            // Get Ports
            let splitSource = edge.source.split(':') 
            let splitTarget = edge.target.split(':') 
            if (splitSource.length < 2) splitSource.push('default')
            if (splitTarget.length < 2) splitTarget.push('default')

            // Draw Line Between Ports
            let sourcePort = this.nodes[splitSource[0]].element.getElementsByClassName(`port-${splitSource[1]}`)[0]
            let targetPort = this.nodes[splitTarget[0]].element.getElementsByClassName(`port-${splitSource[1]}`)[0]
            // let sourceOffset = sourcePort.getBoundingClientRect();
            // let targetOffset = targetPort.getBoundingClientRect();

            // connect.createConnection(this.parentNode, sourcePort, targetPort)
        }
    }

    createNode(nodeInfo) {
        return new Node(nodeInfo,this.parentNode)
    }
}