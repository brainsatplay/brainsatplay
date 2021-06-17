import {Session} from './Session'
import {DOMFragment} from './ui/DOMFragment'
import './ui/styles/defaults.css'

export class Application{
    constructor(
        info={},
        parent=document.body,
        session=new Session(),
        settings=[]
        ){
            
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = info
        this.settings = settings;
        this.AppletHTML = null;
        this.graph = null
        this.editor = null
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            sessionId: null
        };
    }

    init() {
        let info = this.session.registerApp(this.props.id, this.info.name, this.info.graph)
        this.graph = info

        let setupHTML = () => {
            for (let key in this.graph.nodes) {
                let n = this.graph.nodes[key]
                this.insertInterface(n)
            }
            this.session.connectDevice()
        }

        if (!this.AppletHTML){
            this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
                `<div id="${this.props.id}" style="height:100%; width:100%; position: relative; display: flex;"></div>`,       //Define the html template string or function with properties
                this.parentNode,    //Define where to append to (use the parentNode)
                this.props,         //Reference to the HTML render properties (optional)
                setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
                undefined,          //Can have an onchange function fire when properties change
                "NEVER",             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed,
                this._deinit,
                this.responsive
            )
        } else {
            this.AppletHTML.setupHTML = setupHTML
            this.AppletHTML.setupHTML()
        }

        this.configure(this.settings); //You can give the app initialization settings if you want via an array.
    }

        //Delete all event listeners and loops here and delete the HTML block
        _deinit = () => {
            this.session.removeApp(this.props.id)
        }

        deinit = (soft=false) => {
            if (this.AppletHTML) {

                // Soft Deinit
                if (soft) {
                    this._deinit()
                    if (this.intro) this.intro.deleteNode()
                }

                // Hard Deinit
                else {
                    this.AppletHTML.deleteNode();
                }
            }
        }

        reload = () => {

            // Soft Deinitialization
            this.deinit(true)

            // Reinitialize App
            this.init()
        }
    
        //Responsive UI update, for resizing and responding to new connections detected by the UI manager
        responsive() {
            // _runInternalFunctions(this.uiParams.responsive)
        }
    
        configure = (settings=[{}]) => { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
            
            settings.forEach((cmd,i) => {});

            this.session.createIntro(this, (sessionInfo) => {
                // this.tutorialManager.init();

                // Multiplayer Configuration
                if(sessionInfo && this.props.sessionId !== sessionInfo.id){    
                    this.sessionId = sessionInfo.id;
                }

                this.session.startApp(this.props.id, this.sessionId)

                if (!('editor' in this.info)){
                    this.info.editor = {}
                    this.info.editor.parentNode = this.parentNode
                    this.info.editor.show = false
                }

                this.editor = this.session.graph.edit(this, this.info.editor.parentNode)

                if (this.info.editor.show !== false) this.editor.toggleDisplay()

                // Resize All Nodes
                for (let k in this.graph.nodes) {
                    if (this.graph.nodes[k].fragment && this.graph.nodes[k].fragment.onresize instanceof Function)
                    this.graph.nodes[k].fragment.onresize()         
                }
            })
        }

        _runInternalFunctions(arr){
            arr.forEach(f => {
                if (f instanceof Function) f(this)
            })
        }

        insertInterface(n){

            let ui = n.ui
            if (ui){
                n.fragment = new DOMFragment( // Fast HTML rendering container object
                    ui.HTMLtemplate, //Define the html template string or function with properties
                    document.getElementById(`${this.props.id}`),    //Define where to append to (use the parentNode)
                    this.props,         //Reference to the HTML render properties (optional)
                    ui.setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
                    undefined,          //Can have an onchange function fire when properties change
                    "NEVER",             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
                    undefined, // deinit
                    ui.responsive // responsive
                )
            }
        }
}