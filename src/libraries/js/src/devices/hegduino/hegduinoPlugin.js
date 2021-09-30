//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../../utils/signal_processing/BiquadFilters'
import {DataAtlas} from '../../DataAtlas'
import {hegduino} from './hegduino'
import {DOMFragment} from '../../ui/DOMFragment'

export class hegduinoPlugin {
    constructor(mode='hegduino_usb', onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
        this.filtering = false;
        this.ui = null;

        this.refuS = 0;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    	//Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)

    mean(arr){
        var sum = arr.reduce((prev,curr)=> curr += prev);
        return sum / arr.length;
    }

    init = async (info,pipeToAtlas) => {

        this.info = info
		this.info.sps = 32;
        this.info.deviceType = 'heg';

        let ondata = (newline) => {
            if(newline.indexOf("|") > -1) {
                let data = newline.split("|");
                //console.log(data);
                if(data.length > 3) {
                    let coord = this.atlas.data.heg[this.info.deviceNum];
                    coord.count++;
                    if(coord.count === 1) { coord.startTime = Date.now(); }
                    if(this.device.mode === 'ble' && this.device.interface.android === true) {
                        coord.times.push(Date.now());
                        if(!this.filtering){
                            coord.red.push(parseFloat(data[0]));
                            coord.ir.push(parseFloat(data[1]));
                            coord.ratio.push(parseFloat(data[2]));
                        } else{
                            coord.red.push(this.filters[0].applyFilter(parseFloat(data[0])));
                            coord.ir.push(this.filters[1].applyFilter(parseFloat(data[1])));
                            coord.ratio.push(this.filters[2].applyFilter(parseFloat(data[2])));
                        }
                        //ignore the rest for now
                    } else { 
                        if(coord.times.length === 0) {coord.times.push(Date.now()); this.refuS = parseFloat(data[0]);} //Microseconds = parseFloat(data[0]). We are using date.now() in ms to keep the UI usage normalized
                        else {
                            let t = parseFloat(data[0]);
                            coord.times.push(Math.floor(coord.times[coord.times.length-1]+(t-this.refuS)*0.001))
                            this.refuS = t; //keep times synchronous
                        }
                        if(!this.filtering){
                            coord.red.push(parseFloat(data[1]));
                            coord.ir.push(parseFloat(data[2]));
                            coord.ratio.push(parseFloat(data[3]));
                            coord.ambient.push(parseFloat(data[4]));
                            coord.temp.push(parseFloat(data[5])); // temp is on new firmware
                        } else {
                            coord.red.push(this.filters[0].applyFilter(parseFloat(data[1])));
                            coord.ir.push(this.filters[1].applyFilter(parseFloat(data[2])));
                            coord.ratio.push(this.filters[2].applyFilter(parseFloat(data[3])));
                            coord.ambient.push(this.filters[3].applyFilter(parseFloat(data[4])));
                            coord.temp.push(parseFloat(data[5])); // temp is on new firmware
                        }
                        //ignore the rest for now
                    }

                    //Simple beat detection. For breathing detection applying a ~3 second moving average and peak finding should work
                    this.atlas.beatDetection(coord, this.info.sps);
                }
            } else {console.log("HEGDUINO: ", newline); }
        }

        if(this.mode === 'hegduino_wifi' || this.mode === 'hegduino_sse') {
            this.info.sps = 20; //20sps incoming rate fixed for wifi
            this.device = new hegduino('wifi',ondata,
            ()=>{
                this.setupAtlas(pipeToAtlas);
                if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.atlas.settings.deviceConnected = true;
                this.device.sendCommand('t');
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.atlas.settings.deviceConnected = false; this.ondisconnect();});
        }
        else if (this.mode === 'hegduino_Bluetooth') {
            this.device= new hegduino('ble',ondata,
            ()=>{
                this.setupAtlas(pipeToAtlas);
                if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.atlas.settings.deviceConnected = true;
                this.device.sendCommand('t');
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.atlas.settings.deviceConnected = false; this.ondisconnect();});
        }
        else if (this.mode === 'hegduino_USB') {
            this.device= new hegduino('usb',ondata,
            ()=>{
                this.setupAtlas(pipeToAtlas);
                if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                    this.atlas.settings.analyzing = true;
                    setTimeout(() => {this.atlas.analyzer();},1200);		
                }
                this.atlas.settings.deviceConnected = true;
                this.device.sendCommand('t');
                this.onconnect();
            },
            ()=>{ this.atlas.settings.analyzing = false; this.atlas.settings.deviceConnected = false; this.ondisconnect();});
        }
    }

    setupAtlas = (pipeToAtlas) => {

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

    connect = async () => {
        await this.device.connect();
    }

    disconnect = () => {
        this.device.disconnect();
        if (this.ui) this.ui.deleteNode()
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode=document.body) => {
        let id = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        let template = () => {
            let t = `
            <br>
            <div id='`+id+`hegduinoControls'>
                <h3>Control Panel</h3>
                <hr>
                <button id='`+id+`hegon'>On</button>
                <button id='`+id+`hegoff'>Off</button>
                <input id='`+id+`hegcmd' type='text' placeholder='R'></input><button id='`+id+`sendcmd'>Send</button>
                Add Digital Filters:<input id='`+id+`filter' type='checkbox'></input>
            `;
            if(this.mode === 'hegduino_ble') {
                t+= `
                <button id='`+id+`hegupdate'>Update Firmware (.bin)</button>
                </div>
                `;
            }
            else { t+=`</div>`;}
            
            return t;
        }

        let setup = () => {
         
            document.getElementById(id+'hegon').onclick = () => {
                this.device.sendCommand('t');
            }
            document.getElementById(id+'hegoff').onclick = () => {
                this.device.sendCommand('f');
            }
            document.getElementById(id+'sendcmd').onclick = () => {
                this.device.sendCommand(document.getElementById(id+'hegcmd').value);
            }
            if(this.mode === 'hegduino_ble') {
                document.getElementById(id+'hegupdate').onclick = () => {
                    this.device.getFile(); //testing
                }
            }

            document.getElementById(id+'filter').onchange = () => {
                this.filters.forEach((filter)=>{
                    if(filter.filtering) filter.filtering = false;
                    else filter.filtering = true;
                })
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