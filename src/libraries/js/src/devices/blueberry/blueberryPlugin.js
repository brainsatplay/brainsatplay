//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../ui/DOMFragment';
import {Blueberry} from './blueberry.js'


export class BlueberryPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

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
		info.sps = 32;
        info.deviceType = 'heg';

        let ondata = (data) => {
            // if(newline.indexOf("|") > -1) {
            //     let data = newline.split("|");
            //     //console.log(data);
            //     if(data.length > 3) {
            //         let coord = this.atlas.data.heg[info.deviceNum];
            //         coord.count++;
            //         if(coord.count === 1) { coord.startTime = Date.now(); }
            //         if(this.device.mode === 'ble' && this.device.interface.android === true) {
            //             coord.times.push(Date.now());
            //             coord.red.push(parseFloat(data[0]));
            //             coord.ir.push(parseFloat(data[1]));
            //             coord.ratio.push(parseFloat(data[2]));
            //             //ignore the rest for now
            //         } else { 
            //             if(coord.times.length === 0) {coord.times.push(Date.now()); this.refuS = parseFloat(data[0]);} //Microseconds = parseFloat(data[0]). We are using date.now() in ms to keep the UI usage normalized
            //             else {
            //                 let t = parseFloat(data[0]);
            //                 coord.times.push(Math.floor(coord.times[coord.times.length-1]+(t-this.refuS)*0.001))
            //                 this.refuS = t; //keep times synchronous
            //             }
            //             coord.red.push(parseFloat(data[1]));
            //             coord.ir.push(parseFloat(data[2]));
            //             coord.ratio.push(parseFloat(data[3]));
            //             coord.ambient.push(parseFloat(data[4]));
            //             coord.temp.push(parseFloat(data[5])); // temp is on new firmware
            //             //ignore the rest for now
            //         }

            //         //Simple beat detection. For breathing detection applying a ~3 second moving average and peak finding should work
            //         this.atlas.beatDetection(coord, info.sps);
            //     }
            // } else {
                console.log("BLUEBERRY: ", data); 
            // }
        }


        this.device= new blueberry('',ondata,

        // On Connection
        ()=>{
            this.setupAtlas(info,pipeToAtlas);
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

    setupAtlas = (info,pipeToAtlas) => {
        if(pipeToAtlas === true) {
            let config = 'heg';
            this.atlas = new DataAtlas(
                location+":"+this.mode,
                {hegshared:{sps:info.sps}},
                config,false,true,
                info.analysis
                );

            info.deviceNum = this.atlas.data.heg.length-1;
            info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            info.deviceNum = this.atlas.data.heg.length; 
            this.atlas.data.hegshared = {sps:info.sps};
            this.atlas.addHEGCoord(this.atlas.data.heg.length); 
            this.atlas.settings.heg = true;
            info.useAtlas = true;
            if(info.analysis.length > 0 ) {
                this.atlas.settings.analysis.push(...info.analysis);
                if(!this.atlas.settings.analyzing) { 
                    this.atlas.settings.analyzing = true;
                    this.atlas.analyzer();
                }
            }
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

    addControls = (parentNode=document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            let t = ``
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