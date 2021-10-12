//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/signal_processing/BiquadFilters'


export class syntheticPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode.split('_')[1]; // EEG, HEG, replay

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.refuS = 0;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        this.loop;
        this.looping = true;


        this.states = {
            'key_ArrowUp': {data: 0, meta: {id:'key_ArrowUp'}},
            'key_ArrowDown': {data: 0, meta: {id:'key_ArrowDown'}},
            'key_ArrowLeft': {data: 0, meta: {id:'key_ArrowLeft'}},
            'key_ArrowRight': {data: 0, meta: {id:'key_ArrowRight'}},
        }


        // Simulated BCI2000 States
        document.addEventListener('keydown',this.handleKeyDown)
        document.addEventListener('keyup',this.handleKeyUp)
    }

    init = async (info,pipeToAtlas) => {
        info.deviceType = this.mode.toLowerCase()
        if (info.deviceType === 'eeg') {
            info.sps = 256
            info.eegChannelTags = '8'
        } else if (info.deviceType === 'heg'){
            info.sps = 32
        }
        
        this.info = info;

        this._onConnected = () => {
            this.setupAtlas(pipeToAtlas,info);
        }
    }

    setupAtlas = (pipeToAtlas=true,info=this.info) => {
        
        if (this.info.deviceType === 'eeg'){
            if(pipeToAtlas === true) { //New Atlas
                let config = '10_20';
                this.atlas = new DataAtlas(
                    location+":"+this.mode,
                    {eegshared:{eegChannelTags: info.eegChannelTags, sps:info.sps}},
                    config
                    );
                    this.atlas.init()
                info.useAtlas = true;
            } else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
                this.atlas = pipeToAtlas; //External atlas reference
                this.atlas.data.eegshared.sps = info.sps;
                this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,256);
                this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
                this.atlas.data.eeg = this.atlas.gen10_20Atlas(info.eegChannelTags); 
                
                // Populate EEG Channel Tags
                info.eegChannelTags = []
                this.atlas.data.eeg.forEach((d,i) => {
                    info.eegChannelTags.push({ch:i,tag:d.tag,analyze: true})
                })
                if (this.atlas.data.eegshared.eegChannelTags == null) this.atlas.data.eegshared.eegChannelTags = info.eegChannelTags
                
                this.atlas.data.coherence = this.atlas.genCoherenceMap(info.eegChannelTags);
                this.atlas.settings.eeg = true;
                info.useAtlas = true;
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
        } else if (this.info.deviceType === 'heg'){

            this.filters.push(new BiquadChannelFilterer('red',100,false,1),new BiquadChannelFilterer('ir',100,false,1),new BiquadChannelFilterer('ratio',100,false,1),new BiquadChannelFilterer('ambient',100,false,1));
            this.filters.forEach((filter)=> {
                filter.useSMA4 = true;
                filter.useDCB = false;
            })    

            if(pipeToAtlas === true) {
                let config = 'hegduino';
                this.atlas = new DataAtlas(
                    location+":"+this.mode,
                    {hegshared:{sps:this.info.sps}},
                    config,
                    );
    
                this.atlas.init()
                this.info.deviceNum = this.atlas.data.heg.length-1;
                this.info.useAtlas = true;
                
            } else if (typeof pipeToAtlas === 'object') {
                this.atlas = pipeToAtlas; //External atlas reference
                this.info.deviceNum = this.atlas.data.heg.length; 
                this.atlas.data.hegshared = {sps:this.info.sps};
                this.atlas.addHEGCoord(this.atlas.data.heg.length); 
                this.atlas.settings.heg = true;
                this.info.useAtlas = true;
            }
        }
    }

    //For internal use only on init
    _onConnected = () => {}

    connect = () => {

      this._onConnected();
      if (this.deviceType === 'eeg') this.atlas.data.eegshared.startTime = Date.now();

      console.log(this)
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
        document.removeEventListener('keyup',this.handleKeyUp)

        this.looping = false;
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
        );
        
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

        let delay = 1000/this.sps;

        let simulate = () => {
            if (this.looping){

            if(this.info.useAtlas) {
    
                if (this.mode === 'EEG'){
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
                } else if (this.mode === 'HEG') {
                    let coord = this.atlas.data.heg[this.info.deviceNum];
                    // console.log( this.atlas.data.heg, this.info.deviceNum)

                    coord.count++;

                    let thisTime = Date.now()
                    if(coord.count === 1) { coord.startTime = thisTime; }
                    if(coord.times.length === 0) {coord.times.push(thisTime); this.refuS = parseFloat(thisTime);} //Microseconds = parseFloat(data[0]). We are using date.now() in ms to keep the UI usage normalized
                    else {
                        let t = parseFloat(thisTime);
                        coord.times.push(Math.floor(coord.times[coord.times.length-1]+(t-this.refuS)*0.001))
                        this.refuS = t; //keep times synchronous
                    }

                    let offset = 1
                    let amps = [1,1]
                    let freqs = [1/4, 1/60] // Per minute
                    freqs = freqs.map(f => f*60) // per second
                    let red = 0, ir = 0

                    freqs.forEach((f,i) => {
                        red += amps[i] * (0.5 + 0.5 * Math.sin(2*Math.PI*thisTime/(1000*f)))
                    })

                    ir = red
                    red += offset
                    ir += offset * (1.2 + 0.4*Math.sin(2*Math.PI/(1000)))

                    coord.red.push(this.filters[0].apply(parseFloat(red)));
                    coord.ir.push(this.filters[1].apply(parseFloat(ir)));
                    coord.ratio.push(this.filters[2].apply(parseFloat(red/ir)));
                    coord.ambient.push(parseFloat(0));
                    coord.temp.push(parseFloat(0)); // temp is on new firmware

                    //Simple beat detection. For breathing detection applying a ~3 second moving average and peak finding should work
                    this.atlas.beatDetection(coord, this.info.sps);
                }
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