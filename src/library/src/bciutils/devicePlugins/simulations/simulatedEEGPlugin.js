//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../../frontend/utils/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../signal_analysis/BiquadFilters'


export class simulatedEEGPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
		this.readRate = 16.666667; //Throttle EEG read speed. (1.953ms/sample min @103 bytes/line)

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
        this.info = info
        this.info.sps = 250
        this.info.deviceType = 'eeg'
        this.info.eegChannelTags = [
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
        

        // Setup atlas
        if(pipeToAtlas === true) {
            let config = 'big';
            this.atlas = new DataAtlas(
                location+":"+this.mode,
                {eegshared:{eegChannelTags:this.info.eegChannelTags, sps:this.info.sps}},
                config,true,true,
                this.info.analysis
                );

            this.info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            this.atlas.data.eegshared.eegChannelTags = this.info.eegChannelTags;
            this.atlas.data.eegshared.sps = this.info.sps;
            this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,this.info.sps*0.5);
			this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
			this.atlas.data.eeg = this.atlas.gen10_20Atlas();
            this.atlas.data.coherence = this.atlas.genCoherenceMap(this.info.eegChannelTags);

            this.atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
				if( this.atlas.getEEGDataByTag(row.tag) === undefined ) {
					this.atlas.addEEGCoord(row.ch);
				}
			});

            this.atlas.settings.coherence = true;
            this.atlas.settings.eeg = true;
            this.info.useAtlas = true;
			if(this.info.analysis.length > 0 ) {
				this.atlas.settings.analysis.push(...this.info.analysis);
                if(!this.atlas.settings.analyzing) { 
                    this.atlas.settings.analyzing = true;
                    this.atlas.analyzer();
                }
			}
        }
    }

    connect = () => {
       this.setIndicator(true);
       this.atlas.settings.deviceConnected = true;
       if(this.info.useAtlas === true){			
            this.atlas.data.eegshared.startTime = Date.now();
            if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }
        }
        this.atlas.settings.deviceConnected = true;
        this.onconnect(); 
        this.simulate(true);
    }

    disconnect = () => {
        this.simulate(false)
        this.atlas.settings.analyzing = false;
        this.atlas.settings.deviceConnected = false;
        this.ondisconnect();   
        this.setIndicator(false);
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


    simulate = (toggle) => {
        if (toggle === true){
            this.simulation = {
                simulationId: null,
                times: {
                    previous: null,
                    current: Date.now()
                }
            };
            this.startSimulation()

        } else {
            if (this.simulation?.simulationId) {
                window.cancelAnimationFrame(this.simulation.simulationId)
                this.simulation = undefined
            }
        }
    }

    simulationLoop = (t) => {
        this.simulation.simulationId = undefined

        this.simulation.times.previous = this.simulation.times.current
        this.simulation.times.current = Date.now()
        let timeElapsed = (this.simulation.times.current - this.simulation.times.previous)
        let newLinesInt = Math.floor(this.info.sps * timeElapsed/1000)

        this.atlas.data.eegshared.eegChannelTags.forEach((o,i) => {
            
            let frequencies = [8,9,10,11,12]
            let latest = []
            let times = []
            for (let i = 0; i < newLinesInt; i++){
                let time = this.simulation.times.current - (1-(i*timeElapsed/newLinesInt))
                times.push(time)

                let signal = 0;
                frequencies.forEach(f => {
                    signal += Math.sin(time/(f*1000))
                })

                latest.push(signal)
            }

            let latestFiltered = new Array(latest.length).fill(0);
            if(o.tag !== "other" && this.info.useFilters === true) { 
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
                    coord.times.push(...times);
                    coord.filtered.push(...latestFiltered);
                    coord.raw.push(...latest);
                }
            }
            else {
                if(this.info.useAtlas === true) {
                    let coord = this.atlas.getEEGDataByChannel(o.ch); 
                    coord.count += newLinesInt;
                    coord.times.push(...times);
                    coord.raw.push(...latest);
                }
            }
        });

        setTimeout(()=>{this.startSimulation()}, this.readRate) //Throttled read 1/512sps = 1.953ms/sample @ 103 bytes / line or 1030bytes every 20ms
    }

    startSimulation = ()  => {
        if (!this.simulation?.simulationId) {
            this.simulation.simulationId = window.requestAnimationFrame(this.simulationLoop)
        }
    }

}