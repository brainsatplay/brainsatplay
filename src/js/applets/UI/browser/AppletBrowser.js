import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import { presets , AppletInfo, getAppletSettings} from "../../appletList"
import * as settingsFile from './settings'

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
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
        };
        
        // Default Configuration Settings 
        this.appletToReplace = 0
        this.showPresets = true
        this.showApplets = true
        this.displayMode = 'default'
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
            padding: 50px
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

        

        // Style Configuration
        let appletStyle;
        let imgStyle = `width: 100%; aspect-ratio: 2 / 1; object-fit: cover;`;
        let infoStyle = `padding: 0px 25px 10px 25px;`;
        let appletHeaderStyle;
        if (this.displayMode === 'tight'){
            appletStyle = `
            min-width: 100px;
            width: 20%; 
            cursor: pointer;
            border-radius: 5px;
            position: relative;  
            font-size: 80%;
            flex-grow: 1;
            overflow: hidden;
            background: rgb(15,15,15);
            margin: 5px;
            transition: 0.5s;
            `

        } else {
        appletStyle = `
            min-width: 100px;
            width: 200px; 
            cursor: pointer;
            border-radius: 5px;
            position: relative;  
            font-size: 80%;
            flex-grow: 1;
            overflow: hidden;
            background: rgb(15,15,15);
            margin: 5px;
            transition: 0.5s;
            `
        }

        if (this.showPresets){
            appletHeaderStyle = `display: grid; grid-template-columns: repeat(2,1fr); padding-top: 50px;`
        } else {
            appletHeaderStyle = `display: grid; grid-template-columns: repeat(2,1fr);`
        }

        // Mouse Over Behavior

        let onMouseOver = `
            this.style.boxShadow = '0px 1px 3px rgba(0, 0, 0, 0.05) inset, 0px 0px 8px rgba(82, 168, 236, 0.6)';
        `

        let onMouseOut = `
            this.style.boxShadow = 'none';
        `

        // HTML Fragments
        let presetSelections = []
        let presetHTML = ''
        if (this.showPresets){
            presetHTML = `
            <h1>Feedback Presets</h1>
            <hr>
            <div style='
            display: flex;
            flex-wrap: wrap; 
            align-items: stretch; 
            justify-content: center;'>
            `

            if (this.showPresets){
                presets.forEach(preset => {
                        presetHTML += `
                        <div id="${this.props.id}-${preset.value}" class='browser-card' style="${appletStyle};" onMouseOver="${onMouseOver}" onMouseOut="${onMouseOut}">
                            <img src="${preset.image}" style="width: 100%; aspect-ratio: 2 / 1; object-fit: cover;">
                            <div style="padding: 0px 25px 10px 25px;">
                            <h2 style="margin-bottom: 0px;">${preset.name}</h2>
                            <p style="font-size: 80%;margin-top: 5px;">${preset.type}</p>
                            <p style="font-size: 80%;margin-top: 5px;">${preset.description}</p>
                            </div>
                        </div>`
                        presetSelections.push(preset.value)
                })
            }
            presetHTML += `</div>`
        }
        let generalHTML = ``
        // let eegHTML = ``
        // let hegHTML = ``

        var appletInfoArray = Object.keys(AppletInfo).map(function(key) {
        return [key, AppletInfo[key]];
        });

        appletInfoArray.sort(function(first, second) {
        let translate = (settings) => {
            if (settings.devices.length > 1){
                return 0 // all
            } else if (settings.devices[0] == 'eeg'){
                return 1 // eeg
            } else if (settings.devices[0] == 'heg'){
                return 2 // heg
            } else {
                return 3 // other
            }
        }
        let pos1 = translate(first[1])
        let pos2 = translate(second[1])
        return pos1 - pos2;
        });

        let appletSettingsArray = appletInfoArray.map(async (arr) => {
            return await getAppletSettings(arr[1].folderUrl)
        })
        Promise.all(appletSettingsArray).then((appletSettings) => {

            let categoryArray = []
            let deviceArray = []
            appletSettings.forEach(settings => {
                if (!['Applet Browser','Randomizer'].includes(settings.name)){
                    let type;
                    if (settings.devices.length > 1){
                        type = 'All'
                    } else {
                        type = settings.devices[0]
                    }

                    let categoryString = settings.categories.map(category => category[0].toUpperCase() + category.slice(1)).join(' + ')

                    let html = `
                    <div id="${this.props.id}-${settings.name}" class='browser-card' categories="${settings.categories}" devices="${settings.devices}" style="${appletStyle};" onMouseOver="${onMouseOver}" onMouseOut="${onMouseOut}">
                        <img src="${settings.image}" style="${imgStyle}">
                        <div style="${infoStyle}">
                            <h2 style="margin-bottom: 0px;">${settings.name}</h2>
                            <p style="font-size: 80%;margin-top: 5px;">${type} | ${categoryString}</p>
                            <p style="font-size: 80%;margin-top: 5px;">${settings.description}</p>
                        </div>
                    </div>`
                    generalHTML += html

                    categoryArray.push(...settings.categories)
                    deviceArray.push(...settings.devices)
                }
            })

            document.getElementById(this.props.id).innerHTML += `
            ${presetHTML}
            <div id="${this.props.id}-appletheader" style="${appletHeaderStyle}">
                <h1>Applets</h1>
                <div style="padding: 0px 25px;  width: 100%; display: flex; margin: auto;">
                    
                <div style="margin: 5px;">
                <p style="font-size: 80%; margin-bottom: 5px;">Device</p>
                    <select id="${this.props.id}-devices" style="max-height: 30px; width: 100%;">
                        <option value="all" selected>All</option>
                    </select>
                </div>
                <div style="margin: 5px;">
                    <p style="font-size: 80%; margin-bottom: 5px;"s>Category</p>
                    <select id="${this.props.id}-categories" style="max-height: 30px; width: 100%;">
                        <option value="all" selected>All</option>
                    </select>
                    </div>
                </div>
            </div>
            <hr>
            <br>
            <div id="${this.props.id}-appletsection" 
            style='
            display: flex;
            flex-wrap: wrap; 
            align-items: stretch; 
            justify-content: center;'>
                ${generalHTML}
            </div>
            `

            // Populate Category Selector
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
              }
              
            // usage example:
            let uniqueCategories = categoryArray.filter(onlyUnique);
            let categorySelector = document.getElementById(`${this.props.id}-categories`)
            uniqueCategories.forEach(category => {
                categorySelector.innerHTML += `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`
            })
            categorySelector.onchange = (e) => {
                this.filterApplets()
            }

            let uniqueDevices = deviceArray.filter(onlyUnique);
            let deviceSelector = document.getElementById(`${this.props.id}-devices`)
            uniqueDevices.forEach(device => {
                deviceSelector.innerHTML += `<option value="${device}">${device.charAt(0).toUpperCase() + device.slice(1)}</option>`
            })
            
            deviceSelector.onchange = (e) => {
                this.filterApplets()
            }


            // Declare OnClick Responses
            const appletCards = document.getElementById(this.props.id).querySelectorAll('.browser-card')
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
                        let selector = document.getElementById(`applet${this.appletToReplace+1}`)
                        selector.value = choice
                        window.history.pushState({additionalInformation: 'Updated URL from Applet Browser (applet)' },'',`${window.location.origin}/#${selector.value}`)
                        selector.onchange()
                    }
                    }
                }

            //Add whatever else you need to initialize
            this.responsive()
        })
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
            if (cmd.appletIdx != null) this.appletToReplace = cmd.appletIdx
            if (cmd.showPresets != null) this.showPresets = cmd.showPresets
            // if (cmd.showApplets != null) this.showApplets = cmd.showApplets
            if (cmd.displayMode != null) this.displayMode = cmd.displayMode

        });
    }

    filterApplets(){
        let divs = document.getElementById(`${this.props.id}-appletsection`).querySelectorAll('.browser-card')
        let selectors = document.getElementById(`${this.props.id}-appletheader`).querySelectorAll('select')

        let attributes = []
        let values = []
        for (let selector of selectors){
            attributes.push(selector.id.split('-')[1])
            values.push(selector.value)
        }

        for (let div of divs){
            let votes = 0;
            attributes.forEach((a,i) => {
                if (div.getAttribute(a).includes(values[i]) || values[i] ===  "all"){
                    votes++
                }
            })
            if (votes === attributes.length){
                div.style.display = "block"
            } else {
                div.style.display = "none"
            }
        }

    }
} 