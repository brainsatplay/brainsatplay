import {State} from '../frontend/State'
import {EEG, ATLAS, addChannelOptions, addCoherenceOptions} from '../frontend/EEGInterface'
import { SmoothieChartMaker } from '../utils/visuals/eegvisuals';
import {TimeSeries} from 'smoothie'
import {DOMFragment} from '../frontend/DOMFragment'

//You can extend or call this class and set renderProps and these functions
export class SmoothieApplet {
    constructor (parentNode=document.getElementById("applets"),settings=[]) { // customize the render props in your constructor
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = {  //Add properties to set and auto-update the HTML
            width: "400px",
            height: "300px",
            id: String(Math.floor(Math.random()*1000000))
        }

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        this.class=null;
        this.mode="smoothie";
        this.sub = null;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>
            <canvas id='`+props.id+`canvas' width=`+props.width+` height=`+props.height+` style='z-index:3; position:absolute; width:`+props.width+`; height:`+props.height+`;'></canvas>
            <table id='`+props.id+`menu' style='position:absolute; z-index:4; color:white;'>
            <tr>
              <td>
                Mode:
                <select id='`+props.id+`mode'>
                  <option value="alpha" selected="selected">Alpha1 Bandpowers</option>
                  <option value="coherence">Alpha1 Coherence</option>
                  <option value="bandpowers">1Ch All Bandpowers</option>
                </select>
              </td><td id='`+props.id+`channelmenu'>  
                Channel:
                <select id='`+props.id+`channel'>
                  <option value="0">0</option>
                </select>
              </td>
                </tr>
                <tr>
                <td colSpan=2 style='display:table-row;' id='`+props.id+`legend'>
                </td>
                </tr>
            </table>
        </div>
        `;
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        addChannelOptions(this.renderProps.id+"channel", true);
        document.getElementById(this.renderProps.id+"channelmenu").style.display = "none";
        
        document.getElementById(this.renderProps.id+"mode").onchange = () => {
            this.class.series.forEach((series,i)=> {
              series.clear();
            });
            let val = document.getElementById(this.renderProps.id+"mode").value;
            if(val === "alpha" || val === "coherence"){
              document.getElementById(this.renderProps.id+"channelmenu").style.display = "none";
            }
            else if (val === "bandpowers") {
              document.getElementById(this.renderProps.id+"channelmenu").style.display = "";
              document.getElementById(this.renderProps.id+"legend").innerHTML = "";
            }
            this.setLegend();
            //if(document.getElementById(this.renderProps.id+"mode").value === "coherence"){
            //    State.unsubscribe('FFTResult',this.sub);
            //    this.sub = State.subscribe('coherenceResult',this.onUpdate);
            //}
            //else{
            //    State.unsubscribe('coherenceResult',this.sub);
            //    this.sub = State.subscribe('FFTResult',this.onUpdate);
            //}
        }
        
    }

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML();},undefined,"NEVER"); //Changes to this.props will automatically update the html template
        
        this.class = new SmoothieChartMaker(8, document.getElementById(this.renderProps.id+"canvas"));
        this.class.init('rgba(0,100,100,0.5)');
        
        this.setLegend();
        
        this.sub = State.subscribe('FFTResult', ()=>{try{this.onUpdate()}catch(e){console.error(e);}});

        document.getElementById("stopbutton").addEventListener('click',this.stopEvent);
        document.getElementById("runbutton").addEventListener('click',this.startEvent);
    }

    
    configure(newsettings=this.settings) { //Expects an array []
      this.settings=newsettings;
      settings.forEach((cmd,i) => {
          //if(cmd === 'x'){//doSomething;}
      });
    }

    //Destroy applet. Keep this one line
    deInit() {
        this.class.deInit();
        this.AppletHTML.deleteNode();
        this.class = null;

        document.getElementById("stopbutton").removeEventListener('click',this.stopEvent);
        document.getElementById("runbutton").addEventListener('click',this.stopEvent);
    }

    //Callback for when the window resizes. This gets called by the UIManager class to help resize canvases etc.
    onResize() {
       this.class.canvas.style.height = this.AppletHTML.node.style.height;
       this.class.canvas.style.width = this.AppletHTML.node.style.width;
    }

    //------------ add new functions below ---------------

    onUpdate = () => {
      var graphmode = document.getElementById(this.renderProps.id+"mode").value;
      if((graphmode === "alpha") || (graphmode === "bandpowers")) {
        if(ATLAS.channelTags.length > this.class.series.length) {
          while(ATLAS.channelTags.length > this.class.series.length) {
            var newseries = new TimeSeries();
            this.series.push(newseries);
            var r = Math.random()*255, g = Math.random()*255, b = Math.random()*255;
				    stroke = 'rgb('+r+","+g+","+b+")"; fill = 'rgba('+r+','+g+','+b+","+"0.2)";
            this.seriesColors.push(stroke); // For reference
            this.chart.addTimeSeries(this.series[this.series.length-1], {strokeStyle: stroke, fillStyle: fill, lineWidth: 2 });
          }
        }
        if(graphmode === "alpha"){
            ATLAS.channelTags.forEach((row,i) => {
              if(row.tag !== null && row.tag !== 'other'){
                var coord = {};
                coord = ATLAS.getAtlasCoordByTag(row.tag);

                if(i < this.class.series.length - 1){
                  this.class.series[i].append(Date.now(), Math.max(...coord.data.slices.alpha1[coord.data.slices.alpha1.length-1]));
                }
              }
          });
        }
        else if(graphmode === "bandpowers") {
          var ch = parseInt(document.getElementById(this.renderProps.id+"channel").value);
          var tag = null;
          ATLAS.channelTags.find((o,i) => {
            if(o.ch === ch){
              tag = o.tag;
              return true;
            }
          });
          if(tag !== null){
            var coord = ATLAS.getAtlasCoordByTag(tag);
            this.class.bulkAppend([
              coord.data.means.delta[coord.data.means.delta.length-1],
              coord.data.means.theta[coord.data.means.theta.length-1],
              coord.data.means.alpha1[coord.data.means.alpha1.length-1],
              coord.data.means.alpha2[coord.data.means.alpha2.length-1],
              coord.data.means.beta[coord.data.means.beta.length-1],
              coord.data.means.lowgamma[coord.data.means.lowgamma.length-1]
            ]);
          }
        }
      }
      else if (graphmode === "coherence") {
        ATLAS.coherenceMap.map.forEach((row,i) => {
          if(i < this.class.series.length - 1){
            this.class.series[i].append(Date.now(), Math.max(...row.data.slices.alpha1[row.data.slices.alpha1.length-1]));
          }
        });
      }
    }

    setLegend = () => {
      let val = document.getElementById(this.renderProps.id+"mode").value;
      document.getElementById(this.renderProps.id+"legend").innerHTML = "";
      let htmlToAppend = "";
      if(val === "alpha") {
        ATLAS.channelTags.forEach((row,i) => {
          if(row.tag !== null && row.tag !== 'other'){
            htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+row.tag+`</div>`;
          }
        });
      }
      else if(val === "coherence") {
        ATLAS.coherenceMap.map.forEach((row,i) => {
          htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+row.tag+`</div>`;
        });
      }
      else if (val === "bandpowers") {
        let i = 0;
        for(const prop in ATLAS.fftMap.map[0].data.means){
          if(prop !== 'scp' && prop !== 'highgamma'){
            htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+prop+`</div>`;
            i++;
          }
        }
      }
      document.getElementById(this.renderProps.id+"legend").innerHTML = htmlToAppend;
      
    }

    stopEvent = () => {
        this.class.chart.stop();
    }

    startEvent = () => {
        this.class.chart.start();
    }

}