import {brainsatplay} from '../../../brainsatplay'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'
import featureImg from '../../../../assets/features/placeholder.png'
import logo from '../../../../assets/logo_and_sub(v3).png'

import { applets } from './../../appletList'

export class RandomizerApplet {

    static name = "Randomizer"; 
    static devices = ['eeg','heg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "Try out a random applet!"
    static categories = ['framework']; //data,game,multiplayer,meditation,etc
    static image=featureImg

    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
        };

        this.applets = applets
        this.currentApplet = null
        this.animation = null
        this.mode = 'timer' // 'button', 'timer'
        this.timeLimit = 10; // s
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
                <div id='${props.id}-ui' style='position: absolute; top: 0; left: 0; height:100%; width:100%; z-index: 1; pointer-events:none;'>
                    <div id='${props.id}-mask' style="position:absolute; top: 0; left: 0; width: 100%; height: 100%; background: black; opacity: 0; pointer-events: none; display: flex; align-items: center; justify-content: center;">
                        <img src='${logo}' style="width: 50%;">
                    </div>
                </div>
                <div id='${props.id}-applet' style='position: absolute; top: 0; left: 0; height:100%; width:100%; z-index: 0'></div>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.ui = document.getElementById(`${props.id}-ui`)

            if (this.mode == 'button'){
                this.ui.innerHTML +=   `<button id='${props.id}-randomize' style="pointer-events:auto;position:absolute; top: 25px; right: 25px;">Randomize</button>`
                document.getElementById(`${props.id}-randomize`).onclick = () => {
                    this.setNewApplet()
                };   
            } else if (this.mode == 'timer'){
                this.ui.innerHTML += `<h2 id='${props.id}-countdown' style="pointer-events:auto;position:absolute; top: 25px; right: 25px; margin: 0px;">0:00</h2>`
                this.countdown = document.getElementById(`${props.id}-countdown`)
            }
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
    

        this.setNewApplet()

        this.animate = () => {
            if (this.currentApplet != null && this.mode == 'timer'){
                let timeLeft = this.timeLimit - (Date.now() - this.currentApplet.tInit)/1000
                if (this.currentApplet.tUp == false){
                    this.countdown.innerHTML = Math.max(0, timeLeft).toFixed(2)
                    if (timeLeft <= 0){
                        this.currentApplet.tUp = true
                        this.setNewApplet()
                    } 
                } else {
                    this.countdown.innerHTML = (0).toFixed(2)
                }
            }
            setTimeout(()=>{this.animation = requestAnimationFrame(this.animate)},1000/60);
        }

        this.animation = requestAnimationFrame(this.animate)
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        if (this.currentApplet != null) this.currentApplet.instance.deinit();
        cancelAnimationFrame(this.animation);
        this.AppletHTML.deleteNode();
        this.currentApplet = null
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if (this.currentApplet != null) this.currentApplet.instance.responsive();
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    setNewApplet = () => {

        let mask = document.getElementById(`${this.props.id}-mask`)
        // Transition
        mask.style.opacity = 1;
        mask.style.pointerEvents = 'none';
        let transitionLength = 500
        mask.style.transition = `opacity ${transitionLength/1000}s`;

        // Reset
        setTimeout(()=>{
            let applet = this.getNewApplet()
            if (this.currentApplet != null) this.currentApplet.instance.deinit()
            this.currentApplet = {
                tInit: Date.now(),
                instance: new applet(
                    document.getElementById(`${this.props.id}-applet`),
                    this.bci
                ),
                tUp: false
            }
            this.currentApplet.instance.init()
            this.currentApplet.instance.responsive();
        },transitionLength);

        // Display
        setTimeout(()=>{
            mask.style.opacity = 0;
            mask.style.auto = 'auto';
        },transitionLength+500);

    }

    getNewApplet = () => {
        let appletKeys = Array.from(this.applets.keys())
        let applet = this.applets.get(appletKeys[Math.floor(Math.random() * appletKeys.length)])
        // Check that the chosen applet is not prohibited, compatible with current devices, and not the same applet as last time
        let prohibitedApplets = ['Randomizer','Applet Browser', 'Sunrise'] // Sunrise takes too long to load
        let compatible = true
        let instance;
        if (this.currentApplet != null) instance = this.currentApplet.instance
        this.bci.devices.forEach((device) => {
            if (!applet.devices.includes(device.info.deviceType) && !applet.devices.includes(device.info.deviceName) && instance instanceof applet) compatible = false
        })
        if (prohibitedApplets.includes(applet.name) || !compatible) applet = this.getNewApplet()
        return applet
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 