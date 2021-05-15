import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import { SmoothieChartMaker } from '../../../platform/js/frontend/UX/eegvisuals';
import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class PulseMonitorApplet {


    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.looping = false;
        this.loop = null;
        this.breathCounter = 0;
        this.beatCounter = 0;

        this.charts = [];

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='${props.id}menu' style='position:absolute; height:100%; width:100%; font-size:12px;'>
                    Mode:
                    <select id='`+props.id+`mode'>
                        <option value="raw">HEG Ratio</option>
                        <option value="pulse">Pulse Rate</option>
                        <option value="breath">Breathing</option>
                        <option value="feedback">Feedback Vars</option>
                    </select>
                    <div id='`+props.id+`legend'></div>
                    <table style='position:absolute; bottom:10px; font-size:10px'>
                        <tr><td>Heart Rate Estimate:     </td><td><span id='${props.id}hr' style=' color:aqua;'>Waiting</span></td></tr>
                        <tr><td>Breathing Rate Estimate: </td><td><span id='${props.id}br' style=' color:aqua;'>Waiting</span></td></tr>
                    </table>
                </div>
                <div id='`+props.id+`canvascontainer' style='width:100%; height:100%;'>
                  <canvas id='`+props.id+`canvas1' width='100%' height='33%' style='z-index:3; width:100%; height:33%;'></canvas>
                  <canvas id='`+props.id+`canvas2' width='100%' height='33%' style='z-index:3; width:100%; height:33%;'></canvas>
                  <canvas id='`+props.id+`canvas3' width='100%' height='32%' style='z-index:3; width:100%; height:32%;'></canvas>
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.charts[0] = new SmoothieChartMaker(1,document.getElementById(props.id+"canvas1"));
            this.charts[1] = new SmoothieChartMaker(1,document.getElementById(props.id+"canvas2"));
            this.charts[2] = new SmoothieChartMaker(1,document.getElementById(props.id+"canvas3"));
            this.charts[0].init('rgba(100,0,100,0.3)',undefined,undefined,'orangered');
            this.charts[1].init('rgba(50,0,100,0.3)',undefined,undefined,'lightgreen','rgba(0,255,0,0.1)');
            this.charts[2].init('rgba(100,0,50,0.3)',undefined,undefined,'yellow','rgba(255,255,0,0.2)');
            this.setLegend();

            document.getElementById(props.id+"mode").onchange = () => {
                this.charts.forEach((chart) => {chart.series.forEach((series)=> {
                    series.clear();
                });});
                let val = document.getElementById(props.id+"mode").value;
                if (val === "raw") {

                } else if (val === "pulse") {

                } else if (val === "breath") {

                } else if (val === "feedback") {

                }
                this.setLegend();
            }

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
        this.looping = true;
        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {

    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    updateLoop = () => {
        if(this.looping) {
            if(this.bci.atlas.settings.heg) {
                this.onUpdate();
            }
            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop),16});
        }
    }

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    onUpdate = () => {
        let heg = this.bci.atlas.data.heg[0];
        if(heg) {
            let val = document.getElementById(this.props.id+"mode").value;
            let hr = heg.beat_detect.beats;
            let breaths = heg.beat_detect.breaths;

            if(hr.length > this.beatCounter) {
                this.beatCounter = hr.length;
                let bpm = hr[hr.length-1].bpm;
                let hrv =  hr[hr.length-1].hrv;
                let span = document.getElementById(this.props.id+'hr');
                span.innerHTML = bpm.toFixed(2);
                if(bpm < 30 || bpm > 200) { span.style.color = 'yellow'; } else if (span.style.color !== 'aqua') { span.style.color = 'aqua'; }
                console.log(bpm, hr[hr.length-1]);
                if(val === 'pulse') {
                    this.charts[1].series[0].append(Date.now(),bpm);
                    this.charts[2].series[0].append(Date.now(),hrv);
                } else if (val === "feedback") {
                    this.charts[1].series[0].append(Date.now(),hrv);
                }
            }
            if(breaths.length > this.breathCounter) {
                this.breathCounter = breaths.length;
                let bpm = breaths[breaths.length-1].bpm;
                let brv =  breaths[breaths.length-1].brv;
                let span = document.getElementById(this.props.id+'br');
                span.innerHTML = bpm.toFixed(2);
                if(bpm < 4.5 || bpm > 20) { span.style.color = 'yellow'; } else if (span.style.color !== 'aqua') { span.style.color = 'aqua'; }
                console.log(bpm, breaths[breaths.length-1]);
                if(val === 'breath') {
                    this.charts[1].series[0].append(Date.now(),bpm);
                    this.charts[2].series[0].append(Date.now(),brv);
                } else if (val === "feedback") {
                    this.charts[2].series[0].append(Date.now(),brv);
                }
            }

            if(val === "pulse") {
                this.charts[0].series[0].append(Date.now(),heg.beat_detect.rir[heg.beat_detect.rir.length-1]);
            } else if (val === "breath") {
                this.charts[0].series[0].append(Date.now(),heg.beat_detect.rir2[heg.beat_detect.rir2.length-1]);
            } else if (val === "raw") {
                this.charts[0].series[0].append(Date.now(),heg.red[heg.red.length-1]);
                this.charts[1].series[0].append(Date.now(),heg.ir[heg.ir.length-1]);
                let meanratio = heg.ratio[heg.ratio.length-1];
                if(heg.count > 40) meanratio = this.mean(heg.ratio.slice(heg.ratio.length-40));
                else if(heg.count > 1) meanratio = this.mean(heg.ratio);
                else meanratio = heg.ratio[heg.ratio.length-1];
                this.charts[2].series[0].append(Date.now(),meanratio);
            } else if (val === "feedback") {
                let meanratio;
                if(heg.count > 40) meanratio = this.mean(heg.ratio.slice(heg.ratio.length-40));
                else if(heg.count > 1) meanratio = this.mean(heg.ratio);
                else meanratio = heg.ratio[heg.ratio.length-1];
                this.charts[0].series[0].append(Date.now(),meanratio);  
            }


        }
    }

    setLegend = () => {
        let val = document.getElementById(this.props.id+"mode").value;
        let htmlToAppend = `Legend:<br>`;
        if (val === "raw") {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[0]+`'>Red</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[1].seriesColors[0]+`'>Infrared</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[2].seriesColors[0]+`'>Ratio R/IR</div>`;
        } else if (val === "pulse") {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[0]+`'>R + IR Smoothed</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[1].seriesColors[0]+`'>Beats per Minute (BPM)</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[2].seriesColors[0]+`'>Heart Rate Variability (HRV)</div>`;
        } else if (val === "breath") {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[0]+`'>R + IR Smoothed</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[1].seriesColors[0]+`'>Breaths per Minute (BPM)</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[2].seriesColors[0]+`'>Breathing Rate Variability (BRV)</div>`;
        } else if (val === "feedback") {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[0]+`'>Ratio</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[1].seriesColors[0]+`'>Heart Rate Variability (HRV)</div>`;
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[2].seriesColors[0]+`'>Breathing Rate Variability (BRV)</div>`;
        }
        document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
    }   

   
} 
