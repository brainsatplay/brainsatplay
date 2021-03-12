import {State} from '../frontend/State'
import {EEG, ATLAS} from '../frontend/EEGInterface'
import {DOMFragment} from '../frontend/DOMFragment'
import { TimeChartMaker } from '../utils/visuals/eegvisuals';

//You can extend or call this class and set renderProps and these functions
export class TimeChartsApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML
            width: "100px",
            height: "100px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class = null;
        this.mode = "timechart";
        this.sub = null;

        this.loop = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <div id='`+props.id+`charts'></div>
        </div>
        `;
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        document.getElementById("runbutton").addEventListener('click',()=>{
            if(this.loop === null) { this.updateLoop(); }
        });
        document.getElementById("stopbutton").addEventListener('click',()=>{
            this.cancelLoop();
        });
    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML()}); //Changes to this.props will automatically update the html template
        this.class = new TimeChartMaker(this.renderProps.id+'charts', 30000);
        this.class.setEEGTimeCharts(EEG, ATLAS, 10);
    }

    
    configure(newsettings=this.settings) { //Expects an array []
        this.settings=newsettings;
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //Destroy applet. Keep this one line
    deInit() {
        this.AppletHTML.deleteNode();
    }

    //Callback for when the window resizes. This gets called by the UIManager class to help resize canvases etc.
    onResize() {
        document.getElementById(this.renderProps.id+'charts').style.width = this.AppletHTML.node.style.width;
        document.getElementById(this.renderProps.id+'charts').style.height = this.AppletHTML.node.style.height;
    }

    //------------ add new functions below ---------------

    updateLoop = () => {
        this.onUpdate();
        this.loop = requestAnimationFrame(this.updateLoop);
    }

    onUpdate = () => {
        this.class.updateTimeCharts(EEG, ATLAS);
    }

    cancelLoop = () => {
        cancelAnimationFrame(this.loop);
        this.loop = null;
    }

}