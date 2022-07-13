// An integrated freerange + brainsatplay App class

import App from "../App";
import Plugins from "./Plugins";

export default class EditableApp {

    active: App;
    plugins: Plugins
    filesystem?: any;
    onstart: any
    onstop: any

    constructor(system) {
        this.filesystem = system
    }

    set = async () => {


        
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

    start = async (system = this.filesystem) => {
        await this.stop() 
        this.filesystem = system
        this.active = new App(this.filesystem.root, this.filesystem.native)
        this.active.oncompile = this.set
        this.active.onstart = this.onstart
        this.active.onstop = this.onstop
        return await this.active.start()
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