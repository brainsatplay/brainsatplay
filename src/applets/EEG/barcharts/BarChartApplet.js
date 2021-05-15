import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import {eegBarChart, mirrorBarChart} from '../../../platform/js/frontend/UX/eegvisuals'
import {addChannelOptions, addCoherenceOptions} from '../../../platform/js/frontend/menus/selectTemplates'
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class BarChartApplet {
    

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

        //etc..
        this.chart = null;
        this.looping = false;
        this.loop = null;
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
                <div id='${props.id}menu' style='position:absolute;'>
                    <div>
                    <select id='${props.id}mode'>
                        <option value='single'>Single</option>
                        <option value='mirror'>Mirrored</option>
                    </select>
                    <select id='${props.id}channel'></select>
                    <select id='${props.id}channel2'></select>
                    </div>
                    <div>
                    <select id='${props.id}data'>
                        <option value='fft'>FFT</option>
                        <option value='bands'>Bands</option>
                        <option value='ratios'>Ratios</option>
                    </select></div>
                    <div id='${props.id}legend' style='background-color:rgba(0,0,0,0.3)'></div>
                </div>
                <canvas id='${props.id}canvas' style='width:100%;height:100%;'></canvas>
                <canvas id='${props.id}canvas2' style='display:none;width:49%;height:100%;'></canvas>
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            addChannelOptions(props.id+'channel', this.bci.atlas.data.eegshared.eegChannelTags, true);
            addChannelOptions(props.id+'channel2', this.bci.atlas.data.eegshared.eegChannelTags, true);
            document.getElementById(props.id+'channel2').style.display = 'none';
            document.getElementById(props.id+'mode').onchange = () => {
                let val = document.getElementById(props.id+'mode').value;
                this.chart.deInit();
                if (val === 'single') {
                    document.getElementById(props.id+'channel2').style.display = 'none';
                    document.getElementById(props.id+'canvas2').style.display = 'none';
                    document.getElementById(props.id+'canvas').style.width = '100%';
                    this.chart = new eegBarChart(props.id+'canvas');

                    let val2 = document.getElementById(props.id+'data').value;
                    if(val2 === 'fft') {
                        this.chart.showvalues = false;
                    }
                } else if (val === 'mirror') {
                    document.getElementById(props.id+'canvas').style.width = '49%';
                    document.getElementById(props.id+'canvas2').style.display = '';
                    document.getElementById(props.id+'channel2').style.display = '';
                    this.chart = new mirrorBarChart(props.id+'canvas',props.id+'canvas2');

                    let val2 = document.getElementById(props.id+'data').value;
                    if(val2 === 'fft') {
                        this.chart.leftbars.showvalues = false;
                        this.chart.rightbars.showvalues = false;
                    }
                }
                this.chart.init();
                this.responsive();
            }

            document.getElementById(props.id+'data').onchange = () => {
                this.setLegend();
                let val = document.getElementById(props.id+'data').value;
                let val2 = document.getElementById(props.id+'mode').value;
                if(val === 'fft') {
                    if(val2 === 'single'){
                        this.chart.showvalues = false;
                    }
                    else if (val2 === 'mirror') {
                        this.chart.leftbars.showvalues = false;
                        this.chart.rightbars.showvalues = false;
                    }
                }
                else {
                    if(val2 === 'single'){
                        this.chart.showvalues = true;
                    }
                    else if (val2 === 'mirror') {
                        this.chart.leftbars.showvalues = true;
                        this.chart.rightbars.showvalues = true;
                    }
                }
                this.chart.draw();
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
        this.chart = new eegBarChart(this.props.id+'canvas');
        this.chart.showvalues = false;
        this.chart.init();

        this.looping = true;
        this.setLegend();
        this.updateLoop();
        
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.chart.deInit();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if(this.bci.atlas.settings.eeg) {
            addChannelOptions(this.props.id+"channel", this.bci.atlas.data.eegshared.eegChannelTags, true);
            addChannelOptions(this.props.id+"channel2", this.bci.atlas.data.eegshared.eegChannelTags, true);
        }
        
        let graphmode = document.getElementById(this.props.id+'mode').value;
        if(graphmode === 'single') {
            document.getElementById(this.props.id+'canvas').width = this.AppletHTML.node.clientWidth;
            document.getElementById(this.props.id+'canvas').height = this.AppletHTML.node.clientHeight;
            document.getElementById(this.props.id+'canvas').style.width = this.AppletHTML.node.clientWidth;
            document.getElementById(this.props.id+'canvas').style.height = this.AppletHTML.node.clientHeight;
        } else {
            document.getElementById(this.props.id+'canvas').width = this.AppletHTML.node.clientWidth*0.49;
            document.getElementById(this.props.id+'canvas').height = this.AppletHTML.node.clientHeight;
            document.getElementById(this.props.id+'canvas2').width = this.AppletHTML.node.clientWidth*0.49;
            document.getElementById(this.props.id+'canvas2').height = this.AppletHTML.node.clientHeight;
            document.getElementById(this.props.id+'canvas').style.width = this.AppletHTML.node.clientWidth*0.49;
            document.getElementById(this.props.id+'canvas').style.height = this.AppletHTML.node.clientHeight;
            document.getElementById(this.props.id+'canvas2').style.width = this.AppletHTML.node.clientWidth*0.49;
            document.getElementById(this.props.id+'canvas2').style.height = this.AppletHTML.node.clientHeight;
        }
        this.chart.draw();
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    setLegend() {
        let legend = document.getElementById(this.props.id+'legend');
        if(document.getElementById(this.props.id+'data').value === 'ratios'){
            legend.innerHTML = `
                Ratios:<br>
                <span style='color:purple;'>Theta/Beta Ratio</span><br>
                <span style='color:blue;'>Alpha/Beta Ratio</span><br>
                <span style='color:chartreuse;'>Alpha2/Alpha1 Ratio</span><br>
            `;
        }
        else {
            legend.innerHTML = `
                Bands:<br>
                <span style='color:purple;'>SCP</span><br>
                <span style='color:violet;'>Delta</span><br>
                <span style='color:blue;'>Theta</span><br>
                <span style='color:green;'>Alpha 1</span><br>
                <span style='color:chartreuse;'>Alpha 2</span><br>
                <span style='color:gold;'>Beta</span><br>
                <span style='color:red;'>Low Gamma</span><br>
            `;
        }
    }


    //doSomething(){}
    updateLoop = () => {
        if(this.looping) {
            if(this.bci.atlas.settings.eeg && this.bci.atlas.settings.analyzing) { 
                this.updateChart();
            }
            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop)},16);
        }
    }

    updateChart = () => {
        let ch1 = document.getElementById(this.props.id+'channel').value;
        let dat = this.bci.atlas.getLatestFFTData(ch1)[0];
        let graphmode = document.getElementById(this.props.id+'mode').value;
        let datamode = document.getElementById(this.props.id+'data').value;
        if(dat.fftCount > 0) {
            if(graphmode === 'single') {
                if(datamode === 'fft') {
                    this.chart.slices = dat.slice;
                } else if (datamode === 'bands') {
                    this.chart.slices = dat.mean;
                } else if (datamode === 'ratios') {
                    let coord = this.bci.atlas.getEEGDataByChannel(ch1);
                    if(coord) {
                        let thetabeta = this.bci.atlas.getThetaBetaRatio(coord);
                        let alphabeta = this.bci.atlas.getAlphaBetaRatio(coord);
                        let alpha2_1 = this.bci.atlas.getAlphaRatio(coord);
                        this.chart.slices = { scp:thetabeta, theta:alphabeta, alpha1:alpha2_1 };
                    }
                }
            } else if (graphmode === 'mirror') {
                let ch2 = document.getElementById(this.props.id+'channel2').value;
                let dat2 = this.bci.atlas.getLatestFFTData(ch2)[0];
                if(datamode === 'fft') {
                    this.chart.leftbars.slices = dat.slice;
                    this.chart.rightbars.slices = dat2.slice;
                } else if (datamode === 'bands') {
                    this.chart.leftbars.slices = dat.mean;
                    this.chart.rightbars.slices = dat2.mean;
                } else if (datamode === 'ratios') {
                    let coord = this.bci.atlas.getEEGDataByChannel(ch1);
                    if(coord) {
                        let thetabeta = this.bci.atlas.getThetaBetaRatio(coord);
                        let alphabeta = this.bci.atlas.getAlphaBetaRatio(coord);
                        let alpha2_1 = this.bci.atlas.getAlphaRatio(coord);
                        this.chart.leftbars.slices = { scp:thetabeta, theta:alphabeta, alpha2:alpha2_1};
                    }
                    let coord2 = this.bci.atlas.getEEGDataByChannel(ch2);
                    if(coord2) {
                        let thetabeta2 = this.bci.atlas.getThetaBetaRatio(coord2);
                        let alphabeta2 = this.bci.atlas.getAlphaBetaRatio(coord2);
                        let alpha2_12 = this.bci.atlas.getAlphaRatio(coord2);
                        this.chart.rightbars.slices = { scp:thetabeta2, theta:alphabeta2, alpha2:alpha2_12 };
                    }
                }
            }
            this.chart.draw();
        }
    }
   
} 
