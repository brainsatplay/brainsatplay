import {Session} from './Session'
import {DOMFragment} from './ui/DOMFragment'
import {StateManager} from './ui/StateManager'
import {Plugin} from './graph/Plugin'

import './ui/styles/defaults.css'
import { Editor } from './graph/Editor'

export class App {
    constructor(
        info={},
        parent=document.body,
        session=new Session(),
        settings=[]
        ) {
        
        // ------------------- SETUP -------------------
        this.ui = {
            container: document.createElement('div') // wraps the app ui
        }

        this._setCoreAttributes(info, parent, session, settings)

        this.graphs = new Map() // graph execution
        this.devices = []
        this.state = new StateManager({}); // app-specific state maanger
        

        this.props = { // Changes to this can be used to auto-update the HTML and track important UI values 
            id: null, // Keep random ID
            sessionId: null, // Track Brainstorm sessions
        };

        this.editor = new Editor(this, parent)

        // Track Data Streams
        this.streams = []

        // Track Analysis
        this.analysis = {
            default: [],
            dynamic: []
        }

        // Track Controls
        this.controls = []

        // Set shortcuts
        document.addEventListener('keyup', this.shortcutManager, false);
    }

    shortcutManager = (e) => {
        if (e.ctrlKey && e.key === 'e') {
            if (this.editor) this.editor.toggleDisplay()
        }
    }

    // ------------------- START THE APPLICATION -------------------

    init = async () => {
        // Keep Style of Previous Top-Level Wrapper
        if (this.props.id == null) this.ui.container.style = `height:100%; width:100%; max-height: 100vh; max-width: 100vw; position: relative; display: flex; overflow: scroll;`

        // Get New ID
        this.props.id = this.ui.container.id = String(Math.floor(Math.random()*1000000))

        // Add Functionality to Applet
        this.info.graphs.forEach(g => this.addGraph(g)) // initialize all graphs
        
        await Promise.all(Array.from(this.graphs).map(async a => await this.startGraph(a[1]))) // initialize all graphs

        // Create Base UI
        this.AppletHTML = this.ui.manager = new DOMFragment( // Fast HTML rendering container object
            this.ui.container,       //Define the html template string or function with properties
            this.ui.parent,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            this._setupUI,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER",             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed,
            this._deinit,
            this.responsive
        )


        // console.log('initing editor', this)
        // this.editor.init()

        // Register App in Session
        this.session.registerApp(this) // Rename

        // Create App Intro Sequence
        this.session.createIntro(this, (sessionInfo) => {

            // this.tutorialManager.init();

            // Multiplayer Configuration
            this.session.startApp(this, sessionInfo?.id ?? this.props.id)

            // Activate All Edges
            this.graphs.forEach(async g => {
                for (const arr of Array.from(g.edges)) {
                    await arr[1].update() // second time (first inside edge, this time for brainstorm)
                }
            })

        })    

    }

    // Properly set essential attributes for the App class (used on construction and when reloaded)
    _setCoreAttributes = (info={}, parent=document.body, session=new Session(), settings=[]) => {

        // ------------------- DEFAULTS -------------------
        if (!('editor' in info)) info.editor = {}
        if (info.editor.toggle == null) info.editor.toggle = "brainsatplay-visual-editor"

        // ------------------- SETUP -------------------
        this.session = session; //Reference to the Session to access data and subscribe
        this.ui.parent = parent; // where to place the container
        info = this._copySettingsFile(info) // ensure that settings files do not overlap
        this.info = this.parseSettings(info) // parse settings (accounting for stringified functions)
        this.settings = settings // 
    }

    // Executes after UI is created
    _setupUI = () => {
        if (this.info.connect) this._createDeviceManager(this.info.connect)
    }

    // Populate the UI with a Device Manager
    _createDeviceManager = ({parentNode, toggle, filter, autosimulate, onconnect, ondisconnect}) => {
        if (typeof toggle === 'string') toggle = document.querySelector(`[id="${toggle}"]`)
        this.session.connectDevice(parentNode, toggle, filter, autosimulate, onconnect, ondisconnect)
    }

    // ------------------- STOP THE APPLICATION -------------------

    deinit = (soft=false) => {            
        if (this.AppletHTML) {
            // Soft Deinit
            if (soft) {
                this.session.removeApp(this.props.id)
                if (this.intro.deleteNode instanceof Function) this.intro.deleteNode()
                // this._removeAllFragments()
            }

            // Hard Deinit
            else {
                this.AppletHTML.deleteNode();
                this.AppletHTML = null
            }

            this.graphs.forEach(g => g.deinit())
            this.editor.deinit()
            document.removeEventListener('keyup', this.shortcutManager);
        }
    }

    // ------------------- Additional Utilities -------------------
    responsive = () => {}
    configure = () => {}

    // ------------------- Manipulation Utilities -------------------

    replace = (info=this.info,parent=this.parent,session=this.session, settings=this.settings) => {
        this._setCoreAttributes(info, parent, session, settings)
        this.deinit(true)
        this.init()
    }

    reload = () => {

        // Soft Deinitialization
        this.updateGraph()
        this.deinit(true)

        // Reinitialize App
        this.init()
    }

    updateGraph(){
        let copiedSettings = this._copySettingsFile({graphs: this.info.graphs})
        this.info.graphs = copiedSettings.graphs // Replace settings
    }

    _copySettingsFile(info){
        let infoCopy = Object.assign({}, info)

        // ------------------- CONVERSIONS -------------------
        if (!('graphs' in infoCopy)) infoCopy.graphs = [] // create graph array
        if ('graph' in infoCopy) infoCopy.graphs.push(infoCopy.graph) // push single graph
                
        // ------------------- CONVERSIONS -------------------
        let keys = ['nodes','edges']
        infoCopy.graphs = [...infoCopy.graphs.map(g => Object.assign({}, g))]

        infoCopy.graphs.forEach(g => {
            keys.forEach(k => {
                if (g[k]){
                    g[k] = [...g[k]]
                    g[k].forEach(o => {
                        o = Object.assign({}, o)
                        for (let key in o){
                            if (o[key] === Object) o[key] = Object.assign({}, o[key])
                        }
                    })
                }
            })
        })

        return infoCopy
    }

    // ------------------- GRAPH UTILITIES -------------------


    addGraph = (info) => {
                
        let graph = new Plugin(info, {app: this}); // top-level graph
        if(!this.graphs.get(graph.name)) this.graphs.set(graph.name, graph)
    }

    startGraph = async (g) => {
        await g.init()
    }

    removeGraph = (name='') => {
        this.graphs.get(name).deinit()
        this.graphs.delete(name)
    }

    // ------------------- HELPER FUNCTIONS -------------------

    // Unstringify Functions
    parseSettings = (settings) => {
        settings.graphs.forEach(g => {
            g.nodes.forEach(n => {
                for (let k in n.params){
                    let value = n.params[k]
                    let regex = new RegExp('([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)) =>')
                    let func = (typeof value === 'string') ? value.substring(0,8) == 'function' : false
                    let arrow = regex.test(value)
                    n.params[k] = ( func || arrow) ? eval('('+value+')') : value;
                }
            })
        })
        return settings
    }
}