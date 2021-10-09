//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/signal_processing/BiquadFilters'
import BCI2K from 'bci2k'

export class bci2000Plugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;
        this.operator = new BCI2K.bciOperator(); //Invoke a device class here if needed
        this.filters = [];

        this.states = {}

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    init = async (info,pipeToAtlas) => {

        info.sps = 256 // Arbitrary
        info.deviceType = 'eeg'
        this.info = info;
        return new Promise((resolve, reject) => {

        if (this.mode === 'bci2k_Operator') {

            let script = ``;
            script += `Reset System; `;
            script += `Startup System localhost; `;
            script += `Add State StimulusCode 4 0; `;
            script += `Add State BrainClick 1 0; `;
            script += `Add State Baseline 1 0; `;
            script += `Add State TrialStart 1 0; `;
            script += `Start executable SignalGenerator; `;
            script += `Start executable DummyApplication; `;
            script += `Start executable DummySignalProcessing; `;
            script += `Set Parameter WSSourceServer *:20100; `;
            script += `Wait for connected; `
            script += `Set Config; `
            script += `Start; `
    
            this.operator.connect("ws://127.0.0.1").then(() => {
                console.log("Connected to Operator layer through NodeJS server");
                this.operator.execute(script);
                this.connectToDataLayer(info,pipeToAtlas).then(res => {
                    resolve(res)
                })
              });
        } else if (this.mode === 'bci2k_Data') {
            this.connectToDataLayer(info,pipeToAtlas).then(res =>{
                resolve(res)
            })
        }
    })
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

    connectToDataLayer = async (info,pipeToAtlas) => {
        return new Promise(async (resolve, reject) => {

        let resolved = false
        this.device = new BCI2K.bciData();
        this.device.connect("ws://127.0.0.1:20100").then((x) => {

            // Create Event Handlers
            this.device.onGenericSignal = (raw) => {

                // Update Monitored States
                let monitoredStates = Object.keys(this.states)
                monitoredStates.forEach(k => {
                    if(this.device.states[k] != null) {

                        // LIMITATIONS
                        // BCI2000 only supports (1) exclusive and (2) binary switches for now. 
                        // The framework itself supports values from 0-1 for any particular state.

                        let value = this.device.states[k][0] // Exclusive (only first index)
                        // if (Object.keys(this.states[k].length == 1) || value != 0){
                        if (this.states[k][value].data != true){
                        this.states[k].forEach((state,i) => { // Exclusive (resets states not chosen)
                            if (i === value) {
                                this.states[k][value].data = true // Binary
                            }
                            else {
                                if (this.states[k][i].data != false) {
                                    this.states[k][i].data = false // Binary
                                }
                            }
                        })
                    // }
                    }
                    }
                })
               
                // Raw Data
                if(this.info.useAtlas) {
                    raw.forEach((chData,i) => {
                        let coord = this.atlas.getEEGDataByChannel(i);

                        let time = this.timeCorrection(coord, raw, Date.now(), 'back')
                        coord.times.push(...time);
                        coord.raw.push(...chData);
                        coord.count += chData.length;
                        // if(this.info.useFilters === true) {                
                        //     let latestFiltered = new Array(chData.length).fill(0);
                        //     if(this.filters[this.info] !== undefined) {
                        //         chData.forEach((sample,k) => { 
                        //             latestFiltered[k] = this.filters[i].apply(sample); 
                        //         });
                        //     }
                        //     coord.filtered.push(...latestFiltered);
                        // }
                        // console.log(coord.filtered);
                    })	
                }
            };

            // Initialize Possible Device States
            this.device.onStateFormat = data => {
                let defaults = ['Recording', 'Running', 'SourceTime', 'StimulusTime','__pad0', 'TrialStart', 'Baseline']
                let keys = Object.keys(data)
                keys = keys.filter(k => !defaults.includes(k))

                keys.forEach(stateId => {
                    // Determine Possible Keys
                    let possibilities = Math.pow(data[stateId].bitWidth,2)

                    // Split ID to Derive Additional Specifiers
                    // Create States Based on Possibilities
                    let id = ''
                    this.states[stateId] = Array.from({length: possibilities}, (e,i) => {
                        if (possibilities > 1) id = `${stateId}_${i}` // Create unique ID
                        else id = stateId
                        return {data: false, meta: {id}} // Set with expected (boolean) value
                    })
                })
            }
            this.device.onSignalProperties = data => {

                // Check if already created
                if (this.atlas == null){
                    this.info.eegChannelTags = data.channels.length//eegChannelTags

                    // Create Data Atlas Given Signal Properties
                    this.setupAtlas(this.info,pipeToAtlas);  
                    
                    // Validate Connection
                    this.onconnect();

                    resolve(true) // Resolve promise when signalProperties are received
                }                
            }
        });
        })
    }

    setupAtlas = (info,pipeToAtlas) => {

        if(pipeToAtlas === true) { //New Atlas
			let config = '10_20';
            this.atlas = new DataAtlas(
				location+":"+this.mode,
				{eegshared:{eegChannelTags:info.eegChannelTags, sps:info.sps}},
				config
                );
            this.atlas.init()
			info.useAtlas = true;
		} else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
			this.atlas = pipeToAtlas; //External atlas reference
            this.atlas.data.eegshared.eegChannelTags = info.eegChannelTags;
            this.atlas.data.eegshared.sps = info.sps;
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,256);
			this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
			this.atlas.data.eeg = this.atlas.genMuseAtlas(); 
            this.atlas.data.coherence = this.atlas.genCoherenceMap(info.eegChannelTags);
            this.atlas.settings.eeg = true;
            info.useAtlas = true;
		}

        // Auto-assign channel tags
        if (!Array.isArray(info.eegChannelTags)) info.eegChannelTags = this.atlas.data.eegshared.eegChannelTags

        // Create Filters
        if(info.useFilters === true) {
            info.eegChannelTags.forEach((row,i) => {
                this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,1));
            });
        }

        this.atlas.data.eegshared.startTime = Date.now();
        this.atlas.settings.deviceConnected = true;
        if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
            this.atlas.settings.analyzing = true;
            setTimeout(() => {this.atlas.analyzer();},1200);		
        }

    }

    _onConnected = () => {} //for internal use only on init

    connect = () => {}

    disconnect = () => {
        if (this.ui) this.ui.deleteNode()
        this.ondisconnect();
        if (this.device) this.device.disconnect()
        // if (this.operator) this.operator.disconnect()
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