import logo from '../../../platform/assets/logo_and_sub(v3).png'
import {appletManifest} from '../../../platform/appletManifest'
import {Application} from '../../../libraries/js/src/Application'

import { getApplet, getAppletSettings} from "../../../platform/js/general/importUtils"


class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            currentApplet: null,
            animation: null,
            mode: 'timer', // or button
            ui: null,
            countdown: null,
        }

        // Port Definition
        this.ports = {
            default: {
                defaults: {
                    input: [{username: 'Username', data: 'Value', meta: {label: 'Waiting for Data'}}]
                }
            }
        }

        // Operator Configuration 
        this.paramOptions = {
            timeLimit: {
                default: 10,
                options: null,
                min: 0,
                max: 25,
                step: 0.1
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='height:100%; width:100%; position: relative;'>
                <div id='${this.props.id}-ui' style='position: absolute; top: 0; left: 0; height:100%; width:100%; z-index: 1; pointer-events:none;'>
                    <div id='${this.props.id}-mask' style="position:absolute; top: 0; left: 0; width: 100%; height: 100%; background: black; opacity: 0; pointer-events: none; display: flex; align-items: center; justify-content: center;">
                        <img src='${logo}' style="width: 50%;">
                    </div>
                </div>
                <div id='${this.props.id}-applet' style='position: absolute; top: 0; left: 0; height:100%; width:100%; z-index: 0'></div>
            </div>`
        }


        let setupHTML = (app) => {

            this.props.ui = document.getElementById(`${this.props.id}-ui`)

            if (this.props.mode == 'button'){
                this.props.ui.innerHTML +=   `<button id='${this.props.id}-randomize' style="pointer-events:auto;position:absolute; top: 25px; right: 25px;">Randomize</button>`
                document.getElementById(`${props.id}-randomize`).onclick = () => {
                    this._setNewApplet()
                };   
            } else if (this.props.mode == 'timer'){
                this.props.ui.innerHTML += `<h2 id='${this.props.id}-countdown' style="pointer-events:auto;position:absolute; top: 25px; right: 25px; margin: 0px;">0:00</h2>`
                this.props.countdown = document.getElementById(`${this.props.id}-countdown`)
            }

            this._setNewApplet()

            this._animate = () => {
                if (this.props.currentApplet != null && this.props.mode == 'timer'){
                    let timeLeft = this.params.timeLimit - (Date.now() - this.props.currentApplet.tInit)/1000
                    if (this.props.currentApplet.tUp == false){
                        this.props.countdown.innerHTML = Math.max(0, timeLeft).toFixed(2)
                        if (timeLeft <= 0){
                            this.props.currentApplet.tUp = true
                            this._setNewApplet()
                        } 
                    } else {
                        this.props.countdown.innerHTML = (0).toFixed(2)
                    }
                }
                this.props.animation = requestAnimationFrame(this._animate)
            }
    
            this._animate()

        }

        return {HTMLtemplate, setupHTML}
    }

    deinit = () => {

        if (this.props.urrentApplet != null) this.props.currentApplet.instance.deinit();
        cancelAnimationFrame(this.props.animation);
    }

    // Ports

    default = (userData) => {
        return userData
    }

    // Helper Functions

    _createInstance = (appletCls, info=undefined) => {
        let parentNode = document.getElementById(`${this.props.id}-applet`)
        if (appletCls === Application){
            return new Application(info, parentNode, this.session, [])
        } else {
            return new appletCls(parentNode, this.session, [])
        }
    }

    _setNewApplet = () => {

        let mask = document.getElementById(`${this.props.id}-mask`)
        // Transition
        mask.style.opacity = 1;
        mask.style.pointerEvents = 'none';
        let transitionLength = 500
        mask.style.transition = `opacity ${transitionLength/1000}s`;

        // Reset
        setTimeout(async ()=>{
            let [applet,settings] = await this._getNewApplet()
            if (this.props.currentApplet != null) this.props.currentApplet.instance.deinit()
            this.props.currentApplet = {
                tInit: Date.now(),
                instance: this._createInstance(applet, settings),
                tUp: false
            }
            this.props.currentApplet.instance.init()
            this.props.currentApplet.instance.responsive();
        },transitionLength);

        // Display
        setTimeout(()=>{
            mask.style.opacity = 0;
            mask.style.auto = 'auto';
        },transitionLength+500);

    }

    _getNewApplet = async () => {
        let appletKeys = Object.keys(appletManifest)
        let settings = await getAppletSettings(appletManifest[appletKeys[Math.floor(Math.random() * appletKeys.length)]].folderUrl)
        // Check that the chosen applet is not prohibited, compatible with current devices, and not the same applet as last time
        let prohibitedApplets = ['One Bit Bonanza','Applet Browser', 'Sunrise'] // Sunrise takes too long to load
        let compatible = true
        let instance;
        if (this.props.currentApplet != null) instance = this.props.currentApplet.instance
        this.session.deviceStreams.forEach((device) => {
            if (!settings.devices.includes(device.info.deviceType) && !settings.devices.includes(device.info.deviceName) && instance instanceof applet) compatible = false
        })
        let applet;
        if (prohibitedApplets.includes(settings.name) || !compatible) applet = await this._getNewApplet()
        else applet = await getApplet(settings)

        return [applet,settings]
    }
}

export {UI}