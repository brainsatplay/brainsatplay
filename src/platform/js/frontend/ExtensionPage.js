
import { DOMFragment } from '../../../libraries/js/src/ui/DOMFragment';
import { appletManifest } from './../../appletManifest'
import { ExtensionCard } from '../../../libraries/js/src/ui/ExtensionCard'
import { getAppletSettings } from "../general/importUtils"
import { StorageManager } from "../../../libraries/js/src/StorageManager"
export class ExtensionPage{
    constructor(parentNode, toggle){
        this.parentNode = parentNode
        this.toggle = toggle

        this.storage = new StorageManager()

        this.page = document.createElement('div')
        this.page.classList.add('brainsatplay-page')

        this.html = `
            <div class="brainsatplay-header-grid">
                <h1>Extensions</h1>
                <button class="brainsatplay-default-button">Close</button>
            </div>
            <div class="page-container">
            </div>
        `

        this.page.insertAdjacentHTML('beforeend', this.html)

        this.setupHTML = async () => {
            this.toggle.onclick = () => {
                this.fragment.node.classList.toggle('shown')
            }

            let container = this.page.querySelector('.page-container')
            container.style = 'display: flex; flex-wrap: wrap;'
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

            apps = await Promise.all(apps)

            apps.forEach(o => {
                let card = new ExtensionCard(o, this.storage)
                container.insertAdjacentElement('beforeend',card.element)
            })

            let close = this.page.querySelector('.brainsatplay-default-button')

            close.onclick = () => {
                this.toggle.click()
            }
        }

        this.fragment = new DOMFragment(
            this.page,
            this.parentNode,
            undefined,
            this.setupHTML,
            undefined,
            undefined,
            undefined,
            this.responsive
        )

        this._init()
    }

    _init(){}

    _toggle(){

    }

    responsive(){}
}