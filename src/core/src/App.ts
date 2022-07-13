import { Graph } from '. ./../../external/graphscript/Graph'
import { AppInfo } from './types'
import * as utils from './utils'

const scriptLocation = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]

export default class App {

    // App Location
    base: string
    package: {
        main: string
    }
    info: AppInfo;
    remote: boolean = false
    manual?: boolean = false

    packagePath = '/package.json'
    pluginPath = '/.brainsatplay/index.plugins.json'
    graphPath = '/.brainsatplay/index.graph.json'

    ok = false

    // App Object References
    plugins: {[x:string]: any}
    tree: any; // graph properties
    graph: Graph | null;
    animated: {[key: string]: Graph}
    
    constructor(base?: App['base'], manual?: App['manual']) {
        this.set(base, manual)
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

    set = (base?: this['tree'] | this['base'], manualInit = false) => {

        if (!base) base = '.'

        this['#base'] = null
        this.base = null
        this.package = null
        this.remote = false
        this.manual = manualInit

        if (typeof base === 'string') {

            // Check if URL
            const url = this.getURL(base)
            if (url) {
                this.remote = true
                this['#base'] = url
            }
            else this['#base'] = this.base = base

            this.info = null

        } else {

            this.info = base
            for (let key in this.info) {
                if (key === 'base') this['#base'] = this.base = this.info[key]
                else this.info[key] = this.checkJSONConversion(this.info[key])
            }

            if (!this['#base'] && typeof this.info.plugins[0] === 'string') throw 'The "base" property (pointing to a valid ESM module) is required in the app info'

        }

        this.ok = false
        this.tree = null
    }



    setPlugins = async (plugins = this.info.plugins) => {

        this.info.plugins = plugins

        const pluginsObject = {}
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
            
        this.plugins = pluginsObject
        return this.plugins
    }

    setTree = async (graph = this.info.graph) => {
        const tree = {}

        this.info.graph = graph

        graph.nodes.map(tag => {
            const [cls, id] = tag.split('_')
            const instance = Object.assign({}, this.plugins[cls])
            instance.tag = tag // update tag based on name in the application
            tree[tag] = instance
        })

        // TODO: Use the ports to target specific function arguments...
        graph.edges.forEach(([outputInfo, inputInfo]) => {
            const [output, outputPort] = outputInfo.split(':')
            const [input, inputPort] = inputInfo.split(':')
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
        this.base = this.join(this['#base'], this.getBase(this.package.main))
    }

    init = async () => {

        // Manual Initialization
        if (this.manual) {
            if (!this.info) this.info = {} as any
            return
         }
         
         // Automatic Initialization
         else {

            // Set package
            if (!this.package) {
                let pkg = await this.json(this['#base'] + this.packagePath)
                this.setPackage(pkg)
            }


            // Set application graph and plugins
            if (!this.info) {

                // Correct for Remote Files
                const graphPath = this.join(this.base, this.graphPath)
                const pluginPath = this.join(this.base, this.pluginPath)

                let graph = await this.json(graphPath)
                let plugins = await this.json(pluginPath)

                this.info = {
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
            await this.init()
            await this.compile()

            if (this.ok) {
                this.graph = new Graph(this.tree, 'graph')

                // Run the top-level nodes
                for (let key in this.graph.tree) {
                    const nodeInfo = this.graph.tree[key]
                    const node = this.graph.nodes.get((nodeInfo as any).tag)
                    if (node.loop) node.loop = parseFloat(node.loop) // TODO: fix importing...
                    node.run()
                }
                
                // Run onstart event
                if (this.onstart instanceof Function) this.onstart()
            }

            return this.ok
    }
    
    compile = async () => {
        this.stop() // stop existing graph
        if (this.oncompile instanceof Function) await this.oncompile() // set new info

        return this.tree
    }

    stop = () => {
        if (this.onstop instanceof Function) this.onstop()
        if (this.graph) this.graph.nodes.forEach((n) => {
            this.graph.removeTree(n) // remove from tree
            n.stopNode() // stop animating
            n.unsubscribe() // unsubscribe all listeners
        }) // destroy existing graph
        this.graph = null
    }

    // -------------- Events --------------
    onstart = () => {}
    onstop = () => {}
    oncompile: () => void | any = () => {}
}