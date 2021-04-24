import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import { presets , appletSettings} from "../../appletList"

//Example Applet for integrating with the UI Manager
export class AppletBrowser {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
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
            <div id='${props.id}' style='
            height:100%; width:100%;
            overflow-y: scroll;
            padding: 50px;
            ' 
            >
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id);   
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

        

        // Applet Browser
        const container = document.getElementById(this.props.id)


        let appletStyle = `
            width: 200px; 
            cursor: pointer;
            transition: 0.5s;
            border-radius: 5px;
            margin: 25px;
            position: relative;  
            background: rgb(25,25,25);
            font-size: 80%;
            `
        
        let sectionContainer = `
            <div style='
            display: flex;
            flex-wrap: wrap; 
            align-items: stretch; 
            justify-content: center;'>
            `

        let presetSelections = []
        let presetHTML = ``

        presets.forEach(preset => {
                presetHTML += `
                <div id="${this.props.id}-${preset.value}" class='browser-card' style="${appletStyle};">
                    <img src="${preset.image}" style="width: 100%; aspect-ratio: 2 / 1;">
                    <div style="padding: 0px 25px 10px 25px;">
                    <h2 style="margin-bottom: 0px;">${preset.name}</h2>
                    <p style="font-size: 80%;margin-top: 5px;">${preset.type}</p>
                    <p style="font-size: 80%;margin-top: 5px;">${preset.description}</p>
                    </div>
                </div>`
                presetSelections.push(preset.value)
        })

        let generalHTML = ``
        let eegHTML = ``
        let hegHTML = ``

        appletSettings.forEach(settings => {
            if (settings.name != 'Applet Browser'){
                let type;
                if (settings.devices.length > 1){
                    type = 'All'
                } else if (settings.devices[0] == 'eeg'){
                    type = 'EEG'
                } else if (settings.devices[0] == 'heg'){
                    type = 'HEG'
                } else {
                    type = "Other"
                }
                let html = `
                <div id="${this.props.id}-${settings.name}" class='browser-card' style="${appletStyle};">
                    <img src="${settings.image}" style="width: 100%;">
                    <div style="padding: 0px 25px 10px 25px; position: relative;">
                        <h2 style="margin-bottom: 0px;">${settings.name}</h2>
                        <p style="font-size: 80%;margin-top: 5px;">${type}</p>
                        <p style="font-size: 80%;margin-top: 5px;">${settings.description}</p>
                    </div>
                </div>`
                if (settings.devices.length > 1){
                    generalHTML += html
                } else if (settings.devices[0] == 'eeg'){
                    eegHTML += html
                } else if (settings.devices[0] == 'heg'){
                    hegHTML += html
                }
            }
        })

        container.innerHTML += `
        <h1>Feedback Presets</h1>
        <hr>
        ${sectionContainer}
        ${presetHTML}
        </div>
        <h1>Applets</h1>
        <hr>
        ${sectionContainer}
        ${generalHTML}
        ${eegHTML}
        ${hegHTML}
        </div>
        `

        const appletCards = container.querySelectorAll('.browser-card')
        for (let div of appletCards){
            let choice = div.id.split('-')[1]
            if (presetSelections.includes(choice)){
                div.onclick = (e) => {
                    let selector = document.getElementById('preset-selector')
                    selector.value = choice
                    selector.onchange()
                }
            } else {
                div.onclick = (e) => {
                    let selector = document.getElementById('applet1')
                    selector.value = choice
                    window.history.pushState({additionalInformation: 'Updated URL from Applet Browser (applet)' },'',`${window.location.origin}/#${selector.value}`)
                    selector.onchange()
                }
                }
            }

        //Add whatever else you need to initialize
        this.responsive()
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let container = document.getElementById(this.props.id)
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

    //doSomething(){}

   
} 