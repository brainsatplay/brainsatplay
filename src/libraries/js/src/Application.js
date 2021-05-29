import {Session} from './Session'
import {DOMFragment} from './ui/DOMFragment'
// import './ui/styles/defaults.css'

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
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
        };

        this.session.graphs.add(this.props.id, this.info.name, this.info.graphs)
    }


    init() {

        let info = this.session.graphs.start(this.props.id)
        this.streams = info.streams
        this.uiParams = info.uiParams

        let setupHTML = () => {

            if (this.info.intro != null) this.session.createIntro(this)

            console.log('setting up')
            this.uiParams.setupHTML.forEach(f => {
                f(this)
            })
        }

        this.uiParams.HTMLtemplate = `<div id="${this.props.id}" style="height:100%; width:100%;">${this.uiParams.HTMLtemplate}</div>`

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            this.uiParams.HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.
    }

        //Delete all event listeners and loops here and delete the HTML block
        deinit() {
            this.session.graphs.stop(this.props.id)
            if (this.AppletHTML) this.AppletHTML.deleteNode();
        }
    
        //Responsive UI update, for resizing and responding to new connections detected by the UI manager
        responsive() {
            this.uiParams.responsive.forEach(foo => {
                if (foo instanceof Function) foo()        
            })
        }
    
        configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
            settings.forEach((cmd,i) => {});
        }
}