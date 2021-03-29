import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import {BrainMap2D} from '../bciutils/visuals/eegvisuals'
import {genBandviewSelect} from '../frontend/menus/selectTemplates'

//Example Applet for integrating with the UI Manager
export class BrainMapApplet {
    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            width:'400px',
            height:'400px'
            //Add whatever else
        };

        this.class = null;
        this.loop = null;
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

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id+'bandview').onchange = () => {
            this.setBrainMap();
        };
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
        
        this.class = new BrainMap2D(this.props.id+'canvas',this.props.id+'points');
        this.class.genHeatMap();
        this.class.points = [];

        this.class.scale = this.AppletHTML.node.clientHeight*.5*0.01*.8;
        this.bci.atlas.data.eeg.forEach((row,i) => {
            this.class.points.push({x:row.position.x*this.class.scale+this.class.pointsCanvas.width*.5, y: this.class.pointsCanvas.height*.5-row.position.y*this.class.scale, size:90*this.class.scale, intensity:0.8});
        });
        
        this.class.updateHeatmap();
        this.class.updatePointsFromAtlas(this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags);

        this.looping = true;
        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.class.deInit();
        this.class = null;
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        var brainmapcanvas = document.getElementById(this.props.id+'canvas');
        var brainpointscanvas = document.getElementById(this.props.id+'points');
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
        this.bci.atlas.data.eeg.forEach((row,i) => {
            this.class.points.push({x:row.position.x*this.class.scale+this.class.pointsCanvas.width*.5, y: this.class.pointsCanvas.height*.5-row.position.y*this.class.scale, size:90*this.class.scale, intensity:0.8});
        });

        this.class.updateHeatmap();
        this.class.updatePointsFromAtlas(this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags);

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
            if(this.bci.info.nDevices > 0) {
                this.onUpdate();
            }
            setTimeout(()=>{ this.loop = requestAnimationFrame(this.updateLoop); },16);
        }
    }

    onUpdate = () => {
        var viewing = document.getElementById(this.props.id+"bandview").value;
        let hscalar = 0.05; if(this.bci.devices[0] && this.bci.devices[0].info.useFilters === false) { hscalar = 10;}
        this.class.updateHeatmapFromAtlas(this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags, viewing, hscalar);

        if(this.bci.atlas.data.coherence[0].fftCount > 0){
            let cscalar = 0.1; if(this.bci.devices[0] && this.bci.devices[0].info.useFilters === false) { cscalar = 10;}
            this.class.updateConnectomeFromAtlas(this.bci.atlas.data.coherence,this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags,viewing,true,cscalar);
        }
    }

    setBrainMap = () => {
        var viewing = document.getElementById(this.props.id+"bandview");
        this.class.updatePointsFromAtlas(this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags);
        let hscalar = 0.1; if(this.bci.devices[0] && this.bci.devices[0].info.useFilters === false) { hscalar = 10;}
        this.class.updateHeatmapFromAtlas(this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags, viewing, hscalar);
        let cscalar = 0.1; if(this.bci.devices[0] && this.bci.devices[0].info.useFilters === false) { cscalar = 10;}
        this.class.updateConnectomeFromAtlas(this.bci.atlas.data.coherence,this.bci.atlas.data.eeg,this.bci.atlas.data.eegshared.eegChannelTags,viewing,true,cscalar);
    }

   
} 