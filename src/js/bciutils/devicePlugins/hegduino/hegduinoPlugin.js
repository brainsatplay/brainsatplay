//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../../signal_analysis/BiquadFilters'
import {DataAtlas} from '../../DataAtlas'
import {hegduino} from './hegduino'
import {DOMFragment} from '../../../frontend/utils/DOMFragment'

export class hegduinoPlugin {
    constructor(mode='hegduinousb', onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
        this.ui = null;

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

    	//Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)

    mean(arr){
        var sum = arr.reduce((prev,curr)=> curr += prev);
        return sum / arr.length;
    }

    isExtrema(arr,critical='peak') { //Checks if the middle of the array is a local extrema. options: 'peak','valley','tangent'
        let ref = [...arr];
        if(arr.length > 1) { 
            let pass = true;
            ref.forEach((val,i) => {
                if(critical === 'peak') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                    } else if (i > Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                    } else if (i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                    } else if ((i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                    }
                } //|| (i < ref.length*.5 && val <= 0 ) || (i > ref.length*.5 && val > 0)
            });
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                ref.forEach((val,i) => { 
                    if((i <  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                    } else if ((i >  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                    }
                });
            }
            return pass;
        }
    }

    isCriticalPoint(arr,critical='peak') { //Checks if the middle of the array is a critical point. options: 'peak','valley','tangent'
        let ref = [...arr];
        if(arr.length > 1) { 
            let pass = true;
            ref.forEach((val,i) => {
                if(critical === 'peak') { //search first derivative
                    if(i < ref.length*.5 && val <= 0 ) {
                        pass = false;
                    } else if (i > ref.length*.5 && val > 0) {
                        pass = false;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < ref.length*.5 && val >= 0 ) {
                        pass = false;
                    } else if (i > ref.length*.5 && val < 0) {
                        pass = false;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < ref.length*.5 && val >= 0 )) {
                        pass = false;
                    } else if ((i > ref.length*.5 && val < 0)) {
                        pass = false;
                    }
                }
            });
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                ref.forEach((val,i) => { 
                    if((i < ref.length*.5 && val <= 0 )) {
                        pass = false;
                    } else if ((i > ref.length*.5 && val > 0)) {
                        pass = false;
                    }
                });
            }
            return pass;
        }
    }

    init = (info,pipeToAtlas) => {
		info.sps = 32;
        info.deviceType = 'heg';

        //beat detect smoothing window and midpoint
        let window = Math.floor(info.sps/4);
        let pw = window; if(pw%2 === 0) {pw+=1} //make sure the peak window is an odd number
        let mid = Math.round(pw*.5);
        //breathing detect smoothing window and midpoint
        let window2 = Math.floor(info.sps*3);
        let pw2 = window2; if(pw2%2 === 0) {pw2+=1} 
        let mid2 = Math.round(pw2*.5);

        let ondata = (newline) => {
            if(newline.indexOf("|") > -1) {
                let data = newline.split("|");
                //console.log(data);
                if(data.length > 3) {
                    let coord = this.atlas.data.heg[info.deviceNum];
                    coord.count++;
                    if(coord.count === 1) { coord.startTime = Date.now(); }
                    if(this.device.mode === 'ble' && this.device.interface.android === true) {
                        coord.times.push(Date.now());
                        coord.red.push(parseFloat(data[0]));
                        coord.ir.push(parseFloat(data[1]));
                        coord.ratio.push(parseFloat(data[2]));
                        //ignore the rest for now
                    } else { 
                        coord.times.push(Date.now()); //Microseconds = parseFloat(data[0]). We are using date.now() in ms to keep the UI usage normalized
                        coord.red.push(parseFloat(data[1]));
                        coord.ir.push(parseFloat(data[2]));
                        coord.ratio.push(parseFloat(data[3]));
                        coord.ambient.push(parseFloat(data[4]));
                        //ignore the rest for now
                    }

                    //Simple beat detection. For breathing detection applying a ~3 second moving average and peak finding should work
                    let bt = coord.beat_detect;
                    bt.rir.push(coord.red[coord.count-1]+coord.ir[coord.count-1]);
                    if(bt.rir.length > pw2) {
                        bt.rir2.push(this.mean(bt.rir.slice(bt.rir.length-pw2))); //filter with SMA
                    } else {
                        bt.rir2.push(this.mean(bt.rir));
                    }
                    if(coord.count > 1) {
                        bt.drir_dt.push((bt.rir[coord.count-1]-bt.rir[coord.count-2])/(coord.times[coord.count-1]-coord.times[coord.count-2]));
                        if(bt.drir_dt.length>pw) {
                            bt.drir_dt[bt.drir_dt.length-1] = this.mean(bt.drir_dt.slice(bt.drir_dt.length-pw)); //filter with SMA
                            //Find local maxima and local minima.
                            if(this.isCriticalPoint(bt.drir_dt.slice(bt.drir_dt.length-pw),'valley')) {
                                bt.localmins.push({idx:coord.count-mid, val:bt.rir[coord.count-mid], t:us[coord.count-mid] });
                            }
                            else if(this.isCriticalPoint(bt.drir_dt.slice(bt.drir_dt.length-pw),'peak')) {
                                bt.localmaxs.push({idx:coord.count-mid, val:bt.rir[coord.count-mid], t:us[coord.count-mid] });
                            }

                            if(bt.localmins.length > 1 && bt.localmaxs.length > 1) {
                                
                                //Shouldn't be more than 2 extra samples on the end if we have the correct number of beats.
                                if(bt.localmins.length > bt.localmaxs.length+2) { while(bt.localmins.length > bt.localmaxs.length+2) { bt.localmins.splice(bt.localmins.length-2,1); } } //Keep the last detected max or min if excess detected
                                else if (bt.localmaxs.length > bt.localmins.length+2) { while(bt.localmaxs.length > bt.localmins.length+2) {bt.localmaxs.splice(bt.localmins.length-2,1); } }
                                
                                bt.peak_dists.push({dt:(bt.localmaxs[bt.localmaxs.length-1].t-bt.localmaxs[bt.localmaxs.length-2].t),t:bt.localmaxs[bt.localmaxs.length-1].t});
                                bt.val_dists.push({dt:(bt.localmins[bt.localmins.length-1].t-bt.localmins[bt.localmins.length-2].t),t:bt.localmins[bt.localmins.length-1].t});
                                //Found a peak and valley to average together (for accuracy)
                                if(bt.peak_dists.length > 1 && bt.val_dists.length > 1) {
                                    //Make sure you are using the leading valley
                                    if(bt.val_dists[bt.val_dists.length-1].t > bt.val_dists[bt.peak_dists.length-1].t) {
                                        if(bt.beats[bt.beats.length-1].t !== bt.peak_dists[bt.peak_dists.length-1].t)
                                            bt.beats.push({t:bt.peak_dists[bt.peak_dists.length-1].t,bpm:60*(bt.peak_dists[bt.peak_dists.length-1].dt + bt.val_dists[bt.val_dists.length-1].dt)/2000});
                                    } else {
                                        if(bt.beats[bt.beats.length-1].t !== bt.peak_dists[bt.peak_dists.length-2].t)
                                            bt.beats.push({t:bt.peak_dists[bt.peak_dists.length-2].t,bpm:60*(bt.peak_dists[bt.peak_dists.length-2].dt + bt.val_dists[bt.val_dists.length-1].dt)/2000});
                                    }
                                }
                                
                            }
                        }
                        if(bt.rir2.length>pw2) {
                            //Find local maxima and local minima.
                            if(this.isExtrema(bt.rir2.slice(bt.rir2.length-pw2),'valley')) {
                                bt.localmins2.push({idx:coord.count-mid2, val:bt.rir[coord.count-mid2], t:us[coord.count-mid2] });
                            }
                            else if(this.isExtrema(bt.rir2.slice(bt.rir2.length-pw2),'peak')) {
                                bt.localmaxs2.push({idx:coord.count-mid2, val:bt.rir[coord.count-mid2], t:us[coord.count-mid2] });
                            }

                            if(bt.localmins2.length > 1 && bt.localmaxs2.length > 1) {
                                
                                //Shouldn't be more than 2 extra samples on the end if we have the correct number of beats.
                                if(bt.localmins2.length > bt.localmaxs2.length+2) { while(bt.localmins2.length > bt.localmaxs2.length+2) { bt.localmins2.splice(bt.localmins2.length-2,1); } } //Keep the last detected max or min if excess detected
                                else if (bt.localmaxs.length > bt.localmins2.length+2) { while(bt.localmaxs2.length > bt.localmins2.length+2) {bt.localmaxs2.splice(bt.localmins2.length-2,1); } }
                                
                                bt.peak_dists2.push({dt:(bt.localmaxs2[bt.localmaxs2.length-1].t-bt.localmaxs2[bt.localmaxs2.length-2].t),t:bt.localmaxs2[bt.localmaxs2.length-1].t});
                                bt.val_dists2.push({dt:(bt.localmins2[bt.localmins2.length-1].t-bt.localmins2[bt.localmins2.length-2].t),t:bt.localmins2[bt.localmins2.length-1].t});
                                //Found a peak and valley to average together (for accuracy)
                                if(bt.peak_dists2.length > 1 && bt.val_dists2.length > 1) {
                                    //Make sure you are using the leading valley
                                    if(bt.val_dists2[bt.val_dists2.length-1].t > bt.val_dists2[bt.peak_dists2.length-1].t) {
                                        if(bt.breaths[bt.breaths.length-1].t !== bt.peak_dists2[bt.peak_dists2.length-1].t)
                                            bt.breaths.push({t:bt.peak_dists[bt.peak_dists2.length-1].t,bpm:60/(bt.peak_dists2[bt.peak_dists2.length-1].dt + bt.val_dists2[bt.val_dists2.length-1].dt)/2000});
                                    } else {
                                        if(bt.breaths[bt.breaths.length-1].t !== bt.peak_dists2[bt.peak_dists2.length-2].t)
                                            bt.breaths.push({t:bt.peak_dists2[bt.peak_dists2.length-2].t,bpm:60/(bt.peak_dists2[bt.peak_dists2.length-2].dt + bt.val_dists2[bt.val_dists2.length-1].dt)/2000});
                                    }
                                }
                                
                            }
                        }
                    }
                }
            } else {console.log("HEGDUINO: ", newline); }
        }
        if(this.mode === 'hegduinowifi' || this.mode === 'hegduinosse') {
            info.sps = 20; //20sps incoming rate fixed for wifi
            this.device = new hegduino('wifi',ondata,
            ()=>{
                if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.ondisconnect();});
        }
        else if (this.mode === 'hegduinobt' || this.mode === 'hegduinoble') {
            this.device= new hegduino('ble',ondata,
            ()=>{
                if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.ondisconnect();});
        }
        else if (this.mode === 'hegduinoserial' || this.mode === 'hegduinousb') {
            this.device= new hegduino('usb',ondata,
            ()=>{
                if(this.atlas.settings.analyzing !== true && info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.ondisconnect();});
        }

        
        if(pipeToAtlas === true) {
            let config = 'hegduino';
            this.atlas = new DataAtlas(
                location+":"+this.mode,
                {hegshared:{sps:info.sps}},
                config,false,true,
                info.analysis
                );

            info.deviceNum = this.atlas.data.heg.length-1;
            info.useAtlas = true;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            info.deviceNum = this.atlas.data.heg.length; 
            this.atlas.data.hegshared = {sps:info.sps};
            this.atlas.addHEGCoord(this.atlas.data.heg.length); 
            this.atlas.settings.heg = true;
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

    connect = () => {
        this.device.connect();
        this.setIndicator(true)
    }

    disconnect = () => {
        this.device.disconnect();
        this.setIndicator(false)

    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode=document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            return `
            <div id='`+id+`hegduinoControls'>
                <button id='`+id+`hegon'>On</button>
                <button id='`+id+`hegoff'>Off</button>
                <input id='`+id+`hegcmd' type='text' placeholder='R'></input><button id='`+id+`sendcmd'>Send</button>
            </div>
            `;
        }

        let setup = () => {
         
            document.getElementById(id+'hegon').onclick = () => {
                this.device.sendCommand('t');
            }
            document.getElementById(id+'hegoff').onclick = () => {
                this.device.sendCommand('f');
            }
            document.getElementById(id+'sendcmd').onclick = () => {
                this.device.sendCommand(elm(id+'hegcmd').value);
            }
        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
        
    }

}