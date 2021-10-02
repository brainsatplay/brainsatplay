
import { DOMFragment } from '../../../libraries/js/src/ui/DOMFragment';


export class Page{
    constructor(parentNode, toggle){
        this.parentNode = parentNode
        this.toggle = toggle

        this.page = document.createElement('div')
        this.page.classList.add('brainsatplay-page')

        // Create Header
        this.headerContainer = document.createElement('div')
        this.headerContainer.classList.add('brainsatplay-header-grid')
        this.header = document.createElement('h1')
        this.headerContainer.insertAdjacentElement('beforeend', this.header)
        this.close = document.createElement('button')
        this.close.classList.add('brainsatplay-default-button')
        this.close.innerHTML = 'Close'
        this.headerContainer.insertAdjacentElement('beforeend', this.close)
        this.page.insertAdjacentElement('beforeend', this.headerContainer)
       
        // Add Content
        this.content = document.createElement('div')
        this.content.classList.add('page-container')
        this.page.insertAdjacentElement('beforeend', this.content)


        // Add Click Events
        this.toggle.onclick = () => {
            this.fragment.node.classList.toggle('shown')
        }

        this.close.onclick = () => {
            this.toggle.click()
        }

        this.fragment = new DOMFragment(
            this.page,
            this.parentNode,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.responsive
        )
    }
    
    responsive(){}
}