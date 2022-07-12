// An integrated freerange + brainsatplay App class

import App from "../App";
import Plugins from "../Plugins";

export default class EditableApp {

    active: App;
    plugins: Plugins
    filesystem?: any;
    oncompile: () => any

    constructor(system) {
        this.filesystem = system
    }

    start = async (system = this.filesystem) => {
        this.filesystem = system
        this.active = new App(this.filesystem)

        // Set App Reactions
        this.active.onsave = async () =>  await this.filesystem.save()

        this.active.oncompile = async () => {
            const packageContents = await (await this.filesystem.open('package.json')).body
            if (packageContents){

                // Get main file
                const file = await this.filesystem.open(packageContents.main)

                // Get attached plugins
                this.plugins = new Plugins(this.filesystem)
                await this.plugins.init()

                if (file) {
                    const imported = await file.body
                    this.oncompile()
                    return imported
                } else console.error('The "main" field in the supplied package.json is not pointing to an appropriate entrypoint.')
            }
        }

        await this.active.start()
    }    
    
    save = async () => await this.active.save()
}