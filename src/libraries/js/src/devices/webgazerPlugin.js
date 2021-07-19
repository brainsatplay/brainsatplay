//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../ui/DOMFragment';
import {DataAtlas} from '../DataAtlas'
import {BiquadChannelFilterer} from '../utils/BiquadFilters'
import { TorusGeometry } from 'three';

export class webgazerPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.info;

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        this.states = {
            'blink_left': {data: false, meta: {id:'blink_left'}},
            'blink_right': {data: false, meta: {id:'blink_right'}}
        }


        this.blinkBuffers = {
            left: [],
            right: []
        }

        this.maxBufferLength = 150
        this.blinkThreshold = 1.1
        this.lastBlink = {
            right: Date.now(),
            left: Date.now()
        }
        this.blinkDuration = 400 // ms
        this.startCalculating = true
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


    // From https://gist.github.com/kleysonr/d75494f239ad0dce561a55a624920693
    euclidean_dist (x1, y1, x2, y2) {
        return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
    };


    startWebgazer(webgazer){
        webgazer.setGazeListener((data,elapsedTime) => {
            if(data == null) return  
            
            for (let side in data.eyeFeatures){
                let aspect = data.eyeFeatures[side].width / data.eyeFeatures[side].height

                // Only Calculate after Delay AND When Buffer is Full
                if (Date.now() - this.lastBlink[side] > this.blinkDuration && this.startCalculating){
                    let mean = this.atlas.mean(this.blinkBuffers[side])
                    this.states[`blink_${side}`].data = aspect > this.blinkThreshold*mean
                    if (this.states[`blink_${side}`].data) console.log(`blink ${side}`)
                    this.lastBlink[side] = Date.now()
                } else this.states[`blink_${side}`].data = false

                this.blinkBuffers[side].push(aspect)
                if (this.blinkBuffers[side].length > this.maxBufferLength) {
                    this.blinkBuffers[side].shift()
                    this.startCalculating = true
                }
            }
            
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

        console.log('loading webgazer')
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