//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {DataAtlas} from '../DataAtlas'
import {DOMFragment} from '../ui/DOMFragment'
import * as neosensory from 'neosensory'

export class buzzPlugin {
    constructor( mode, onconnect=()=>{}, ondisconnect=()=>{}) {
        this.mode = mode
        this.atlas = null;
        this.device = null;
        this.filters = [];
        this.ui = null;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }


    init = async (info,pipeToAtlas) => {
        info.deviceType = 'other';
        this.device = new neosensory.Buzz(
            (response) => {
                // if (response) console.log(response)
            })

        this._onConnected = () => {
            this.setupAtlas(info,pipeToAtlas);
        }
    }

    setupAtlas(info,pipeToAtlas){
        if(pipeToAtlas === true) {
            let config = 'neosensory_buzz';
            this.atlas = new DataAtlas(
                location+":" + this.mode,
                {},
                config,false,true,
                info.analysis
                );

            info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            info.useAtlas = true;
        }
        this.atlas.settings.deviceConnected = true; 
    }

    connect = async () => {
        await this.device.connect();
        this._onConnected();
        this.onconnect()
    }

    disconnect = () => {
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
            <div id='`+id+`buzzControls'>
                <button id='`+id+`request'>Request Dev Authorization</button>
                <button id='`+id+`accept'>Accept</button>
                <button id='`+id+`battery'>Battery</button>
                <button id='`+id+`info'>Info</button>
                <button id='`+id+`getLEDs'>Get LEDS</button>
                <button id='`+id+`setLEDs'>Set LEDS</button>
                <button id='`+id+`motorsStart'>Start Motors</button>
                <button id='`+id+`motorsVibrate'>Vibrate Motors</button>
                <input id='`+id+`buzzcmd' type='text' placeholder='device info'></input><button id='`+id+`sendcmd'>Send</button>
            </div>
            `;
        }

        let setup = () => {
         
            document.getElementById(id+'request').onclick = () => {
                this.device.requestAuthorization()
            }
            document.getElementById(id+'accept').onclick = () => {
                this.device.acceptTerms()
            }
            document.getElementById(id+'battery').onclick = () => {
                this.device.battery()
            }
            document.getElementById(id+'info').onclick = () => {
                this.device.info()
            }
            document.getElementById(id+'getLEDs').onclick = () => {
                this.device.getLEDs()
            }
            document.getElementById(id+'setLEDs').onclick = () => {
                this.device.setLEDs([[255,0,0],[0,255,0],[0,0,255]],[1,1,1])
            }
            document.getElementById(id+'motorsStart').onclick = () => {
                this.device.enableMotors()
            }
            document.getElementById(id+'motorsVibrate').onclick = () => {
                this.device.vibrateMotors([255,255,255,255])
            }
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
}