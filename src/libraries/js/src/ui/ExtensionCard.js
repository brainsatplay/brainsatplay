
import * as brainsatplay from '../../brainsatplay'


export class ExtensionCard {
    constructor(extension, storage){

        this.settings = extension
        this.storage = storage


        // Check Storage for Extension Usage
        let isEnabled = false
        if (this.storage) isEnabled = this.storage.get('extensions', this.settings.name)

        // Create Visuals
        this.element = document.createElement('div')
        this.element.classList.add('browser-card')
        
        this.info = document.createElement('div')
        this.info.innerHTML = `<h2>${extension.name}</h2>`
        this.info.classList.add('info')
        this.element.insertAdjacentElement('beforeend', this.info)
        
        this.buttons =  document.createElement('div')
        this.buttons.style = 'display: flex;'
        
        this.toggle = document.createElement('button')
        this.toggle.classList.add('brainsatplay-default-button')
        this.toggle.innerHTML = 'Enable'
        this.toggle.onclick = () => {
            if (this.toggle.innerHTML === 'Enable') this._enableExtension()
            else this._disableExtension()
        }

        this.show = document.createElement('button')
        this.show.classList.add('brainsatplay-default-button')
        this.show.innerHTML = 'View'
        this.show.onclick = this._showExtensionElement
        this.show.style.display = 'none'


        this.buttons.insertAdjacentElement('beforeend', this.toggle)
        this.buttons.insertAdjacentElement('beforeend', this.show)

        this.info.insertAdjacentElement('beforeend', this.buttons)
        // this.app.AppletHTML.node.style.display = 'hidden'

        if (isEnabled) {
            this._enableExtension()
        }
    }

    _enableExtension = () => {
        this.toggle.innerHTML = 'Disable'

        this.closeView = document.createElement('div')
        this.closeView.classList.add('brainsatplay-default-button')
        this.closeView.style = 'position: absolute; bottom: 25px; right: 25px;'
        
        
        this.view = document.createElement('div')
        this.view.style = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            padding: 50px;
            display: none;
            z-index: 1000;
            background: black;
        `

        this.closeView = document.createElement('div')
        this.closeView.classList.add('brainsatplay-default-button')
        this.closeView.style = 'position: absolute; bottom: 25px; right: 25px; z-index: 100;'
        this.closeView.onclick = this._hideExtensionElement
        this.closeView.innerHTML = 'Close Extension'

        console.log(this.closeView)
        this.view.insertAdjacentElement('beforeend', this.closeView)
        document.body.insertAdjacentElement('beforeend', this.view)
        this.app = new brainsatplay.Application(this.settings, this.view)
        this.app.init();
        this.show.style.display = 'flex'

        // Log Enable in Storage
        if (this.storage) this.storage.set('extensions', this.app.info.name, true)
    }

    _disableExtension = () => {
        this.toggle.innerHTML = 'Enable'
        this.show.style.display = 'none'

        // Delete App
        this.app.deinit()

        // Log Disable in Storage
        if (this.storage) this.storage.set('extensions', this.app.info.name, false)
    }

    _showExtensionElement = () => {
        this.view.style.display = 'block'
    }

    _hideExtensionElement = () => {
        this.view.style.display = 'none'
    }
}