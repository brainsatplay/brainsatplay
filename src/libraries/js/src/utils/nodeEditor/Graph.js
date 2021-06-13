import * as dragUtils from './dragUtils'
import {Node} from './Node'
import {Edge} from './Edge'

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
            let edge = new Edge(graph.edges[key], this.nodes)
            edge.insert(this.parentNode)
        }
    }

    createNode(nodeInfo) {
        return new Node(nodeInfo,this.parentNode)
    }
}