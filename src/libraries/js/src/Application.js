import {Session} from './Session'
import {DOMFragment} from './ui/DOMFragment'

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

        this.session.plugins.add(this.props.id, this.info.name, this.info.nodes)
    }


    init() {

        this.streams = this.session.plugins.start(this.props.id, this.info.responses)

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = this.info.template

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => { 
            if (this.info.setupHTML instanceof Function) this.info.setupHTML()        
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
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
            this.streams = this.session.plugins.stop(this.props.id)
            this.AppletHTML.deleteNode();
        }
    
        //Responsive UI update, for resizing and responding to new connections detected by the UI manager
        responsive() {
            if (this.info.responsive instanceof Function) this.info.responsive()        
        }
    
        configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
            settings.forEach((cmd,i) => {});
        }
}