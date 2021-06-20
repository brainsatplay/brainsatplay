//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../ui/DOMFragment';
import {DataAtlas} from '../DataAtlas'
import {BiquadChannelFilterer} from '../utils/BiquadFilters'
// import webgazer from 'webgazer'
// import './webgazer'
// console.log(webgazer)

export class webgazerPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.info;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        window.onkeypress = () => {
            var prediction = this.device.getCurrentPrediction();
            console.log(prediction)
            if (prediction) {
                var x = prediction.x;
                var y = prediction.y;
                console.log(x,y)
            }
        }


    }

    handleScriptLoad= async(onload)=> {    

        // Set Webgazer Settings
        this.startWebgazer(webgazer)
        webgazer.showVideo(true)
        webgazer.showFaceOverlay(true)
        webgazer.showFaceFeedbackBox(true)
        webgazer.showPredictionPoints(true)
        webgazer.setRegression('weightedRidge')
        this.checkWebGazerLoaded(onload)
    }

    checkWebGazerLoaded = (onload) => {
        this.interval = setInterval(() => {
            if(webgazer.isReady()) {
                clearInterval(this.interval)
                this.device = webgazer
                onload()
            }
            else {
                console.log('webgazer not loaded ____')
            }
            
        },1000)
    }

    init = async (info,pipeToAtlas) => {
        info.deviceType = 'eyetracker';

        this._onConnected = () => {
            this.setupAtlas(info,pipeToAtlas);
        }

        this.info = info;
    }

    setupAtlas = (info,pipeToAtlas) => {
        if(pipeToAtlas === true) {
            let config = 'eyetracker';
			
            this.atlas = new DataAtlas(
                location+":"+this.mode,
                undefined,
                config,
                );

            info.deviceNum = this.atlas.data.heg.length-1;
            info.useAtlas = true;
            info.deviceNum = this.atlas.data.eyetracker.length-1;
            
        } else if (typeof pipeToAtlas === 'object') {
            this.atlas = pipeToAtlas; //External atlas reference
            info.deviceNum = this.atlas.data.eyetracker.length; 
            this.atlas.addEyeTracker(this.atlas.data.eyetracker.length); 
            this.atlas.settings.eyetracker = true;
            info.useAtlas = true;
        }

    }

    _onConnected = () => {} //for internal use only on init


    startWebgazer(webgazer){
        webgazer.setGazeListener((data,elapsedTime) => {
            console.log('eyes', data)
            if(data == null) {
                return;
            }
            let x = data.x;
            let y = data.y;
            console.log(x,y)
            if(this.info.useAtlas === true) {
                let o = this.atlas.data.eyetracker[this.info.deviceNum];
                if(o.times.length === 0) { o.startTime = Date.now(); }
                o.times.push(Date.now());
                o.x.push(data.x);
                o.y.push(data.y);
                if(o.x.length > 10) { //10 sample moving average (to smooth things out)
                    o.smax.push(o.x.slice(o.x.length-10).reduce((a,b) => a+b)/10);
                    o.smay.push(o.y.slice(o.y.length-10).reduce((a,b) => a+b)/10);
                }
                else {
                    o.smax.push(o.x.slice(0).reduce((a,b) => a+b)/o.x.length);
                    o.smay.push(o.y.slice(0).reduce((a,b) => a+b)/o.y.length);
                }
            }
        }).begin();
    }


    connect = async () => {
        
        return new Promise((resolve, reject) => {

        this._onConnected(); // Create atlas

        // Create a callback to throw when Webgazer has loaded
        let onload = () => {
            console.log('loaded')
            this.atlas.settings.deviceConnected = true;
            let video = document.getElementById('webgazerVideoContainer')
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = 'auto';
            video.style.right = '100px';
            video.style.zIndex = '1000';
            video.style.width = '200px';
            video.style.height = '200px';


            this.onconnect();
            resolve(true)
        }

        // Import Webgazer as a script
        const script = document.createElement("script");
        script.src = "https://webgazer.cs.brown.edu/webgazer.js"
        script.async = true;

        console.log('luading webgazer')
        script.onload = () => {
            console.log('script loaded')
            this.handleScriptLoad(onload);
        }
        document.body.appendChild(script);
    })
    }

    disconnect = () => {
        if (this.ui) this.ui.deleteNode()
        this.device.end();
        this.atlas.settings.deviceConnected = false;
        this.ondisconnect();
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