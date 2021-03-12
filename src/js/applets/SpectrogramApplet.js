import {State} from '../frontend/State'
import {DOMFragment} from '../frontend/DOMFragment'
import {EEG, ATLAS, addChannelOptions, addCoherenceOptions} from '../frontend/EEGInterface'
import {Spectrogram} from '../utils/visuals/eegvisuals'

//You can extend or call this class and set renderProps and these functions
export class SpectrogramApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML
            width: "400px",
            height: "200px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class = null;
        this.mode = "spectrogram";
        this.sub = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <canvas id='`+props.id+`canvas' height='`+props.height+`' width='`+props.width+`' style='position:absolute; z-index:3;  width:`+props.width+`px; height:`+props.height+`px;'></canvas>
            <div id='`+props.id+`menu' style='position:absolute; z-index:4; color: white;'> 
            Mode
                <select id='`+props.id+`mode'>
                    <option value="FFT" selected="selected">FFT</option>
                    <option value="Coherence">Coherence</option>
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
        addChannelOptions(this.renderProps.id+'channel');
        document.getElementById(this.renderProps.id+'channel').onchange = () => {
          this.class.clear();
        }
        document.getElementById(this.renderProps.id+"mode").onchange = () => {
            this.class.clear();
            if(document.getElementById(this.renderProps.id+"mode").value === "FFT"){
              addChannelOptions(this.renderProps.id+"channel");
            }
            else if(document.getElementById(this.renderProps.id+"mode").value === "Coherence"){
              addCoherenceOptions(this.renderProps.id+"channel");
            }
        }
    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML();},undefined,"NEVER"); //Changes to this.props will automatically update the html template
        this.class = new Spectrogram(this.renderProps.id+'canvas', 10000);
        this.class.init();

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
        State.unsubscribe('FFTResult',this.sub);
        this.class.deInit();
        this.class = null;
        this.AppletHTML.deleteNode();
    }

    //Callback for when the window resizes. This gets called by the UIManager class to help resize canvases etc.
    onResize() {
        this.class.canvas.style.width = this.AppletHTML.node.style.width;
        this.class.canvas.style.height = this.AppletHTML.node.style.height;
      
        this.class.canvas.width = Math.floor(this.AppletHTML.node.clientWidth);
        this.class.canvas.height = Math.floor(this.AppletHTML.node.clientHeight);
    
        this.class.init();
    }

    //------------ add new functions below ---------------

    onUpdate = () => {
        var graphmode = document.getElementById(this.renderProps.id+"mode").value;
        var view = document.getElementById(this.renderProps.id+"channel").value
        var ch = parseInt(view);
        if(graphmode === "FFT"){
          var tag = null;
          ATLAS.channelTags.find((o,i) => {
            if(o.ch === ch){
              tag = o.tag;
              return true;
            }
          });
          if(tag !== null){
            var coord = ATLAS.getAtlasCoordByTag(tag);
            this.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length-1].slice(State.data.fftViewStart,State.data.fftViewEnd);
            this.class.draw();
          }
        }
        else if(graphmode === "Coherence"){
          var coord = null;
          ATLAS.coherenceMap.map.find((o,i) => {
            if(o.tag === view){
              coord = o;
              return true;
            }
          });
          this.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length - 1].slice(State.data.fftViewStart,State.data.fftViewEnd);
          this.class.draw();
        }
    }

}