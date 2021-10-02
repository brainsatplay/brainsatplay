
import { Page } from './Page';

export class SettingsPage extends Page{
    constructor(parentNode, toggle, storage){
        super(parentNode, toggle)

        this.header.innerHTML = `Settings`
        this.storage = storage

        // Create Data Storage Option
        this._createSelector('Storage Type', [
            'Local', 
            // 'MongoDB'
        ])
    }

    _createSelector = (header, options) => {
        let div = document.createElement('div')
        div.style = 'display: flex; align-items: center; grid-template-columns: repeat(2,1fr);'

        div.innerHTML = `<h3>${header}</h3>`
        let select = document.createElement('select')
        select.style = 'max-height: 35px; margin-left: 25px;'
        
        options.forEach(str => {
            let option = document.createElement('option')
            option.value = option.innerHTML = str
            select.appendChild(option)       
        })

        div.insertAdjacentElement('beforeend', select)
        this.content.insertAdjacentElement('beforeend', div)

        select.value = this.storage.get('settings', header) ?? options[0]
        
        select.onchange = (e) => {
            this.storage.set('settings', header, select.value)
        }
    }
}