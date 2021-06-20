import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as settingsFile from './settings'

import './Build/webbuild.wasm'
import './Build/webbuild.data'

import * as webconfig from './Build/buildconfig'
import * as webbuild from './Build/webbuild.loader'

//Example Applet for integrating with the UI Manager
export class UnityApplet {

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
            //Add whatever else
        };
	
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the applet with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:80%; width:80%;'>
			        <canvas id='${props.id}canvas' style='width:80%;height:80%;'>
			        </canvas>
			    </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.session.registerApp(this.props.id,this.info)
            this.session.startApp(this.props.id)
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

        let canvas = document.getElementById(this.props.id + "canvas");

        let onError = () => { };
        
        var gameInstance;

        //Add whatever else you need to initialize
        webbuild.createUnityInstance(canvas, webconfig.config, () =>
        { }).then((unityInstance) =>
        {
            gameInstance = unityInstance;
            animate();
        }).catch(onError);

        let animate = () => {
            // Get Frontal Alpha Coherence
            let coherence = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(), 'alpha1');
            gameInstance.SendMessage('System', 'UpdateData', coherence);

            // Continue update
            setTimeout(this.animation = window.requestAnimationFrame(animate), 1000 / 60); // Limit framerate to 60fps
        }
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        // Stop Animation
        if (this.animation) {
            window.cancelAnimationFrame(this.animation);
            this.animation = undefined;
        }

        this.AppletHTML.deleteNode();
        this.session.removeApp(this.props.id)
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
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

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------
    //
} 
