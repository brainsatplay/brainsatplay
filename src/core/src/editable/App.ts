// An integrated freerange + brainsatplay App class

import * as freerange from 'freerange/dist/index.esm'
import App from "../App";
import Plugins from "./Plugins";

export default class EditableApp {


    active: App;
    plugins: Plugins
    filesystem?: string | freerange.System;
    onstart: any
    onstop: any
    ignore: string[] = ['.DS_Store', '.git']
    debug: boolean = false
    options: {
        ignore: string[]
        debug: boolean
    } = {
        ignore: ['.DS_Store', '.git'],
        debug: false
    }

    constructor(input, options) {
        this.filesystem = input
        this.options = Object.assign(this.options, options)
    }

    compile = async () => {

        const packageContents = await (await this.filesystem.open('package.json')).body
        if (packageContents){

            // Get main file
            const file = await this.filesystem.open(packageContents.main)

            // Get attached plugins
            this.plugins = new Plugins(this.filesystem)
            await this.plugins.init()

            if (file) {
                const mainPlugins = await this.plugins.get(packageContents.main, 'plugins')
                const mainGraph = await this.plugins.get(packageContents.main, 'graph')
                this.active.setPackage(packageContents)
                await this.active.setPlugins(mainPlugins)
                await this.active.setTree(mainGraph)
            } else console.error('The "main" field in the supplied package.json is not pointing to an appropriate entrypoint.')
        }
    }

    createFilesystem = async (input, options=this.options) => {
        if (!input && !(this.filesystem instanceof freerange.System)) input = this.filesystem
        let system = new freerange.System(input, options)
        return await system.init().then(() => system).catch(() => undefined)
    }

    start = async (input) => {
        await this.stop() 
        const system = await this.createFilesystem(input)
        if (system){
            this.filesystem = system
            this.active = new App(this.filesystem.root)
            this.active.compile = this.compile
            this.active.onstart = this.onstart
            this.active.onstop = this.onstop
            return await this.active.start()
        } else return false
    }   

    stop = async () => {
        if (this.active) await this.active.stop()
    }
    
    
    save = async () => {
        await this.stop()
        await this.filesystem.save()
        await this.active.start()
    }
}