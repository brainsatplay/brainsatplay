import {settings} from '../template/settings.js'
import {Application} from '../../../libraries/js/src/Application'
import {appletManifest} from '../../../platform/appletManifest'
import { getApplet, getAppletSettings } from "../../../platform/js/general/importUtils"

class Studio{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.template = settings
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            container: null,
            projects:null,
            app:null
        }

        // Port Definition
        this.ports = {
            default: {},
            readout: {}, 
            color: {}
        }
    }

    init = () => {
        // Simply define the HTML template
        let HTMLtemplate = () => {return `
            <div id='brainsatplay-studio' style='height:100%; width:100%;'>
            </div>`
        }


        let setupHTML = async () => {
           this.props.container = document.getElementById('brainsatplay-studio')
           this.props.projects = await this._createBrowser()
        }

        return {HTMLtemplate, setupHTML}
    }

    default = (input) => {
        return input
    }

    deinit = () => {
        if (this.props.app) this.props.app.deinit()
    }

    _createApp(settings){
        settings.editor = {
            parentId: this.props.container.id,
            show: true,
            style: `
            position: block;
            z-index: 9;
            `,
        }
        this.props.app = this.session.initApp(settings, this.props.container,this.session,['edit'])
        this.props.projects.style.opacity = '0'
        this.props.projects.style.pointerEvents = 'none'
        this.props.app.init()
    }

    async _createBrowser(){
        this.props.mask = document.createElement('div')
        this.props.mask.classList.add(`projects`)
        this.props.mask.style = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transition: 1s;
            display: flex; 
            align-items: center; 
            justify-content: center;
            z-index: 10;
            background: black;
        `
        
        this._insertBrowserContent(this.props.mask)

        return this.props.mask
    }

    _insertBrowserContent = async (projectMask) => {
        let container = document.createElement('div')
        container.style.width = '80%'
        projectMask.insertAdjacentElement('beforeend', container)


        let galleries = {
            personal: {
                header: 'Your Projects',
                projects: []
            }, 
            templates: {
                header: 'Create a New Project',
                projects: []
            }
        }

        // Get Project Settings Files
        let projectSet = await this.session.projects.list()
        projectSet = Array.from(projectSet).map(async str => {
            let files = await this.session.projects.getFilesFromDB(str)
            let settings =  await this.session.projects.load(files)
            return {destination: 'personal', settings}
        })

        // Get Template Files
        let templateSet = []
        for (let key in appletManifest){
            let o = appletManifest[key]
            let settings = await getAppletSettings(o.folderUrl)
            if (settings.graph) templateSet.push({destination: 'templates', settings})
        }

        Promise.allSettled([...projectSet,...templateSet]).then(set => {

            let restrictedTemplates = ['BuckleUp', 'Analyzer', 'Brains@Play Studio', 'One Bit Bonanza']
            set.forEach(o => {
                if (o.status === 'fulfilled'){
                    if (!restrictedTemplates.includes(o.value.settings.name)) galleries[o.value.destination].projects.push(o.value.settings)
                }
            })

            // Add Load from File Button
            galleries.templates.projects.unshift({name: 'Load from File'})

            Object.keys(galleries).forEach(k => {

                let o = galleries[k]

                // Create Top Header
                let div = document.createElement('div')
                div.innerHTML = `<h2>${o.header}</h2>`
                div.style = `display: grid; grid-template-columns: repeat(2, 1fr);`
                container.insertAdjacentElement('beforeend', div)
                container.insertAdjacentHTML('beforeend', `<hr></hr>`)

                // Create Project List
                let projects = document.createElement('div')
                projects.id = `${this.props.id}-projectlist-${k}`
                projects.style = `display: flex; flex-wrap: wrap;`
                projects.class="brainsatplay-project-gallery"
                container.insertAdjacentElement(`beforeend`, projects)
                this.props.container.insertAdjacentElement(`beforeend`, projectMask)

                o.projects.forEach(settings => {
                    let div = document.createElement('div')
                    div.classList.add('brainsatplay-project-div')

                    let button = document.createElement('button')
                    button.innerHTML = settings.name
                    button.style.maxWidth = 'auto'
                    button.classList.add('brainsatplay-default-button')

                    button.onclick = async () => {

                        if (this.props.projects.style.pointerEvents != 'none'){
                        // Rename Template Projects
                        if (k === 'templates'){
                            settings = Object.assign({}, settings)
                            // Rename Blank Project
                            if (settings.name === 'Blank Project') settings.name = 'My Project'
                            // Rename Duplicate Projects
                            // let originalName = settings.name
                            // let i = 0
                            // let found = galleries.personal.projects.find(o => o.name === settings.name)
                            // while (found != null){
                            //     i++
                            //     settings.name = `${originalName} ${i}`
                            //     found = galleries.personal.projects.find(o => o.name === settings.name)
                            // }
                        }

                        // Create Application
                        if (settings.name === 'Load from File') {
                            console.log('loading from file')
                            settings = await this.session.projects.loadFromFile()
                            console.log(settings)
                            this._createApp(settings)
                        } else this._createApp(settings)
                    }
                    }
                    div.insertAdjacentElement('beforeend', button)
                    if (settings.name === 'Blank Project' || settings.name === 'Load from File' && k === 'templates'){
                        div.style.flex = '43%'
                        projects.insertAdjacentElement('afterbegin',div)
                    } else {projects.insertAdjacentElement('beforeend',div)}

                })
            })
        })
    }
}

export {Studio}