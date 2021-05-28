//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/BiquadFilters'
import {IO} from './timeflux'

export class timefluxPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;
        this.connected = false

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.subscriptions = []

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        let disconnectOnRefresh = () => {
            this.disconnect()
            window.removeEventListener('beforeunload', disconnectOnRefresh)
        }
        window.addEventListener('beforeunload', disconnectOnRefresh)
    }

    init = async (info,pipeToAtlas) => {

        this.device = new IO('ws://localhost:8000');

        this.info = info;

        return new Promise((resolve, reject) => {
            this.setupAtlas(info,pipeToAtlas).then(() => {
                resolve(true)
            });
        });
    }


    timeCorrection = (coord, data, timestamp, direction='back') => {

        // Update Sampling Rate for New Data
        let prevTime = coord.times[coord.times.length - 1]
        if (prevTime == null) prevTime = timestamp - (data.length/this.info.sps)
        let timeToSample = (timestamp - prevTime)/data.length 
        this.info.sps = 1000/timeToSample // In Seconds

        // Calculate Time Vector through Linear interpolation
        let time = Array(data.length).fill(timestamp);
        if (direction === 'back') time = time.map((t,i) => {return t-(timeToSample*(time.length - i))}) // Back
        else time = time.map((t,i) => {return t+(timeToSample*i)}) // Forward
        
        return time
    }


    connect = async () => {

        const averageDelta = ([x,...xs]) => {
            if (x === undefined)
              return NaN
            else
              return xs.reduce(
                ([acc, last], x) => [acc + (x - last), x],
                [0, x]
              ) [0] / xs.length
          };

        this.subscriptions.push('data')
        this.device.subscribe('data');
        this.device.on('data', (data) => {
                if(this.info.useAtlas) {

                    let timestamps = Object.keys(data)
                    // Update Sampling Rate
                    let aveTimeToSample = averageDelta(timestamps)
                    this.info.sps = 1000/aveTimeToSample // In Seconds

                    timestamps.forEach((timestamp,i) => {

                        let bundle = data[timestamp]

                        Object.keys(bundle).forEach((chId,j) => {
                            let raw = bundle[chId]

                        let coord = this.atlas.getEEGDataByChannel(chId);

                        // Push to Atlas
                        coord.times.push(timestamp);
                        coord.raw.push(raw);
                        coord.count += 1

                        // // Filter Data
                        // if(this.info.useFilters === true) {                
                        //     let latestFiltered = new Array(data.length).fill(0);
                        //     if(this.filters[i] !== undefined) {
                        //         data.forEach((sample,k) => { 
                        //             latestFiltered[k] = this.filters[i].apply(sample); 
                        //         });
                        //     }
                        //     coord.filtered.push(...latestFiltered);
                        // }
                    })
                    })
                }
        });


            this.atlas.data.eegshared.startTime = Date.now();
            this.atlas.settings.deviceConnected = true;
            if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }

        this.onconnect();
    }

    disconnect = () => {
        this.subscriptions.forEach(s => {
            this.device.unsubscribe(s)
        })

        this.device._disconnect()
        this.ondisconnect();
        if (this.ui) this.ui.deleteNode()
        this.atlas.settings.deviceConnected = false;
    }

    setupAtlas = async (info,pipeToAtlas) => {

         info.sps = 256 // Arbitrary
         info.deviceType = 'eeg' // Arbitrary
         info.eegChannelTags = 5 // Hardcoded

         // FOR EEG ONLY
         if(pipeToAtlas === true) { //New Atlas
             let config = '10_20';
             this.atlas = new DataAtlas(
                 location+":"+this.mode,
                 {eegshared:{eegChannelTags: info.eegChannelTags, sps:info.sps}},
                 config,true,true,
                 info.analysis
                 );
             info.useAtlas = true;
         } else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
             this.atlas = pipeToAtlas; //External atlas reference
             this.atlas.data.eegshared.sps = info.sps;
             this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,info.sps*0.5);
             this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
             this.atlas.data.eeg = this.atlas.gen10_20Atlas(info.eegChannelTags); 
             
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
         
         if (!Array.isArray(info.eegChannelTags)) info.eegChannelTags = this.atlas.data.eegshared.eegChannelTags

  
         if(info.useFilters === true) {
             info.eegChannelTags.forEach((row,i) => {
                 if(row.tag !== 'other') {
                     this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,1));
                 }
                 else { 
                     this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,1)); 
                 }
             });
         }
         
         return this.atlas
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode = document.body) => {
        // this.uiid = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        // let template = () => {
        //     return `
        //     `;
        // }

        // let setup = () => {
           

        // }

        // this.ui = new DOMFragment(
        //     template,
        //     parentNode,
        //     undefined,
        //     setup
        // )
    }
}