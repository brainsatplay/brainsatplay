import { addChannelOptions, addCoherenceOptions, ATLAS } from '../frontend/EEGInterface';
import {State} from '../frontend/State'
import {DOMFragment} from '../frontend/DOMFragment'
import { mirrorBarChart } from '../utils/visuals/eegvisuals';

//You can extend or call this class and set renderProps and these functions
export class MirrorBarsApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML. 
            width: "100px",
            height: "100px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class = null;
        this.mode = "mirroredbars";
        this.sub = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <div id='`+props.id+`visuals' style='position:absolute;width:`+props.width+`px; height:`+props.height+`px;'>
                <canvas id='`+props.id+`leftbars' style='width:`+(props.width*.5)+`px; height:`+props.height+`px;'></canvas>
                <canvas id='`+props.id+`rightbars' style='width:`+(props.width)*.5+`px; height:`+props.height+`px;'></canvas>
            </div>
            <div id='`+props.id+`menu'>
                Mode:
                <select id='`+props.id+`mode'>
                    <option value="Bandpowers"></option>
                    <option value="Coherence"></option>
                </select>
                Channel 1
                <select id='`+props.id+`channel1'>
                    <option value="0" selected="selected">0</option>
                    <option value="1">1</option>
                </select>
                Channel 2
                <select id='`+props.id+`channel2'>
                    <option value="0">0</option>
                    <option value="1" selected="selected">1</option>
                </select>
            </div>
        </div>
        `;
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        addChannelOptions(this.renderProps.id+"channel1");
        addChannelOptions(this.renderProps.id+"channel2");

        document.getElementById(this.renderProps.id+"mode").onchange = () => {
            var val = document.getElementById(this.renderProps.id+"mode").value;
            if(val === "Bandpowers"){
                addChannelOptions(this.renderProps.id+"channel1");
                addChannelOptions(this.renderProps.id+"channel2");
            }
            else {
                addCoherenceOptions(this.renderProps.id+"channel1");
                addCoherenceOptions(this.renderProps.id+"channel2");
            }
        }

    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML();},undefined,"NEVER"); //Changes to this.props will automatically update the html template if interval not set to null or "NEVER". Use "FRAMERATE" for framerate level updating
        this.class = new mirrorBarChart(this.renderProps.id+"visuals",this.renderProps.id+"leftbars", this.renderProps.id+"rightbars",1000);
        this.class.init();

        this.sub = State.subscribe('FFTResult',()=>{try{this.onUpdate()}catch(e){console.error(e);}});
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
        this.class.leftbars.canvas.style.width = this.AppletHTML.node.style.width*.5;
        this.class.leftbars.canvas.style.height = this.AppletHTML.node.style.height;
        this.class.rightbars.canvas.style.width = this.AppletHTML.node.style.width*.5;
        this.class.rightbars.canvas.style.height = this.AppletHTML.node.style.height;
        
        this.class.leftbars.width = this.AppletHTML.node.clientWidth*.5;
        this.class.leftbars.height = this.AppletHTML.node.clientHeight;
        
        this.class.rightbars.width = this.AppletHTML.node.clientWidth*.5;
        this.class.rightbars.height = this.AppletHTML.node.clientHeight;
    }

    //------------ add new functions below ---------------

    onUpdate = () => {
        var ch1 = parseInt(document.getElementById(this.renderProps.id+"channel1").value);
        var ch2 = parseInt(document.getElementById(this.renderProps.id+"channel2").value);
        var tag1 = null;
        var tag2 = null;
        if(document.getElementById(this.renderProps.id+"mode").value === "Bandpowers"){
            ATLAS.channelTags.find((o,i) => {
                if(o.ch === ch1){
                    tag1 = o.tag;
                    return true;
                }
            });
            ATLAS.channelTags.find((o,i) => {
                if(o.ch === ch2){
                    tag2 = o.tag;
                    return true;
                }
            });
            var coord1, coord2;
            if(tag1 !== null){
                coord1 = ATLAS.getAtlasCoordByTag(tag1);
                if(tag2 !== null){
                    coord2 = ATLAS.getAtlasCoordByTag(tag2);
                    this.class.updateCharts(coord1.data.slices[coord1.data.slices.length-1],coord2.data.slices[coord2.data.slices.length-1]);
                }
            }
        }
        else if(document.getElementById(this.renderProps.id+"mode").value === "Coherence"){ 
            ATLAS.coherenceMap.map.find((o,i) => {
                if(o.tag === ch1){
                    tag1 = o.tag;
                    return true;
                }
            });
            ATLAS.coherenceMap.map.find((o,i) => {
                if(o.tag === ch2){
                    tag2 = o.tag;
                    return true;
                }
            });
            if(tag1 !== null){
                coord1 = ATLAS.getAtlasCoherenceCoordByTag(tag1);
                if(tag2 !== null){
                    coord2 = ATLAS.getAtlasCoherenceCoordByTag(tag2);
                    this.class.updateCharts(coord1.data.slices[coord1.data.slices.length-1],coord2.data.slices[coord2.data.slices.length-1]);
                }
            }
        }
    }
}