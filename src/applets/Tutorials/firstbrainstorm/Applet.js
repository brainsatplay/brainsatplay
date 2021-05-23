import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'

import {Spacebar} from '../../../libraries/js/src/nodes/Spacebar'
import {Coherence} from '../../../libraries/js/src/nodes/Coherence'

import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class Applet {

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
        this.subtitle = this.info.subtitle
        this.streams = []
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        let plugins = {
            processing: [Spacebar,Coherence],
            ui: []
        }

        this.session.plugins.add(this.props.id, this.info.name, plugins)
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the applet with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        // APPLICATION LOGIC

        let responses = {
            coherence: (userData) => {
                userData.forEach(u => {
                    // console.log(u.coherence)
                })
            }, 

            spacebar: (userData) => {
                userData.forEach(u => {
                    console.log(u.spacebar?.value)
                })
            },
        }

        let shared = (userData) => {
            console.log(userData)
            let html = ``
            userData.forEach(u => {
                let userStyle = (u.spacebar?.value ? "color: red;" : "")
                html += `<p style="${userStyle}">${u.username}: ${u.coherence}</p>`
            })
            document.getElementById(`${this.props.id}-coherence`).innerHTML = html
        }

        let appletInfo = this.session.plugins.start(this.props.id, responses, shared)
        this.streams = appletInfo.streams

        // VISUALS
        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                <div>
                    <h1>Frontal Alpha Coherence</h1>
                    <p id="${props.id}-coherence"></p>
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.session.createIntro(this)
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
        this.session.plugins.stop(this.props.id)

        // Delete Applet HTML
        this.AppletHTML.deleteNode();
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }
} 
