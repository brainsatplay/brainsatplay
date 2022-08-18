// Graphscript
import { Graph, GraphNode } from '../../../external/graphscript/Graph'
import { DOMService } from '../../../external/graphscript/services/dom/DOM.service'
import { Router } from '../../../external/graphscript/routers/Router'

// WASL
import * as wasl from 'wasl/dist/index.esm'

// Internal Imports
import { AnyObj, AppAPI, AppOptions, WASL, WASLLoadInput, WASLOptions } from './types'
import * as utils from './utils'
import extensions from './extensions'

const scriptLocation = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]

// Must be manually provided with app information
export default class App {

    // App Location
    name: string
    wasl: any; // Original information about the graph
    remote: boolean = false

    options: WASLOptions = {}


    ok = false

    // App Object References
    parentNode?: HTMLElement = document.body
    plugins: { [x: string]: any }
    tree: any; // graph properties
    router: Router;
    graph: Graph | null
    nested: { [x: string]: App } = {}
    isNested: boolean = false

    debug: boolean

    animated: { [key: string]: Graph }
    compile: () => void

    constructor(input?: WASLLoadInput, options: WASLOptions = {}) {

        this.debug = options.debug

        // Set Router
        if (options.router) {
            this.router = options.router
            this.isNested = true
        } else this.router = new Router()

        this.wasl =this.set(input, options)
        this.graph = null
        this.animated = {}
    }

    checkJSONConversion = (info) => {
        if (typeof info === 'string') return JSON.parse(info)
        else return info
    }

    getURL = (str) => {
        try {
            return new URL(str).href
        } catch {
            return false
        }
    }

    set = async (input?: WASLLoadInput, options: WASLOptions=this.options) => {

        this.name = 'graph'
        this.options = Object.assign({}, options)
        if (!this.options.errors) this.options.errors = []
        if (!this.options.warnings) this.options.warnings = []
        if (!this.options.files) this.options.files = {}

        if (!input && this.wasl) input = await this.wasl // could be a promise initalized in the constructor...

        if (input){
            const valid = await wasl.validate(input, this.options)
            if (valid){
            const loaded = await wasl.load(input, this.options)
            if (loaded.name) this.name = loaded.name

            this.plugins = this.setInfo(loaded)
            this.ok = false
            this.tree = null
            } else {
                console.error('Invalid WASL file.')
                return
            }
        } else {
            console.warn('no info specified.')
            return
        }

        return this.wasl
    }

    checkJSONConversionAll = (info) => {
        for (let key in info) {

            if (utils.isMetadata(info)) {
                info.graph = this.checkJSONConversion(info.graph);
            } else if (
              info[key] && // exists
              typeof info[key] === "object" && // is an object
              info[key]?.constructor?.name === 'Object' // is a bare object
              ){
              this.checkJSONConversionAll(info[key]);
            }
          }
    }

    setInfo = (wasl: WASL) => {
        this.wasl = wasl
        this.checkJSONConversionAll(this.wasl)

        // Set Plugins
        const pluginsObject = {}
        for (let key in wasl) {
            if (!utils.isMetadata(wasl)) pluginsObject[key] = wasl[key]
        }
        this.plugins = pluginsObject
        return this.plugins
    }

    setTree = async (graph = this.wasl.graph) => {
        const tree: AnyObj<any> = {}

        this.wasl.graph = graph
        const nodes = Object.entries(graph.nodes ?? {})
        await Promise.all(nodes.map(async (arr) => {
            const tag = arr[0]
            const info = arr[1] as any

            const src = info.src

            // Copy Source Object for this Class Instance
            const clsSrc = Object.assign({}, src) ?? {} as any;
            for (let key in clsSrc) {
              if (typeof clsSrc[key] === 'object') clsSrc[key] = Object.assign({}, clsSrc[key])
            }

            // Nest Inside Tree Notation
            if (utils.isMetadata(clsSrc)) {

                const app = this.nested[tag] = new App(clsSrc, {
                    name: tag, 
                    router: this.router,
                    debug: this.debug
                })
                
                app.setParent(this.parentNode)
                await app.start()
                this.router.load(app.graph, false, true, undefined, undefined, undefined); // load nested graph into main router

                // Run nested graph
                if (app.wasl.graph.ports) {

                    let input = app.wasl.graph.ports.input
                    let output = app.wasl.graph.ports.output
                    if (typeof input === 'string') input = { [input]: input }
                    if (typeof output === 'string') output = { [output]: output }


                    // Support for targeting nested graph with multiple inputs and outputs
                    app.graph.operator = async (...args) => {

                        for (let key in (output as AnyObj<string>)) {
                            return new Promise(async resolve => {
                                const sub = app.graph.subscribe(output[key], (res) => {
                                    resolve(res)
                                })

                                await Promise.all(Object.values(input).map(async (n:any) => {
                                    await app.graph.run(n, ...args)
                                }))

                                app.graph.unsubscribe(output[key], sub)
                            })
                        }
                    }
                }

                tree[tag] = app.graph // new Service(app.graph.tree, tag) // tree as graph node

            } else {

                // transform for graphscript
                info.tag = tag;
                const clone = Object.assign({}, info)
                clone.operator = clone.default
                const instance = extensions.arguments.transform(clone, this)
                delete clone.default
                tree[tag] = instance
            }
    }))

        if (graph.edges) {
            for (let outputInfo in graph.edges) {
                const edges = graph.edges[outputInfo]
                for (let inputInfo in edges){
                    // const edgeDetails = edges[inputInfo]

                    let outputPortPath = outputInfo.split(".");
                    let inputPortPath = inputInfo.split(".");

                    // NOTE: Input may be from any graph in the main graph
                    const input = inputPortPath.slice(-1)[0] // target by name | TODO: Target by path and support updating arguments...

                    // NOTE: Output ports may only be in this graph (if nested)
                    let ref = tree
                    outputPortPath.forEach((str) => {
                        const newRef = ref[str] || ((ref.nodes?.get) ? ref.nodes.get(str) : undefined)
                        if (newRef)
                            ref = newRef;
                    });

                    if (!("children" in ref)) ref.children = {};

                    // Add Child to Node
                    if (ref.addChildren instanceof Function) ref.addChildren({ [input]: true })
                    else ref.children[input] = true
                };
            }
        }

        this.tree = tree
        this.ok = true

        return this.tree

    }

    join = utils.join
    getBase = utils.getBase

    json = async (src) => {
        return this.checkJSONConversion(await utils.importFromOrigin(src, scriptLocation, !this.remote, 'json'))
    }

    init = async (input?: WASLLoadInput, options: WASLOptions=this.options) => {

        await this.set(input, options)

        if (!this.compile){
            if (!this.wasl) return false
            else if (!utils.isMetadata(this.wasl)) return false
        }

        // Manual Initialization
        if (this.compile instanceof Function) {
            if (!this.wasl) this.wasl = {graph: {}} as any
            await this.compile() // manually set properties
            return
        }

        // Automatic Initialization
        else {

            // Get Tree
            this.tree = await this.setTree()
        }

    }

    setParent = (parentNode) => {
        if (parentNode instanceof HTMLElement) {
            this.parentNode = parentNode
        } else console.warn('Input is not a valid HTML element', parentNode)
    }


    start = async (input?: WASLLoadInput, options?: WASLOptions) => {
        this.stop() // stop existing graph

        await this.init(input, options)

        if (this.ok) {

            this.graph = new DOMService({
                name: this.name,
                routes: this.tree,
            }, this.parentNode)


            // Load Graph into Router + Run (if not nested)
            if (!this.isNested) {

                this.router.load(this.graph, false, true, undefined, undefined, undefined);

                // Run all nodes
                this.graph.nodes.forEach(node => {
                    if (node instanceof GraphNode) {
                            if (node.loop) {
                                node.loop = parseFloat(node.loop) // TODO: fix importing...
                                node.run() // Run looping functions
                            }
                    } else console.warn(`${node.tag ?? node.name} not recognized`)
                })


                // Run onstart event
                if (this.onstart instanceof Function) this.onstart()
            }
        }

        return this.ok
    }

    stop = () => {
        if (this.onstop instanceof Function) this.onstop()
        for (let k in this.nested) this.nested[k].stop()
        if (this.graph) this.graph.nodes.forEach((n) => {
            this.graph.removeTree(n) // remove from tree
            n.stopNode() // stop animating
            n.unsubscribe() // unsubscribe all listeners
        }) // destroy existing graph
        this.graph = null
        this.nested = {}
    }

    // -------------- Events --------------
    onstart = () => { }
    onstop = () => { }
}