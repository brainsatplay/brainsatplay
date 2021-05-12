//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../algorithms/BiquadFilters'


export class syntheticPlugin {
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
        info.sps = 256
        info.deviceType = 'eeg'
        info.eegChannelTags = 'auto'

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
            
            // Populate EEG Channel Tags
            info.eegChannelTags = []
            this.atlas.data.eeg.forEach((d,i) => {
                info.eegChannelTags.push({ch:i,tag:d.tag,analyze: true})
            })
            if (this.atlas.data.eegshared.eegChannelTags == null) this.atlas.data.eegshared.eegChannelTags = info.eegChannelTags
            
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
                //this.filters[this.filters.length-1].useBp1 = true;
            });
        }
        
        this.info = info;
    }

    connect = () => {

      this.atlas.data.eegshared.startTime = Date.now();

      this.atlas.settings.deviceConnected = true;
      if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
          this.atlas.settings.analyzing = true;
          setTimeout(() => {this.atlas.analyzer();},1200);		
      }

       this.onconnect();
       this.setIndicator(true);

       this.simulateData()
    }

    disconnect = () => {
        this.ondisconnect();
        this.setIndicator(false);
        this.atlas.settings.deviceConnected = false;
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

    simulateData = () => {

        let delay = 100;

        let simulate = () => {

            if(this.info.useAtlas) {

                let n = Math.floor(this.info.sps*delay/1000);
                let time = Array(n).fill(Date.now());
                time = time.map((t,i) => {return t-(1-(this.info.sps/(time.length))*i/5)})	
    
                let nCh = this.info.eegChannelTags.length
                this.info.eegChannelTags.forEach((o,i) => {
    
                    let samples = []
                    let minFreq = 1
                    let maxFreq = 20
                    time.forEach((t) => {
                        let f = Math.floor(minFreq + (maxFreq-minFreq)*(i/nCh))
                        samples.push(25*Math.sin(2*Math.PI*(f)*t/1000));
                    })

                    let coord = this.atlas.getEEGDataByTag(o.tag);
                    coord.times.push(...time);
                    coord.raw.push(...samples);
                    coord.count += samples.length;
        
                    // if(this.info.useFilters === true) {                
                    //     let latestFiltered = new Array(samples.length).fill(0);
                    //     if(this.filters[o.tag] !== undefined) {
                    //         samples.forEach((sample,k) => { 
                    //             latestFiltered[k] = this.filters[o.tag].apply(sample); 
                    //         });
                    //     }
                    //     console.log(latestFiltered)
                    //     coord.filtered.push(...latestFiltered);
                    // }
                })
            }
    
            if (typeof window === 'undefined') {
                setTimeout(()=>{this.simulateData}, delay)
            } else {
                setTimeout(requestAnimationFrame(this.simulateData),delay);
            }
          }
    
          simulate()
    }

}