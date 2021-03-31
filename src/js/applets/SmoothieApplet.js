import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import {addChannelOptions,addCoherenceOptions} from '../frontend/menus/selectTemplates'
import { SmoothieChartMaker } from '../bciutils/visuals/eegvisuals';

//Example Applet for integrating with the UI Manager
export class SmoothieApplet {
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
            //Add whatever else
        };

        
        this.class=null;
        this.loop=null;
        this.looping=false;

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

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            addChannelOptions(this.props.id+"channel", this.bci.atlas.data.eegshared.eegChannelTags, true);
            document.getElementById(props.id+"channelmenu").style.display = "none";
            
            document.getElementById(props.id+"mode").onchange = () => {
            this.class.series.forEach((series,i)=> {
              series.clear();
            });
            let val = document.getElementById(props.id+"mode").value;
            if(val === "alpha" || val === "coherence"){
              document.getElementById(props.id+"channelmenu").style.display = "none";
            }
            else if (val === "bandpowers") {
              document.getElementById(props.id+"channelmenu").style.display = "";
              document.getElementById(props.id+"legend").innerHTML = "";
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


        this.class = new SmoothieChartMaker(8, document.getElementById(this.props.id+"canvas"));
        this.class.init('rgba(0,100,100,0.5)');
        
        this.setLegend();
        
        //document.getElementById("stopbutton").addEventListener('click',this.stopEvent);
        //document.getElementById("runbutton").addEventListener('click',this.startEvent);

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
      if(this.bci.atlas.settings.eeg) {
        addChannelOptions(this.props.id+"channel", this.bci.atlas.data.eegshared.eegChannelTags, true);
        this.setLegend();
      }
        this.class.canvas.style.height = this.AppletHTML.node.style.height;
        this.class.canvas.style.width = this.AppletHTML.node.style.width;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

   
    stopEvent = () => {
        this.class.chart.stop();
    }

    startEvent = () => {
        this.class.chart.start();
    }

    updateLoop = () => {
        if(this.looping) {
            if(this.bci.atlas.settings.eeg){
              if(this.bci.atlas.getLatestFFTData()[0].fftCount > 0) this.onUpdate();
            }
            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop)},16);
        }
    }

    onUpdate = () => {
        let atlas = this.bci.atlas;
        let channelTags = atlas.data.eegshared.eegChannelTags;
        var graphmode = document.getElementById(this.props.id+"mode").value;
        if((graphmode === "alpha") || (graphmode === "bandpowers")) {
          if(channelTags.length > this.class.series.length) {
            while(channelTags.length > this.class.series.length) {
              var newseries = new TimeSeries();
              this.series.push(newseries);
              var r = Math.random()*255, g = Math.random()*255, b = Math.random()*255;
                      stroke = 'rgb('+r+","+g+","+b+")"; fill = 'rgba('+r+','+g+','+b+","+"0.2)";
              this.seriesColors.push(stroke); // For reference
              this.chart.addTimeSeries(this.series[this.series.length-1], {strokeStyle: stroke, fillStyle: fill, lineWidth: 2 });
            }
          }
          if(graphmode === "alpha"){
              channelTags.forEach((row,i) => {
                if(row.tag !== null && row.tag !== 'other'){
                  var coord = {};
                  coord = atlas.getEEGDataByTag(row.tag);
  
                  if(i < this.class.series.length - 1){
                    this.class.series[i].append(Date.now(), Math.max(...coord.slices.alpha1[coord.slices.alpha1.length-1]));
                  }
                }
            });
          }
          else if(graphmode === "bandpowers") {
            var ch = parseInt(document.getElementById(this.props.id+"channel").value);
            var tag = null;
            channelTags.find((o,i) => {
              if(o.ch === ch){
                tag = o.tag;
                return true;
              }
            });
            if(tag !== null){
              var coord = atlas.getEEGDataByTag(tag);
              this.class.bulkAppend([
                coord.means.delta[coord.means.delta.length-1],
                coord.means.theta[coord.means.theta.length-1],
                coord.means.alpha1[coord.means.alpha1.length-1],
                coord.means.alpha2[coord.means.alpha2.length-1],
                coord.means.beta[coord.means.beta.length-1],
                coord.means.lowgamma[coord.means.lowgamma.length-1]
              ]);
            }
          }
        }
        else if (graphmode === "coherence") {
          atlas.data.coherence.forEach((row,i) => {
            if(i < this.class.series.length - 1){
              this.class.series[i].append(Date.now(), Math.max(...row.slices.alpha1[row.slices.alpha1.length-1]));
            }
          });
        }
      }
  
      setLegend = () => {
        let atlas = this.bci.atlas;
        let channelTags = atlas.data.eegshared.eegChannelTags;
        let val = document.getElementById(this.props.id+"mode").value;
        document.getElementById(this.props.id+"legend").innerHTML = "";
        let htmlToAppend = "";
        if(val === "alpha") {
          channelTags.forEach((row,i) => {
            if(row.tag !== null && row.tag !== 'other'){
              htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+row.tag+`</div>`;
            }
          });
        }
        else if(val === "coherence") {
          atlas.data.coherence.forEach((row,i) => {
            htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+row.tag+`</div>`;
          });
        }
        else if (val === "bandpowers") {
          let i = 0;
          for(const prop in atlas.data.eeg[0].means){
            if(prop !== 'scp' && prop !== 'highgamma'){
              htmlToAppend += `<div style='display:table-row; color:`+this.class.seriesColors[i]+`'>`+prop+`</div>`;
              i++;
            }
          }
        }
        document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
        
      }


} 