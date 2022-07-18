import { Graph, GraphNode } from '../../../external/graphscript/Graph'
import { DOMService } from '../../../external/graphscript/services/dom/DOM.service'
import { Router } from '../../../external/graphscript/routers/Router'

import { AnyObj, AppAPI } from './types'
import * as utils from './utils'

const scriptLocation = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]


type TreeType = any
type BaseType = string
type InputType = TreeType | BaseType

export default class App {

    // App Location
    name: string
    base: string
    package: {
        main: string
    }
    info: AppAPI;
    remote: boolean = false

    packagePath = '/package.json'
    pluginPath = '/.brainsatplay/index.plugins.json'
    graphPath = '/.brainsatplay/index.graph.json'

    ok = false

    // App Object References
    parentNode?: HTMLElement = document.body
    plugins: { [x: string]: any }
    tree: any; // graph properties
    router: Router;
    graph: Graph | null
    nested: { [x: string]: App } = {}
    isNested: boolean = false


    animated: { [key: string]: Graph }
    compile: () => void

    constructor(input?: InputType, name?: string, router?: Router) {

        // Set Router
        if (router) {
            this.router = router
            this.isNested = true
        } else this.router = new Router()

        this.set(input, name)
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

        if (!input) input = '.'

        this['#base'] = null
        this.base = null
        this.package = null
        this.remote = false

        if (typeof input === 'string') {

            // Check if URL
            const url = this.getURL(input)
            if (url) {
                this.remote = true
                this['#base'] = url
            }
            else this['#base'] = this.base = input

            this.info = null

        } else {

            this.info = input
            const appMetadata = this.info['.brainsatplay']
            for (let key in appMetadata) {
                if (key === 'base') this['#base'] = this.base = appMetadata[key]
                else appMetadata[key] = this.checkJSONConversion(appMetadata[key])
            }

            // if (!this['#base'] && typeof appMetadata.plugins[0] === 'string') throw 'The "base" property (pointing to a valid ESM module) is required in the app info'

        }


        this.ok = false
        this.tree = null
    }



    setPlugins = async (plugins = this.info['.brainsatplay'].plugins) => {

        this.info['.brainsatplay'].plugins = plugins

        // Only Without Manual Initialization
        const pluginsObject = {}
        if (this.base) {
            for (const name in plugins) {
                // Plugin Paths
                if (typeof plugins[name] === 'string') {
                    let plugin = await utils.importFromOrigin(this.join(this.base, plugins[name]), scriptLocation, !this.remote)
                    if (typeof plugin === 'string') {
                        const datauri = "data:text/javascript;base64," + btoa(plugin);
                        plugin = await utils.dynamicImport(datauri)
                    }
                    pluginsObject[name] = plugin
                }

                // Raw Plugins
                else pluginsObject[name] = plugins[name]
            }
        } else {
            for (let key in this.info) {
                if (key !== '.brainsatplay') pluginsObject[key] = this.info[key]
            }
        }

        this.plugins = pluginsObject
        return this.plugins
    }

    setTree = async (graph = this.info['.brainsatplay'].graph) => {
        const tree: AnyObj<any> = {}

        this.info['.brainsatplay'].graph = graph
        const nodes = Object.entries(graph.nodes ?? {})
        await Promise.all(nodes.map(async ([tag, info]) => {
            const [cls, id] = tag.split("_");
            const clsInfo = this.plugins[cls]

            // TODO: Actuall nest inside tree notation
            if (clsInfo['.brainsatplay']) {

                const app = this.nested[tag] = new App(clsInfo, tag, this.router)
                app.setParent(this.parentNode)
                await app.start()
                this.router.load(app.graph, false) // load nested graph into main router

                // Run nested graph
                if (app.info[".brainsatplay"].graph.ports) {

                    let input = app.info['.brainsatplay'].graph.ports.input
                    let output = app.info['.brainsatplay'].graph.ports.output
                    if (typeof input === 'string') input = { [input]: input }
                    if (typeof output === 'string') output = { [output]: output }


                    // // old
                    app.graph.operator = async (...args) => {
                        for (let key in (output as AnyObj<string>)) {
                            console.log(`global operator for ${this.name}`, ...args)
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
                let instance = Object.assign({}, clsInfo)
                instance.tag = tag
                instance = Object.assign(instance, info); // provide instance-specific info


            // Cache Last Input for Each Argument
            instance.transformArgs = (args, self) => {
                let updatedArgs = []
                let i = 0
                self.arguments.forEach((v, k) => {
                    const currentArg = (k.includes('...')) ? args.slice(i) : args[i]
                    let update = (currentArg !== undefined) ? currentArg : v
                    self.arguments.set(k, update)
                    if (!Array.isArray(update)) update = [update]
                    updatedArgs.push(...update)
                    i++
                })
                return updatedArgs
            }

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
                    const input = inputPortPath.slice(-1)[0] // target by name | TODO: Target by path...

                    // NOTE: Output ports may only be in this graph (if nested)
                    let ref = tree
                    outputPortPath.forEach((str) => {
                        const newRef = ref[str] || ref.nodes.get(str)
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
        if (this['#base']) this.base = this.join(this['#base'], this.getBase(this.package.main))
    }

    init = async () => {

        // Manual Initialization
        if (this.compile instanceof Function) {
            if (!this.info) this.info = {
                '.brainsatplay': {}
            } as any
            await this.compile() // manually set properties
            return
        }

        // Automatic Initialization
        else {

            // Set package
            if (!this.package) {

                if ('.brainsatplay' in this.info) {
                    const pkg = this.info['.brainsatplay'].package
                    if (pkg) this.setPackage(pkg)
                    else console.error('No package.json has been included...')
                } else {
                    let pkg = await this.json(this['#base'] + this.packagePath)
                    this.setPackage(pkg)
                }
            }


            // Set application graph and plugins
            if (!this.info) {

                // Correct for Remote Files
                const graphPath = this.join(this.base, this.graphPath)
                const pluginPath = this.join(this.base, this.pluginPath)

                let graph = await this.json(graphPath)
                let plugins = await this.json(pluginPath)

                this.info['.brainsatplay'] = {
                    graph,
                    plugins
                }
            }

            // Get Plugins and Tree
            this.plugins = await this.setPlugins()
            this.tree = await this.setTree()
        }

    }

    setParent = (parentNode) => {
        if (parentNode instanceof HTMLElement) {
            this.parentNode = parentNode
        } else console.warn('Input is not a valid HTML element', parentNode)
    }


    start = async () => {
        this.stop() // stop existing graph
        await this.init()

        if (this.ok) {

            const mainGraph = new DOMService({
                name: this.name,
                routes: this.tree,
            }, this.parentNode)

            // Assign Graph
            if (this.isNested) this.graph = mainGraph

            // Load Graph into Router + Run (if not nested)
            else {
                this.router.load(mainGraph, false)
                this.graph = this.router.service

                // Run the top-level nodes
                this.graph.nodes.forEach(node => {
                    if (node instanceof GraphNode) {
                        if (!node.source) {
                            if (node.loop) {
                                node.loop = parseFloat(node.loop) // TODO: fix importing...
                                node.run() // Run looping functions
                            }
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