import * as freerange from 'freerange/dist/index.esm'
import * as utils from '../utils'

const base = '.brainsatplay'

const suffixes = {
    metadata: 'metadata.json',
    graph: 'graph.json',
    plugins: 'plugins.json'
}

const regexp = {}
 Object.keys(suffixes).forEach(k => {
    regexp[k] = new RegExp(`${base}/(.+).${suffixes[k]}`, 'g')
})


export default class Plugins {

    readyState: boolean = false
    source: string
    filesystem: freerange.System
    ['#plugins']: {[x:string]: {
        path: string,
        metadata?: freerange.RangeFile,
        module?: freerange.RangeFile,
        package?: freerange.RangeFile,
        graph?: freerange.RangeFile,
        plugins?: freerange.RangeFile,
    }}

    checkedPackageLocations = { }

    list: Set<string> = new Set()

    // Expected File Organization
    base = base
    suffixes = suffixes
    regexp :{
        metadata: RegExp,
        graph: RegExp,
        plugins: RegExp
    } = regexp as any


    constructor(source:string | freerange.System ='https://raw.githubusercontent.com/brainsatplay/awesome-brainsatplay/main/plugins.js') {
        if (typeof source === 'string') this.source = source
        else {
            this.source = source.name
            this.filesystem = source
        }
        this['#plugins'] = {}
    }

    init = async () => {

        // Remote Plugins
        if (!this.filesystem){
            this.filesystem = new freerange.System('plugins', {
                // debug: true,
                ignore: ['DS_Store']
            })
            await this.filesystem.init()

            const file = await this.filesystem.open(this.source)
            const plugins = await file.body
    
            for (let key in plugins){
                this.list.add(key) // Add to list
                const path = plugins[key]
                this['#plugins'][key] = { path }
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

    set = (f) => {
        this.list.add(f.path) // Add to list
        this['#plugins'][f.path] = { 
            path: f.path,
            module: f
        }

        this.metadata(f.path)
    }

    getFile = async (url) => {
        return await this.filesystem.open(url)
    }

    // Get closest package.json file contents
    package = async (name) => {
        if (this['#plugins'][name]){
            let path = this.getPath(name)
            const splitPath = path.split('/').slice(0, -1)

            let packageFile;

            do {
                try {
                path = splitPath.length ? `${splitPath.join('/')}/package.json` :'package.json' 

                // narrow the search over time
                if (this.checkedPackageLocations[path] !== false){
                    this.checkedPackageLocations[path] = false
                    packageFile = this['#plugins'][name].package ?? await this.getFile(path)
                    this.checkedPackageLocations[path] = true
                }

                } catch (e) {} // don't log failed package searches
                if (splitPath.length === 0) break
                splitPath.pop()

            } while (!packageFile) 
            
            
            if (packageFile) {
                this['#plugins'][name].package = packageFile
                return await this['#plugins'][name].package.body
            } else return {}
        } else {
            console.warn(`No package for ${name}.`)
            return {}
        }
    }

    get = async (name, type='metadata') => {

        if (type === 'module') return await this.module(name)
        else {

            let path = this.getPath(name)

            if (
                this['#plugins'][name] && 
                !path.includes(this.base) && // Don't get for .brainsatplay files
                !path.includes("package.json") // Don't get for package.json files
            ){
                
                let path = this.getPath(name)
                const thisPath = this.path(path, type)
                
                // Convert module to metadata path
                if (!path.includes(thisPath)) path = thisPath
                
                const file = this['#plugins'][name][type] ?? await this.getFile(path)

                if (file) {
                    this['#plugins'][name][type] = file
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
    plugins = async (name) => await this.get(name, 'plugins')
    graph = async (name) => await this.get(name, 'graph')

    getPath = (name:string) =>{
        const base = this['#plugins'][name]?.module?.path ?? this['#plugins'][name]?.path ?? name
        return base.split('/').filter(v => v != '').join('/')
    } 

    path = (path, type='metadata') => {
        if (this.regexp[type].test(path)) return path
        else {
            const splitPath = path.split('/')
            const fullFileName = splitPath.pop()
            if (fullFileName){
                const filePrefix = fullFileName.split('.').at(-2)
                return  `${splitPath.join('/')}/${this.base}/${filePrefix}.${this.suffixes[type]}`
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
        const match = path.match(this.regexp.metadata)?.[0]
        if (match){
            name = name.replace(match,`${match.split('/').at(-1).split('.')[0]}.js`)
            isMetadata = true
            // path = path.replace(metadataPath, '')
        }

        // Skip without Name
        if (this['#plugins'][name]){
            const path = this.getPath(name)
            const pluginModule = this['#plugins'][name].module ?? await this.getFile(path)
            if (pluginModule) {
                this['#plugins'][name].module = pluginModule
                if (isMetadata) return await this.metadata(name)
                else return await this['#plugins'][name].module.body
            } else return {}
        } else {
            console.error(`Module for ${name} not found.`)
            return {}
        }
    }
}