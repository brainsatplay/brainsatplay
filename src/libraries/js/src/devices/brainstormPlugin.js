//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../ui/DOMFragment';
import {DataAtlas} from '../DataAtlas'
import {BiquadChannelFilterer} from '../algorithms/BiquadFilters'

export class brainstormPlugin {
    constructor(mode, metadata={}, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;
        this.session = metadata.session;
        this.subscription;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
        this.setIndicator = (on=true) => {
            if (on){
                document.getElementById(`brainsatplay-${this.mode}-indicator`).style.background = 'lime';
                document.getElementById(`brainsatplay-${this.mode}-indicator`).style.border = 'none';
            } else {
                document.getElementById(`brainsatplay-${this.mode}-indicator`).style.background = 'transparent';
                document.getElementById(`brainsatplay-${this.mode}-indicator`).style.border = '1px solid white';
            }
        }
    }

    init = (info,pipeToAtlas) => {

        let onAuth = () => {this.session.createBrainstormBrowser((username)=>{
            this.subscription = username
        })}

        if (!this.session.info.auth.authenticated){
            this.session.promptLogin(onAuth)
         } else {
            onAuth()
         }
    }

    connect = () => {
       this.onconnect();
       this.setIndicator(true);
       //onconnected: this.atlas.settings.deviceConnected = true;
    }

    disconnect = () => {
        this.ondisconnect();
        this.session.unsubscribeFromUser(this.subscription)
        this.setIndicator(false);

        //ondisconnected: this.atlas.settings.deviceConnected = false;
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode = document.body) => {
        // this.uiid = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        // let template = () => {
        //     return `
        //     `;
        // }

        // let setup = () => {
           

        // }

        // this.ui = new DOMFragment(
        //     template,
        //     parentNode,
        //     undefined,
        //     setup
        // )
    }
}