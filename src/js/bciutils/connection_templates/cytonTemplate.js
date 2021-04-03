//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.

import {cyton} from './cyton'
import {BiquadChannelFilterer} from '../signal_analysis/BiquadFilters'

export class cytonPlugin {
    constructor(mode='daisy') {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
        
    }

    init = (info,pipeToAtlas) => { //info and pipeToAtlas passed by reference from deviceStream class
        info.sps = 250;
        info.deviceType = 'eeg';

        let onDecoded = (newLinesInt) => {
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
                        if(this.info.useAtlas === true) {
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
                        if(this.info.useAtlas === true) {
                            let coord = this.atlas.getEEGDataByChannel(o.ch); 
                            coord.count += newLinesInt;
                            coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
                            coord.raw.push(...latest);
                        }
                    }
        }

        let onConnect = () => {
            () => {
                if(this.info.useAtlas === true){			
                    this.atlas.data.eegshared.startTime = Date.now();
                    if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                        this.atlas.settings.analyzing = true;
                        setTimeout(() => {this.atlas.analyzer();},1200);		
                    }
                    this.onconnect();
                }
            }
        }

        let onDisconnect = () => {
            () => {
                this.atlas.settings.analyzing = false;
                this.ondisconnect();
            }
        }

        if(mode === 'daisy') {
            info.eegChannelTags = [
                {ch: 4, tag: "FP2", analyze:true},
                {ch: 24, tag: "FP1", analyze:true},
                {ch: 8, tag: "other", analyze:false}
            ];
            this.device = new cyton(
                onDecoded,onConnect,onDisconnect,
                'daisy'
            );

        } else {
            info.eegChannelTags = [
                {ch: 4, tag: "FP2", analyze:true},
                {ch: 24, tag: "FP1", analyze:true},
                {ch: 8, tag: "other", analyze:false}
            ];
            this.device = new cyton(
                onDecoded,onConnect,onDisconnect,
                'single'
            );
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


        if(pipeToAtlas === true) { //New Atlas
			let config = '10_20';
            this.atlas = new dataAtlas(
				location+":"+device,
				{eegshared:{eegChannelTags:info.eegChannelTags, sps:info.sps}},
				config,true,true,
				info.analysis
				);
			info.useAtlas = true;
		} else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
			this.atlas = pipeToAtlas; //External atlas reference
			this.atlas.data.eeg = this.atlas.gen10_20Atlas();
            info.useAtlas = true;
			if(this.atlas.settings.analyzing === false && info.analysis.length > 0 ) {
				this.atlas.settings.analysis.push(...info.analysis);
				this.atlas.settings.analyzing = true;
				this.atlas.analyzer();
			}
		}

    }

    connect = async () => {
        await this.device.setupSerialAsync();
        this.onconnect();
    }


    disconnect = () => {
        this.device.disconnect();
        this.ondisconnect();
    }

    //eternally modifiable callbacks
    onconnect = () => {}
    ondisconnect = () => {}


}