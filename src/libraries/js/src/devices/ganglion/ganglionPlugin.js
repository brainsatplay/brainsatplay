//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/BiquadFilters'
import {Ganglion} from './ganglion-ble-master/src'

export class ganglionPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        // we will need to figure out how to short circuit this, but for now, it gets connected.
        this.pipeToAtlas = null;
        this.info = null;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    init = async (info,pipeToAtlas=true) => {

        this.pipeToAtlas = pipeToAtlas;
        this.info = info;
        this.info.sps = 200;
        this.info.deviceType = 'eeg';

        info.eegChannelTags = [
            {ch: 0, tag: "FP1", analyze:true},
            {ch: 1, tag: "FP2", analyze:true},
            {ch: 2, tag: "C3",  analyze:true},
            {ch: 3, tag: "C4",  analyze:true}
        ];
    }

    setupAtlas = (pipeToAtlas=true,info) => {

        let uvPerStep = 1e6;

        if(info.useFilters === true) {
            info.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,uvPerStep));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,uvPerStep)); 
                }
                this.filters[this.filters.length-1].useScaling = true; 
                this.filters[this.filters.length-1].notch60.pop();
                //this.filters[this.filters.length-1].useBp1 = true;
            });
        }

        if(pipeToAtlas === true) { //New Atlas
			let config = '10_20';
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
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,256);
			this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
			this.atlas.data.eeg = this.atlas.gen10_20Atlas();
            this.atlas.data.coherence = this.atlas.genCoherenceMap(info.eegChannelTags);

            this.atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
				if( this.atlas.getEEGDataByTag(row.tag) === undefined ) {
					this.atlas.addEEGCoord(row.ch);
				}
			});

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

    }

    _onConnected = () => {} //for internal use on init

    connect = async () => {

        this.device = new Ganglion();
        await this.device.connect();
        await this.device.start();

        var info = this.info;
        var pipeToAtlas = this.pipeToAtlas;

        this.setupAtlas(pipeToAtlas, info);
        
        this.device.stream.subscribe(sample => {
            if(info.useAtlas) {
                let time = sample.timestamp;
                sample.data.forEach((datum, i) => {
                    let coord = this.atlas.getEEGDataByChannel(i);
                    coord.times.push(time);
                    coord.raw.push(datum);
                    coord.count++;
                    if(info.useFilters === true) {                
                        let latestFiltered = 0;
                        if(this.filters[i] !== undefined) {
                            latestFiltered = this.filters[i].apply(datum); 
                        }
                        coord.filtered.push(latestFiltered);
                    }
                });
                
            }
        });

        if(info.useAtlas === true){			
            this.atlas.data.eegshared.startTime = Date.now();
            if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }
        }
        this.atlas.settings.deviceConnected = true; 

        this.onconnect();
    }

    disconnect = () => {
        this.device.disconnect();
        this.atlas.settings.analyzing = false;
        this.atlas.settings.deviceConnected = false;
        if (this.ui) this.ui.deleteNode()
        this.ondisconnect();
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
