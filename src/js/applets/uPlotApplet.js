import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import {uPlotMaker} from '../bciutils/visuals/eegvisuals'
import {eegmath} from '../bciutils/eeg32'
import {genBandviewSelect,addChannelOptions,addCoherenceOptions} from '../frontend/menus/selectTemplates'


document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="./_dist_/styles/css/uPlot.min.css" />`);

//Example Applet for integrating with the UI Manager
export class uPlotApplet {
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

        this.class = null;
        this.loop = null;
        this.looping = false;
        this.xrange = 10; //minutes
        this.yrange = true;
        this.plotWidth = 500;
        this.plotHeight = 300;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    init() {
        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let  HTMLtemplate = (props=this.props) => {
            return `
            <div id='`+props.id+`'>    
                <div id='`+props.id+`menu' style='position:absolute; float:right; z-index:4;'>
                  <table style='position:absolute; transform:translateX(40px);'>
                    <tr>
                      <td>
                        Channel:
                        <select id="`+props.id+`channel" style='width:80px'></select>
                      </td> 
                      <td>  
                        Graph:
                        <select id='`+props.id+`mode' style='width:98px'>
                          <option value="FFT" selected="selected">FFTs</option>
                          <option value="Coherence">Coherence</option>
                          <option value="CoherenceTimeSeries">Mean Coherence</option>
                          <option value="TimeSeries">Raw</option>
                          <option value="Stacked">Stacked Raw</option>
                        </select>
                      </td>
                      <td id='`+props.id+`yrangetd' style='width:98px'>
                        Y scale <button id='`+props.id+`yrangeset' style='position:absolute; transform:translateX(21px); height:13px;'><div style='transform:translateY(-3px);'>Set</div></button><input type='text' id='`+props.id+`yrange' placeholder='0,100 or auto' style='width:90px'>
                      </td>
                      <td id='`+props.id+`xrangetd' style='width:98px'>
                        Time: <button id='`+props.id+`xrangeset' style='position:absolute; transform:translateX(30px); height:13px;'><div style='transform:translateY(-3px);'>Set</div></button><input type='text' id='`+props.id+`xrange' placeholder='10 (sec)' style='width:90px'>
                      </td>
                      
                    </tr>
                    <tr>
                    <td colSpan=2 style='display:table-row;' id='`+props.id+`legend'></td>
                      <td>
                      `+genBandviewSelect(props.id+'bandview')+`
                      </td>
                      <td colSpan=2>
                        <div id='`+props.id+`title' style='font-weight:bold; width:200px;'>Fast Fourier Transforms</div>
                      </td>
                    </tr>
                  </table>
                </div>
                <div id='`+props.id+`canvas' height='100%' width='100%' style='z-index:3; height:100%; width:100%;'></div>
            </div>
            `; //
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id+"bandview").style.display="none";
            document.getElementById(props.id+'xrangetd').style.display = "none";
            document.getElementById(props.id+'mode').onchange = () => {
              
              let atlas = this.bci.atlas;
              this.yrange = true;
              if(document.getElementById(props.id+'mode').value === "CoherenceTimeSeries" || document.getElementById(props.id+'mode').value === "Coherence"){
                addCoherenceOptions(props.id+'channel',atlas.data.coherence,true,['All']);
              }
              else if (document.getElementById(props.id+'mode').value === "TimeSeries" || document.getElementById(props.id+'mode').value === "Stacked"){
                addChannelOptions(props.id+'channel',atlas.data.eegshared.eegChannelTags,false,['All']);
              }
              else {
                addChannelOptions(props.id+'channel',atlas.data.eegshared.eegChannelTags,true,['All']);
              }
              if (document.getElementById(props.id+'mode').value === "CoherenceTimeSeries") {
                document.getElementById(props.id+'xrangetd').style.display = "";
                document.getElementById(props.id+"bandview").style.display="";
              }
              else if(document.getElementById(props.id+'mode').value==="TimeSeries") { 
                document.getElementById(props.id+'xrangetd').style.display = "";
                document.getElementById(props.id+"bandview").style.display="none";
              }
              else {
                document.getElementById(props.id+'xrangetd').style.display = "none";
                document.getElementById(props.id+"bandview").style.display="none";
              }
              
              this.setuPlot();
            }

            document.getElementById(props.id+'bandview').style.width='98px';

            document.getElementById(props.id+'bandview').onchange = () => {
                if(document.getElementById(props.id+'mode').value === "CoherenceTimeSeries"){
                    this.setuPlot();
                }
            }
            document.getElementById(props.id+'channel').onchange = () => {
              this.setuPlot();
            }

            addChannelOptions(props.id+'channel',this.bci.atlas.data.eegshared.eegChannelTags,true,['All']);

            document.getElementById(props.id+'xrangeset').onclick = () => {
              let val = parseInt(document.getElementById(props.id+'xrange').value)
              if(!isNaN(val)){
                if(val < 1) { val = 1; }
                if(val > 300) { val = 300; }
                this.xrange = val;
              }
            }

            document.getElementById(props.id+'yrangeset').onclick = () => {
              let val = document.getElementById(props.id+'yrange').value;
              let split = val.split(',')
              if(split.length === 2){
                let low = parseInt(split[0]);
                let high = parseInt(split[1]);
                if(!isNaN(low) && !isNaN(high)){
                  this.yrange = [low,high];
                  this.setuPlot();
                }
              }
              else if(val === 'auto'){
                this.yrange = true;
                this.setuPlot();
              }
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
       
        if(this.bci.atlas.data.eegshared.frequencies.length === 0) {
          this.bci.atlas.data.eegshared.frequencies = this.bci.atlas.bandpassWindow(0,this.bci.atlas.data.eegshared.sps);
        }
       
        this.setPlotDims();
        
        this.class = new uPlotMaker(this.props.id+'canvas');    

        //Add whatever else you need to initialize  
    }

    deinit() {
      this.class.deInit();
      this.class = null;
      
      this.AppletHTML.deleteNode();
      //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    responsive() {
      let atlas = this.bci.atlas;
      if(this.bci.info.nDevices > 0) {
        if(atlas.settings.eeg) {
          if(document.getElementById(this.props.id+'mode').value === "CoherenceTimeSeries" || document.getElementById(this.props.id+'mode').value === "Coherence"){
            addCoherenceOptions(this.props.id+'channel',atlas.data.coherence,true,['All']);
          }
          else if (document.getElementById(this.props.id+'mode').value === "TimeSeries" || document.getElementById(this.props.id+'mode').value === "Stacked"){
            addChannelOptions(this.props.id+'channel',atlas.data.eegshared.eegChannelTags,false,['All']);
          }
          else {
            addChannelOptions(this.props.id+'channel',atlas.data.eegshared.eegChannelTags,true,['All']);
          }
        }
        if(atlas.settings.heg) {
          let opts = [];
          let sel = document.getElementById(this.props.id+"mode");
          for (var i=0, n=sel.options.length; i<n; i++) { // looping over the options
            if (sel.options[i].value) opts.push(sel.options[i].value);
          }
          if(opts.indexOf("HEG") < 0) {
            sel.innerHTML = `
              <option value="HEG" selected="selected">HEG</option>
              <option value="FFT">FFTs</option>
              <option value="Coherence">Coherence</option>
              <option value="CoherenceTimeSeries">Mean Coherence</option>
              <option value="TimeSeries">Raw</option>
              <option value="Stacked">Stacked Raw</option>
            `;
          }
        } 
      }

      this.setPlotDims(); 
      this.setuPlot();

      if(!this.looping) this.start();
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    stop() {
      this.looping = false;
      cancelAnimationFrame(this.loop);
    }

    start() {
      this.looping = false;
      setTimeout(() => {
        this.looping = true;
        this.updateLoop();
      },100);
    }

    setPlotDims = () => {
      //debugger;
      console.log(this.AppletHTML.node.clientWidth)
      this.plotWidth = this.AppletHTML.node.clientWidth;
      this.plotHeight = this.AppletHTML.node.clientHeight;
    }

    updateLoop = () => {
      if(this.looping === true) {
        this.onUpdate();
        setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop); },16);
      }
    }

    onUpdate = () => {
      var graphmode = document.getElementById(this.props.id+"mode").value;
      var view = document.getElementById(this.props.id+"channel").value;
      let ch = null; 
      let atlas = this.bci.atlas;
      let ref_ch;
      //console.log(atlas);
      if (view !== 'All') {
        ch = parseInt(view);
      }
      if(atlas.settings.heg && graphmode === 'HEG') {
        let tint = this.xrange*1000;
        let heg = atlas.data.heg[0];
        let j = 0;
        if(heg.count > 2) {
          for(let i = heg.count-2; i > 0; i-- ) {
            if(heg.times[heg.count-1] - heg.times[i] > tint) {
              j = i;
              break;
            }
          }
          this.class.uPlotData = [heg.times.slice(j),heg.red.slice(j),heg.ir.slice(j),heg.ratio.slice(j)];
          if(heg.ambient.length > 0) {
            this.class.uPlotData.push(heg.ambient.slice(j))
          }
        }
      }
      else if(atlas.settings.eeg) {
        ref_ch = atlas.getDeviceDataByTag('eeg',atlas.data.eegshared.eegChannelTags[0].ch);
    
        if(ref_ch.fftCount > 0) {
          if(graphmode === 'FFT'){
            //Animate plot(s)
            //console.log(atlas);
            this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
            atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                if(row.analyze === true && (row.tag !== 'other' && row.tag !== null)) {
                  if(view === 'All' || row.ch === ch) {
                    atlas.data.eeg.find((o,i) => {
                      if(o.tag === row.tag || o.tag === row.ch) this.class.uPlotData.push(o.ffts[o.fftCount-1]);
                    });
                  }
                }
            });  
          }
          else if (graphmode === 'Coherence') {
            if(view === 'All') {
              this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
              //console.log(State.data.coherenceResult)
              atlas.data.coherence.forEach((o,i) => {
                this.class.uPlotData.push(o.ffts[o.fftCount-1]);
              })
            }
            else{
              atlas.data.coherence.find((o,i) => {
                //console.log(o)
                if(o.tag === view) {
                  this.class.uPlotData = [[...atlas.data.eegshared.frequencies],o.ffts[o.fftCount-1]];
                  return true;
                }
              });
            }
          }
          else if (graphmode === "CoherenceTimeSeries") {
            var band = document.getElementById(this.props.id+"bandview").value
            
            var count = atlas.data.coherence[0].fftCount;
            if(this.class.uPlotData[0][this.class.uPlotData[0].length-1]-this.class.uPlotData[0][0] >= this.xrange*1000) {
              this.class.uPlotData[0].shift();
            }
            //console.log(EEG.sps*this.xrange)
            //console.log(this.class.uPlotData[0].length)
            this.class.uPlotData[0].push(atlas.data.coherence[0].fftTimes[count-1]);// = [ATLAS.coherenceMap.map[0].data.times.slice(count, ATLAS.coherenceMap.map[0].data.count)];
            
            atlas.data.coherence.forEach((row,i) => {
              if(view === 'All') {
                this.class.uPlotData[i+1].push(eegmath.sma(row.means[band].slice(count-20, atlas.data.coherence[0].count),20)[19]);
                if(this.class.uPlotData[i+1].length > this.class.uPlotData[0].length) {
                  this.class.uPlotData[i+1].shift();
                }
              } else if (row.tag === view) {
                this.class.uPlotData[i+1].push(eegmath.sma(row.means[band].slice(count-20, atlas.data.coherence[0].count),20)[19]);
                if(this.class.uPlotData[i+1].length > this.class.uPlotData[0].length) {
                  this.class.uPlotData[i+1].shift();
                }
              }
            });
          }
        }
        if(graphmode === "TimeSeries" || graphmode === "Stacked") {
          var nsamples = Math.floor(atlas.data.eegshared.sps*this.xrange);
          if(nsamples > ref_ch.count) {nsamples = ref_ch.count-1}

          if (graphmode === "TimeSeries") {
              var nsamples = Math.floor(atlas.data.eegshared.sps*this.xrange);
              if(nsamples > ref_ch.count) { nsamples = ref_ch.count-1;}
              this.class.uPlotData = [
                ref_ch.times.slice(ref_ch.count - nsamples, ref_ch.count)
              ];
                atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                  atlas.data.eeg.find((o,j) => {
                    if(o.tag == row.tag || o.tag === o.ch) {
                      if(o.filtered.length > 0) {
                        this.class.uPlotData.push(o.filtered.slice(o.count - nsamples));
                      } else {
                        this.class.uPlotData.push(o.raw.slice(o.count - nsamples));
                      }
                    }
                  });
                });
              
            }
            else if (graphmode === "Stacked") {
              if(ref_ch.count > 0) {
                var nsamples = Math.floor(atlas.data.eegshared.sps*this.xrange);
                if(nsamples > ref_ch.count) {nsamples = ref_ch.count-1;}
          
                this.class.uPlotData = [
                    ref_ch.times.slice(ref_ch.count - nsamples, ref_ch.count)//.map((x,i) => x = x-EEG.data.ms[0])
                ];
                atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                  atlas.data.eeg.find((o,j) => {
                    if(o.tag === row.tag || o.tag === row.ch) {
                      if(o.filtered.length > 0) {
                        this.class.uPlotData.push(o.filtered.slice(o.filtered.length - nsamples, o.filtered.length ));
                      } else {
                        this.class.uPlotData.push(o.raw.slice(o.count - nsamples, o.count));
                      }
                    }
                  });
                });
              }
              else {
                this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
                  atlas.data.eegshared.eegChannelTags.forEach((row,i) => {  
                      this.class.uPlotData.push([...atlas.data.eegshared.frequencies]);
                  });
              }
              if(this.yrange !== true){
                this.class.updateStackedData(this.class.uPlotData);
              } else { 
                this.class.updateStackedData(this.class.uPlotData,true);
              }
            }
        }
      }
      //console.log(uPlotData)
      if(graphmode !== "Stacked" && this.class.uPlotData.length > 1){
        this.class.plot.setData(this.class.uPlotData);
      }
    }

    setuPlot = () => {
      let graphmode = document.getElementById(this.props.id+"mode").value;
      let view = document.getElementById(this.props.id+"channel").value;
      let newSeries = [{}];
      let ch = null; 
      let atlas = this.bci.atlas;
      let ref_ch;
      //console.log(atlas);
      
      if (view !== "All") {
        ch = parseInt(view);
      }
      if(atlas.settings.heg && graphmode === 'HEG') {
        document.getElementById(this.props.id+"title").innerHTML = "HEG";
        let tint = this.xrange*1000;
        let heg = atlas.data.heg[0];
        console.log(heg);
        let j = 0;
        if(heg.count > 2) {
          for(let i = heg.count-2; i > 0; i-- ) {
            if(heg.times[heg.count-1] - heg.times[i] > tint) {
              j = i;
              break;
            }
          }
          this.class.uPlotData = [heg.times.slice(j),heg.red.slice(j),heg.ir.slice(j),heg.ratio.slice(j)];
          if(heg.ambient.length > 0) {
            this.class.uPlotData.push(heg.ambient.slice(j))
          }
        }
        else {
          let arr = new Array(100).fill(0).map((x,i) => {x = i});
          this.class.uPlotData = [arr,arr,arr,arr,arr];
        }
        let newSeries = [{}];
        this.class.uPlotData.forEach((row,i) => {
          if(i === 0) {
            newSeries[0].label = "t"
          }
          else if (i === 1) {
            newSeries.push({
              label:"Red",
              value: (u, v) => v == null ? "-" : v.toFixed(1),
              stroke: "rgb(155,0,0)"
            });
          }
          else if (i === 2) {
            newSeries.push({
              label:"IR",
              value: (u, v) => v == null ? "-" : v.toFixed(1),
              stroke: "rgb(0,155,155)"
            });
          }
          else if (i === 3) {
            newSeries.push({
              label:"Ratio",
              value: (u, v) => v == null ? "-" : v.toFixed(1),
              stroke: "rgb(0,0,0)"
            });
          }
          else if (i === 4) {
            newSeries.push({
              label:"Ambient",
              value: (u, v) => v == null ? "-" : v.toFixed(1),
              stroke: "rgb(0,0,0)"
            });
          }
        });

        this.class.makeuPlot(
          newSeries, 
          this.class.uPlotData, 
          this.plotWidth, 
          this.plotHeight,
          undefined,
          this.yrange
        );
        this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-atlas.data.heg[0].startTime)*.00001666667)+"m:"+((v-atlas.data.heg[0].startTime)*.001 - 60*Math.floor((v-atlas.data.heg[0].startTime)*.00001666667)).toFixed(1) + "s");
  
      }
      else if(atlas.settings.eeg) {
        ref_ch = atlas.getDeviceDataByTag('eeg',atlas.data.eegshared.eegChannelTags[0].ch);
      
        if(graphmode === "TimeSeries"){
          document.getElementById(this.props.id+"title").innerHTML = "ADC signals";
      
          if(ref_ch.count > 0) {
            var nsamples = Math.floor(atlas.data.eegshared.sps*this.xrange);
            if(nsamples > ref_ch.count) {nsamples = ref_ch.count-1;}
      
            this.class.uPlotData = [
                ref_ch.times.slice(ref_ch.count - nsamples, ref_ch.count)//.map((x,i) => x = x-EEG.data.ms[0])
            ];
              atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                if(view === 'All' || row.ch === ch) {  
                  atlas.data.eeg.find((o,j) => {
                    if(o.tag == row.tag || o.tag === o.ch) {
                      if(o.filtered.length > 0) {
                        this.class.uPlotData.push(o.filtered.slice(o.count - nsamples));
                      } else {
                        this.class.uPlotData.push(o.raw.slice(o.count - nsamples));
                      }
                    }
                  });
                } 
              });
          }
          else {
            this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
              atlas.data.eegshared.eegChannelTags.forEach((row,i) => {  
                if(view === 'All' || row.ch === parseInt(view)) {
                  //console.log("gotcha")
                  this.class.uPlotData.push([...atlas.data.eegshared.frequencies]);
                  console.log(this.class.uPlotData)
                }
              });
            
          }
          if(view !== "All") {newSeries = this.class.makeSeriesFromChannelTags(atlas.data.eegshared.eegChannelTags,false,ch);}
          else {newSeries = this.class.makeSeriesFromChannelTags(atlas.data.eegshared.eegChannelTags,false);}
          newSeries[0].label = "t";
          this.class.makeuPlot(
              newSeries, 
              this.class.uPlotData, 
              this.plotWidth, 
              this.plotHeight,
              undefined,
              this.yrange
            );
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)+"m:"+((v-atlas.data.eegshared.startTime)*.001 - 60*Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)).toFixed(1) + "s");
      
        }
        else if (graphmode === "FFT"){
        
          document.getElementById(this.props.id+"title").innerHTML = "Fast Fourier Transforms";
            //Animate plot(s)
          
          this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
          if(ref_ch.fftCount > 0) {
            //console.log(posFFTList);
              atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
                if(row.analyze === true && (row.tag !== 'other' && row.tag !== null)) {
                  if(view === 'All' || row.ch === ch) {
                    atlas.data.eeg.find((o,i) => {
                      if(o.tag === row.tag || o.tag === row.ch) {
                        this.class.uPlotData.push(o.ffts[o.fftCount-1]);
                      }
                    });  
                  }
                }
                else {
                  if(view === 'All' || row.ch === ch) {
                    this.class.uPlotData.push([...atlas.data.eegshared.frequencies]); // Placeholder for unprocessed channel data.
                  }
                }
              });
            
          }
          else {
            atlas.data.eegshared.eegChannelTags.forEach((row,i) => {   
              if(view === 'All' || row.ch === ch) {
                this.class.uPlotData.push([...atlas.data.eegshared.frequencies]);
              }
            });
          }

          if(view !== "All") {newSeries = this.class.makeSeriesFromChannelTags(atlas.data.eegshared.eegChannelTags,true,ch);}
          else {newSeries = this.class.makeSeriesFromChannelTags(atlas.data.eegshared.eegChannelTags,true);}
          //console.log(newSeries); console.log(atlas.data.eegshared.eegChannelTags)
          //console.log(newSeries);
          //console.log(this.class.uPlotData);
          //console.log(newSeries)
          newSeries[0].label = "Hz";
          this.class.makeuPlot(
              newSeries, 
              this.class.uPlotData, 
              this.plotWidth, 
              this.plotHeight,
              undefined,
              this.yrange
            );
        }
        else if (graphmode === "Stacked") {
          document.getElementById(this.props.id+"title").innerHTML = "ADC signals Stacked";

          if(ref_ch.count > 0) {
            var nsamples = Math.floor(atlas.data.eegshared.sps*this.xrange);
            if(nsamples > ref_ch.count) {nsamples = ref_ch.count-1;}
      
            this.class.uPlotData = [
                ref_ch.times.slice(ref_ch.count - nsamples, ref_ch.count)//.map((x,i) => x = x-EEG.data.ms[0])
            ];
            atlas.data.eegshared.eegChannelTags.forEach((row,i) => {
              atlas.data.eeg.find((o,j) => {
                if(o.tag === row.tag || o.tag === row.ch) {
                  if(o.filtered.length > 0) {
                    this.class.uPlotData.push(o.filtered.slice(o.filtered.length - nsamples, o.filtered.length ));
                  } else {
                    this.class.uPlotData.push(o.raw.slice(o.count - nsamples, o.count));
                  }
                }
              });
            });
          }
          else {
            this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
              atlas.data.eegshared.eegChannelTags.forEach((row,i) => {  
                  this.class.uPlotData.push([...atlas.data.eegshared.frequencies]);
              });
          }
      
          //console.log(uPlotData);
          newSeries[0].label = "t";
          this.class.makeStackeduPlot(
              undefined, 
              this.class.uPlotData,
              undefined, 
              atlas.data.eegshared.eegChannelTags,
              this.plotWidth, 
              this.plotHeight,
              this.yrange
            );
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)+"m:"+((v-atlas.data.eegshared.startTime)*.001 - 60*Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)).toFixed(1) + "s");
          
        }
        else if (graphmode === "Coherence") {
          atlas.data.coherence.forEach((row,i) => {
            if(view === 'All' || row.tag === view) {
              newSeries.push({
                label:row.tag,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
              });
            }
          });
          if(atlas.data.coherence[0].ffts.length > 0){
            if(view === 'All') {
              this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
              atlas.data.coherence.forEach((o,i) => {
                this.class.uPlotData.push(o.ffts[o.fftCount-1]);
              });
              if(this.class.uPlotData.length < atlas.data.coherence.length+1) {
                for(var i = this.class.uPlotData.length; i < atlas.data.coherence.length+1; i++){
                  this.class.uPlotData.push(atlas.data.eegshared.frequencies);
                }
              }
            }
            else{
              atlas.data.coherence.find((o,i) => {
                if(o.tag === view) {
                  this.class.uPlotData = [[...atlas.data.eegshared.frequencies],o.ffts[o.fftCount-1]];
                  return true;
                }
              });
            }
          }
          else {
            this.class.uPlotData = [[...atlas.data.eegshared.frequencies]];
            atlas.data.coherence.forEach((row,i) => {
              if(view === 'All' || row.tag === view) {
                this.class.uPlotData.push(atlas.data.eegshared.frequencies);
              }
            });
          }
          //console.log(newSeries);
          //console.log(this.class.uPlotData);
          newSeries[0].label = "Hz";
          console.log(this.class.uPlotData)
          this.class.makeuPlot(
              newSeries, 
              this.class.uPlotData, 
              this.plotWidth, 
              this.plotHeight,
              undefined,
              this.yrange
            );
          document.getElementById(this.props.id+"title").innerHTML = "Coherence from tagged signals";
        
        }
        else if (graphmode === "CoherenceTimeSeries") {
          var band = document.getElementById(this.props.id+"bandview").value;
          
          var count = atlas.data.coherence[0].count-1;
          //console.log(ATLAS.coherenceMap.map[0].data.times[count-1])
          if(count > 1) {
            while(atlas.data.coherence[0].times[atlas.data.coherence[0].count-1]-atlas.data.coherence[0].times[count-1] < this.xrange*1000 && count > 0) {
              count-=1;
            }

            this.class.uPlotData = [atlas.data.coherence[0].times.slice(count, atlas.data.coherence[0].count)];

            atlas.data.coherence.forEach((row,i) => {
              if(view === 'All' || row.tag === view) {
                newSeries.push({
                  label:row.tag,
                  value: (u, v) => v == null ? "-" : v.toFixed(1),
                  stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
                });
                this.class.uPlotData.push(eegmath.sma(row.means[band].slice(count, atlas.data.coherence[0].count),20));
              }
            });
            //console.log(this.class.uPlotData)
            newSeries[0].label = "t";
            this.class.makeuPlot(
                newSeries, 
                this.class.uPlotData, 
                this.plotWidth, 
                this.plotHeight,
                undefined,
                this.yrange
              );
          }
          document.getElementById(this.props.id+"title").innerHTML = "Mean Coherence over time";
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)+"m:"+((v-atlas.data.eegshared.startTime)*.001 - 60*Math.floor((v-atlas.data.eegshared.startTime)*.00001666667)).toFixed(1) + "s");
          
        }
      }

      this.setLegend();
      if(this.looping !== true) { 
        this.looping = true;
        this.updateLoop();
      }
        //else if(graphmode === "StackedRaw") { graphmode = "StackedFFT" }//Stacked Coherence
    }

    setLegend = () => {
      document.getElementById(this.props.id+"legend").innerHTML = "";
      let htmlToAppend = ``;
      this.class.plot.series.forEach((ser,i) => {
        if(i>0){
          htmlToAppend += `<div id='`+this.props.id+ser.label+`' style='color:`+ser.stroke+`; cursor:pointer;'>`+ser.label+`</div>`;
        }
      });
      document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
      this.class.plot.series.forEach((ser,i) => {
        if(i>0){
          document.getElementById(this.props.id+ser.label).onclick = () => {
            if(this.class.plot.series[i].show === true){
              document.getElementById(this.props.id+ser.label).style.opacity = 0.3;
              this.class.plot.setSeries(i,{show:false});
            } else {this.class.plot.setSeries(i,{show:true}); document.getElementById(this.props.id+ser.label).style.opacity = 1;}
          }
        }
      });
    }

   
} 