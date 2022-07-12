import { Graph } from '. ./../../external/graphscript/Graph'
import { AppInfo, AssertType } from './types'

const scriptLocation = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]


const dynamicImport = async (url:string, type?: AssertType) => {
    const assert:any = {}
    if (type) assert.type = type
    let imported = await import(url, {assert})
    if (imported.default) imported = imported.default
    return imported
}

const importFromOrigin = async (url, local=true, type?:AssertType) => {


    // Import the Module
    let imported = null
    if (local) {
        // Remap URL to absolute path
        const extraPath = scriptLocation.replace(window.origin, '').split('/')
        url = [...extraPath.map(e => '..'), ...url.split('/')].join('/')
        imported = await dynamicImport(url, type)
    } else imported = await fetch(url).then(res => {
        if (res.ok) return res[type]()
        else return
    })

    return imported
}

export default class App {

    // App Location
    base: string
    package: {
        main: string
    }
    info: AppInfo;
    remote: boolean = false

    packagePath = '/package.json'
    pluginPath = '/.brainsatplay/index.plugins.json'
    graphPath = '/.brainsatplay/index.graph.json'

    // App Object References
    plugins: {[x:string]: any}
    tree: any; // graph properties
    graph: Graph | null;
    animated: {[key: string]: Graph}
    
    constructor(base) {
        this.set(base)
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

    set = (base?: this['tree'] | this['base']) => {

        if (!base) base = '.'

        this.base = null
        this.package = null

        if (typeof base === 'string') {


            const url = this.getURL(base)
            if (url) {
                this.remote = true
                this.base = url
            }
            else this.base = base

            this.info = null

        } else {

            this.info = base
            for (let key in this.info) {
                if (key === 'base') this.base = this.info[key]
                else this.info[key] = this.checkJSONConversion(this.info[key])
            }

            if (!this.base && typeof this.info.plugins[0] === 'string') throw 'The "base" property (pointing to a valid ESM module) is required in the app info'

        }

        this.tree = null
    }



    getPlugins = async () => {
        const plugins = {}
        for (const name in this.info.plugins) {

            // Plugin Paths
            if (typeof this.info.plugins[name] === 'string') {
                let plugin = await importFromOrigin(this.join(this.base, this.info.plugins[name]), !this.remote)
                if (typeof plugin === 'string') {
                    const datauri = "data:text/javascript;base64," + btoa(plugin);
                    plugin = await dynamicImport(datauri)
                }
                plugins[name] = plugin
            }

            // Raw Plugins
            else plugins[name] = this.info.plugins[name]

        }
            
        return plugins
    }

    getTree = async () => {
        const tree = {}

        this.info.graph.nodes.map(tag => {
            const [cls, id] = tag.split('_')
            const instance = Object.assign({}, this.plugins[cls])
            instance.tag = tag // update tag based on name in the application
            tree[tag] = instance
        })

        // TODO: Use the ports to target specific function arguments...
        this.info.graph.edges.forEach(([outputInfo, inputInfo]) => {
            const [output, outputPort] = outputInfo.split(':')
            const [input, inputPort] = inputInfo.split(':')
            if (!('children' in tree[output])) tree[output].children = []
            tree[output].children.push(input)
        })

        return tree

    }

    join = (...paths: string[]) => {

        const split = paths.map(path => {
            return path.split('/')
        }).flat()

        return split.join('/')

    }

    getBase = (path) => {
        return path.split('/').slice(0,-1).join('/')
    }

    json = async (src) => {
        return this.checkJSONConversion( await importFromOrigin(src, !this.remote, 'json'))
    }

    init = async () => {

        if (!this.package) {
            this.package = await this.json(this.base + this.packagePath)
            this.base = this.join(this.base, this.getBase(this.package.main))
        }

        // Get Information
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

    }


    start = async () => {
            await this.init()
            await this.compile()
            this.graph = new Graph(this.tree, 'graph')

            // Run the top-level nodes
            for (let key in this.graph.tree) {
                const nodeInfo = this.graph.tree[key]
                const node = this.graph.nodes.get((nodeInfo as any).tag)
                if (node.loop) node.loop = parseFloat(node.loop) // TODO: fix importing...
                node.run()
            }
        if (this.onstart instanceof Function) this.onstart()
    }

    compile = async () => {

        // Remove While Tree
        if (this.graph) this.graph.nodes.forEach(this.graph.removeTree)
        this.graph = null

        // Let User Specify the New Tree
        if (this.oncompile instanceof Function) this.tree = await this.oncompile()
        return this.tree
    }

    oncompile = async () => {
        this.plugins = await this.getPlugins()
        this.tree = await this.getTree()
        return this.tree
    }

    save = async () => {
        if (this.onsave instanceof Function) await this.onsave()
        await this.start()
    }

    // -------------- Events --------------
    onsave = () => {}
    onstart = () => {}
}