import {State} from '../frontend/State'
import { EEG, ATLAS, addChannelOptions, addCoherenceOptions } from '../frontend/EEGInterface';
import {eegBarChart} from '../utils/visuals/eegvisuals'
import {DOMFragment} from '../frontend/DOMFragment'

//You can extend or call this class and set renderProps and these functions
export class BarChartApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML
            width: "300px",
            height: "500px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class = null;
        this.mode = "bars";
        this.sub = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <canvas id='`+props.id+`canvas'style='position:absolute; width:`+props.width+`px; height:`+props.height+`px;'></canvas>
            Mode:
            <div id='`+props.id+`menu'>
                <select id='`+props.id+`mode'>
                    <option value="Bandpowers"></option>
                    <option value="Coherence"></option>
                </select>
                Channel
                <select id='`+props.id+`channel'>
                <option value="0" selected="selected">0</option>
                </select>
            </div>
        </div>
        `;
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        addChannelOptions(this.renderProps.id+"channel");

        document.getElementById(this.renderProps.id+"mode").onchange = () => {
            var val = document.getElementById(this.renderProps.id+"mode").value;
            if(val === "Bandpowers"){
                addChannelOptions(this.renderProps.id+"channel1");
            }
            else {
                addCoherenceOptions(this.renderProps.id+"channel1");
            }
        }
    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML()},undefined,"NEVER"); //Changes to this.props will automatically update the html template
        this.class = new eegBarChart(this.renderProps.id+"canvas",1000);
        this.class.init();
        this.sub = State.subscribe('FFTResult',()=>{try{this.onUpdate();}catch(e){console.error(e);}});
    }

    
    configure(newsettings=this.settings) { //Expects an array []
        this.settings=newsettings;
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //Destroy applet. Keep this one line
    deInit() {
        State.unsubscribe('FFTResult',this.sub);
        this.class.deInit();
        this.class = null;
        this.AppletHTML.deleteNode();
    }

    //Callback for when the window resizes. This gets called by the UIManager class to help resize canvases etc.
    onResize() {
        this.class.canvas.style.width = this.AppletHTML.node.style.width;
        this.class.canvas.style.height = this.AppletHTML.node.style.height;
        this.class.canvas.width = this.AppletHTML.node.clientWidth;
        this.class.canvas.height = this.AppletHTML.node.clientHeight;
    }

    //------------ add new functions below ---------------

    onUpdate = () => {
        var ch = parseInt(document.getElementById(this.renderProps.id+"channel").value);
        var tag = null;
        if(document.getElementById(this.renderProps.id+"mode").value === "Bandpowers"){
            ATLAS.channelTags.find((o,i) => {
                if(o.ch === ch){
                tag = o.tag;
                return true;
                }
            });
            if(tag !== null){
                var coord = ATLAS.getAtlasCoordByTag(tag);
                this.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length-1].slice(State.data.fftViewStart,State.data.fftViewEnd);
            }
        }
        else {
            ATLAS.coherenceMap.map.find((o,i) => {
                if(o.tag === ch){
                tag = o.tag;
                return true;
                }
            });
            if(tag !== null){
                var coord = ATLAS.getAtlasCoherenceCoordByTag(tag);
                this.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length-1].slice(State.data.fftViewStart,State.data.fftViewEnd);
            }
        }
    }
}