import { Graph, GraphNode } from '. ./../../external/graphscript/Graph'
import { Service } from '. ./../../external/graphscript/Service'
import { resolve } from 'path'

import { AppAPI } from './types'
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
    plugins: {[x:string]: any}
    tree: any; // graph properties
    graph: Graph | null;
    nested: {[x:string]: App} = {}


    animated: {[key: string]: Graph}
    compile: () => void
    
    constructor(input?: InputType, name?:string) {
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
        const tree = {}

        this.info['.brainsatplay'].graph = graph

        await Promise.all(graph.nodes.map(async info => {
            const [cls, id] = info.tag.split('_')

            const clsInfo = this.plugins[cls]

            // TODO: Actuall nest inside tree notation
            if (clsInfo['.brainsatplay']) {


                const app = this.nested[info.tag] = new App(clsInfo, info.tag)
                await app.start().catch(e => {
                    throw new Error(`Nested app (${info.tag}) failed: ${e}`)
                })

                // Run nested graph
                let firstInput = Object.values(app.info['.brainsatplay'].graph.ports.input)[0]
                let output =app.info['.brainsatplay'].graph.ports.output

                // Instantiate Nested Graph Logic
                app.graph.operator = async (i) => {
                    return new Promise(async resolve => {
                        const sub = app.graph.subscribe(output, (res) => {
                            resolve(res)
                        })
                        await app.graph.run(firstInput, i)
                        app.graph.unsubscribe(output, sub)
                    })
                }
                tree[info.tag] = app.graph // new Service(app.graph.tree, info.tag) // tree as graph node

            } else {
                let instance = Object.assign({}, clsInfo)
                instance.tag = info.tag // update tag based on name in the application
                tree[info.tag] = instance
            }

        }))

        // TODO: Use the ports to target specific function arguments...
        graph.edges.forEach(([outputInfo, inputInfo]) => {
            let [output, outputPort] = outputInfo.split(':')
            let [input, inputPort] = inputInfo.split(':')

            // Assign Children
            if (!('children' in tree[output])) tree[output].children = []
            tree[output].children.push(input)
        })

        this.tree = tree
        this.ok = true
        return this.tree

    }

    join = utils.join
    getBase = utils.getBase

    json = async (src) => {
        return this.checkJSONConversion( await utils.importFromOrigin(src, scriptLocation, !this.remote, 'json'))
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


    start = async () => {
            this.stop() // stop existing graph
            await this.init()

            if (this.ok) {
                this.graph = new Graph(this.tree, this.name)

                // Run the top-level nodes
                for (let key in this.graph.tree) {
                    const nodeInfo = this.graph.tree[key]
                    const node = this.graph.nodes.get((nodeInfo as any).tag)

                    if (node instanceof GraphNode) {
                        if (!node.source) {
                            if (node.loop) node.loop = parseFloat(node.loop) // TODO: fix importing...
                            node.run()
                        }
                    } else console.warn(`${key} not recognized`)
                }
                
                // Run onstart event
                if (this.onstart instanceof Function) this.onstart()
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
    onstart = () => {}
    onstop = () => {}
}