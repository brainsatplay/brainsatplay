//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {blueberry} from './blueberry.js'
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/signal_processing/BiquadFilters'


export class BlueberryPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.info = {}

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    init = async (info,pipeToAtlas) => {

		this.info.sps = 32;
        this.info.deviceType = 'heg';

        let ondata = (data) => {
            data = data.fNIRS
            let red = data.L1
            let ir = this.atlas.mean([data.L2,data.L3])
            let ratio = red/ir
            let coord = this.atlas.data.heg[info.deviceNum];
            coord.count++;
            if(coord.count === 1) { coord.startTime = Date.now(); }
            coord.times.push(Date.now());
            
            coord.red.push(red);
            coord.ir.push(ir);
            coord.ratio.push(ratio);
            this.atlas.beatDetection(coord, this.info.sps);
        }


        this.device= new blueberry(ondata,

        // On Connection
        ()=>{
            this.setupAtlas(pipeToAtlas);
            if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }
            this.atlas.settings.deviceConnected = true;
            this.onconnect();
        },

        // On Disconnection
        ()=>{ this.atlas.settings.analyzing = false; this.atlas.settings.deviceConnected = false; this.ondisconnect();});
        
        
    }

    setupAtlas = (pipeToAtlas) => {

        this.filters.push(new BiquadChannelFilterer('red',100,false,1),new BiquadChannelFilterer('ir',100,false,1),new BiquadChannelFilterer('ratio',100,false,1),new BiquadChannelFilterer('ambient',100,false,1));
        this.filters.forEach((filter)=> {
            filter.useSMA4 = true;
            filter.useDCB = false;
        })

        if(pipeToAtlas === true) {
            let config = 'hegduino';
            this.atlas = new DataAtlas(
                location+":"+this.mode,
                {hegshared:{sps:this.info.sps}},
                config,
                );

                this.info.deviceNum = this.atlas.data.heg.length-1;
                this.info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            this.info.deviceNum = this.atlas.data.heg.length; 
            this.atlas.data.hegshared = {sps:info.sps};
            this.atlas.addHEGCoord(this.atlas.data.heg.length); 
            this.atlas.settings.heg = true;
            this.info.useAtlas = true;
        }
    }

    connect = async () => {
        this.device.connect();
    }

    disconnect = () => {
        if (this.ui) this.ui.deleteNode()
        this.device.disconnect();
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode=document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            return ``
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