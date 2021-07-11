import { Session } from '../Session'
import { DOMFragment } from './DOMFragment'

import { Train } from '../plugins/utilities/Train'
import { UI } from '../plugins/outputs/UI'
import { Application } from '../Application'

import {createCards} from './browserUtils.js'

//Example Applet for integrating with the UI Manager
export class AppletBrowser {

    constructor(
        parent = document.body,
        bci = new Session(),
        settings = [{
            hide: [],
            applets: [],
            presets: []
        }],
        info = {}
    ) {

        //-------Keep these------- 
        this.session = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = info
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random() * 1000000)), //Keep random ID,
            trainingModules: {},
            applets: [],
            presets: []
        };


        // Default Configuration Settings 
        // this.appletToReplace = 0
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
        let HTMLtemplate = (props = this.props) => {
            return `
            <div id='${this.props.id}' class="brainsatplay-browser" >
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props = this.props) => {

            if (this.settings.length > 0) { this.configure(this.settings); } //you can give the app initialization settings if you want via an array.

            this.props.container = document.getElementById(this.props.id)

            if (this.showPresets) {
                this._createFeature()
            }

            this._createTraining()

            this._createLibrary()
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );
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

    configure(settings = []) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
            
        settings.forEach((cmd, i) => {
            if (cmd.appletIdx != null) this.appletToReplace = cmd.appletIdx
            if (cmd.showPresets != null) this.showPresets = cmd.showPresets
            if (cmd.showApplets != null) this.showApplets = cmd.showApplets 
            if (cmd.displayMode != null) this.displayMode = cmd.displayMode

            if (cmd.applets != null) this.props.applets = cmd.applets
            if (cmd.presets != null) this.props.presets = cmd.presets
        });
    }

    _createFeature = () => {
        let presetEl = document.createElement('div')
        presetEl.classList.add('preset-container')
        this.props.container.insertAdjacentElement('beforeend', presetEl)
        this.props.presets.forEach(preset => {

            let presetCard = document.createElement('div')
            presetCard.classList.add(`browser-card`)
            presetCard.classList.add(`preset`)
            presetCard.id = `${this.props.id}-${preset.value}`
            presetCard.innerHTML = `<div class="info">
            <div>
                <h2 style="margin-bottom: 5px;">${preset.name}</h2>
                <p style="font-size: 80%; margin: 15px 0px 20px 0px;">${preset.description}</p>
            </div>
            <span style="position: absolute; bottom: 10px; right: 10px; font-size: 60%;margin-top: 5px;">Tags: ${preset.type}</span>
            </div>
            <img src="${preset.image}">`

            presetEl.insertAdjacentElement('beforeend', presetCard)
            presetCard.onclick = (e) => {
                let selector = document.getElementById('preset-selector')
                selector.value = preset.value
                selector.onchange()
            }
        })

        return
    }

    _createTraining = () => {
        // Training Prompts
        let trainingHeader = document.createElement('div')
        trainingHeader.innerHTML = `
        <div id="${this.props.id}-trainingheader" class="browser-header">
            <h1>Training</h1>
        </div>
        `
        this.props.container.insertAdjacentElement('beforeend', trainingHeader)

        let trainingContainer = document.createElement('div')
        trainingContainer.id = `${this.props.id}-trainingsection`
        trainingContainer.classList.add(`applet-container`)

        this.props.container.insertAdjacentElement('beforeend', trainingContainer)

        let trainingModes = [
            'Blink', 
            'Motor Imagery', 
            // 'SSVEP', 
            // 'P300'
        ]

        let settings = {
            graph: {
                nodes: [],
                edges: []
            }
        }

        // Training Selection
        trainingModes.forEach((mode, i) => {
            settings.graph.nodes.push({ id: mode, class: Train, params: { mode , applets: this.props.applets} })
            settings.graph.nodes.push({ id: `${mode}ui`, class: UI, params: { style: `div {flex-grow: 1;}`, parentNode: trainingContainer } })
            settings.graph.edges.push({ source: `${mode}:ui`, target: `${mode}ui:add` })
        })

        this.props.trainingModule = new Application(settings, trainingContainer, this.session)
        this.props.trainingModule.init()
        trainingContainer.style.padding = 0
    }

    _createLibrary = async () => {
        let filter
        let appletInfo = await createCards(this.props.applets, filter)

        this.props.container.insertAdjacentHTML('beforeend',
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
        <div id="${this.props.id}-appletsection" class="applet-container"></div>
        `)

        let appletSection = document.getElementById(`${this.props.id}-appletsection`)

        let categoryArray = []
        let deviceArray = []
        appletInfo.forEach(o => {
            appletSection.insertAdjacentElement('beforeend', o.element)
            let categories = o.element.getAttribute('categories')
            categoryArray.push(...categories.split(','))
            let devices = o.element.getAttribute('devices')
            deviceArray.push(...devices.split(','))
        })

        // Category Filter
        function onlyUnique(value, index, self) {
            return self.indexOf(value) == index;
        }

        categoryArray = categoryArray.map(c => c.charAt(0).toUpperCase() + c.slice(1))
        let uniqueCategories = categoryArray.filter(onlyUnique);
        let categorySelector = document.getElementById(`${this.props.id}-categories`)
        uniqueCategories.forEach(category => {
            categorySelector.innerHTML += `<option value="${category}">${category}</option>`
        })
        categorySelector.onchange = (e) => {
            this.filterApplets()
        }

        // Device Filter
        let uniqueDevices = deviceArray.filter(onlyUnique);
        let deviceSelector = document.getElementById(`${this.props.id}-devices`)
        uniqueDevices.forEach(device => {
            deviceSelector.innerHTML += `<option value="${device}">${device.charAt(0).toUpperCase() + device.slice(1)}</option>`
        })

        deviceSelector.onchange = (e) => {
            this.filterApplets()
        }

        //Add whatever else you need to initialize
        this.responsive()
    }


    filterApplets() {
        let divs = document.getElementById(`${this.props.id}-appletsection`).querySelectorAll('.browser-card')
        let selectors = document.getElementById(`${this.props.id}-appletheader`).querySelectorAll('select')

        let attributes = []
        let values = []
        for (let selector of selectors) {
            attributes.push(selector.id.split('-')[1])
            values.push(selector.value)
        }

        for (let div of divs) {
            let votes = 0;
            attributes.forEach((a, i) => {
                if (div.getAttribute(a).toLowerCase().includes(values[i].toLowerCase()) || values[i].toLowerCase() === "all") {
                    votes++
                }
            })
            if (votes === attributes.length) {
                div.style.display = "block"
            } else {
                div.style.display = "none"
            }
        }

    }
} 