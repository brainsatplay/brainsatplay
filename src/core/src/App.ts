// An integrated freerange + brainsatplay App class

// import WASL from 'wasl/dist/index.esm'
import WASL from '../external/wasl/index.esm'
import * as freerange from '../external/freerange/index.esm'
// import * as freerange from 'freerange/dist/index.esm'
import { AppOptions } from './types';
import Plugins from "./Plugins";
import * as utils from './utils'

let defaultOptions = {
    ignore: ['.DS_Store', '.git'],
    debug: false,
    autosync: [
        '*.wasl.json'
    ],
}

export default class App {

    #input: any;

    wasl: WASL; // active wasl instance
    plugins: Plugins
    filesystem?: string | freerange.System;
    onstart: any
    onstop: any
    ignore: string[] = ['.DS_Store', '.git']
    debug: boolean = false
    options: AppOptions = defaultOptions
    editable: boolean = null
    #sameRoot = 4

    constructor(input, options = {}) {
        this.#input = input
        this.setOptions(options)
    }

    setOptions = (options) => {
        this.options = Object.assign(this.options, options)
        if (this.options.sameRoot) this.#sameRoot = this.options.sameRoot
        return this.options
    }

    compile = async () => {
        const packageContents = await (await this.filesystem.open('package.json')).body
        let mainPath = packageContents?.main ?? 'index.wasl.json'

            // Get main file
            const file = await this.filesystem.open(mainPath)

            // Get WASL files in reference mode
            let filesystem = {}


            // Get attached plugins
            // this.plugins = new Plugins(this.filesystem)
            // await this.plugins.init()

            if (file) {
                const body = await file.body

                const toFilterOut = utils.noProtocol(file.path).split('/')

                await Promise.allSettled(Array.from(this.filesystem.files.list.entries()).map(async (arr) => {
                    let path = utils.noProtocol(arr[0]) // no protocols
                    const file = arr[1]

                    // Remove Common Paths
                    const splitPath = path.split('/')
                    let i = 0
                    let ogLength = splitPath.length
                    let keepGoing = true
                    do {
                        keepGoing = splitPath[0] === toFilterOut[i]
                        if (keepGoing) splitPath.shift() // remove first element
                        if (i >= ogLength - 2) keepGoing = false // stop before removing file name
                        i++
                    } while (keepGoing)
                    if (i > this.#sameRoot) path = splitPath.join('/') // arbitrary cutoff for what counts as the same reference
                    filesystem[path] = await file.body // loading in
                }))

                this.wasl = await this.create(body, Object.assign(this.options, {filesystem, _modeOverride: 'reference', _overrideRemote: true}))
                return this.wasl
            } else if (packageContents?.main) console.error('The "main" field in the supplied package.json is not pointing to an appropriate entrypoint.')
            else console.error('No index.wasl.json file found at the expected root location.')
    }

    join = utils.join

    createFilesystem = async (input?, options=this.options) => {

        // Create a new filesystem
        let clonedOptions = Object.assign({}, options)
        let system = new freerange.System(input, clonedOptions)

        await system.init()

        this.editable = true

        // Load WASL Files Locally
        if (this.wasl){

            let pkg = system.open('package.json', false); // don't create

            // create actual files
            let createPkg = !pkg || input === null // input was null
            for (let path in this.wasl.files)  {
                await system.addExternal(path, this.wasl.files[path].text) // note: does not recognize xxx:// formats when loading into a native filesystem
                if (path === 'package.json') createPkg = false
            }

            // place reference file at the root (for later loading)
            if (createPkg) {
                console.warn('Creating package.json file at the root to reference later!')
                await system.addExternal('package.json', `{"main": "${this.#input}"}`)
            }
        }

        return system
    }

    create = async (input, options, toStart = true) => {
        let wasl = new WASL(input, options)
        await wasl.init()
        if (toStart) await wasl.start()
        return wasl
    }

    start = async (input=this.#input, options=this.options, fromSave) => {
        this.#input = input // always update
        options = this.setOptions(options) // update options
        await this.stop() // make sure to stop old version

        if (!fromSave){
            // Correct input (if remote)
            let isUrl = false
            try {
                new URL(input ?? '').href
                input = this.join(input)
                isUrl = true
            } catch { }

            const isObject = typeof input === 'object'

            // Base WASL Application
            if (isObject || isUrl) {
                this.wasl = await this.create(input, options, !options.edit)
                this.filesystem  = await this.createFilesystem(null)
            }
            
            // Choose a Directory
            else this.filesystem  = await this.createFilesystem(input)
        

            // Check if Editable
            if (this.wasl && Object.keys(this.wasl.files).length === 0) {
                console.warn('No files have been loaded. Cannot edit files loaded in Reference Mode.')
                this.editable = false
            }
        }

        // compile from filesystem
        if (this.editable) await this.compile()

        return this.wasl
    }   

    stop = async () => {
        if (this.wasl) await this.wasl.stop()
    }
    
    
    save = async (restart=true) => {

        if (this.editable) {
            if (!this.filesystem) this.filesystem = await this.createFilesystem() // allow the user to specify
            if (this.filesystem) await this.filesystem.save()
            await this.compile() // recompile
        }

        if (restart && this.wasl) await this.start(undefined, undefined, true)
    }
}