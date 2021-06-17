import {settings} from '../template/settings.js'
import { bufferToggle } from 'rxjs-compat/operator/bufferToggle'

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
            <div id='${this.props.id}' style='height:100%; width:100%;'>
            </div>`
        }


        let setupHTML = async () => {
           this.props.container = document.getElementById(this.props.id)
           this.props.projects = await this._insertBrowser()
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
            parentNode: this.props.container,
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

    async _insertBrowser(){
        let projectMask = document.createElement('div')
        projectMask.id = `${this.props.id}-projects`
        projectMask.style = `
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
        let projects = document.createElement('div')
        projects.id = `${this.props.id}-projectlist`
        projects.style = `
        `
        let button = document.createElement('button')
        button.id = `${this.props.id}-new`
        button.innerHTML = 'Create New Project'
        button.classList.add('brainsatplay-default-button')
        button.onclick = () => {
            this._createApp(this.template)
        }
        projects.insertAdjacentElement(`beforeend`, button)
        projectMask.insertAdjacentElement(`beforeend`, projects)
        this.props.container.insertAdjacentElement(`beforeend`, projectMask)

        let projectSet = await this.session.projects.list()
        projectSet.forEach(str => {
            let div = document.createElement('div')
            div.classList.add('brainsatplay-project-div')

            let button = document.createElement('button')
            button.id = `${this.props.id}${str}`
            button.innerHTML = str
            button.classList.add('brainsatplay-default-button')
            button.onclick = async () => {
                 let settings = await this.session.projects.load(button.id.replace(this.props.id,''))
                 this._createApp(settings)
            }
            div.insertAdjacentElement('beforeend', button)

         projects.insertAdjacentElement('beforeend',div)
        })

        return projectMask
    }
}

export {Studio}