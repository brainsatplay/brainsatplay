import {Session} from './Session'
import {DOMFragment} from './ui/DOMFragment'
import {StateManager} from './ui/StateManager'
import {Graph} from './graph/Graph'

import './ui/styles/defaults.css'
import { Editor } from './graph/Editor'

// Utilities
import { Dropdown } from "./ui/Dropdown";

// Images
import appletSVG from './ui/assets/th-large-solid.svg'
// import dragSVG from '../../assets/arrows-alt-solid.svg'
import nodeSVG from './ui/assets/network-wired-solid.svg'
import expandSVG from './ui/assets/expand-arrows-alt-solid.svg'

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
            sessionId: null, // Track Brainstorm sessions,
            ready: false,
            edgeCallbacks: []
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

        // Create Default Menu
        this._createMenu()

        // Set Shortcuts
        document.addEventListener('keydown', this.shortcutManager, false);
    }

    shortcutManager = (e) => {

        if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            if (e.key === 'e' && this.editor) { // Toggle Editor
                e.preventDefault();
                this.editor.toggleDisplay()
            }
            else if (e.key === 's') { // Save Application
                e.preventDefault();
                this.graphs.forEach(g => g.save())
                this.save()
            }
        }
    }

    // ------------------- START THE APPLICATION -------------------

    init = async () => {


        this.props.sessionId = null

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

        // Register App in Session
        this.session.registerApp(this) // Rename

        // Create App Intro Sequence
        this.session.createIntro(this, async (sessionInfo) => {

            // this.tutorialManager.init();

            this.props.ready = true

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
        setTimeout(() => this.graphs.forEach(g => g._resizeUI()), 250) // resize again
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
                if (this.intro?.deleteNode instanceof Function) this.intro.deleteNode()
                // this._removeAllFragments()
                this.editor.init()
            }

            // Hard Deinit
            else {
                this.editor.deinit()
                document.removeEventListener('keydown', this.shortcutManager);
                this.AppletHTML.deleteNode();
                this.AppletHTML = null
            }

            this.graphs.forEach(g => g.deinit())
            this.graphs = new Map()
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

    export = () => {

        let graphs = []

        this.graphs.forEach(g => {

            let graph = {
                nodes: Array.from(g.nodes).map(arr => arr[1].export()),
                edges: Array.from(g.edges).map(arr => arr[1].export()),
                graphs: Array.from(g.graphs).map(arr => arr[1].export()),
                events: Array.from(g.events).map(arr => arr[1].export())
            }

            graphs.push(graph)
        })

        return graphs

    }

    _createMenu = () => {

                var container = document.createElement('div');
                container.id = `${this.props.id}-brainsatplay-default-ui`
                container.classList.add('brainsatplay-default-interaction-menu')
                this.ui.container.insertAdjacentElement('beforeend', container);

                let headers = [{label: 'Applet Menu', id:'options-menu'}]
                let options = [
                    {header: 'options-menu', content: '<div class="toggle">i</div><p>Info</p>', onclick: (el) => {
                        if (infoMask.style.opacity != 0) {
                            infoMask.style.opacity = 0
                            infoMask.style.pointerEvents = 'none'
                        } else {
                            infoMask.style.opacity = 1
                            infoMask.style.pointerEvents = 'auto'
                            appletMask.style.opacity = 0;
                            appletMask.style.pointerEvents = 'none';
                        }
                    }},
                    {header: 'options-menu', content: `<div class="toggle"><img src="${nodeSVG}"></div><p>Edit</p>`, id:"brainsatplay-visual-editor", onload: (el)=> {    
                        this.editor.setToggle(el)
                    }, onclick: (el) => {
                        // console.error('toggling')
                    }},
                    {header: 'options-menu', content: `<div class="toggle"><img src="${appletSVG}"></div><p>Browse Apps</p>`, id:"brainsatplay-browser", onclick: async (el) => {
                            if (appletMask.style.opacity != 0) {
                                appletMask.style.opacity = 0
                                appletMask.style.pointerEvents = 'none'
                            } else {
                                appletMask.style.opacity = 1
                                appletMask.style.pointerEvents = 'auto'
                                infoMask.style.opacity = 0;
                                infoMask.style.pointerEvents = 'none';
                                // if (instance == null) {
                                //     getAppletSettings(appletManifest['Applet Browser'].folderUrl).then((browser) => {
                                       
                                //         let config = {
                                //             hide: [],
                                //             applets: Object.keys(appletManifest).map(async (key) => {
                                //                 return await getAppletSettings(appletManifest[key].folderUrl)
                                //             }),
                                //             presets: presetManifest,
    
                                //             // OLD
                                //             appletIdx: appletIdx,
                                //             showPresets: false,
                                //             displayMode: 'tight'
                                //         }
    
                                //         Promise.all(config.applets).then((resolved) => {
                                //             config.applets=resolved
                                //             let instance  = new App(browser, appletMask, this.session, [config])

                                //           // FIX
                                //             instance.init()
                                            
                                //             thisApplet.deinit = (() => {
                                //                 var defaultDeinit = thisApplet.deinit;
                                            
                                //                 return function() {    
                                //                     instance.deinit()
                                //                     appletDiv.querySelector(`.option-brainsatplay-browser`).click()                              
                                //                     let result = defaultDeinit.apply(this, arguments);                              
                                //                     return result;
                                //                 };
                                //             })()
                                //         })
                                //     })
                                // }
                            }
                    }},
                    
                    // {header: 'options-menu', content: `Drag`, onload: (el) => {
                    //     let swapped = null
                    //     el.classList.add("draggable")
                    //     console.log(el)
                    //     el.addEventListener('dragstart', () => {
                    //         appletDiv.classList.add("dragging")
                    //         console.log('dragging')
                    //     })
                    //     el.addEventListener('dragend', () => {
                    //         appletDiv.classList.remove("dragging")
                    //     })
                
                    //     appletDiv.addEventListener('dragover', (e) => {
                    //         e.preventDefault()
                    //         if (this.prevHovered != appletDiv){
                    //             let dragging = document.querySelector('.dragging')
                    //             if (dragging){
                    //                 let draggingGA = dragging.style.gridArea
                    //                 let hoveredGA = appletDiv.style.gridArea
                    //                 appletDiv.style.gridArea = draggingGA
                    //                 dragging.style.gridArea = hoveredGA
                    //                 this.responsive()
                    //                 this.prevHovered = appletDiv
                    //                 if (appletDiv != dragging){
                    //                     this.lastSwapped = appletDiv
                    //                 }
                    //             }
                    //         }
                    //         appletDiv.classList.add('hovered')
                    //     })
                
                    //     appletDiv.addEventListener('dragleave', (e) => {
                    //         e.preventDefault()
                    //         appletDiv.classList.remove('hovered')
                    //     })
                
                    //     appletDiv.addEventListener("drop", (event) => {
                    //         event.preventDefault();
                    //         if (this.lastSwapped){
                    //         let dragging = document.querySelector('.dragging')
                    //         let draggingApplet = this.applets.find(applet => applet.name == dragging.name) 
                    //             let lastSwappedApplet = this.applets.find(applet => applet.name == this.lastSwapped.name)
                    //             let _temp = draggingApplet.appletIdx;
                    //             draggingApplet.appletIdx = lastSwappedApplet.appletIdx;
                    //             lastSwappedApplet.appletIdx = _temp;
                    //             this.showOptions()
                    //         }

                    //         for (let hovered of document.querySelectorAll('.hovered')){
                    //             hovered.classList.remove('hovered')
                    //         }
                            
                    //     }, false);
                    // }},
                    {header: 'options-menu', content: `<div class="toggle"><img src="${expandSVG}"></div><p>Toggle Fullscreen</p>`, onclick: (el) => {
                        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
                        if (!fullscreenElement) {
                            if (this.ui.container.requestFullscreen) {
                                this.ui.container.requestFullscreen()
                            } else if (this.ui.container.webkitRequestFullscreen) {
                                this.ui.container.webkitRequestFullscreen()
                            }
                        } else {
                            if (document.exitFullscreen) {
                                document.exitFullscreen()
                            } else if (document.webkitExitFullscreen) {
                                document.webkitExitFullscreen()
                            }
                        }
                    }},
                    {header: 'options-menu', content: `<div class="toggle">?</div><p>Show Tutorial</p>`, onload: (el) => {
                        
                        if (this.tutorialManager != null) {
                            this.tutorialManager.clickToOpen(el)
                        } else {
                            el.remove()
                        }
        
                    }},
                ]

                let dropdown = new Dropdown(container, headers, options, {hidden: true})

                let htmlString = `
        <div class="brainsatplay-default-applet-mask" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.75); opacity: 0; pointer-events: none; z-index: 999; transition: opacity 0.5s; padding: 5%;">
        </div>
        <div class="brainsatplay-default-info-mask" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.75); opacity: 0; pointer-events: none; z-index: 999; transition: opacity 0.5s; padding: 5%; overflow: scroll;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr)">
                <div>
                <h1 style="margin-bottom: 0; padding-bottom: 0;">${this.info.name}</h1>
                <p style="font-size: 69%;">${this.info.description}</p>
                </div>
                <div style="font-size: 80%;">
                    <p>Devices: ${this.info.devices.join(', ')}</p>
                    <p>Categories: ${this.info.categories.join(' + ')}</p>
                </div>
            </div>
            <hr>
            <h2>Instructions</h2>
            <p>${this.info.instructions}</p>
        </div>
        `

                this.ui.container.insertAdjacentHTML('beforeend', htmlString);
                let defaultUI = this.ui.container.querySelector(`.brainsatplay-default-interaction-menu`)

                // Flash UI
                setTimeout(() => {
                    defaultUI.style.opacity = 1.0
                setTimeout(() => {
                    defaultUI.style.opacity = ''
                }, 3000) // Wait to Fade Out 
            }, 1000)

            let appletMask = this.ui.container.querySelector('.brainsatplay-default-applet-mask')
            let infoMask = this.ui.container.querySelector('.brainsatplay-default-info-mask')
    }

    updateGraph(){
        this.info.graphs = this.export() // Replace settings
    }

    _copySettingsFile(info){
        let infoCopy = Object.assign({}, info)

        // ------------------- CONVERSIONS -------------------
        if (!('graphs' in infoCopy)) infoCopy.graphs = [] // create graph array
        if ('graph' in infoCopy) {
            infoCopy.graphs.push(infoCopy.graph) // push single graph
            delete infoCopy.graph
        }

        infoCopy.graphs = infoCopy.graphs.filter(g => Object.keys(g).length > 0)
                
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
        let graph = new Graph(info, {app: this}); // top-level graph
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
            if (g.nodes) g.nodes.forEach(n => {
                for (let k in n.params){
                    let value = n.params[k]
                    let regex = new RegExp('([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)) =>')
                    let func = (typeof value === 'string') ? value.substring(0,8) == 'function' : false
                    let arrow = (typeof value === 'string') ? regex.test(value) : false
                    n.params[k] = ( func || arrow) ? eval('('+value+')') : value;
                }
            })
        })
        return settings
    }

    // Save
    save = (e) => {
        this.updateGraph()
        this.session.projects.save(this)
        this.editor.lastSavedProject = this.name
    }
}