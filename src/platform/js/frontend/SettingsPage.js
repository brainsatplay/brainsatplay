
import { Page } from './Page';
import { settings } from '../../../applets/UI/profile/settings.js';
import { App } from '../../../libraries/js/brainsatplay';
import { Debug } from '../../../libraries/js/src/plugins/debug';

export class SettingsPage extends Page{
    constructor(parentNode, toggle, session){
        super(parentNode, toggle)

        this.header.innerHTML = `Settings`
        this.session = session
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
        // this._addSubPage('Profile')
        // settings.connect = {toggle: 'device-menu'}
        // this.profileApp = new App(settings, this.subpages.get('Profile'), this.session)
        // this.profileApp.init()


        // Create Storage Subpage
        this._addSubPage('Storage')

        // Check Autosave (set true by default)
        this.session.storage.get('settings','Autosave Data').then((autosave) => {
            if (autosave == null) this.session.storage.set('settings','Autosave Data', true)
        })

        this._createCheckbox('Autosave Data', 'Storage')
        this._createSelector('Storage Type', [
            'Local', 
            // 'MongoDB'
        ], 'Storage')

         // Create Badges Page
         this._addSubPage('Badges')
         this._createBadge('Brainstormer', 'Sign the Brains@Play Operator Agreement.')
         this._createBadge('Citizen Scientist', 'Link a Brains@Play product to your account.')

         // Create Plugins Page
         this._addSubPage('Plugins')
         let getPlugins = async () => {
            let plugins = await this.session.storage.get('Plugins')
            plugins.forEach(o => {
                let div = document.createElement('div')
                div.innerHTML = o.name
                this.subpages.get('Plugins').insertAdjacentElement('beforeend',div)
            })
        }
        
        getPlugins()

    }

    _createBadge = async (name, description='', condition=()=>{}) => {

        let badge = document.createElement('div')
        badge.classList.add('brainsatplay-badge')
        badge.innerHTML = `<h4>${name}</h4><p>${description}</p>`


        if (!condition()) badge.classList.add('disabled')
        else {
            badge.classList.remove('disabled')
            this.session.notifications.throw(`<p>You earned the <strong>${name}</strong> badge!</p>`)
        }

        this.subpages.get('Badges').insertAdjacentElement('beforeend', badge)

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

    _createSelector = async (header, options, subpage=this.subpages.entries().next().value[0]) => {
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

        let value = await this.session.storage.get('settings', header)
        select.value = value ?? options[0]
        
        select.onchange = (e) => {
            this.session.storage.set('settings', header, select.value)
        }
    }

    _createCheckbox = async (header, subpage=this.subpages.entries().next().value[0]) => {
        let div = document.createElement('div')
        div.style = 'display: flex; align-items: center; grid-template-columns: repeat(2,1fr);'

        div.innerHTML = `<h3>${header}</h3>`
        let input = document.createElement('input')
        input.type = 'checkbox'
        input.style = 'max-height: 35px; margin-left: 25px;'

        div.insertAdjacentElement('beforeend', input)
        this.subpages.get(subpage).insertAdjacentElement('beforeend', div)

        input.checked = await this.session.storage.get('settings', header)
        
        input.onchange = (e) => {
            this.session.storage.set('settings', header, input.checked)
        }
    }
}