import {State} from '../frontend/State'
import {EEG, ATLAS, genBandviewSelect, addChannelOptions, addCoherenceOptions} from '../frontend/EEGInterface'
import {DOMFragment} from '../frontend/DOMFragment'
import {uPlotMaker} from '../utils/visuals/eegvisuals'
import {eegmath} from '../utils/eeg32'

/*
TODO:
Custom plot legend, still clickable but much more compact.
*/

//You can extend or call this class and set renderProps and these functions
export class uPlotApplet {
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
        this.mode = "uplot";
        this.sub = null;

        this.loop = null;
        
        this.timeRange = 10;
        this.yrange = true;
        this.xrange = 10;
        this.plotWidth = 500;
        this.plotHeight = 300;
    }

    //----------- default functions, keep and customize these --------

    //Create HTML template string with dynamic properties set in this.renderProps. Updates to these props will cause updates to the template
    HTMLtemplate(props=this.renderProps) {
        return `
        <div id='`+props.id+`'>    
            <div id='`+props.id+`canvas' style='position:absolute;z-index:3; top:50px'></div>
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
                      <option value="Stacked">Stacked Raw</option>c
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
        </div>
        `; //
    }

    //Setup javascript functions for the new HTML here
    setupHTML() {
        document.getElementById(this.renderProps.id+"bandview").style.display="none";
        document.getElementById(this.renderProps.id+'xrangetd').style.display = "none";
        document.getElementById(this.renderProps.id+'mode').onchange = () => {
          this.yrange = true;
          if(document.getElementById(this.renderProps.id+'mode').value === "CoherenceTimeSeries" || document.getElementById(this.renderProps.id+'mode').value === "Coherence"){
            addCoherenceOptions(this.renderProps.id+'channel',true,['All']);
          }
          else if (document.getElementById(this.renderProps.id+'mode').value === "TimeSeries" || document.getElementById(this.renderProps.id+'mode').value === "Stacked"){
            addChannelOptions(this.renderProps.id+'channel',false,['All']);
          }
          else {
            addChannelOptions(this.renderProps.id+'channel',true,['All']);
          }
          if (document.getElementById(this.renderProps.id+'mode').value === "CoherenceTimeSeries") {
            document.getElementById(this.renderProps.id+'xrangetd').style.display = "";
            document.getElementById(this.renderProps.id+"bandview").style.display="";
          }
          else if(document.getElementById(this.renderProps.id+'mode').value==="TimeSeries") { 
            document.getElementById(this.renderProps.id+'xrangetd').style.display = "";
            document.getElementById(this.renderProps.id+"bandview").style.display="none";
          }
          else {
            document.getElementById(this.renderProps.id+'xrangetd').style.display = "none";
            document.getElementById(this.renderProps.id+"bandview").style.display="none";
          }
          
          this.setuPlot();
    

          if(document.getElementById(this.renderProps.id+'mode').value==="TimeSeries") {
              if(this.sub !== null){
                  State.unsubscribe('FFTResult',this.sub);
                  this.sub = null;
                  this.updateLoop();
              }
          }
          else { 
              if(this.sub === null) {
                  cancelAnimationFrame(this.loop);
                  this.sub = State.subscribe('FFTResult',this.onUpdate);
              }
          }
        }

        document.getElementById(this.renderProps.id+'bandview').style.width='98px';

        document.getElementById(this.renderProps.id+'bandview').onchange = () => {
            if(document.getElementById(this.renderProps.id+'mode').value === "CoherenceTimeSeries"){
                this.setuPlot();
            }
        }
        document.getElementById(this.renderProps.id+'channel').onchange = () => {
          this.setuPlot();
        }

        addChannelOptions(this.renderProps.id+'channel',true,['All']);

        document.getElementById(this.renderProps.id+'xrangeset').onclick = () => {
          let val = parseInt(document.getElementById(this.renderProps.id+'xrange').value)
          if(!isNaN(val)){
            if(val < 1) { val = 1; }
            if(val > 300) { val = 300; }
            this.xrange = val;
          }
        }

        document.getElementById(this.renderProps.id+'yrangeset').onclick = () => {
          let val = document.getElementById(this.renderProps.id+'yrange').value;
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

    //Initialize the applet. Keep the first line.
    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML()},undefined,"NEVER"); //Changes to this.props will automatically update the html template
        
        this.setPlotDims();
        
        this.class = new uPlotMaker(this.renderProps.id+'canvas');       
        //this.setuPlot(); console.log(this.class.plot)
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
        this.setPlotDims();
        this.setuPlot();
    }

    //------------ add new functions below ---------------

    setPlotDims = () => {
        this.plotWidth = this.AppletHTML.node.clientWidth;
        this.plotHeight = this.AppletHTML.node.clientHeight - 30;
    }

    updateLoop = () => {
        this.onUpdate();
        this.loop = requestAnimationFrame(this.updateLoop);
    }

    stop = () => {
      cancelAnimationFrame(this.loop);
      this.loop = null;
    }

    onUpdate = () => {
      var graphmode = document.getElementById(this.renderProps.id+"mode").value;
      var view = document.getElementById(this.renderProps.id+"channel").value;
      let ch = null; 
        if (view !== "All") {
          ch = parseInt(view);
        }
      if(graphmode === "FFT"){
          //Animate plot(s)
          this.class.uPlotData = [
              ATLAS.fftMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)
          ];
            ATLAS.channelTags.forEach((row,i) => {
              if(row.viewing === true &&  (row.tag !== 'other' && row.tag !== null)) {
                if(view === 'All' || row.ch === ch) {
                  this.class.uPlotData.push(State.data.FFTResult[i].slice(State.data.fftViewStart,State.data.fftViewEnd));
                }
              }
            });
          
      }
      else if (graphmode === "Coherence") {
        if(view === 'All') {
          this.class.uPlotData = [ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)];
          //console.log(State.data.coherenceResult)
          State.data.coherenceResult.forEach((result,i) => {
            this.class.uPlotData.push(result.slice(State.data.fftViewStart,State.data.fftViewEnd));
          })
        }
        else{
          ATLAS.coherenceMap.map.find((o,i) => {
            //console.log(o)
            if(o.tag === view) {
              this.class.uPlotData = [ATLAS.fftMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd),o.data.amplitudes[o.data.count-1].slice(State.data.fftViewStart,State.data.fftViewEnd)];
              return true;
            }
          });
        }
        //console.log(this.class.uPlotData);
      }
      else if (graphmode === "CoherenceTimeSeries") {
        var band = document.getElementById(this.renderProps.id+"bandview").value
        
        var count = ATLAS.coherenceMap.map[0].data.count;
        //console.log(ATLAS.coherenceMap.map[0].data.times[count-1])
        //console.log(this.xrange)
        if(this.class.uPlotData[0][this.class.uPlotData[0].length-1]-this.class.uPlotData[0][0] >= this.xrange*1000) {
          this.class.uPlotData[0].shift();
        }
        //console.log(EEG.sps*this.xrange)
        //console.log(this.class.uPlotData[0].length)
        this.class.uPlotData[0].push(ATLAS.coherenceMap.map[0].data.times[count-1])// = [ATLAS.coherenceMap.map[0].data.times.slice(count, ATLAS.coherenceMap.map[0].data.count)];
        
          ATLAS.coherenceMap.map.forEach((row,i) => {
            if(view === 'All') {
              this.class.uPlotData[i+1].push(eegmath.sma(row.data.means[band].slice(count-20, ATLAS.coherenceMap.map[0].data.count),20)[19]);
              if(this.class.uPlotData[i+1].length > this.class.uPlotData[0].length) {
                this.class.uPlotData[i+1].shift();
              }
            } else if (row.tag === view) {
              this.class.uPlotData[i+1].push(eegmath.sma(row.data.means[band].slice(count-20, ATLAS.coherenceMap.map[0].data.count),20)[19]);
              if(this.class.uPlotData[i+1].length > this.class.uPlotData[0].length) {
                this.class.uPlotData[i+1].shift();
              }
            }
          });
        
        
        //Do a push and pop and get the moving average instead
      }
      else {
        var nsamples = Math.floor(EEG.sps*this.xrange);
        if(nsamples > EEG.data.counter) {nsamples = EEG.data.counter-1}

        if (graphmode === "TimeSeries") {
            var nsamples = Math.floor(EEG.sps*this.xrange);
            if(nsamples > EEG.data.counter) { nsamples = EEG.data.counter-1;}
            this.class.uPlotData = [
                EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)
            ];
              ATLAS.channelTags.forEach((row,i) => {
                if(row.viewing === true) {
                  if(view === 'All' || row.ch === ch) {  
                    if(State.data.useFilters === true) {
                      this.class.uPlotData.push(State.data.filtered["A"+row.ch].slice(State.data.filtered["A"+row.ch].length - nsamples, State.data.filtered["A"+row.ch].length));
                    } else {
                      this.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
                    }
                  } 
                } 
                
              });
          }
          else if (graphmode === "Stacked") {
            this.class.uPlotData = [
                EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)
            ];
            ATLAS.channelTags.forEach((row,i) => {
              if(row.viewing === true) { 
                  if(State.data.useFilters === true) {
                    this.class.uPlotData.push(State.data.filtered["A"+row.ch].slice(State.data.filtered["A"+row.ch].length - nsamples, State.data.filtered["A"+row.ch].length));
                  } else {
                    this.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
                  }
              } 
            });
            if(this.yrange !== true){
              this.class.updateStackedData(this.class.uPlotData);
            } else { 
              this.class.updateStackedData(this.class.uPlotData,true);
            }
          }
      }

      //console.log(uPlotData)
      if(graphmode !== "Stacked"){
        this.class.plot.setData(this.class.uPlotData);
      }
    }

    setuPlot = () => {
      
        var gmode = document.getElementById(this.renderProps.id+"mode").value;
        var view = document.getElementById(this.renderProps.id+"channel").value;
        let newSeries = [{}];
        let ch = null; 
        if (view !== "All") {
          ch = parseInt(view);
        }
        if(gmode === "TimeSeries"){
          document.getElementById(this.renderProps.id+"title").innerHTML = "ADC signals";
      
          if(State.data.counter > 0) {
            var nsamples = Math.floor(EEG.sps*this.xrange);
            if(nsamples > EEG.data.counter) {nsamples = EEG.data.counter-1;}
      
            this.class.uPlotData = [
                EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)//.map((x,i) => x = x-EEG.data.ms[0])
            ];
              ATLAS.channelTags.forEach((row,i) => {
                  if(row.viewing === true) {
                    if(view === 'All' || row.ch === ch) {
                      if(State.data.useFilters === true) {
                        this.class.uPlotData.push(State.data.filtered["A"+row.ch].slice(State.data.filtered["A"+row.ch].length - nsamples, State.data.filtered["A"+row.ch].length ));
                      } else {
                        this.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
                      }
                    }
                  }
              });
            
            }
          else {
            this.class.uPlotData = [[...ATLAS.fftMap.shared.bandPassWindow]];
              ATLAS.channelTags.forEach((row,i) => {  
                if(view === 'All' || row.ch === parseInt(view)) {
                  console.log("gotcha")
                  this.class.uPlotData.push([...ATLAS.fftMap.shared.bandPassWindow]);
                  console.log(this.class.uPlotData)
                }
              });
            
          }

          if(view !== "All") {newSeries = this.class.makeSeriesFromChannelTags(ATLAS.channelTags,false,ch);}
          else {newSeries = this.class.makeSeriesFromChannelTags(ATLAS.channelTags,false);}
          newSeries[0].label = "t";
          this.class.makeuPlot(
              newSeries, 
              this.class.uPlotData, 
              this.plotWidth, 
              this.plotHeight,
              undefined,
              this.yrange
            );
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-EEG.data.startms)*.00001666667)+"m:"+((v-EEG.data.startms)*.001 - 60*Math.floor((v-EEG.data.startms)*.00001666667)).toFixed(1) + "s");
      
        }
        else if (gmode === "FFT"){
      
              document.getElementById(this.renderProps.id+"title").innerHTML = "Fast Fourier Transforms";
                //Animate plot(s)
               
              this.class.uPlotData = [
                ATLAS.fftMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)
              ];
              if((State.data.FFTResult.length > 0) && (State.data.FFTResult.length <= ATLAS.channelTags.length)) {
                //console.log(posFFTList);
                  ATLAS.channelTags.forEach((row,i) => {
                    if(i < State.data.FFTResult.length){
                      if(row.viewing === true && (row.tag !== 'other' && row.tag !== null)) {
                        if(view === 'All' || row.ch === ch) {
                          this.class.uPlotData.push(State.data.FFTResult[i].slice(State.data.fftViewStart,State.data.fftViewEnd));
                        }
                      }
                    }
                    else {
                      if(view === 'All' || row.ch === ch) {
                        this.class.uPlotData.push(ATLAS.fftMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)); // Placeholder for unprocessed channel data.
                      }
                    }
                  });
                
              }
              else {
                ATLAS.channelTags.forEach((row,i) => {   
                  if(view === 'All' || row.ch === ch) {
                    this.class.uPlotData.push(ATLAS.fftMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd));
                  }
                });
              }

              if(view !== "All") {newSeries = this.class.makeSeriesFromChannelTags(ATLAS.channelTags,true,ch);}
              else {newSeries = this.class.makeSeriesFromChannelTags(ATLAS.channelTags,true);}

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
        else if (gmode === "Stacked") {
          document.getElementById(this.renderProps.id+"title").innerHTML = "ADC signals Stacked";

          if(State.data.counter > 0) {
            var nsamples = Math.floor(EEG.sps*this.xrange);
            if(nsamples > EEG.data.counter) {nsamples = EEG.data.counter-1;}
      
            this.class.uPlotData = [
                EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)//.map((x,i) => x = x-EEG.data.ms[0])
            ];
            ATLAS.channelTags.forEach((row,i) => {
                if(row.viewing === true) {
                    if(State.data.useFilters === true) {
                      this.class.uPlotData.push(State.data.filtered["A"+row.ch].slice(State.data.filtered["A"+row.ch].length - nsamples, State.data.filtered["A"+row.ch].length ));
                    } else {
                      this.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
                    }
                  }
            });
          }
          else {
            this.class.uPlotData = [[...ATLAS.fftMap.shared.bandPassWindow]];
              ATLAS.channelTags.forEach((row,i) => {  
                  this.class.uPlotData.push([...ATLAS.fftMap.shared.bandPassWindow]);
              });
          }
      
          //console.log(uPlotData);
          newSeries[0].label = "t";
          this.class.makeStackeduPlot(
              undefined, 
              this.class.uPlotData,
              undefined, 
              ATLAS.channelTags,
              this.plotWidth, 
              this.plotHeight,
              this.yrange
            );
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-EEG.data.startms)*.00001666667)+"m:"+((v-EEG.data.startms)*.001 - 60*Math.floor((v-EEG.data.startms)*.00001666667)).toFixed(1) + "s");
          
        }
        else if (gmode === "Coherence") {
          ATLAS.coherenceMap.map.forEach((row,i) => {
            if(view === 'All' || row.tag === view) {
              newSeries.push({
                label:row.tag,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
              });
            }
          });

          if((State.data.coherenceResult.length > 0) && (State.data.coherenceResult.length <= ATLAS.coherenceMap.map.length)){
            if(view === 'All') {
              this.class.uPlotData = [ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)];
              State.data.coherenceResult.forEach((result,i) => {
                this.class.uPlotData.push(result.slice(State.data.fftViewStart,State.data.fftViewEnd));
              });
              if(this.class.uPlotData.length < ATLAS.coherenceMap.map.length+1) {
                for(var i = this.class.uPlotData.length; i < ATLAS.coherenceMap.map.length+1; i++){
                  this.class.uPlotData.push(ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd));
                }
              }
            }
            else{
              ATLAS.coherenceMap.map.find((o,i) => {
                if(o.tag === view) {
                  this.class.uPlotData = [ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd),o.data.amplitudes[o.data.count-1].slice(State.data.fftViewStart,State.data.fftViewEnd)];
                  return true;
                }
              });
            }
          }
          else {
            this.class.uPlotData = [ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd)];
            ATLAS.coherenceMap.map.forEach((row,i) => {
              if(view === 'All' || row.tag === view) {
                this.class.uPlotData.push(ATLAS.coherenceMap.shared.bandPassWindow.slice(State.data.fftViewStart,State.data.fftViewEnd));
              }
            });
          }
          //console.log(newSeries);
          //console.log(this.class.uPlotData);
          newSeries[0].label = "Hz";
          this.class.makeuPlot(
              newSeries, 
              this.class.uPlotData, 
              this.plotWidth, 
              this.plotHeight,
              undefined,
              this.yrange
            );
          document.getElementById(this.renderProps.id+"title").innerHTML = "Coherence from tagged signals";
         
        }
        else if (gmode === "CoherenceTimeSeries") {
          var band = document.getElementById(this.renderProps.id+"bandview").value;
          
          var count = ATLAS.coherenceMap.map[0].data.count-1;
          //console.log(ATLAS.coherenceMap.map[0].data.times[count-1])
          while(ATLAS.coherenceMap.map[0].data.times[ATLAS.coherenceMap.map[0].data.count-1]-ATLAS.coherenceMap.map[0].data.times[count-1] < this.xrange*1000 && count > 0) {
            count-=1;
          }

          this.class.uPlotData = [ATLAS.coherenceMap.map[0].data.times.slice(count, ATLAS.coherenceMap.map[0].data.count)];

          ATLAS.coherenceMap.map.forEach((row,i) => {
            if(view === 'All' || row.tag === view) {
              newSeries.push({
                label:row.tag,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
              });
              this.class.uPlotData.push(eegmath.sma(row.data.means[band].slice(count, ATLAS.coherenceMap.map[0].data.count),20));
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
          document.getElementById(this.renderProps.id+"title").innerHTML = "Mean Coherence over time";
          this.class.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-EEG.data.startms)*.00001666667)+"m:"+((v-EEG.data.startms)*.001 - 60*Math.floor((v-EEG.data.startms)*.00001666667)).toFixed(1) + "s");
          
        }

        this.setLegend();
        //else if(graphmode === "StackedRaw") { graphmode = "StackedFFT" }//Stacked Coherence
      }

      setLegend = () => {
        document.getElementById(this.renderProps.id+"legend").innerHTML = "";
        let htmlToAppend = ``;
        this.class.plot.series.forEach((ser,i) => {
          if(i>0){
            htmlToAppend += `<div id='`+this.renderProps.id+ser.label+`' style='color:`+ser.stroke+`; cursor:pointer;'>`+ser.label+`</div>`;
          }
        });
        document.getElementById(this.renderProps.id+"legend").innerHTML = htmlToAppend;
        this.class.plot.series.forEach((ser,i) => {
          if(i>0){
            document.getElementById(this.renderProps.id+ser.label).onclick = () => {
              if(this.class.plot.series[i].show === true){
                document.getElementById(this.renderProps.id+ser.label).style.opacity = 0.3;
                this.class.plot.setSeries(i,{show:false});
              } else {this.class.plot.setSeries(i,{show:true}); document.getElementById(this.renderProps.id+ser.label).style.opacity = 1;}
            }
          }
        });
        
      }
}