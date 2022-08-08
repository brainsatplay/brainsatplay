import { Graph, GraphNode } from '../../../external/graphscript/Graph'
import { DOMService } from '../../../external/graphscript/services/dom/DOM.service'
import { Router } from '../../../external/graphscript/routers/Router'

import { AnyObj, AppAPI, AppOptions } from './types'
import * as utils from './utils'

import extensions from './extensions'

const scriptLocation = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]

type TreeType = any
type InputType = AppAPI


// Must be manually provided with app information
export default class App {

    // App Location
    name: string
    package: {
        main: string
    }
    info: AppAPI; // Original information about the graph
    remote: boolean = false

    packagePath = '/package.json'

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


    // Return Active WASL Information
    // TODO: Support src: string rather than grabbing from info via keys
    get wasl() {
        const wasl = this.info.default.graph // always have a graph at the top-level
        const info = this.info

        // merge wasl graph with src information
        const mergeWASLWithInfo = (wasl, info) => {

            // merge basic graph with src information
            for (let key in wasl.nodes) {
                wasl.nodes[key] = Object.assign({}, wasl.nodes[key])
                const src = wasl.nodes[key].src
                if (!src || typeof src != 'object') {
                    if (info[key] && this.isMetadata(info[key]))  {
                        const newWASL = info[key].default.graph
                        wasl.nodes[key].src = newWASL
                        mergeWASLWithInfo(newWASL, info[key]) // catch nested graphs
                    } else {
                        const [classId, _] = key.split('_')
                        wasl.nodes[key].src = (info) ? info[classId] : {} // replace with plugin information
                    }
                }
            }
        }

        mergeWASLWithInfo(wasl, info)

        return wasl
    }


    constructor(input?: InputType, options: AppOptions = {}) {

        this.debug = options.debug

        // Set Router
        if (options.router) {
            this.router = options.router
            this.isNested = true
        } else this.router = new Router()

        this.set(input, options.name)
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

    set = (input?: InputType, name?: string) => {

        this.name = name ?? 'graph'
        this.package = null

        if (input){
            this.plugins = this.setInfo(input)
            this.ok = false
            this.tree = null
        } else console.warn('no info specified.')
    }

    isMetadata = (info, key='default') => {
        return key === "default" && typeof info.default !== 'function'
    }

    checkJSONConversionAll = (info) => {
        for (let key in info) {

            if (this.isMetadata(info, key)) {
              for (let innerKey in info.default) info.default[innerKey] = this.checkJSONConversion(info.default[innerKey]);
            } else if (
              info[key] && // exists
              typeof info[key] === "object" && // is an object
              info[key]?.constructor?.name === 'Object' // is a bare object
              ){
              this.checkJSONConversionAll(info[key]);
            }
          }
    }

    setInfo = (info: InputType) => {
        this.info = Object.assign({}, info)
        this.checkJSONConversionAll(this.info)

        // Set Plugins
        const pluginsObject = {}
        for (let key in info) {
            if (!this.isMetadata(info, key)) pluginsObject[key] = info[key]
        }
        this.plugins = pluginsObject
        return this.plugins
    }

    setTree = async (graph = this.info.default.graph) => {
        const tree: AnyObj<any> = {}

        this.info.default.graph = graph
        const nodes = Object.entries(graph.nodes ?? {})
        await Promise.all(nodes.map(async ([tag, info]) => {
            const [cls, id] = tag.split("_");

            // Shallow copy class info
            const ogClsInfo = this.plugins[cls]
            if (ogClsInfo) {

            const clsInfo = Object.assign({}, ogClsInfo) ?? {};  // still run without plugin
            for (let key in clsInfo) {
              if (typeof clsInfo[key] === 'object') clsInfo[key] = Object.assign({}, clsInfo[key])
            }

            // Nest Inside Tree Notation
            if (this.isMetadata(clsInfo)) {

                const app = this.nested[tag] = new App(clsInfo, {
                    name: tag, 
                    router: this.router,
                    debug: this.debug
                })
                
                app.setParent(this.parentNode)
                await app.start()
                this.router.load(app.graph, false, true); // load nested graph into main router

                // Run nested graph
                if (app.info.default.graph.ports) {

                    let input = app.info.default.graph.ports.input
                    let output = app.info.default.graph.ports.output
                    if (typeof input === 'string') input = { [input]: input }
                    if (typeof output === 'string') output = { [output]: output }


                    // Support for targeting nested graph with multiple inputs and outputs
                    app.graph.operator = async (...args) => {
                        for (let key in (output as AnyObj<string>)) {
                            return new Promise(async resolve => {
                                const sub = app.graph.subscribe(output[key], (res) => {
                                    resolve(res)
                                })

                                await Promise.all(Object.values(input).map(async (n) => {
                                    await app.graph.run(n, ...args)
                                }))

                                app.graph.unsubscribe(output[key], sub)
                            })
                        }
                    }
                }

                tree[tag] = app.graph // new Service(app.graph.tree, tag) // tree as graph node

            } else {
                clsInfo.tag = tag;
                const properties = Object.assign(clsInfo, info);
                const instance = extensions.arguments.transform(properties, this)
                tree[tag] = instance
            }
        } else console.warn(`No information found for the ${cls} plugin. Please export this from your main file.`)
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

    setPackage = (pkg) => {
        this.package = pkg
    }

    init = async (input?: InputType) => {
        if (input) this.set(input)


        if (!this.compile){
            if (!this.info) return false
            else if (!this.isMetadata(this.info)) return false
        }

        // Manual Initialization
        if (this.compile instanceof Function) {
            if (!this.info) this.info = {
                default: {}
            } as any
            await this.compile() // manually set properties
            return
        }

        // Automatic Initialization
        else {

            // Set package
            if (!this.package) {
                const pkg = this.info.default.package
                if (pkg) this.setPackage(pkg)
                else console.error('No package.json has been included...')
            }

            // Get Tree
            this.tree = await this.setTree()
        }

    }

    setParent = (parentNode) => {
        if (parentNode instanceof HTMLElement) {
            this.parentNode = parentNode
        } else console.warn('Input is not a valid HTML element', parentNode)
    }


    start = async (input?: InputType) => {
        this.stop() // stop existing graph
        await this.init(input)

        if (this.ok) {

            this.graph = new DOMService({
                name: this.name,
                routes: this.tree,
            }, this.parentNode)


            // Load Graph into Router + Run (if not nested)
            if (!this.isNested) {

                this.router.load(this.graph, false, true);

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