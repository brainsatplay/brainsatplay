// import * as freerange from './external/freerange/index.esm.js'

const freerange = {}

export default class Plugins {

    readyState: boolean = false
    source: string
    filesystem: freerange.System
    plugins: {[x:string]: {
        path: string,
        metadata?: freerange.RangeFile,
        module?: freerange.RangeFile,
        package?: freerange.RangeFile,
    }}

    checkedPackageLocations = { }

    list: Set<string> = new Set()

    // Expected File Organization
    metadataDirBase = '.brainsatplay'
    metadataFileSuffix = 'metadata.js'
    metaRegExp = new RegExp(`${this.metadataDirBase}/(.+).${this.metadataFileSuffix}`, 'g')


    constructor(source:string | freerange.System ='https://raw.githubusercontent.com/brainsatplay/awesome-brainsatplay/main/plugins.js') {
        if (typeof source === 'string') this.source = source
        else {
            this.source = source.name
            this.filesystem = source
        }
        this.plugins = {}
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
                this.plugins[key] = { path }
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
        this.plugins[f.path] = { 
            path: f.path,
            module: f
        }

        this.metadata(f.path)
    }

    get = async (url) => {
        return await this.filesystem.open(url)
    }


    // Get closest package.json file contents
    package = async (name) => {
        if (this.plugins[name]){
            let path = this.getPath(name)
            const splitPath = path.split('/').slice(0, -1)

            let packageFile;

            do {
                try {
                path = splitPath.length ? `${splitPath.join('/')}/package.json` :'package.json' 

                // narrow the search over time
                if (this.checkedPackageLocations[path] !== false){
                    this.checkedPackageLocations[path] = false
                    packageFile = this.plugins[name].package ?? await this.get(path)
                    this.checkedPackageLocations[path] = true
                }

                } catch (e) {} // don't log failed package searches
                if (splitPath.length === 0) break
                splitPath.pop()

            } while (!packageFile) 
            
            
            if (packageFile) {
                this.plugins[name].package = packageFile
                return await this.plugins[name].package.body
            } else return {}
        } else {
            console.warn(`No package for ${name}.`)
            return {}
        }
    }

    metadata = async (name) => {

        let path = this.getPath(name)

        if (
            this.plugins[name] && 
            !path.includes('.metadata.js') && // Don't get metadata for metadata
            path != 'package.json' // Don't get metadaat for package.json files
        ){
            
            let path = this.getPath(name)
            const metadataPath = this.metadataPath(path)
            
            // Convert module to metadata path
            if (!path.includes(metadataPath)) path = metadataPath

            
            const metadata = this.plugins[name].metadata ?? await this.get(path)

            if (metadata) {
                this.plugins[name].metadata = metadata
                return await metadata.body
            } else return {}
        } else {
            console.warn(`No metadata for ${name}.`)
            return {}
        }
    }

    getPath = (name:string) =>{
        const base = this.plugins[name]?.module?.path ?? this.plugins[name]?.path ?? name
        return base.split('/').filter(v => v != '').join('/')
    } 

    metadataPath = (path) => {
        if (this.metaRegExp.test(path)) return path
        else {
            // console.log(path.match(regexp), regexp.test(path))
            const splitPath = path.split('/')
            const fullFileName = splitPath.pop()
            const filePrefix = fullFileName.split('.').at(-2)
            return  `${splitPath.join('/')}/${this.metadataDirBase}/${filePrefix}.${this.metadataFileSuffix}`
        }
    }

    module = async (name) => {
        
        let path = this.getPath(name)

        // Convert Metadata Path to Module
        let isMetadata = false
        const match = path.match(this.metaRegExp)?.[0]
        if (match){
            name = name.replace(match,`${match.split('/').at(-1).split('.')[0]}.js`)
            isMetadata = true
            // path = path.replace(metadataPath, '')
        }

        // Skip without Name
        if (this.plugins[name]){
            const path = this.getPath(name)
            const pluginModule = this.plugins[name].module ?? await this.get(path)
            if (pluginModule) {
                this.plugins[name].module = pluginModule
                if (isMetadata) return await this.metadata(name)
                else return await this.plugins[name].module.body
            } else return {}
        } else {
            console.error(`Module for ${name} not found.`)
            return {}
        }
    }
}