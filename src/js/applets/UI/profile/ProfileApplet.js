import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import * as settingsFile from './settings'

export class ProfileApplet {
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
        };

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:100%; width:100%; position: relative;'>
                <section id="${props.id}-error-screen" style="position:absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 50px; background: black; opacity: 1; transition: opacity 1s;">
                </section>
                <section id='${props.id}-profile' style="padding: 50px; width: 100%; height: 100%; box-sizing: border-box; oveflow: scroll;">
                    <img id="${props.id}-picture">
                    <h1 id="${props.id}-name"></h1>
                    <div style='font-size: 80%;'>
                        <p>ID: <span id="${props.id}-customData-userId"></span></p>
                        <p>Email: <span id="${props.id}-customData-email"></span></p>
                    </div>
                </section>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.updateProfileInfo()
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
        if (this.currentApplet != null) this.currentApplet.instance.deinit();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.toggleErrorScreen()
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    toggleErrorScreen(msg='<h1>Please log in to view your profile.</h1>') {
        let errorScreen = document.getElementById(`${this.props.id}-error-screen`)
        if (this.session.info.googleAuth != null) {
            errorScreen.style.opacity = 0;
            errorScreen.style.pointerEvents = 'none';

        }
        else {
            errorScreen.style.opacity = 1;
            errorScreen.style.pointerEvents = 'auto';
            errorScreen.innerHTML = msg;
        }
    }

    updateProfileInfo(){
        if (this.session.info.googleAuth != null){
            document.getElementById(`${this.props.id}-error-screen`).style.opacity = 0;
            document.getElementById(`${this.props.id}-picture`).src = this.session.info.googleAuth._profile.data.pictureUrl
            document.getElementById(`${this.props.id}-name`).innerHTML = this.session.info.googleAuth._profile.data.name
            this.session.info.googleAuth.refreshCustomData().then((data) => {
                console.log(data)
                for (const [key, value] of Object.entries(data)) {
                    if (!['picture', 'firstName', 'lastName', '_id'].includes(key)){
                        document.getElementById(`${this.props.id}-customData-${key}`).innerHTML = value;         
                    }
                }
            })
        } else {
            document.getElementById(`${this.props.id}-error-screen`).style.opacity = 1;
        }
    }
} 