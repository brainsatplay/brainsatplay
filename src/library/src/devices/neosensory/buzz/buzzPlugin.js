//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {DataAtlas} from '../../../DataAtlas'
import {Buzz} from './Buzz'
import {DOMFragment} from '../../../ui/DOMFragment'

export class buzzPlugin {
    constructor( mode, onconnect=()=>{}, ondisconnect=()=>{}) {
        this.mode = mode
        this.atlas = null;
        this.device = null;
        this.filters = [];
        this.ui = null;

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
        info.deviceType = 'other';
        console.log(this)
        this.device = new Buzz(
            (v) => {console.log(v)},
            ()=>{ this.atlas.settings.deviceConnected = true; this.onconnect();},
            ()=>{ this.atlas.settings.deviceConnected = false; this.ondisconnect();}
            )

            if(pipeToAtlas === true) {
                let config = 'neosensory_buzz';
                this.atlas = new DataAtlas(
                    location+":" + this.mode,
                    {},
                    config,false,true,
                    info.analysis
                    );
    
                info.deviceNum = this.atlas.data.heg.length-1;
                info.useAtlas = true;
                
            } else if (typeof pipeToAtlas === 'object') {
                this.atlas = pipeToAtlas; //External atlas reference
                info.deviceNum = this.atlas.data.heg.length; 
                info.useAtlas = true;
            }
    }

    connect = () => {
        this.device.connect();
        this.setIndicator(true)
    }

    disconnect = () => {
        this.device.disconnect();
        this.setIndicator(false)

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
            </div>
            `;
        }

        let setup = () => {
         
            document.getElementById(id+'request').onclick = () => {
                this.device.requestDeveloperAuthorization()
            }
            document.getElementById(id+'accept').onclick = () => {
                this.device.acceptDeveloperTerms()
            }
            document.getElementById(id+'battery').onclick = () => {
                this.device.battery()
            }
            document.getElementById(id+'info').onclick = () => {
                this.device.info()
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