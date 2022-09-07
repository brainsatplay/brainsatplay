import * as freerange from 'freerange/dist/index.esm'
import * as utils from './utils'

export default class Plugins {

    readyState: boolean = false
    source: string
    filesystem: freerange.System
    #plugins: {[x:string]: {
        path: string,
        metadata?: freerange.RangeFile,
        module?: freerange.RangeFile,
        package?: freerange.RangeFile,
        graph?: freerange.RangeFile,
    }}

    checkedPackageLocations = { }

    list: Set<string> = new Set()

    // Expected File Organization
    regexp : RegExp = new RegExp(`(.+).wasl`, 'g')


    constructor(source:string | freerange.System ='https://raw.githubusercontent.com/brainsatplay/plugins/index.js') {
        if (typeof source === 'string') this.source = source
        else {
            this.source = source.name
            this.filesystem = source
        }
        this.#plugins = {}

        console.log('plugins', this.#plugins)
    }

    init = async () => {

        // Remote Plugins
        if (!this.filesystem){
            this.filesystem = new freerange.System('plugins', {
                ignore: ['DS_Store']
            })
            await this.filesystem.init()

            const file = await this.filesystem.open(this.source)
            const plugins = await file.body
    
            for (let key in plugins){
                this.list.add(key) // Add to list
                const path = plugins[key]
                this.#plugins[key] = { path }
                // await this.metadata(key) // Get metadata right away
            }
        } 
        
        // Get Metadata from Local Plugins
        else {
            // Loading Current Plugins
            this.filesystem.files.list.forEach(f => this.set(f))
        }

        // Monitor for new files
        this.filesystem.addGroup('plugins', undefined, (f) => this.set(f))

        this.readyState = true // Switch readyState to true
    }

    set = async (f) => {
        this.list.add(f.path) // Add to list
        this.#plugins[f.path] = { 
            path: f.path,
            module: f
        }

        // only grab metadata if expected by the structure of the module
        const body = await this.module(f.path)
        const isModule = utils.isMetadata(body)
        if (isModule) this.metadata(f.path) // only grab metadata if expected by the structure of the module
    }

    getFile = async (url) => {
        return await this.filesystem.open(url)
    }

    // Get closest package.json file contents
    package = async (name) => {
        if (this.#plugins[name]){
            let path = this.getPath(name)
            const splitPath = path.split('/').slice(0, -1)

            let packageFile;

            do {
                try {
                path = splitPath.length ? `${splitPath.join('/')}/package.json` :'package.json' 

                // narrow the search over time
                if (this.checkedPackageLocations[path] !== false){
                    this.checkedPackageLocations[path] = false
                    packageFile = this.#plugins[name].package ?? await this.getFile(path)
                    this.checkedPackageLocations[path] = true
                }

                } catch (e) {} // don't log failed package searches
                if (splitPath.length === 0) break
                splitPath.pop()

            } while (!packageFile) 
            
            
            if (packageFile) {
                this.#plugins[name].package = packageFile
                return await this.#plugins[name].package.body
            } else return {}
        } else {
            console.warn(`No package for ${name}.`)
            return {}
        }
    }

    get = async (name, type='module') => {

        if (type === 'module') return await this.module(name)
        else if (type === 'module') return await this.package(name)
        else {

            let path = this.getPath(name)

            if (
                this.#plugins[name] && 
                !utils.isWASL(path) && // Don't get for .wasl files
                path.slice(-12) !== ("package.json") // Don't get for package.json files
            ){
                
                let path = this.getPath(name)
                const thisPath = this.path(path)
                
                // Convert module to metadata path
                if (!path.includes(thisPath)) path = thisPath
                
                const file = this.#plugins[name][type] ?? await this.getFile(path)

                if (file) {
                    this.#plugins[name][type] = file
                    const imported = await file.body

                    // Recursively Load Plugin Metadata
                    if (type === 'plugins') {
                        const pkg = await this.package(name)
                        const imports = {} // don't modify the original file
                        for (name in imported) {
                            const path = imported[name]
                            const file = await this.getFile(utils.join(utils.getBase(pkg.main), path))
                            imports[name] = await file.body
                        }

                        return imports
                    }

                    return imported
                } else return {}
            } else {
                console.warn(`No ${type} for ${name}.`)
                return {}
            }

        }
    }

    metadata = async (name) => await this.get(name, 'metadata')
    graph = async (name) => await this.get(name, 'graph')

    getPath = (name:string) =>{
        const base = this.#plugins[name]?.module?.path ?? this.#plugins[name]?.path ?? name
        return base.split('/').filter(v => v != '').join('/')
    } 

    path = (path) => {
        if (this.regexp.test(path)) return path
        else {
            const splitPath = path.split('/')
            const fullFileName = splitPath.pop()
            if (fullFileName){
                const filePrefix = fullFileName.split('.').at(-2)
                return  `${splitPath.join('/')}/${filePrefix}.wasl`
            } else {
                console.warn('Something went wrong...')
                return path
            }
        }
    }


    module = async (name) => {
        
        let path = this.getPath(name)

        // Convert Metadata Path to Module
        let isMetadata = false
        const match = path.match(this.regexp)?.[0]
        if (match){
            name = name.replace(match,`${match.split('/').at(-1).split('.')[0]}.js`)
            isMetadata = true
            // path = path.replace(metadataPath, '')
        }

        // Skip without Name
        if (this.#plugins[name]){
            const path = this.getPath(name)
            const pluginModule = this.#plugins[name].module ?? await this.getFile(path)
            if (pluginModule) {
                this.#plugins[name].module = pluginModule
                if (isMetadata) return await this.metadata(name)
                else return await this.#plugins[name].module.body
            } else return {}
        } else {
            console.error(`Module for ${name} not found.`)
            return {}
        }
    }
}