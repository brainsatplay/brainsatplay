//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../algorithms/BiquadFilters'
import BCI2K from 'bci2k'

export class bci2000Plugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        console.log(BCI2K)
        this.device = new BCI2K.bciOperator(); //Invoke a device class here if needed
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
        //info.sps = 10
        //info.deviceType = ''

        // Setup atlas
        // if(pipeToAtlas === true) {
        //     let config = 'hegduino';
        //     this.atlas = new DataAtlas(
        //         location+":"+this.mode,
        //         {eegshared:{eegChannelTags:info.eegChannelTags, sps:this.info.sps}},
        //         config,true,true,
        //         info.analysis
        //         );

        //     this.info.deviceNum = this.atlas.data.heg.length-1;
        //     this.info.useAtlas = true;
            
        // } else if (typeof pipeToAtlas === 'object') {
        //     this.atlas = pipeToAtlas; //External atlas reference
        //     info.deviceNum = this.atlas.data.heg.length; 
        //     this.atlas.addHEGCoord(this.atlas.data.heg.length); 
        //     this.atlas.settings.heg = true;
        //     this.info.useAtlas = true;
        //     if(this.atlas.settings.analyzing === false && info.analysis.length > 0 ) {
        //         this.atlas.settings.analysis.push(...info.analysis);
        //         this.configureDefaultStreamTable();
        //         this.atlas.settings.analyzing = true;
        //         this.atlas.analyzer();
        //     }
        // }
    }

    connect = () => {
    
        this.device.connect('ws://localhost')
            .then(() => console.log("Connected to Operator layer through NodeJS server"))
            .catch(err => console.log(err))


       this.onconnect();
       this.setIndicator(true);

       //onconnected: this.atlas.settings.deviceConnected = true;
    }

    disconnect = () => {
        this.ondisconnect();
        this.setIndicator(false);

        //ondisconnected: this.atlas.settings.deviceConnected = false;
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode = document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            return `
            `;
        }

        let setup = () => {
           

        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
        
    }

}