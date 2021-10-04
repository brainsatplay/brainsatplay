
import { Page } from './Page';
import { appletManifest } from './../../appletManifest'
import { ExtensionCard } from '../../../libraries/js/src/ui/ExtensionCard'
import { getAppletSettings } from "../../../libraries/js/src/utils/general/importUtils"

export class ExtensionPage extends Page{
    constructor(parentNode, toggle, session){
        super(parentNode, toggle)

        this.header.innerHTML = `Extensions`

        this.session = session

        this.content.style = 'display: flex; flex-wrap: wrap;'
        let applets = Object.keys(appletManifest)
        let extensions = []
        applets.forEach(name => {
            let o = appletManifest[name]
            // o.categories.forEach(c => {
                if (o.folderUrl.includes('/Extensions/')) extensions.push(o)
            // })
        })

        let apps = extensions.map(async (o) => {
            return await getAppletSettings(o.folderUrl)
        })

        let init = async () => {
            apps = await Promise.all(apps)

            apps.forEach(o => {
                let card = new ExtensionCard(o, this.session)
                this.content.insertAdjacentElement('beforeend', card.element)
            })
        }

        init()
        
    }
}