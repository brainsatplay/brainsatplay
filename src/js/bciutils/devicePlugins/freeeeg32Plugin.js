//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {eeg32} from '../eeg32'
import {dataAtlas} from '../dataAtlas'
import {DOMFragment} from '../../frontend/utils/DOMFragment'

export class eeg32Plugin {
    constructor(mode="freeeeg32_2", onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
       
        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect

    }

    init = (info,pipeToAtlas) => {
        info.sps = 512;
        info.deviceType = 'eeg';
        let eegChannelTags = [];

        if(this.mode === "freeeeg32_2") { 
            eegChannelTags = [
                {ch: 4, tag: "FP2", analyze:true},
                {ch: 24, tag: "FP1", analyze:true},
                {ch: 8, tag: "other", analyze:false}
            ];
        }
        else if (this.mode === 'freeeeg32_19') {
            eegChannelTags = [
                {ch: 4, tag: "FP2", analyze:true},
                {ch: 24, tag: "FP1", analyze:true},
                {ch: 8, tag: "other", analyze:false}
            ];
        }
        else {
            eegChannelTags = [
                {ch: 4, tag: "FP2", analyze:true},
                {ch: 24, tag: "FP1", analyze:true},
                {ch: 8, tag: "other", analyze:false}
            ];
        }
        this.device = new eeg32(
            (newLinesInt) => {
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
            },
            ()=>{	
                if(info.useAtlas === true){			
                    this.atlas.data.eegshared.startTime = Date.now();
                    if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                        this.atlas.settings.analyzing = true;
                        setTimeout(() => {this.atlas.analyzer();},1200);		
                    }
                    this.onconnect();
                }
            },
            ()=>{
                this.atlas.settings.analyzing = false;
                this.ondisconnect();
            }
        );
        if(info.useFilters === true) {
            this.atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,this.device.uVperStep));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,this.device.uVperStep)); 
                }
            });
        }

        if(pipeToAtlas === true) {
			let config = '10_20'; 
			this.atlas = new dataAtlas(
				location+":"+this.mode,
				{eegshared:{eegChannelTags:info.eegChannelTags, sps:info.sps}},
				config,true,true,
				info.analysis
			);
			info.useAtlas = true;
		} else if (typeof pipeToAtlas === 'object') {
			this.atlas = pipeToAtlas; //External atlas reference
            this.atlas.data.eegshared.eegChannelTags = info.eegChannelTags;
            this.atlas.data.eegshared.sps = info.sps;
			this.atlas.data.eeg = this.atlas.gen10_20Atlas(); this.atlas.settings.eeg = true;
			info.useAtlas = true;
			if(this.atlas.settings.analyzing === false && info.analysis.length > 0 ) {
				this.atlas.settings.analysis.push(...info.analysis);
				this.configureDefaultStreamTable();
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
            let elm = document.getElementById;

        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
        
    }

}