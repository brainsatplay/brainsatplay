//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../algorithms/BiquadFilters'
import {Ganglion} from './ganglion-ble-master/src/index.js'

export class ganglionPlugin {
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

        this.info = info
        this.info.sps = 200;
        this.info.deviceType = 'eeg';
        let uvPerStep = 15686 / 8388607;

        this.info.eegChannelTags = [
            {ch: 0, tag: "FP1", analyze:true},
            {ch: 1, tag: "FP2", analyze:true},
            {ch: 2, tag: "C3",  analyze:true},
            {ch: 3, tag: "C4",  analyze:true}
        ];

        if(this.info.useFilters === true) {
            this.info.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,this.info.sps,true,uvPerStep));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,this.info.sps,false,uvPerStep)); 
                }
                this.filters.notch50.pop();
                this.filters.notch60.pop();
            });
        }

        if(pipeToAtlas === true) { //New Atlas
			let config = '10_20';
            this.atlas = new DataAtlas(
				location+":"+this.mode,
				{eegshared:{eegChannelTags:this.info.eegChannelTags, sps:this.info.sps}},
				config,true,true,
				this.info.analysis
				);
			this.info.useAtlas = true;
		} else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
			this.atlas = pipeToAtlas; //External atlas reference
            this.atlas.data.eegshared.eegChannelTags = this.info.eegChannelTags;
            this.atlas.data.eegshared.sps = this.info.sps;
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,this.info.sps*0.5);
			this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
			this.atlas.data.eeg = this.atlas.gen10_20Atlas();
            this.atlas.data.coherence = this.atlas.genCoherenceMap(this.info.eegChannelTags);

            this.atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
				if( this.atlas.getEEGDataByTag(row.tag) === undefined ) {
					this.atlas.addEEGCoord(row.ch);
				}
			});

            this.atlas.settings.coherence = true;
            this.atlas.settings.eeg = true;
            this.info.useAtlas = true;
			if(info.analysis.length > 0 ) {
				this.atlas.settings.analysis.push(...this.info.analysis);
                if(!this.atlas.settings.analyzing) { 
                    this.atlas.settings.analyzing = true;
                    this.atlas.analyzer();
                }
			}
        }
    }

    connect = async () => {
        this.device = new Ganglion();
        await this.device.connect();
        await this.device.start();

        this.device.stream.subscribe(sample => {
            if(this.info.useAtlas) {
                let time = sample.timestamp;
                sample.data.forEach((datum, i) => {
                    let coord = this.atlas.getEEGDataByChannel(i);
                    coord.times.push(time);
                    coord.raw.push(datum);
                    coord.count++;
                    if(this.info.useFilters === true) {                
                        let latestFiltered = 0;
                        if(this.filters[i] !== undefined) {
                            latestFiltered = this.filters[i].apply(sample); 
                        }
                        coord.filtered.push(...latestFiltered);
                    }
                });
                
            }
        });

        if(this.info.useAtlas === true){			
            this.atlas.data.eegshared.startTime = Date.now();
            if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }
        }
        this.atlas.settings.deviceConnected = true; 

        this.onconnect();
        this.setIndicator(true);

        //onconnected: this.atlas.settings.deviceConnected = true;
    }

    disconnect = () => {
        this.device.disconnect();
        this.atlas.settings.analyzing = false;
        this.atlas.settings.deviceConnected = false;
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