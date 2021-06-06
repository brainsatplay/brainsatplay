//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/BiquadFilters'


export class syntheticPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode; //syntheticeeg, syntheticheg, replay

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        this.loop;
        this.looping = true;


        this.states = {
            'key_ArrowUp': {data: 0, meta: {id:'key_ArrowUp'}, timestamp: Date.now()},
            'key_ArrowDown': {data: 0, meta: {id:'key_ArrowDown'}, timestamp: Date.now()},
            'key_ArrowLeft': {data: 0, meta: {id:'key_ArrowLeft'}, timestamp: Date.now()},
            'key_ArrowRight': {data: 0, meta: {id:'key_ArrowRight'}, timestamp: Date.now()},
        }


        // Simulated BCI2000 States
        document.addEventListener('keydown',this.handleKeyDown)
        document.addEventListener('keyup',this.handleKeyUp)
    }

    init = async (info,pipeToAtlas) => {
        info.sps = 256
        info.deviceType = 'eeg'
        info.eegChannelTags = '8'
        
        this.info = info;

        this._onConnected = () => {
            this.setupAtlas(pipeToAtlas,info);
        }
    }

    setupAtlas = (pipeToAtlas=true,info=this.info) => {
        
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
    }

    //For internal use only on init
    _onConnected = () => {}

    connect = () => {

      this._onConnected();
      this.atlas.data.eegshared.startTime = Date.now();

      this.atlas.settings.deviceConnected = true;
      if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
          this.atlas.settings.analyzing = true;
          setTimeout(() => {this.atlas.analyzer();},1200);		
      }

       this.onconnect();
       this.simulateData()
    }

    disconnect = () => {
        this.ondisconnect();
        if (this.ui) this.ui.deleteNode()
        this.atlas.settings.deviceConnected = false;
        if (typeof window != undefined){
            window.cancelAnimationFrame(this.loop)
        }

        // Simulated BCI2000 States
        document.removeEventListener('keydown',this.handleKeyDown)
        document.removeEventListener('keyup',this.handleKeyDown)

        this.looping = false;
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode = document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements

        if(this.mode === 'replay') {
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
            );
        }
        
    }

    timeCorrection = (coord, data, timestamp) => {

        // Update Sampling Rate for New Data
        let prevTime = coord.times[coord.times.length - 1]
        if (prevTime == null) prevTime = timestamp - (data.length/this.info.sps)
        let timeToSample = (timestamp - prevTime)/data.length 
        this.info.sps = 1000/timeToSample // In Seconds

        // Calculate Time Vector through Linear interpolation
        let time = Array(data.length).fill(timestamp);
        time = time.map((t,i) => {return t-(timeToSample*(time.length - i))}) // Forward

        return time
    }

    simulateData = () => {

        let delay = 100;

        let simulate = () => {
            if (this.looping){

            if(this.info.useAtlas) {
    
                let nCh = this.info.eegChannelTags.length
                this.info.eegChannelTags.forEach((o,i) => {
                    let coord = this.atlas.getEEGDataByTag(o.tag);
                    let prevTime = coord.times[coord.times.length - 1]
                    if (isNaN(prevTime)) prevTime = Date.now() - delay
                    let n = Math.floor(this.info.sps * (Date.now() - prevTime)/1000)
                    let time = Array(n).fill(Date.now());
                    time = time.map((t,i) => {return t-((this.info.sps/1000)*(time.length - i))}) // Forward
                    let samples = []
                    let minFreq = 1
                    let maxFreq = 40
                    time.forEach((t) => {
                        let f = Math.floor(minFreq + (maxFreq-minFreq)*(i/nCh))
                        samples.push(200*Math.sin(2*Math.PI*(f)*t/1000));
                    })
                    
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
                setTimeout(this.loop = requestAnimationFrame(this.simulateData),delay);
            }
        }
          }
    
          simulate()
    }

    replayData() {
		
    }
    
    addControls(){

    }

    handleKeyDown = (e) => {
        Object.keys(this.states).forEach(k => {
            let splitId = k.split('_')
            if (splitId[0] === 'key'){
                if (this.matchKey(e.code, splitId[1]) && this.states[k].data != true) {
                    this.states[k].data = true
                }
            }
        })
    }
    
    handleKeyUp = (e) => {
        Object.keys(this.states).forEach(k => {
            let splitId = k.split('_')
            if (splitId[0] === 'key'){
                if (this.matchKey(e.code, splitId[1])) this.states[k].data = false
            }
        })
    }

    matchKey(keycode, k){
            let regex = new RegExp(`(?:^|\W)${k}(?:$|\W)`,'i')
            return (keycode.match(regex) || keycode.replace('Key', '').match(regex) || keycode.replace('Digit', '').match(regex))
    }


}