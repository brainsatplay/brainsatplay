//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../signal_analysis/BiquadFilters'
import {DataAtlas} from '../DataAtlas'
import {MuseClient} from 'muse-js'
import { DOMFragment } from '../../frontend/utils/DOMFragment';
import { TimeSeries } from 'smoothie';

export class musePlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.info;

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
        info.sps = 256;
        info.deviceType = 'eeg';
        info.eegChannelTags = [
            {ch: 0, tag: "TP9", analyze:true},
            {ch: 1, tag: "AF7", analyze:true},
            {ch: 2, tag: "AF8", analyze:true},
            {ch: 3, tag: "TP10", analyze:true}
        ]; // {ch: 4, tag: "other", analyze: false}
        this.device = new MuseClient();

        if(info.useFilters === true) {
            info.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,1));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,1)); 
                }
                //this.filters[this.filters.length-1].useBp1 = true;
            });
        }

        if(pipeToAtlas === true) { //New Atlas
			let config = 'muse';
            this.atlas = new DataAtlas(
				location+":"+this.mode,
				{eegshared:{eegChannelTags:info.eegChannelTags, sps:info.sps}},
				config,true,true,
				info.analysis
				);
			info.useAtlas = true;
		} else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
			this.atlas = pipeToAtlas; //External atlas reference
            this.atlas.data.eegshared.eegChannelTags = info.eegChannelTags;
            this.atlas.data.eegshared.sps = info.sps;
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,info.sps*0.5);
			this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
			this.atlas.data.eeg = this.atlas.genMuseAtlas(); 
            this.atlas.data.coherence = this.atlas.genCoherenceMap(info.eegChannelTags);
            this.atlas.settings.coherence = true;
            this.atlas.settings.eeg = true;
            info.useAtlas = true;
			if(info.analysis.length > 0 ) {
				this.atlas.settings.analysis.push(...info.analysis);
                if(!this.atlas.settings.analyzing) { 
                    this.atlas.settings.analyzing = true;
                    this.atlas.analyzer();
                }
			}
		}

        
        this.info = info;
    }

    connect = async () => {
        //connect muse and begin streaming
        await this.device.connect();
        await this.device.start();
        this.device.eegReadings.subscribe(o => {
            if(this.info.useAtlas) {
                let time = Array(o.samples.length).fill(o.timestamp);
                time = time.map((t,i) => {return t-(1-(this.info.sps/(time.length))*i/10)})	
                let coord = this.atlas.getEEGDataByChannel(o.electrode);
                coord.times.push(...time);
                coord.raw.push(...o.samples);
                coord.count += o.samples.length;
                if(this.info.useFilters === true) {                
                    let latestFiltered = new Array(o.samples.length).fill(0);
                    if(this.filters[o.electrode] !== undefined) {
                        o.samples.forEach((sample,k) => { 
                            latestFiltered[k] = this.filters[o.electrode].apply(sample); 
                        });
                    }
                    coord.filtered.push(...latestFiltered);
                }
            }
        });

        this.atlas.data.eegshared.startTime = Date.now();

        // this.device.telemetryData.subscribe(telemetry => {
        // });
        // this.device.accelerometerData.subscribe(accel => {
        // });
        this.atlas.settings.deviceConnected = true;
        if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
            this.atlas.settings.analyzing = true;
            setTimeout(() => {this.atlas.analyzer();},1200);		
        }

        this.device.gatt.device.addEventListener('gattserverdisconnected', () => {
            this.atlas.analyzing = false;
            this.atlas.settings.deviceConnected = false;
            this.ondisconnect();
        });

        this.onconnect();
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