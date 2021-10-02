
import { DOMFragment } from '../../../libraries/js/src/ui/DOMFragment';


export class ExtensionPage{
    constructor(parentNode, toggle){
        this.parentNode = parentNode
        this.toggle = toggle

        this.page = document.createElement('div')
        this.page.classList.add('brainsatplay-page')


        this.html = `
            <div class="brainsatplay-header-grid">
                <h1>Extensions</h1>
                <button class="brainsatplay-default-button">Close</button>
            </div>
            <div class="page-container">
                Coming soon...
            </div>
        `

        this.page.insertAdjacentHTML('beforeend', this.html)

        this.setupHTML = () => {
            this.toggle.onclick = () => {
                this.fragment.node.classList.toggle('shown')
            }

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