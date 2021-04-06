//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import {BiquadChannelFilterer} from '../signal_analysis/BiquadFilters'
import {dataAtlas} from '../dataAtlas'
import {hegduino} from '../hegduino'
import {DOMFragment} from '../../frontend/utils/DOMFragment'

export class hegduinoPlugin {
    constructor(mode='hegduinousb', onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];
        this.ui = null;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
       
    }

    init = (info,pipeToAtlas) => {
		info.sps = Math.floor(2048/3);
        info.deviceType = 'heg';
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
                    } else { 
                        coord.times.push(Date.now()); //Microseconds = parseFloat(data[0]). We are using date.now() in ms to keep the UI usage normalized
                        coord.red.push(parseFloat(data[1]));
                        coord.ir.push(parseFloat(data[2]));
                        coord.ratio.push(parseFloat(data[3]));
                        coord.ambient.push(parseFloat(data[4]));
                        //ignore the rest for now
                    }
                }
            } else {console.log("HEGDUINO: ", newline); }
        }
        if(this.mode === 'hegduinowifi' || this.mode === 'hegduinosse') {
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
            this.atlas = new dataAtlas(
                location+":"+this.mode,
                {hegshared:{sps:info.sps}},
                config,true,true,
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
    }

    disconnect = () => {
        this.device.disconnect();
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