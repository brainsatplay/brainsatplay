import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import {addChannelOptions,addCoherenceOptions} from '../../../platform/js/frontend/menus/selectTemplates'
import { SmoothieChartMaker } from '../../../platform/js/frontend/UX/eegvisuals';
import { TimeSeries } from 'smoothie'
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class SmoothieApplet {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            width:'400px',
            height:'300px'
            //Add whatever else
        };

        
        this.charts=[];
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
            <div id='`+props.id+`' width=100% height=100%>
                <table id='`+props.id+`menu' style='position:absolute; z-index:4; color:white;'>
                <tr>
                <td>
                    Mode:
                    <select id='`+props.id+`mode'>
                    <option value="alpha" selected="selected">Alpha1 Bandpowers</option>
                    <option value="coherence">Alpha1 Coherence</option>
                    <option value="bandpowers">1Ch All Bandpowers</option>
                    <option value="stackedraw">Raw Data</option>
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
                <div id='`+props.id+`canvascontainer' style='width:100%; height:100%;'>
                  <canvas id='`+props.id+`canvas' width='100%' height='100%' style='z-index:3; width:100%; height:100%;'></canvas>
                </div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
          this.session.registerApp(this)
          this.session.startApp(this.props.id)

          addChannelOptions(this.props.id+"channel", this.session.atlas.data.eegshared.eegChannelTags, true);
          document.getElementById(props.id+"channelmenu").style.display = "none";
          
          document.getElementById(props.id+"mode").onchange = () => {
            this.charts[0].series.forEach((series,i)=> {
              series.clear();
            });
            let val = document.getElementById(props.id+"mode").value;
            console.log(this.charts)
            if(val === "alpha" || val === "coherence"){
              if(this.charts.length>1) {
                this.charts.forEach((chart,i) => {if(i>1) {chart.deInit();}});
                this.charts.splice(1,this.charts.length-1);  
                document.getElementById(props.id+'canvascontainer').innerHTML = `
                  <canvas id='`+props.id+`canvas' width=100% height=100% style='z-index:3; width:100%; height:100%;'></canvas>
                `;
                this.charts[0] = new SmoothieChartMaker(8, document.getElementById(props.id+"canvas"));
                this.charts[0].init('rgba(0,100,100,0.5)');
              }
              document.getElementById(props.id+"channelmenu").style.display = "none";
            }
            else if (val === "bandpowers") {
              if(this.charts.length>1) {
                this.charts.forEach((chart,i) => {if(i>1) {chart.deInit();}});
                this.charts.splice(1,this.charts.length-1);  
                document.getElementById(props.id+'canvascontainer').innerHTML = `
                  <canvas id='`+props.id+`canvas' width='100%' height='100%' style='z-index:3; width:100%; height:100%;'></canvas>
                `;
                this.charts[0] = new SmoothieChartMaker(8, document.getElementById(props.id+"canvas"));
                this.charts[0].init('rgba(0,100,100,0.5)');
              }
              document.getElementById(props.id+"channelmenu").style.display = "";
              document.getElementById(props.id+"legend").innerHTML = "";
            } else if (val === "stackedraw") {
              this.charts[0].deInit();
              document.getElementById(props.id+'canvascontainer').innerHTML = '';
              let height = 100/this.session.atlas.data.eegshared.eegChannelTags.length;
              this.session.atlas.data.eegshared.eegChannelTags.forEach((tag,i)=>{
                document.getElementById(props.id+'canvascontainer').innerHTML += `
                  <canvas id='`+props.id+`canvas`+i+`' style='z-index:3; width:100%; height:`+height+`%;'></canvas>
                `;
              });
              this.session.atlas.data.eegshared.eegChannelTags.forEach((tag,i)=>{
                this.charts[i] = new SmoothieChartMaker(1, document.getElementById(props.id+"canvas"+i));
                let stroke = 'red'; let fill='rgba(255,0,0,0.2)';
                if(i === 1) { stroke = 'orange';    fill = 'rgba(255,128,0,0.2)'; }
                else if(i === 2) { stroke = 'green';     fill = 'rgba(0,255,0,0.2)';   }
                else if(i === 3) { stroke = 'turquoise'; fill = 'rgba(0,255,150,0.2)'; }
                else if(i === 4) { stroke = 'rgba(50,50,255,1)';      fill = 'rgba(0,0,255,0.2)';   }
                else if(i === 5) { stroke = 'rgba(200,0,200,1)';    fill = 'rgba(128,0,128,0.2)'; }
                else if (i !== 0) {
                  var r = Math.random()*255, g = Math.random()*255, b = Math.random()*255;
                  stroke = 'rgb('+r+","+g+","+b+")"; fill = 'rgba('+r+','+g+','+b+","+"0.2)";
                }
                this.charts[i].init('rgba(0,100,100,0.5)',undefined,undefined,stroke,fill);
              });
              document.getElementById(props.id+"channelmenu").style.display = "none";
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


        this.charts[0] = new SmoothieChartMaker(8, document.getElementById(this.props.id+"canvas"));
        this.charts[0].init('rgba(0,100,100,0.5)');
        
        this.setLegend();
        
        //document.getElementById("stopbutton").addEventListener('click',this.stopEvent);
        //document.getElementById("runbutton").addEventListener('click',this.startEvent);

        this.looping = true;
        this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.charts.forEach(chart => chart.deInit());
        this.charts = null;
        this.AppletHTML.deleteNode();
        this.session.removeApp(this.props.id)
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
      if(this.session.atlas.settings.eeg) {
        addChannelOptions(this.props.id+"channel", this.session.atlas.data.eegshared.eegChannelTags, true);
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

   
    stopEvent = () => {
        this.charts.forEach(chart => chart.stop());
    }

    startEvent = () => {
      this.charts.forEach(chart => chart.start());
    }

    updateLoop = () => {
        if(this.looping) {
            if(this.session.atlas.settings.eeg) {
              if(this.session.atlas.getLatestFFTData()[0].fftCount > 0) this.onUpdate();
            }
            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop)},16);
        }
    }

    onUpdate = () => {
        let atlas = this.session.atlas;
        let channelTags = atlas.data.eegshared.eegChannelTags;
        var graphmode = document.getElementById(this.props.id+"mode").value;
        if((graphmode === "alpha") || (graphmode === "bandpowers")) {
          if(channelTags.length > this.charts[0].series.length) {
            while(channelTags.length > this.charts[0].series.length) {
              var newseries = new TimeSeries();
              this.charts[0].series.push(newseries);
              var r = Math.random()*255, g = Math.random()*255, b = Math.random()*255;
              let stroke = 'rgb('+r+","+g+","+b+")"; let fill = 'rgba('+r+','+g+','+b+","+"0.2)";
              this.charts[0].seriesColors.push(stroke); // For reference
              if (this.series) this.charts[0].addTimeSeries(this.series[this.series.length-1], {strokeStyle: stroke, fillStyle: fill, lineWidth: 2 });
            }
          }
          if(graphmode === "alpha"){
              channelTags.forEach((row,i) => {
                if(row.tag !== null && row.tag !== 'other'){
                  var coord = {};
                  coord = atlas.getEEGDataByTag(row.tag);
  
                  if(i < this.charts[0].series.length - 1){
                    this.charts[0].series[i].append(Date.now(), Math.max(...coord.slices.alpha1[coord.slices.alpha1.length-1]));
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
              this.charts[0].bulkAppend([
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
        else if (atlas.settings.analysis.eegcoherence === true && graphmode === "coherence") {
          atlas.data.coherence.forEach((row,i) => {
            if(i < this.charts[0].series.length - 1){
              this.charts[0].series[i].append(Date.now(), Math.max(...row.slices.alpha1[row.slices.alpha1.length-1]));
            }
          });
        }
        else if (graphmode === 'stackedraw') {
          atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
            let datum = atlas.getEEGDataByChannel(row.ch);
            if(datum.filtered.length < 1) this.charts[i].series[0].append(Date.now(),datum.raw[datum.count-1]);
            else this.charts[i].series[0].append(Date.now(),datum.filtered[datum.count-1]);
          });
        }
      }
  
      setLegend = () => {
        let atlas = this.session.atlas;
        let channelTags = atlas.data.eegshared.eegChannelTags;
        let val = document.getElementById(this.props.id+"mode").value;
        document.getElementById(this.props.id+"legend").innerHTML = "";
        let htmlToAppend = "";
        if(val === "alpha") {
          channelTags.forEach((row,i) => {
            if(row.tag !== null && row.tag !== 'other'){
              htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[i]+`'>`+row.tag+`</div>`;
            }
          });
        }
        else if(atlas.settings.analysis.eegcoherence === true && val === "coherence") {
          atlas.data.coherence.forEach((row,i) => {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[i]+`'>`+row.tag+`</div>`;
          });
        }
        else if (val === "bandpowers") {
          let i = 0;
          for(const prop in atlas.data.eeg[0].means){
            if(prop !== 'scp' && prop !== 'highgamma'){
              htmlToAppend += `<div style='display:table-row; color:`+this.charts[0].seriesColors[i]+`'>`+prop+`</div>`;
              i++;
            }
          }
        }
        else if (val === "stackedraw") {
          let i = 0;
          atlas.data.eegshared.eegChannelTags.forEach((row,i)=> {
            htmlToAppend += `<div style='display:table-row; color:`+this.charts[i].seriesColors[0]+`'>`+row.tag+`</div>`;
          });
        }
        document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
        
      }


} 
