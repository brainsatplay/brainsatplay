//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/BiquadFilters'
import {industryKiller} from './8ch_prototype'

export class Prototype8Plugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    init = async (info,pipeToAtlas) => {
        info.sps = 500;
        info.deviceType = 'eeg';
        //this._onConnected = () => { this.setupAtlas(info,pipeToAtlas); }

        info.eegChannelTags = [
            {ch: 0,  tag: "FP1",  analyze:true},
            {ch: 1,  tag: "FP2",  analyze:true},
            {ch: 2,  tag: "FZ",   analyze:true},
            {ch: 3,  tag: "C3",   analyze:true},
            {ch: 5,  tag: "C4",   analyze:true},
            {ch: 6,  tag: "O1",   analyze:true},
            {ch: 7,  tag: "O2",   analyze:true}
        ];

        this.device = new industryKiller(
            (ct)=>{
                if(ct) {
                    this.atlas.data.eegshared.eegChannelTags.forEach((o,i) => {
                        let latest = this.device.getLatestData("A"+o.ch,1);
                        let latestFiltered = 0;
                        if(o.tag !== "other" && info.useFilters === true) { 
                            this.filters.find((f,j) => {
                                if(f.channel === o.ch) {
                                    latestFiltered = f.apply(latest);
                                    return true;
                                }
                            });
                            if(info.useAtlas === true) {
                                let coord;
                                if(o.tag !== null) { coord = this.atlas.getEEGDataByTag(o.tag); } 
                                else { coord = this.atlas.getEEGDataByChannel(o.ch); }
                                coord.count++;
                                coord.times.push(this.device.data.ms[ct-1]);
                                coord.filtered.push(latestFiltered);
                                coord.raw.push(latest);
                            }
                        }
                        else {
                            if(info.useAtlas === true) {
                                let coord = this.atlas.getEEGDataByChannel(o.ch); 
                                coord.count += newLinesInt;
                                coord.times.push(this.device.data.ms[ct-1]);
                                coord.raw.push(latest);
                            }
                        }
                    });
                }
            },
            ()=>{
                this.setupAtlas(pipeToAtlas,info);
                if(info.useAtlas === true){			
                    this.atlas.data.eegshared.startTime = Date.now();
                    if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                        this.atlas.settings.analyzing = true;
                        this.atlas.settings.deviceConnected = true;
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
       
    }

    setupAtlas = (pipeToAtlas,info) => {
        if(info.useFilters === true) {
            info.eegChannelTags.forEach((row,i) => {
                if(row.tag !== 'other') {
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,this.device.uVperStep));
                }
                else { 
                    this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,this.device.uVperStep)); 
                }
                this.filters[this.filters.length-1].useScaling = true;
                this.filters[this.filters.length-1].useBp1 = true;
            });
        }	
        if(pipeToAtlas === true) {
            let config = '10_20'; 
            this.atlas = new DataAtlas(
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
    }


    _onConnected = () => {} //for internal use only on init
 
    connect = async () => {
        //Insert connection protocols here...
        await this.device.setupSerialAsync(1000000);
        //Setup Atlas via this callback AFTER connection is confirmed, you may need to move this or create an additional callback
        //this._onConnected();
        //run callbacks
        //this.onconnect();
        //onconnected: this.atlas.settings.deviceConnected = true;
    }

    disconnect = () => {
        this.device.closePort();
        //this.ondisconnect();
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