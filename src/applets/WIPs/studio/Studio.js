import {settings} from '../../templates/blank/settings.js'

class Studio{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph) {

        // Generic Plugin Attributes
        
        

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            container: document.createElement('div'),
            projects:null,
            app:null
        }

        this.props.container.id = 'brainsatplay-studio'
        this.props.container.style = 'eight:100%; width:100%;'

        // Port Definition
        this.ports = {
            default: {},
            readout: {}, 
            color: {},
            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element}
            }
        }
    }

    init = () => {

        // let settingsCopy = Object.assign({}, settings)
        // if (settingsCopy.name === 'Blank Project') settingsCopy.name = 'My Project'
        // settingsCopy.editor = {
        //     parentId: this.props.container,
        //     show: true,
        //     toggle: this.app.editor.toggle,
        //     style: `
        //     position: block;
        //     z-index: 9;
        //     `,
        // }

        // this.props.app = this.session.initApp(settingsCopy, this.props.container,this.session,['edit'])
        // this.props.app.init()

    }

    default = (input) => {
        return input
    }

    deinit = () => {
        if (this.props.app) this.props.app.deinit()
    }
}

export {Studio}