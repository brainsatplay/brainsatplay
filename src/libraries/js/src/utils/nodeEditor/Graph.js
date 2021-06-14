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
            let iterator = Math.ceil(Math.sqrt(length))
            let row = Math.floor(i % iterator)
            let col = Math.floor(i/iterator)

            let padding = 10
            let availableSpace = 100 - 2*padding
            let leftShift = 0.5 * availableSpace/(iterator+1)
            let downShift = 0.5 * availableSpace/(iterator+2)

            this.nodes[key].element.style.top = `${padding + downShift + availableSpace*row/iterator}%`
            this.nodes[key].element.style.left = `${padding + leftShift + availableSpace*col/iterator}%`
            // this.nodes[key].element.style.transform =  `translate(-50%,50%)`

            i++
        }

        for (let key in graph.edges){
            let edge = new Edge(graph.edges[key], this.nodes)
            edge.insert(this.parentNode)
            this.edges[key] = edge
        }
    }

    createNode(nodeInfo) {
        let node = new Node(nodeInfo,this)
        return node
    }
}