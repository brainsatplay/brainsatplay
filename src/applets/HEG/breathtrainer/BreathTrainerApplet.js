import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class BreathTrainerApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.canvas;
        this.ctx;

        this.mode = 'dvb'; //dvb, rlx, jmr, wmhf
        this.animation = 'sine'; //sine, circle;
        
        
        this.fs = 10;
        this.amplitudes = [];
        this.startTime = undefined;

        this.scaling = 10;
        this.animating = false;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the applet with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='${props.id}menu'>
                    <select id='${props.id}select'>
                        <option value='dvb' selected>Diaphragmatic</option>
                        <option value='rlx'>Relaxation</option>
                        <option value='jmr'>Jacobson's Muscular Relaxation</option>
                        <option value='wmhf'>Wim Hof Method</option>
                    </select>
                </div>
                <canvas id='${props.id}canvas' style='width:100%;height:100%;'></canvas>
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.canvas = document.getElementById(props.id+'canvas');
            this.ctx = this.canvas.getContext("2d");

            this.yscaling = this.canvas.height*0.2;
            this.xscaling = this.canvas.width*0.1;
            console.log(this.canvas)
            //console.log("gen amplitudes");
            this.genBreathingAmplitudes(this.mode);

            document.getElementById(props.id+'select').onchange = () => {
                this.genBreathingAmplitudes(document.getElementById(props.id+'select').value);
            }
            
            //console.log("drawing...")
            this.animating = true;
            this.animate();
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.


        //Add whatever else you need to initialize

    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.animating = false;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        this.canvas.width = this.AppletHTML.node.clientWidth*.5;
        this.canvas.height = this.AppletHTML.node.clientHeight*.5;
        this.yscaling = this.canvas.height*0.2;
        this.xscaling = this.canvas.width*0.1;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //Generate sinewave, you can add a noise frequency in too. Array length will be Math.ceil(fs*nSec)
	genSineWave(freq=20,peakAmp=1,nSec=1,fs=512,freq2=0,peakAmp2=1,offsetx=0,offsetx2=0){
		var sineWave = [];
		var t = [];
		var incscaled = 1/fs; //x-axis time incscaled based on sample rate
		for (var ti = 0; ti < nSec; ti+=incscaled){
			var amplitude = Math.sin(2*Math.PI*freq*(ti+offsetx))*peakAmp;
			amplitude += Math.sin(2*Math.PI*freq2*(ti+offsetx2))*peakAmp2; //Add interference
			sineWave.push(amplitude);
			t.push(ti);
		}
		return [t,sineWave]; // [[times],[amplitudes]]
	}

    genBreathingAmplitudes=(mode='dvb')=>{
        this.startTime = Date.now();
        let amplitudes = [];
        if(mode === 'dvb') {
            amplitudes = this.genSineWave(1/20,1,60,this.fs);
        } else if (mode === 'rlx') {
            let sine = this.genSineWave(1/28,1,7,this.fs,0,1,7);
            let sine2 = this.genSineWave(1/12,1,3,this.fs,0,1,3);
            let amps = [...sine[1],...sine2[1]];
            let t = new Array(amps.length).fill(0);
            t = t.map((x,i)=>{return i/this.fs;})
            amplitudes = [t, amps];
           
        } else if (mode === 'jmr') {
            amplitudes = this.genSineWave(1/24,1,24*3,this.fs);
        } else if (mode === 'wmhf') {
            let sine = this.genSineWave(0.5,1,30,this.fs,0,1,1);
            let sine2 = this.genSineWave(1/20,1,15,this.fs);
            let hold1 = new Array(this.fs*10).fill(-1);
            let sine3 = this.genSineWave(1/20,1,10,this.fs,0,1,15);
            let hold2 = new Array(this.fs*10).fill(1);
            let amps = [...sine[1],...sine2[1],...hold1,...sine3[1],...hold2];
            let t = new Array(amps.length).fill(0);
            t = t.map((x,i)=>{return i/this.fs;})
            amplitudes = [t,amps];
           
        }
        
        this.amplitudes = amplitudes;
                
        // this.x = [...this.amplitudes[0],...this.amplitudes[0].map((x)=> {return x+this.amplitudes[0][this.amplitudes[0].length-1]})];
        // this.y = [...this.amplitudes[1],...this.amplitudes[1]];

        // this.xi0=0;
        // this.xi1=this.x.length-1;
        // this.x.find((xn,i)=>{
        //     if(xn > this.canvas.width || i === this.xi1-1) {
        //         this.xi1 = i;
        //         return true;
        //     }
        // });

        // this.xDiff = undefined;

        // //console.log(amplitudes);
    }

    animate = () => {

        if(this.inc > this.amplitudes[0][this.amplitudes[0].length-1]) { this.startTime = Date.now(); }
        this.inc = 0.001*(Date.now() - this.startTime)
        //console.log(this.inc,this.x[this.x.length-1]);
        //console.log(this.inc,this.x[Math.floor(this.x.length*0.5)])
        if(this.animation === 'sine') {

            // //console.log('mapping');
            // let y=this.y.map((yn)=>{return this.yscaling*yn+this.canvas.height*0.5;});
            // let x=this.x.map((xn)=>{return this.xscaling*xn-this.incscaled;});

            // x.slice(this.xi0).find((xn,i)=>{
            //     if(xn < this.incscaled) {
            //         this.xi0 = i+this.xi0;
            //     } 
            //     if (this.xi0 > (Math.floor(x.length*0.5))+this.xDiff) {
            //         this.xi0 = 0;
            //         this.xi1 = this.xDiff;
            //         return true;
            //     }
            //     if(xn > this.canvas.width+this.incscaled+this.xscaling) {
            //         this.xi1 = i+this.xi0;
            //         if(!this.xDiff) this.xDiff = this.xi1-this.xi0;
            //         return true;
            //     }
            // });

            // console.log(this.xi0,this.xi1,x[0],this.inc,this.incscaled)
            // // if(this.xi0 > 0) {
            //     let xspliced = x.splice(1,this.xi0-1);
            //     x.push(...xspliced);
            //     let yspliced = y.splice(1,this.xi0-1);
            //     y.push(...yspliced);
            // }
            //console.log(x,y)

            //console.log([x[0],y[0]],[x[xi1],y[xi1]])
            //console.log("drawing");
            //this.ctx.fillStyle = 'black';
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            
            this.ctx.strokeStyle = 'royalblue';
            this.ctx.lineWidth = this.yscaling*0.2;
            this.ctx.beginPath();
            this.ctx.moveTo(x[0],y[0]);
            for(let i=1;i<this.xi1;i++){
                this.ctx.lineTo(x[i]-this.incscaled,y[i])
                this.ctx.stroke();
            }
            

        } else if(this.animation === 'circle') {

        }
        
        if(this.animating)
            setTimeout(()=>{requestAnimationFrame(this.animate)},15);

    }

   
} 
