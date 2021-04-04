//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../signal_analysis/BiquadFilters'
//import webgazer from 'webgazer'
let webgazer;

export class webgazerPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.info;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
       
    }

    init = (info,pipeToAtlas) => {
        info.deviceType = 'eyetracker';

        if(pipeToAtlas === true) {
            let config = 'eyetracker';
			
            this.atlas = new dataAtlas(
                location+":"+this.mode,
                {eegshared:{eegChannelTags:info.eegChannelTags, sps:info.sps}},
                config,true,true,
                info.analysis
                );

            info.deviceNum = this.atlas.data.heg.length-1;
            info.useAtlas = true;
            info.deviceNum = this.atlas.data.eyetracker.length-1;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            info.deviceNum = this.atlas.data.eyetracker.length; 
            this.atlas.addEyeTracker(this.atlas.data.eyetracker.length); 
            this.atlas.settings.eyetracker = true;
            info.useAtlas = true;
            if(this.atlas.settings.analyzing === false && info.analysis.length > 0 ) {
                this.atlas.settings.analysis.push(...info.analysis);
                this.configureDefaultStreamTable();
                this.atlas.settings.analyzing = true;
                this.atlas.analyzer();
            }
        }

        this.info = info;
    }

    connect = () => {
        
        webgazer.setGazeListener((data,elapsedTime) => {
            if(data == null) {
                return;
            }
            let x = data.x;
            let y = data.y;
            if(this.info.useAtlas === true) {
                let o = this.atlas.data.eyetracker[this.info.deviceNum];
                if(o.times.length === 0) { o.startTime = Date.now(); }
                o.times.push(Date.now());
                o.x.push(data.x);
                o.y.push(data.y);
                if(o.x.length > 10) { //10 sample moving average (to smooth things out)
                    o.smax.push(o.x.slice(o.x.length-10).reduce((a,b) => a+b)/10);
                    o.smay.push(o.y.slice(o.y.length-10).reduce((a,b) => a+b)/10);
                }
                else {
                    o.smax.push(o.x.slice(0).reduce((a,b) => a+b)/o.x.length);
                    o.smay.push(o.y.slice(0).reduce((a,b) => a+b)/o.y.length);
                }
            }

        }).begin();
        this.onconnect();

    }

    disconnect = () => {
        webgazer.end();
        this.ondisconnect();
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

}