import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import {presetManifest} from '../../../platform/presetManifest'
import {appletManifest} from '../../../platform/appletManifest'
import placeholderImage from '../../../platform/assets/features/placeholder.png'
import {getAppletSettings} from "../../../platform/js/general/importUtils"
import * as settingsFile from './settings'

import {Train} from '../../../libraries/js/src/plugins/utilities/Train'
import {UI} from '../../../libraries/js/src/plugins/outputs/UI'
import {Application} from '../../../libraries/js/src/Application'

//Example Applet for integrating with the UI Manager
export class AppletBrowser {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID,
            trainingModules: {}
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
            <div id='${this.props.id}' class="brainsatplay-browser" >
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
        let mainContainer = document.getElementById(this.props.id)
        let presetSelections = []
        let presetEl = document.createElement('div')
        presetEl.classList.add('preset-container')
        mainContainer.insertAdjacentElement('beforeend', presetEl)


        // Training Prompts
        let trainingHeader = document.createElement('div')
        trainingHeader.innerHTML = `
        <div id="${this.props.id}-trainingheader" class="browser-header">
            <h1>Training</h1>
        </div>
        `
        mainContainer.insertAdjacentElement('beforeend', trainingHeader)

        let trainingContainer = document.createElement('div')
        trainingContainer.id = `${this.props.id}-appletsection`
        trainingContainer.classList.add(`applet-container`)

        mainContainer.insertAdjacentElement('beforeend', trainingContainer)

        let trainingModes = ['Blink', 'Motor Imagery', 'SSVEP', 'P300']

        let settings = {
            graph: {
                nodes: [],
                edges: []
            }
        }

        // Training Selection
        trainingModes.forEach((mode,i) => {
            settings.graph.nodes.push({id: mode, class: Train, params: {mode}})
            settings.graph.nodes.push({id: `${mode}ui`, class: UI, params: {style: `flex: 47%;`, parentNode:trainingContainer}})
            settings.graph.edges.push({source: `${mode}:ui`, target: `${mode}ui:add`})
        })

        this.props.trainingModule =  new Application(settings,trainingContainer,this.session)
        this.props.trainingModule.init()
        trainingContainer.style.padding = 0


        // HTML Fragments

        if (this.showPresets){

            if (this.showPresets){
                presetManifest.forEach(preset => {
                    presetEl.insertAdjacentHTML('beforeend',`
                        <div id="${this.props.id}-${preset.value}" class='browser-card preset'>
                            <div class="info">
                            <div>
                                <h2 style="margin-bottom: 5px;">${preset.name}</h2>
                                <p style="font-size: 80%; margin: 15px 0px 20px 0px;">${preset.description}</p>
                            </div>
                            <span style="position: absolute; bottom: 10px; right: 10px; font-size: 60%;margin-top: 5px;">Tags: ${preset.type}</span>
                            </div>
                            <img src="${preset.image}">
                        </div>`)
                        presetSelections.push(preset.value)
                })
            }
        }
        let generalHTML = ``
        // let eegHTML = ``
        // let hegHTML = ``

        var appletInfoArray = Object.keys(appletManifest).map(function(key) {
        return [key, appletManifest[key]];
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

            let platformLocation = (location.origin.includes('app.brainsatplay.com') ? 'production' : 'development')

            appletSettings.forEach(async settings => {
                if (settings.display != null && (settings.display.development === false || settings.display[platformLocation] === false)){}
                else {
                    let type;
                    if (settings.devices.length > 1){
                        type = 'All'
                    } else {
                        type = settings.devices[0]
                    }

                    let categoryString = settings.categories.map(category => category[0].toUpperCase() + category.slice(1)).join(', ')

                    let author = settings.author
                    if (['Garrett Flynn', 'Joshua Brewster', 'Samir Ghosh'].includes(author)) author = 'Brains@Play'

                    let img = settings.image ?? placeholderImage
                    let html = `
                    <div id="${this.props.id}-${settings.name}" class='browser-card applet' categories="${settings.categories}" devices="${settings.devices}">
                        <img src="${img}">
                        <div class='info'>
                            <h2 style="margin-bottom: 5px;">${settings.name}</h2>
                            <p style="font-size: 80%; margin: 0px;">By ${author}</p>
                            <p style="font-size: 80%; margin: 15px 0px 20px 0px">${settings.description}</p>
                            <span style="position: absolute; bottom: 10px; right: 10px; font-size: 60%;margin-top: 5px;">Tags: ${categoryString}, ${type}</span>
                        </div>
                    </div>`
                    generalHTML += html

                    categoryArray.push(...settings.categories)
                    deviceArray.push(...settings.devices)
                }
            })

            mainContainer.insertAdjacentHTML('beforeend', 
            `
            <div id="${this.props.id}-appletheader" class="browser-header">
                <h1>App Library</h1>
                <div style="padding: 0px 25px;  width: 100%; display: flex; margin: auto;">
                    
                <div style="margin: 5px; flex-grow: 1;">
                <p style="font-size: 80%; margin-bottom: 5px;">Device</p>
                    <select id="${this.props.id}-devices" style="max-height: 30px; width: 100%;">
                        <option value="all" selected>All</option>
                    </select>
                </div>
                <div style="margin: 5px; flex-grow: 1;"">
                    <p style="font-size: 80%; margin-bottom: 5px;">Category</p>
                    <select id="${this.props.id}-categories" style="max-height: 30px; width: 100%;">
                        <option value="all" selected>All</option>
                    </select>
                    </div>
                </div>
            </div>
            <div id="${this.props.id}-appletsection" class="applet-container">
                ${generalHTML}
            </div>
            `)

            // Populate Category Selector
            function onlyUnique(value, index, self) {
                return self.indexOf(value) == index;
              }
              
            // usage example:
            categoryArray = categoryArray.map(c => c.charAt(0).toUpperCase() + c.slice(1))
            let uniqueCategories = categoryArray.filter(onlyUnique);
            let categorySelector = document.getElementById(`${this.props.id}-categories`)
            uniqueCategories.forEach(category => {
                categorySelector.innerHTML += `<option value="${category}">${category}</option>`
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
                        let selector = document.getElementById(`applet${this.appletToReplace}`)
                        selector.value = choice
                        window.history.pushState({additionalInformation: 'Updated URL from Applet Browser (applet)' },'',`${window.location.origin}/#${choice}`)
                        selector.onchange()
                    }
                    }
                }

            //Add whatever else you need to initialize
            this.responsive()
        })
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
        this.AppletHTML.deleteNode();
        this.props.trainingModule.deinit()
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
                if (div.getAttribute(a).toLowerCase().includes(values[i].toLowerCase()) || values[i].toLowerCase() ===  "all"){
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
