import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import {SSVEP} from '../../../../library/src/algorithms/ssvep/SSVEP'

import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class SSVEPApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            buttonOutput: 0 //Add whatever else
        };


        this.n = 9
        this.objects = Array.from({length: this.n}, (e,i) => {return {element: null, f: (i+1)*(20/(this.n+1))}})
        this.SSVEPManager = null
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 

            return `
                <div id='${props.id}' style='height:100%; width:100%; position:relative; display: flex; align-items: center; justify-content: center;'>
                    <div id='${props.id}-grid' style="width: min(80vw,80vh); height: min(80vw,80vh); padding: 50px; display:grid;">
                    </div>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            let containerElement = document.getElementById(`${props.id}-grid`); 
            let gridLength = Math.ceil(Math.sqrt(this.objects.length))
            containerElement.style.gridTemplateRows = `repeat(${gridLength},1fr)`
            containerElement.style.gridTemplateColumns = `repeat(${gridLength},1fr)`


            let objectStyle = `
                background: white;
                box-sizing: border-box;
                margin: 25%;
                border-radius: 50%;
            `

            this.objects.forEach((o,i) => {
                let newElement = document.createElement('div')
                newElement.id = i
                newElement.style = objectStyle
                containerElement.appendChild(newElement)
                o.element = newElement
            })
            this.SSVEPManager = new SSVEP(this.objects, this.session)
            this.SSVEPManager.start()
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //you can give the app initialization settings if you want via an array.
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.SSVEPManager.stop()
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let containerElement = document.getElementById(this.props.id)
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }
} 