//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {DataAtlas} from '../../DataAtlas'
import {DOMFragment} from '../../ui/DOMFragment'
import * as neosensory from './Buzz'
// import * as neosensory from 'neosensory'

export class buzzPlugin {
    constructor( mode, onconnect=()=>{}, ondisconnect=()=>{}) {
        this.mode = mode
        this.atlas = null;
        this.device = null;
        this.filters = [];
        this.ui = null;
        this.info = {}

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

    }


    init = async (info,pipeToAtlas) => {
        this.info.deviceType = 'other';
            this.device = new neosensory.Buzz(
                (res) => {
                    if (res) {
                        if (res.command.includes('auth as developer')){
                            let display = document.getElementById(`neosensory-termsDisplay`)
                            if (display) display.innerHTML = `To use your Neosensory Buzz on The Brains@Play Platform, please agree to Neosensory Inc's Developer Terms and Conditions, which can be viewed at <a href='https://neosensory.com/legal/dev-terms-service'>https://neosensory.com/legal/dev-terms-service</a>`
                        }
                    }
                })

            this._onConnected = () => {
                this.setupAtlas(this.info,pipeToAtlas);
            }
    }

    setupAtlas(info,pipeToAtlas){
        if(pipeToAtlas === true) {
            let config = 'neosensory_buzz';
            this.atlas = new DataAtlas(
                location+":" + this.mode,
                {},
                config
                );

            this.info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            this.info.useAtlas = true;
        }
        this.atlas.settings.deviceConnected = true; 
    }

    connect = () => {
        return new Promise(async (resolve, reject) => {
            let device = await this.device.connect();
            if (device){
                let res = await this.agreeToTerms()
                if (res) {
                    this._onConnected();
                    this.onconnect()
                    resolve(true)
                } else {
                    this.device.disconnect();
                    reject('Did not agree to Neosensory Developer Terms.')
                }
            } else {
                reject('Device failed to connect.')
            }
        })
    }

    disconnect = () => {
        if (this.ui != null) this.ui.deleteNode()
        this.device.disconnect();
        this.ondisconnect();
        this.atlas.settings.deviceConnected = false; 
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}


    addControls = (parentNode = document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            return `
            <br>
            <div id='`+id+`buzzControls'>
                <h3>Control Panel</h3>
                <hr>
                <div style="display: flex; flex-wrap: wrap;">
                    <input id='`+id+`buzzcmd' type='text' placeholder='device info'></input><button id='`+id+`sendcmd'>Send</button>
                </div>
            </div>
            `;
        }

        let setup = () => {
            document.getElementById(id+'sendcmd').onclick = () => {
                this.device.sendCommand(document.getElementById(id+'buzzcmd').value);
            }
        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
    }

 
    agreeToTerms = () => {
        return new Promise(async (resolve, reject) => {

        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            return `
            <div id='`+id+`buzzTerms' style="position: absolute; width: 100vw; height: 100vh; z-index: 10000; padding: 50px; background: rgba(0,0,0,0.7)">
                <h3>Agree To Terms</h3>
                <hr>
                <div id='neosensory-termsDisplay' style="padding: 25px;"></div>
                <div style="display: flex; flex-wrap: wrap;">
                    <button id='`+id+`accept' class="brainsatplay-default-button">Accept</button>
                    <button id='`+id+`deny' class="brainsatplay-default-button">Deny</button>
                </div>
            </div>
            `;
        }

        let setup = () => {
            this.device.requestAuthorization()
            document.getElementById(id+'accept').onclick = () => {
                this.device.acceptTerms()
                this.terms.deleteNode()
                resolve(true)
            }
            document.getElementById(id+'deny').onclick = () => {
                this.terms.deleteNode()
                resolve(false)
            }
        }
        
        this.terms = new DOMFragment(
            template,
            document.body,
            undefined,
            setup
        )
    })
    }
}