//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.

import {DataAtlas} from '../../DataAtlas'
import {cyton} from './cyton'
import {BiquadChannelFilterer} from '../../algorithms/BiquadFilters'
import { DOMFragment } from '../../ui/DOMFragment';

export class cytonPlugin {
    constructor(mode='cyton_daisy', onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
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

    init = async (info={sps:null,deviceType:null,eegChannelTags:null,analysis:['eegfft'],useAtlas:undefined},pipeToAtlas=true) => { //info and pipeToAtlas passed by reference from deviceStream class
        info.sps = 250;
        info.deviceType = 'eeg';

        let onDecoded = (newLinesInt) => {
            this.atlas.data.eegshared.eegChannelTags.forEach((o,i) => {
                let latest = this.device.getLatestData("A"+o.ch,newLinesInt);
                let latestFiltered = new Array(latest.length).fill(0);
                if(o.tag !== "other" && info.useFilters === true) { 
                    this.filters.forEach((f,j) => {
                        if(f.channel === o.ch) {
                            latest.forEach((sample,k) => { 
                                latestFiltered[k] = f.apply(sample); 
                            });
                        }
                    });
                    if(info.useAtlas === true) {
                        let coord;
                        if(o.tag !== null) { coord = this.atlas.getEEGDataByTag(o.tag); } 
                        else { coord = this.atlas.getEEGDataByChannel(o.ch); }
                        coord.count += newLinesInt;
                        coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
                        coord.filtered.push(...latestFiltered);
                        coord.raw.push(...latest);
                    }
                }
                else {
                    if(info.useAtlas === true) {
                        let coord = this.atlas.getEEGDataByChannel(o.ch); 
                        coord.count += newLinesInt;
                        coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
                        coord.raw.push(...latest);
                    }
                }
            });
        }

        let onConnect = () => {
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

        let onDisconnect = () => {
            this.atlas.settings.analyzing = false;
            this.atlas.settings.deviceConnected = false;
            this.ondisconnect();   
        }

        let eegChannelTags = [];

        if(this.mode.indexOf('Daisy') > -1 ) {
            eegChannelTags = [
                {ch: 0, tag: "FP1", analyze:true},
                {ch: 1, tag: "FP2", analyze:true},
                {ch: 2, tag: "C3", analyze:true},
                {ch: 3, tag: "C4", analyze:true},
                {ch: 4, tag: "P7", analyze:true},
                {ch: 5, tag: "P8", analyze:true},
                {ch: 6, tag: "O1", analyze:true},
                {ch: 7, tag: "O2", analyze:true},
                {ch: 8, tag: "F7", analyze:true},
                {ch: 9, tag: "F8", analyze:true},
                {ch: 10, tag: "F3", analyze:true},
                {ch: 11, tag: "F4", analyze:true},
                {ch: 12, tag: "T7", analyze:true},
                {ch: 13, tag: "T8", analyze:true},
                {ch: 14, tag: "P3", analyze:true},
                {ch: 15, tag: "P4", analyze:true},
            ];
            this.device = new cyton(
                onDecoded,onConnect,onDisconnect,
                'daisy'
            );
        } else {
            eegChannelTags = [      
                {ch: 0, tag: "FP1", analyze:true},
                {ch: 1, tag: "FP2", analyze:true},
                {ch: 2, tag: "C3", analyze:true},
                {ch: 3, tag: "C4", analyze:true},
                {ch: 4, tag: "P7", analyze:true},
                {ch: 5, tag: "P8", analyze:true},
                {ch: 6, tag: "O1", analyze:true},
                {ch: 7, tag: "O2", analyze:true},
            ];
            this.device = new cyton(
                onDecoded,onConnect,onDisconnect,
                'single'
            );
        }

        info.eegChannelTags = eegChannelTags;
        this.setupAtlas(pipeToAtlas,info);
    }

    setupAtlas = (pipeToAtlas=true,info) => {

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
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,info.sps*0.5);
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

        if(info.useFilters === true) {
            info.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,this.device.uVperStep));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,this.device.uVperStep)); 
                }
            });
        }
    }

    connect = async () => {
        await this.device.setupSerialAsync();
        this.setIndicator(true)
    }


    disconnect = () => {
        this.device.closePort();
        this.setIndicator(false)
    }

    //eternally modifiable callbacks
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