//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../signal_analysis/BiquadFilters'


export class devicePlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
       
    }

    init = (info,pipeToAtlas) => {
        //info.sps = 10
        //info.deviceType = ''

        // Setup atlas
        // if(pipeToAtlas === true) {
        //     let config = 'hegduino';
        //     this.atlas = new dataAtlas(
        //         location+":"+this.mode,
        //         {eegshared:{eegChannelTags:this.info.eegChannelTags, sps:this.info.sps}},
        //         config,true,true,
        //         info.analysis
        //         );

        //     this.info.deviceNum = this.atlas.data.heg.length-1;
        //     this.info.useAtlas = true;
            
        // } else if (typeof pipeToAtlas === 'object') {
        //     this.atlas = pipeToAtlas; //External atlas reference
        //     info.info.deviceNum = this.atlas.data.heg.length; 
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

        this.onconnect();
    }

    disconnect = () => {

        this.ondisconnect();
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

}