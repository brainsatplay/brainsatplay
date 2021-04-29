import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import {eegBarChart, mirrorBarChart} from '../../../frontend/UX/eegvisuals'
import {addChannelOptions,addCoherenceOptions} from '../../../frontend/menus/selectTemplates'

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
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        //etc..
        this.chart = null;
        this.mode = 'single'; //single, mirror
        this.looping = false;
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
                    <select id='${props.id}mode'>
                        <option value='single'>Single</option>
                        <option value='mirror'>Mirrored</option>
                    </select>
                    <select id='${props.id}channel'></select>
                    <select id='${props.id}channel2'></select>
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
                    document.getElementById(props.id+'canvas').style.display = 'none';
                    document.getElementById(props.id+'channel2').style.display = 'none';
                    document.getElementById(props.id+'canvas').style.width = '100%';
                    this.chart = new eegBarChart(props.id+'canvas');
                } else if (val === 'mirror') {
                    document.getElementById(props.id+'canvas').style.width = '49%';
                    document.getElementById(props.id+'canvas').style.display = '';
                    document.getElementById(props.id+'channel2').style.display = '';
                    this.chart = new mirrorBarChart(props.id+'canvas',props.id+'canvas2');
                }
                this.chart.init();
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
        this.chart = new eegBarChart(this.props.id+'canvas',200);
        this.chart.init();

        this.looping = true;
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
            document.getElementById(this.props.id+"mode").onchange();
        }
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}
    updateLoop = () => {
        if(this.looping) {
            if(this.bci.atlas.settings.eeg && this.bci.atlas.settings.analyzing) { 
                let ch1 = document.getElementById(this.props.id+'channel').value;
                let dat = this.bci.atlas.getLatestFFTData(ch1)[0];
                if(dat.fftCount > 0) {
                    if(this.mode === 'single') {
                        this.chart.slices = dat.slice;
                        this.chart.fftArr = dat.fft;
                    } else if (this.mode === 'mirror') {
                        let ch2 = document.getElementById(this.props.id+'channel2').value;
                        this.chart.leftbars.slices = dat.slice;
                        this.chart.leftbars.fftArr = dat.fft;
                        let dat2 = this.bci.atlas.getLatestFFTData(ch2)[0];
                        this.chart.rightbars.slices = dat2.slice;
                        this.chart.rightbars.fftArr = dat2.fft;
                    }
                    this.chart.draw();
                }
            }
            setTimeout(()=>{requestAnimationFrame(this.updateLoop)},16);
        }
    }
   
} 