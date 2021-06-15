import * as dragUtils from './dragUtils'
import {Node} from './Node'
import {Edge} from './Edge'

export class Graph{
    constructor(graph, parentNode) {
        this.nodes = {}
        this.edges = []
        this.parentNode = parentNode

        let i = 0
        let length = Object.keys(graph.nodes).length
        for (let key in graph.nodes){  
            this.nodes[key] = this.addNode(graph.nodes[key]) 

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
            i++
        }

        graph.edges.forEach(e => {
            this.addEdge(e)
        })
    }
    
    removeNode(nodeInfo){
        if (this.nodes[nodeInfo.id]){
            this.nodes[nodeInfo.id].element.remove()
            let edges = this.nodes[nodeInfo.id].edges
            for (let i = edges.length - 1; i >=0; i--) this.removeEdge(edges[i])
            delete this.nodes[nodeInfo.id]
        }
    }

    removeEdge(e){
        let types = ['source','target']
        types.forEach(t => {
            let deactivate = true
            e[t].edges.forEach((o,i) => {
                if (o[`${t}Node`].isSameNode(e[`${t}Node`]) && o !== e) deactivate = false // Keep Active 
                else if (o === e) e[t].edges.splice(i,1)
            })
            if (deactivate) e[`${t}Node`].classList.remove('active')
        })
        e.element.remove()
    }

    addEdge(e){
        let edge = new Edge(e, this.nodes)
        edge.insert(this.parentNode)
        this.edges.push(edge)
        return edge
    }


    addNode(nodeInfo) {
        this.nodes[nodeInfo.id] = new Node(nodeInfo,this)
        return this.nodes[nodeInfo.id]
    }
}