import {State} from '../frontend/State'
import {EEG, ATLAS, genBandviewSelect} from '../frontend/EEGInterface'
import {BrainMap2D} from '../utils/visuals/eegvisuals'
import {DOMFragment} from '../frontend/DOMFragment'

//You can extend or call this class and set renderProps and these functions
export class BrainMapApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML
            width: "300px",
            height: "300px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class = null;
        this.mode = "brainmap";
        this.sub = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <div id='`+props.id+`canvascontainer'>
                <canvas id='`+props.id+`canvas' width='`+props.width+`' height='`+props.height+`' style='position:absolute; width:`+props.height+`px; height:`+props.height+`px; z-index:1; '></canvas>
                <canvas id='`+props.id+`points' width='`+props.width+`' height='`+props.height+`' style='position:absolute; width:`+props.height+`px; height:`+props.height+`px; z-index:2; '></canvas>
            </div>
            <table id='`+props.id+`menu' style='position:absolute; z-index:3; '>
                <tr><td><h3>Brain Map |</h3></td>
                <td><h4>Viewing:</h4></td>
                <td>`+genBandviewSelect(props.id+'bandview')+`</td></tr>
            </table>
        </div>
        `;
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        this.class = new BrainMap2D(this.renderProps.id+'canvas',this.renderProps.id+'points');
        document.getElementById(this.renderProps.id+'bandview').onchange = () => {
            this.setBrainMap();
        }
    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML()},undefined,"NEVER"); //Changes to this.props will automatically update the html template
        this.class.genHeatMap();
        this.class.points = [];

        this.class.scale = this.AppletHTML.node.clientHeight*.5*0.01*.8;
        ATLAS.fftMap.map.forEach((row,i) => {
            this.class.points.push({x:row.data.x*this.class.scale+this.class.pointsCanvas.width*.5, y: this.class.pointsCanvas.height*.5-row.data.y*this.class.scale, size:90*this.class.scale, intensity:0.8});
        });
        
        this.class.updateHeatmap();
        this.class.updatePointsFromAtlas(ATLAS.fftMap,ATLAS.channelTags);
        
        this.sub = State.subscribe('FFTResult', ()=>{try{this.onUpdate();}catch(e){console.error(e);}});
    }

    
    configure(newsettings=this.settings) { //Expects an array []
        this.settings=newsettings;
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //Destroy applet. Keep this one line
    deInit() {
        State.unsubscribe('FFTResult', this.sub);
        this.class.deInit();
        this.class = null;
        this.AppletHTML.deleteNode();
    }

    //Callback for when the window resizes. This gets called by the UIManager class to help resize canvases etc.
    onResize() {
        var brainmapcanvas = document.getElementById(this.renderProps.id+'canvas');
        var brainpointscanvas = document.getElementById(this.renderProps.id+'points');
        brainmapcanvas.style.height = this.AppletHTML.node.style.height;
        brainmapcanvas.style.width = brainmapcanvas.style.height;
        brainpointscanvas.style.height = this.AppletHTML.node.style.height;
        brainpointscanvas.style.width = brainpointscanvas.style.height;
        brainmapcanvas.height = this.AppletHTML.node.clientHeight;
        brainmapcanvas.width = this.AppletHTML.node.clientHeight;
        brainpointscanvas.height = this.AppletHTML.node.clientHeight;
        brainpointscanvas.width = this.AppletHTML.node.clientHeight;
        
        this.class.scale = this.AppletHTML.node.clientHeight*.5*0.01*.8;

        this.class.genHeatMap();
        this.class.points = [];
        ATLAS.fftMap.map.forEach((row,i) => {
            this.class.points.push({x:row.data.x*this.class.scale+this.class.pointsCanvas.width*.5, y: this.class.pointsCanvas.height*.5-row.data.y*this.class.scale, size:90*this.class.scale, intensity:0.8});
        });

        this.class.updateHeatmap();
        this.class.updatePointsFromAtlas(ATLAS.fftMap,ATLAS.channelTags);

    }

    //------------ add new functions below ---------------

    onUpdate = () => {
        var viewing = document.getElementById(this.renderProps.id+"bandview").value;
        let hscalar = 0.05; if(State.data.uVScaling === false) { hscalar = 10;}
        this.class.updateHeatmapFromAtlas(ATLAS.fftMap,ATLAS.channelTags,viewing, hscalar);

        if(State.data.coherenceResult.length === ATLAS.coherenceMap.map.length){
            let cscalar = 0.1; if(State.data.uVScaling === false) { cscalar = 10;}
            this.class.updateConnectomeFromAtlas(ATLAS.coherenceMap,ATLAS.fftMap,ATLAS.channelTags,viewing,true,cscalar);
        }
    }

    setBrainMap = () => {
        var viewing = document.getElementById(this.renderProps.id+"bandview");
        this.class.updatePointsFromAtlas(ATLAS.fftMap,ATLAS.channelTags);
        let hscalar = 0.1; if(State.data.uVScaling === false) { hscalar = 10;}
        this.class.updateHeatmapFromAtlas(ATLAS.fftMap,ATLAS.channelTags,viewing, hscalar);
        let cscalar = 0.1; if(State.data.uVScaling === false) { cscalar = 10;}
            this.class.updateConnectomeFromAtlas(ATLAS.coherenceMap,ATLAS.fftMap,ATLAS.channelTags,viewing,true,cscalar);
    }

}