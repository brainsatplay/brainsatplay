
import { Page } from './Page';
import { settings } from '../../../applets/UI/profile/settings.js';
import { Application } from '../../../libraries/js/brainsatplay';

export class SettingsPage extends Page{
    constructor(parentNode, toggle, storage){
        super(parentNode, toggle)

        this.header.innerHTML = `Settings`
        this.storage = storage
        this.subpages = new Map()

        // Create Sidebar
        this.sidebar = document.createElement('div')
        this.sidebar.style = `
            padding: 25px 25px 25px 0px;
            height: 100%;
            width: 150px;
            background: black;
        `
        this.container.insertAdjacentElement('afterbegin', this.sidebar)

        // Create Profile Page
        this._addSubPage('Profile')
        settings.connect = {toggle: 'device-menu'}
        this.profileApp = new Application(settings, this.subpages.get('Profile'))
        this.profileApp.init()


        // Create Storage Subpage
        this._addSubPage('Storage')

        this._createSelector('Storage Type', [
            'Local', 
            // 'MongoDB'
        ], 'Storage')


        
    }

    _addSubPage = (name) => {

        let page = document.createElement('div')
        page.classList.add('page-container')
        page.style = `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        `
        if (this.subpages.size > 0) page.style.display = 'none'
        this.content.insertAdjacentElement('beforeend', page)

        let button = document.createElement('button')
        button.classList.add('brainsatplay-sidebar-button')
        button.insertAdjacentHTML('beforeend', `<span>${name}</span>`)

        button.onclick = () => {
            // Replace Focus Page
            this.subpages.forEach((el,key) => {
                if (key === name) el.style.display = 'block' // focus
                else el.style.display = 'none' // hide
            })
        }

        this.sidebar.insertAdjacentElement('beforeend', button)
        this.subpages.set(name, page)
    }

    _createSelector = (header, options, subpage=this.subpages.entries().next().value[0]) => {
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
        this.subpages.get(subpage).insertAdjacentElement('beforeend', div)

        select.value = this.storage.get('settings', header) ?? options[0]
        
        select.onchange = (e) => {
            this.storage.set('settings', header, select.value)
        }
    }
}