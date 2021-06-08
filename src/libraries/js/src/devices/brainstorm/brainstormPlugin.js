//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../utils/BiquadFilters'

import { brainflow } from './brainflow.js'

export class brainstormPlugin {
    constructor(mode, session, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;
        this.session = session;
        this.subscription;

        this.dataHandlers = {
            brainflow: brainflow
        }

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;
    }

    init = async (info,pipeToAtlas) => {
        
        this.info = info;
        return new Promise((resolve, reject) => {
            let onAuth = () => {
                this.session.createBrainstormBrowser(document.body,(userData)=>{
                this.subscription = userData
                this.setupAtlas(info,pipeToAtlas);
                resolve(true)
            })
        }
            if (!this.session.info.auth.connected){
                this.session.promptLogin(document.body,()=>{},onAuth)
            } else {
                onAuth()
            }
        });
    }

    connect = async () => {

        // Set Loop to Grab Data
        let animate = () => {

            // Grab Data
            let data = this.session.getBrainstormData(this.subscription.username,'user')
            if(this.info.useAtlas) {
                if (data.length > 0){
                    data.forEach(d => {
                        this.dataHandlers[d.format](this,d)
                    })
                }
            }
            this.animation = requestAnimationFrame(animate)
        }

        animate()

        this.atlas.settings.deviceConnected = true;

        this.atlas.data.eegshared.startTime = Date.now();
        this.atlas.settings.deviceConnected = true;
        if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
            this.atlas.settings.analyzing = true;
            setTimeout(() => {this.atlas.analyzer();},1200);		
        }

       this.onconnect();
    }

    disconnect = () => {
        this.ondisconnect();
        if (this.ui) this.ui.deleteNode()
        this.session.unsubscribeFromUser(this.subscription.username)
        window.cancelAnimationFrame(this.animation)
        this.atlas.settings.deviceConnected = false;
    }

    setupAtlas = (info,pipeToAtlas) => {

         info.sps = this.subscription.props.sps
         info.deviceType = this.subscription.props.deviceType
         info.eegChannelTags = this.subscription.props.eegChannelTags

         console.log(info.eegChannelTags)
 
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