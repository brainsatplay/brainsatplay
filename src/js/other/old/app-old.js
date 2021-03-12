import {eeg32, eegmath} from './eeg32.js'
import {SmoothieChartMaker, uPlotMaker, TimeChartMaker, Spectrogram, mirrorBarChart, eegBarChart, brainMap2D, BufferLoader, SoundJS, geolocateJS} from './eegvisuals.js'
import {GPU} from 'gpu.js'
import {gpuUtils} from './utils/gpuUtils.js'


if(!navigator.serial)
  console.error("navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental') then refresh");//document.getElementById("p").innerHTML = "navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental') then refresh";

try { window.EEG = new eeg32(); }
catch (error) { alert("eeg32.js err: ", error) }

var gfx = new GPU();

try { window.gpu = new gpuUtils(gfx); }
catch (err) { alert("gpu.js utils error: ", err); }


window.session = {
  nSec: 1,
  freqStart: 0,
  freqEnd: 100,
  lastPostTime: 0,
  posFFTList: [],
  coherenceResults: [],
  bandPassWindow: [],
  nSecAdcGraph: 10,
  fdbackmode: "coherence",
  newMsg: true,
  vscale: EEG.vref*EEG.stepSize,
  stepsPeruV: 0.000001 / (EEG.vref*EEG.stepSize),
  scalar: 1/(0.000001 / (EEG.vref*EEG.stepSize)),
  anim: null,
  analyze: false,
  analyzeloop: null,
  rawfeed: false,
  rawfeedloop: null,
  visuals: []
};

session.bandPassWindow = gpu.bandPassWindow(session.freqStart,session.freqEnd,EEG.sps)


EEG.channelTags = [
  {ch: 4, tag: "T3", viewing: true},
  {ch: 24, tag: "T4", viewing: true}
];

EEG.atlas = EEG.makeAtlas10_20();
EEG.coherenceMap = EEG.genCoherenceMap(EEG.channelTags);
EEG.atlas.shared.bandPassWindow = session.bandPassWindow;
EEG.atlas.shared.bandFreqs = EEG.getBandFreqs(session.bandPassWindow);
EEG.coherenceMap.shared.bandPassWindow = session.bandPassWindow;
EEG.coherenceMap.shared.bandFreqs = EEG.atlas.shared.bandFreqs;



var vis1 = setupVisualContainer("visual1",700,300,"uplot","block1");
var vis2 = setupVisualContainer("visual2",400,400,"brainmap","block2");
var vis3 = setupVisualContainer("visual3",700,200,"smoothie","block3");
var vis4 = setupVisualContainer("visual4",500,200,"spectrogram","block4");

session.visuals = [vis1,vis2,vis3,vis4];

document.getElementById("vis2").onchange = () => {
  setMode(document.getElementById("vis2").value, vis2);
}

document.getElementById("vis3").onchange = () => {
  setMode(document.getElementById("vis3").value, vis3);
}

document.getElementById("vis4").onchange = () => {
  setMode(document.getElementById("vis4").value, vis4);
}

//appendId is the element Id you want to append this fragment to
function appendFragment(HTMLtoAppend, parentId) {

  var fragment = document.createDocumentFragment();
  var newDiv = document.createElement('div');
  newDiv.insertAdjacentHTML('afterbegin',HTMLtoAppend);
  newDiv.setAttribute("id", parentId + '_child');

  fragment.appendChild(newDiv);

  document.getElementById(parentId).appendChild(fragment);
}

//delete selected fragment. Will delete the most recent fragment if Ids are shared.
function deleteFragment(parentId,fragmentId) {
  var this_fragment = document.getElementById(fragmentId);
  document.getElementById(parentId).removeChild(this_fragment);
}

//Remove Element Parent By Element Id (for those pesky anonymous child fragment containers)
function removeParent(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.parentNode.removeChild(element.parentNode);
}


//generalize this for the eeg32 class
//TODO De-spaghettify
var channelBands = (channel,tag) => {
  //console.log(posFFTList[channel])
  //console.time("slicing bands");
  let atlasCoord = EEG.atlas.map.find((o, i) => {
    if(o.tag === tag){
      EEG.atlas.map[i].data.times.push(session.lastPostTime);
      EEG.atlas.map[i].data.amplitudes.push(session.posFFTList[channel]);
      if(EEG.atlas.shared.bandFreqs.scp[1].length > 0){
        var scp = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.scp[1][0], EEG.atlas.shared.bandFreqs.scp[1][EEG.atlas.shared.bandFreqs.scp[1].length-1]+1);
        EEG.atlas.map[i].data.slices.scp.push(scp);
        EEG.atlas.map[i].data.means.scp.push(eegmath.mean(scp));
      }
      if(EEG.atlas.shared.bandFreqs.scp[1].length > 0){
        var delta = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.delta[1][0], EEG.atlas.shared.bandFreqs.delta[1][EEG.atlas.shared.bandFreqs.delta[1].length-1]+1);
        EEG.atlas.map[i].data.slices.delta.push(delta);
        EEG.atlas.map[i].data.means.delta.push(eegmath.mean(delta));
      }
      if(EEG.atlas.shared.bandFreqs.theta[1].length > 0){
        var theta = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.theta[1][0], EEG.atlas.shared.bandFreqs.theta[1][EEG.atlas.shared.bandFreqs.theta[1].length-1]+1);
        EEG.atlas.map[i].data.slices.theta.push(theta);
        EEG.atlas.map[i].data.means.theta.push(eegmath.mean(theta));
      }
      if(EEG.atlas.shared.bandFreqs.alpha1[1].length > 0){
        var alpha1 = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.alpha1[1][0], EEG.atlas.shared.bandFreqs.alpha1[1][EEG.atlas.shared.bandFreqs.alpha1[1].length-1]+1);
        EEG.atlas.map[i].data.slices.alpha1.push(alpha1);
        EEG.atlas.map[i].data.means.alpha1.push(eegmath.mean(alpha1));
      }
      if(EEG.atlas.shared.bandFreqs.alpha2[1].length > 0){
        var alpha2 = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.alpha2[1][0], EEG.atlas.shared.bandFreqs.alpha2[1][EEG.atlas.shared.bandFreqs.alpha2[1].length-1]+1);
        EEG.atlas.map[i].data.slices.alpha2.push(alpha2);
        EEG.atlas.map[i].data.means.alpha2.push(eegmath.mean(alpha2));
      }
      if(EEG.atlas.shared.bandFreqs.beta[1].length > 0){
        var beta  = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.beta[1][0],  EEG.atlas.shared.bandFreqs.beta[1][EEG.atlas.shared.bandFreqs.beta[1].length-1]+1);
        EEG.atlas.map[i].data.slices.beta.push(beta);
        EEG.atlas.map[i].data.means.beta.push(eegmath.mean(beta));
      }
      if(EEG.atlas.shared.bandFreqs.lowgamma[1].length > 0){
        var lowgamma = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.lowgamma[1][0], EEG.atlas.shared.bandFreqs.lowgamma[1][EEG.atlas.shared.bandFreqs.lowgamma[1].length-1]+1);
        EEG.atlas.map[i].data.slices.lowgamma.push(lowgamma);
        EEG.atlas.map[i].data.means.lowgamma.push(eegmath.mean(lowgamma));
      }
      if(EEG.atlas.shared.bandFreqs.highgamma[1].length > 0){
        var highgamma = session.posFFTList[channel].slice( EEG.atlas.shared.bandFreqs.highgamma[1][0], EEG.atlas.shared.bandFreqs.highgamma[1][EEG.atlas.shared.bandFreqs.highgamma[1].length-1]+1);
        EEG.atlas.map[i].data.slices.highgamma.push(highgamma);
        EEG.atlas.map[i].data.means.highgamma.push(eegmath.mean(highgamma));
      }
      //console.timeEnd("slicing bands");
      return true;
    }
  });
}

var mapCoherenceData = () => {
  session.coherenceResults.forEach((row,i) => {
    EEG.coherenceMap.map[i].data.amplitudes.push(row);
    EEG.coherenceMap.map[i].data.times.push(session.lastPostTime);

  if(EEG.coherenceMap.shared.bandFreqs.scp[1].length > 0){
    var scp = row.slice( EEG.coherenceMap.shared.bandFreqs.scp[1][0], EEG.coherenceMap.shared.bandFreqs.scp[1][EEG.coherenceMap.shared.bandFreqs.scp[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.scp.push(scp);
    EEG.coherenceMap.map[i].data.means.scp.push(eegmath.mean(scp));
  }
  if(EEG.coherenceMap.shared.bandFreqs.delta[1].length > 0){
    var delta = row.slice( EEG.coherenceMap.shared.bandFreqs.delta[1][0], EEG.coherenceMap.shared.bandFreqs.delta[1][EEG.coherenceMap.shared.bandFreqs.delta[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.delta.push(delta);
    EEG.coherenceMap.map[i].data.means.delta.push(eegmath.mean(delta));
  }
  if(EEG.coherenceMap.shared.bandFreqs.theta[1].length > 0){
    var theta = row.slice( EEG.coherenceMap.shared.bandFreqs.theta[1][0], EEG.coherenceMap.shared.bandFreqs.theta[1][EEG.coherenceMap.shared.bandFreqs.theta[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.theta.push(theta);
    EEG.coherenceMap.map[i].data.means.theta.push(eegmath.mean(theta));
  }
  if(EEG.coherenceMap.shared.bandFreqs.alpha1[1].length > 0){
    var alpha1 = row.slice( EEG.coherenceMap.shared.bandFreqs.alpha1[1][0], EEG.coherenceMap.shared.bandFreqs.alpha1[1][EEG.coherenceMap.shared.bandFreqs.alpha1[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.alpha1.push(alpha1);
    EEG.coherenceMap.map[i].data.means.alpha1.push(eegmath.mean(alpha1));
  }
  if(EEG.coherenceMap.shared.bandFreqs.alpha2[1].length > 0){
    var alpha2 = row.slice( EEG.coherenceMap.shared.bandFreqs.alpha2[1][0], EEG.coherenceMap.shared.bandFreqs.alpha2[1][EEG.coherenceMap.shared.bandFreqs.alpha2[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.alpha2.push(alpha2);
    EEG.coherenceMap.map[i].data.means.alpha2.push(eegmath.mean(alpha2));
  }
  if(EEG.coherenceMap.shared.bandFreqs.beta[1].length > 0){
    var beta  = row.slice( EEG.coherenceMap.shared.bandFreqs.beta[1][0],  EEG.coherenceMap.shared.bandFreqs.beta[1][EEG.coherenceMap.shared.bandFreqs.beta[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.beta.push(beta);
    EEG.coherenceMap.map[i].data.means.beta.push(eegmath.mean(beta));
  }
  if(EEG.coherenceMap.shared.bandFreqs.lowgamma[1].length > 0){
    var lowgamma = row.slice( EEG.coherenceMap.shared.bandFreqs.lowgamma[1][0], EEG.coherenceMap.shared.bandFreqs.lowgamma[1][EEG.coherenceMap.shared.bandFreqs.lowgamma[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.lowgamma.push(lowgamma);
    EEG.coherenceMap.map[i].data.means.lowgamma.push(eegmath.mean(lowgamma));
  }
  if(EEG.coherenceMap.shared.bandFreqs.highgamma[1].length > 0){
    var highgamma = row.slice( EEG.coherenceMap.shared.bandFreqs.highgamma[1][0], EEG.coherenceMap.shared.bandFreqs.highgamma[1][EEG.coherenceMap.shared.bandFreqs.highgamma[1].length-1]+1);
    EEG.coherenceMap.map[i].data.slices.highgamma.push(highgamma);
    EEG.coherenceMap.map[i].data.means.highgamma.push(eegmath.mean(highgamma));
  }
  });
}

//For single threaded mode
function coherence(data, nSec, freqStart, freqEnd, scalar=1) {
  const correlograms = eegmath.correlograms(e.data.input[0]);
      const buffer = [...e.data.input[0],...correlograms];
      var dfts;

      dfts = gpu.MultiChannelDFT_Bandpass(buffer, nSec, freqStart, freqEnd, scalar);
      const cordfts = dfts[1].splice(data.length, buffer.length-data.length);
      //console.log(cordfts)

      const coherenceResults = [];
      const nChannels = data.length;

      //cross-correlation dfts arranged like e.g. for 4 channels: [0:0, 0:1, 0:2, 0:3, 1:1, 1:2, 1:3, 2:2, 2:3, 3:3] etc.
      var k=0;
      var l=0;
      cordfts.forEach((row,i) => { //move autocorrelation results to front to save brain power
        if (l+k === nChannels) {
          var temp = cordfts.splice(i,1);
          k++;
          cordfts.splice(k,0,...temp);
          l=0;
          //console.log(i);
        }
        l++;
      });
      //Now arranged like [0:0,1:1,2:2,3:3,0:1,0:2,0:3,1:2,1:3,2:3]

      //Outputs FFT coherence data in order of channel data inputted e.g. for 4 channels resulting DFTs = [0:1,0:2,0:3,1:2,1:3,2:3];

      var autoFFTproducts = [];
      k = 0;
      l = 1;
      cordfts.forEach((dft,i) => {
        var newdft = new Array(dft.length).fill(0);
        if(i < nChannels) { //first multiply autocorrelograms
          dft.forEach((amp,j) => {
            newdft[j] = amp*dfts[1][i][j];
          });
          autoFFTproducts.push(newdft);
        }
        else{ //now multiply cross correlograms
          //var timeMod = (e.data.input[1]-1)*.3333333; //Scaling for longer time intervals
          //if(timeMod <= 1) { timeMod = 1; }
          dft.forEach((amp,j) => {
              newdft[j] = amp*autoFFTproducts[k][j]*autoFFTproducts[k+l][j]*0.001041666666666; //I don't remember how I got to this scalar but it helps return the exact amount of amplitude resonance...
          });
          l++;
          if((l+k) === nChannels) {
            k++;
            l = 1;
          }
          coherenceResults.push(newdft);
        }
      });
      return [dfts[0], dfts[1], coherenceResults];
}






//---------------------------------------
//----------- PERFORM ANALYSIS ----------
//---------------------------------------


function processFFTs() {

  //Separate and report channel results by band
  EEG.channelTags.forEach((row,i) => {
      if((row.tag !== null) && (i < EEG.nChannels)){
          //console.log(tag);
          channelBands(i,row.tag);
      }
  });

}


//Should do a lot of this with a worker to keep the UI smooth and prevent hangups
var analysisLoop = () => {
  if((session.analyze === true) && (session.newMsg === true)) {
    //console.log("analyzing")
      var buffer = [];
      for(var i = 0; i < EEG.channelTags.length; i++){
          if(i < EEG.nChannels) {
              var channel = "A"+EEG.channelTags[i].ch;
              var dat = EEG.data[channel].slice(EEG.data.counter - EEG.sps, EEG.data.counter);
              buffer.push(dat);
          }
      }
      session.lastPostTime = performance.now();
      if(window.workers !== undefined){

        session.newMsg = false;
        if(session.fdbackmode === "coherence") {
          window.postToWorker("coherence",[buffer,session.nSec,session.freqStart,session.freqEnd,session.scalar]);
        }
        else {
          window.postToWorker("multidftbandpass",[buffer,nSec,freqStart,freqEnd,session.scalar]);
        }

      }

      else{

        if(session.fdbackmode === "coherence") {
          console.time("GPU DFT + coherence");
          var results = coherence(buffer, session.nSec, session.freqStart, session.freqEnd, session.scalar);
          console.timeEnd("GPU DFT + coherence");
          console.log("FFTs processed: ", buffer.length+results[2].length);
          session.bandPassWindow = results[0];
          session.posFFTList = results[1];
          session.coherenceResults = results[2];
        }
        else {
          console.time("GPU DFT");
          session.posFFTList = gpu.MultiChannelDFT_Bandpass(buffer, session.nSec, session.freqStart, session.freqEnd, session.scalar)[1]; // Mass FFT
          console.timeEnd("GPU DFT");
          console.log("FFTs processed: ", buffer.length);

        }

        processFFTs();

        //Update visuals
        session.anim = requestAnimationFrame(updateVisualContainers());
      }

  }
  if(session.analyze === true) {setTimeout(() => {session.analyzeloop = requestAnimationFrame(analysisLoop);},50)};

}


//-------------------------------------------
//---------------RAW DATA VIS----------------
//-------------------------------------------

//Separate animation cycle for raw data feeds (smoother)
var updateRawFeed = () => {
  if(session.rawfeed === true) {
    session.rawfeedloop = requestAnimationFrame(() => {updateVisualContainers("RAW");});
    setTimeout(() => {
      updateRawFeed();
    }, 30);
  }
}


//-------------------------------------------
//----------------Worker stuff---------------
//-------------------------------------------


//For handling worker messages
window.receivedMsg = (msg) => {
  if(msg.foo === "multidftbandpass") {
    //console.log(msg)
    session.posFFTList = [...msg.output[1]];
    //session.posFFTList.forEach((row,i) => {
    //  row.map( x => x * session.stepsPeruV);
    //});

    processFFTs();
    session.anim = requestAnimationFrame(() => {updateVisualContainers("FFT")});

  }
  if(msg.foo === "coherence") {
    session.posFFTList = [...msg.output[1]];
    //session.posFFTList.forEach((row,i) => {
    //  row.map( x => x * session.stepsPeruV);
    //});
    session.coherenceResults = [...msg.output[2]];
    processFFTs();
    mapCoherenceData();
    try{
      session.anim = requestAnimationFrame(() => {updateVisualContainers("Coherence")});
    }
    catch(err) {
      console.log(err)
    }
  }
  session.newMsg = true;
}




//---------------------------------------
//-------------- UI SETUP ---------------
//---------------------------------------

function setupVisualContainer(containerId, width, height, mode="none", appendToId){
  var containerobj = {
    id: containerId,
    elem: null,
    child: null,
    width: width,
    height: height,
    mode: "none",
    class: null,
    resetmode: function() {
      if(this.class !== null){
        this.class.deInit();
        this.elem.removeChild(this.child);
        this.class = null;
        this.mode = "none";
      }
    }
  };

  var HTMLtoAppend = genVisualContainer(containerId, width, height);
  appendFragment(HTMLtoAppend, appendToId);
  containerobj.id = containerId;
  containerobj.elem = document.getElementById(containerId);

  if(mode !== "none"){
    setMode(mode,containerobj);
  }

  return containerobj; //Make sure to store this
}


//Container HTML and menus to be targeted by the appropriate class

function genVisualContainer(containerId, width, height){
  return `
  <div id='`+containerId+`' width='`+width+`px' height='`+height+`px'></div>
  `; //Put menus in here for switching inner visuals?
}

function genBandviewSelect(visualId){
  return `
  <select id='`+visualId+`bandview'>
    <option value="scp">SCP (0.1Hz-1Hz)</option>
    <option value="delta">Delta (1Hz-4Hz)</option>
    <option value="theta">Theta (4Hz-8Hz)</option>
    <option value="alpha1" selected="selected">Alpha1 (8Hz-10Hz)</option>
    <option value="alpha2">Alpha2 (10Hz-12Hz)</option>
    <option value="beta">Beta (12Hz-35Hz)</option>
    <option value="lowgamma">Low Gamma (35Hz-48Hz)</option>
    <option value="highgamma">High Gamma (48Hz+)</option>
  </select>`;
}

function genuPlotContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`' height='`+height+`'>
    <h3 id='`+visualId+`title'>FFTs</h3>
    <select id='`+visualId+`mode'>
      <option value="FFT" selected="selected">FFTs</option>
      <option value="Coherence">Coherence</option>
      <option value="CoherenceTimeSeries">Coherence Time Series</option>
      <option value="TimeSeries">Raw</option>
    </select>
    `+genBandviewSelect(visualId)+`
    <div id='`+visualId+`'></div>
  </div>
  `;
}

function genSmoothieContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`' height='`+height+`'>
    Mode:
    <select id='`+visualId+`mode'>
      <option value="alpha" selected="selected">Alpha1 Bandpowers</option>
      <option value="coherence">Alpha1 Coherence</option>
      <option value="bandpowers">1Ch All Bandpowers</option>
    </select>
    Channels:
    <select id='`+visualId+`channel'>
      <option value="0">0</option>
    </select>
    <canvas id='`+visualId+`' width='`+width+`' height='`+height+`' style='width:`+width+`px; height:`+height+`px;'></canvas>
  </div>
  `;
}

function genBrainMapContainer(containerId, visualId, width, height){
  return `
  <div id='`+containerId+`' width='`+width+`' height='`+height+`'>
    <table id='`+visualId+`table' style='position:absolute; z-index:3; transform:translateY(-200px);'>
      <tr><td><h3>Brain Map</h3></td>
      <td><h4>Viewing:</h4></td>
      <td>`+genBandviewSelect(visualId)+`</td></tr>
    </table>
    <canvas id='`+visualId+`' width='`+width+`' height='`+height+`' style='position:absolute; width:`+width+`px; height:`+height+`px; z-index:1; transform:translateY(-200px);'></canvas>
    <canvas id='`+visualId+`points' width='`+width+`' height='`+height+`' style='position:absolute;width:`+width+`px; height:`+height+`px; z-index:2; transform:translateY(-200px);'></canvas>
  </div>
  `;
}

function genTimeChartContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`px' height='`+height+`px'>>
    <div id='`+visualId+`'></div>
  </div>
  `;
}

function genSpectrogramContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`px' height='`+height+`px'>
    Mode
    <select id='`+visualId+`mode'>
      <option value="FFT" selected="selected">FFT</option>
      <option value="Coherence">Coherence</option>
    </select>
    Channel
    <select id='`+visualId+`channel'>
      <option value="0" selected="selected">0</option>
    </select>
    <canvas id='`+visualId+`' width='`+width+`' height='`+height+`' style='width:`+width+`px; height:`+height+`px;'></canvas>
  </div>
  `;
}

function genBarChartContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`px' height='`+height+`px'>
    Channel
    <select id='`+visualId+`channel'>
      <option value="0" selected="selected">0</option>
    </select>
    <canvas id='`+visualId+`' width='`+width+`' height='`+height+`' style='width:`+width+`px; height:`+height+`px;'></canvas>
  </div>
  `;
}

function genMirrorChartsContainer(containerId, visualId, width, height) {
  return `
  <div id='`+containerId+`' width='`+width+`px' height='`+height+`px'>
    Channel 1
    <select id='`+visualId+`channel1'>
      <option value="0" selected="selected">0</option>
      <option value="1">1</option>
    </select>
    Channel 2
    <select id='`+visualId+`channel2'>
      <option value="0" selected="selected">0</option>
      <option value="1">1</option>
    </select>
    <div id='`+visualId+`'>
      <canvas id='`+visualId+`leftbars' width='`+width*.5+`' height='`+height+`' style='width:`+width*.5+`px; height:`+height+`px;'></canvas>
      <canvas id='`+visualId+`rightbars' width='`+width*.5+`' height='`+height+`' style='width:`+width*.5+`px; height:`+height+`px;'></canvas>
    </div>
  </div>
  `;
}


//Setup for appending HTML and creating class instances

function setMode(mode,obj) {
  if(obj.mode !== "none") {
    obj.resetmode();
  }
  var containerId = obj.id + mode;
  var visualId = obj.id + "canvas";
  if (mode === "uplot"){
    setupuPlotContainer(containerId, visualId, obj);
  } else if (mode === "smoothie") {
    setupSmoothieContainer(containerId, visualId, obj);
  } else if (mode === "brainmap") {
    setupBrainMapContainer(containerId, visualId, obj);
  } else if (mode === "timecharts") {
    setupTimeChartContainer(containerId, visualId, obj);
  } else if (mode === "spectrogram") {
    setupSpectrogramContainer(containerId, visualId, obj);
  } else if (mode === "barchart") {
    setupBarChartContainer(containerId, visualId, obj);
  } else if (mode === "mirror") {
    setupMirrorChartsContainer(containerId, visualId, obj);
  } else if (mode === "none") {
    obj.resetmode();
  }
}

function addChannelOptions(selectId) {
  var select = document.getElementById(selectId);
  select.innerHTML = "";
  var opts = ``;
  EEG.channelTags.forEach((row,i) => {
    if(i === 0) {
      opts += `<option value='`+row.ch+`' selected='selected'>`+row.ch+`</option>`
    }
    else {
      opts += `<option value='`+row.ch+`'>`+row.ch+`</option>`
    }
  });
  select.innerHTML = opts;
}

function addCoherenceOptions(selectId) {
  var select = document.getElementById(selectId);
  select.innerHTML = "";
  var newhtml = ``;
  EEG.coherenceMap.map.forEach((row,i) => {
    if(i===0) {
      newhtml += `<option value='`+row.tag+`' selected="selected">`+row.tag+`</option>`;
    }
    else{
      newhtml += `<option value='`+row.tag+`'>`+row.tag+`</option>`;
    }
  });
  select.innerHTML = newhtml;
}

function setupuPlotContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genuPlotContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  obj.class = new uPlotMaker(visualId);
  obj.mode = "uplot";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.uPlotData = [session.bandPassWindow];

  EEG.channelTags.forEach(() => {
    obj.class.uPlotData.push(session.bandPassWindow);
  });

  document.getElementById(visualId+"mode").onchange = () => {
    setuPlot();

    console.log(obj.class.uPlotData);
  }

  document.getElementById(visualId+"bandview").onchange = () => {
    if(document.getElementById(visualId+"mode").value === "CoherenceTimeSeries"){
      setuPlot();
      console.log(obj.class.uPlotData);
    }
  }

  obj.class.makeuPlot(obj.class.makeSeriesFromChannelTags(EEG.channelTags),obj.class.uPlotData,obj.width,obj.height);
}


function setupSmoothieContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genSmoothieContainer(containerId, visualId, obj.width, obj.height);

  appendFragment(HTMLtoAppend,obj.id);
  addChannelOptions(visualId+"channel");

  obj.class = new SmoothieChartMaker(8,visualId);
  obj.mode = "smoothie";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.init('rgba(0,100,100,0.5)');
}

function setupBrainMapContainer(containerId, visualId, obj) {

  var HTMLtoAppend = genBrainMapContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  obj.class = new brainMap2D(visualId,visualId+"points");
  obj.mode = "brainmap";
  obj.child = document.getElementById(containerId).parentNode;

  document.getElementById(visualId+"bandview").onchange = () => {
    setBrainMap(obj);
  };

  obj.class.genHeatMap();
  obj.class.points = [];
  EEG.atlas.map.forEach((row,i) => {
    obj.class.points.push({x:row.data.x*1.5+200, y:200-row.data.y*1.5, size:130, intensity:0.8});
  });
  obj.class.updateHeatmap();
  obj.class.updatePointsFromAtlas(EEG.atlas,EEG.channelTags);
}

function setupTimeChartContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genTimeChartContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  obj.class = new TimeChartMaker(visualId);
  obj.mode = "timecharts";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.setEEGTimeCharts(EEG,session.nSecAdcGraph);
}

function setupSpectrogramContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genSpectrogramContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  addChannelOptions(visualId+"channel");
  obj.class = new Spectrogram(visualId, 1000);
  obj.mode = "spectrogram";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.init();

  document.getElementById(visualId+"mode").onchange = () => {
    if(document.getElementById(visualId+"mode").value === "FFT"){
      addChannelOptions(visualId+"channel");
    }
    else if(document.getElementById(visualId+"mode").value === "Coherence"){
      addCoherenceOptions(visualId+"channel");
    }
  }
}

function setupBarChartContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genBarChartContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  addChannelOptions(visualId+"channel");
  obj.class = new eegBarChart(visualId, 100);
  obj.mode = "bars";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.init();
}

function setupMirrorChartsContainer(containerId, visualId, obj) {
  var HTMLtoAppend = genMirrorChartsContainer(containerId, visualId, obj.width, obj.height);
  appendFragment(HTMLtoAppend,obj.id);
  addChannelOptions(visualId+"channel1");
  addChannelOptions(visualId+"channel2");
  obj.class = new mirrorBarChart(visualId, visualId+"leftbars", visualId+"rightbars", 100);
  obj.mode = "mirror";
  obj.child = document.getElementById(containerId).parentNode;

  obj.class.init();
}





//---------------------------------------
//----------- UPDATE VISUALS ------------
//---------------------------------------


//Updating for raw and fft data per visual container
function updateVisualContainers(type) { //types: coherence, raw

  //console.log(session)

  session.visuals.forEach((obj,i) => {
    if((type === "FFT") || (type === "Coherence")){
    if(obj.mode === "uplot") {
      var graphmode = document.getElementById(obj.class.plotId+"mode").value;
      if(graphmode === "FFT"){
          //Animate plot(s)
          obj.class.uPlotData = [
              session.bandPassWindow
          ];

          EEG.channelTags.forEach((row,i) => {
              if(row.viewing === true) {
                obj.class.uPlotData.push(session.posFFTList[i]);
              }
          });
      }
      else if (graphmode === "Coherence") {
        obj.class.uPlotData = [session.bandPassWindow,...session.coherenceResults];
      }
      else if (graphmode === "CoherenceTimeSeries") {
        var band = document.getElementById(obj.class.plotId+"bandview").value
        obj.class.uPlotData = [EEG.coherenceMap.map[0].data.times];
        EEG.coherenceMap.map.forEach((row,i) => {
          obj.class.uPlotData.push(row.data.means[band]);
        });
      }
      obj.class.plot.setData(obj.class.uPlotData);

    }




    if(obj.mode === "smoothie") {
      var graphmode = document.getElementById(obj.class.canvasId+"mode").value;
      if((graphmode === "alpha") || (graphmode === "bandpowers")) {
        if(graphmode === "alpha"){
          EEG.channelTags.forEach((row,i) => {
            var coord = {};
            coord = EEG.getAtlasCoordByTag(row.tag);

            if(i < obj.class.series.length - 1){
              obj.class.series[i].append(Date.now(), Math.max(...coord.data.slices.alpha1[coord.data.slices.alpha1.length-1]));
            }
          });
        }
        else if(graphmode === "bandpowers") {
          var ch = document.getElementById(obj.class.canvasId+"channel").value;
          var tag = null;
          EEG.channelTags.find((o,i) => {
            if(o.ch === ch){
              tag = o.tag;
              return true;
            }
          });
          if(tag !== null){
            var coord = EEG.getAtlasCoordByTag(tag);
            obj.class.bulkAppend([
              Math.max(...coord.data.slices.delta[coord.data.slices.delta.length-1]),
              Math.max(...coord.data.slices.theta[coord.data.slices.theta.length-1]),
              Math.max(...coord.data.slices.alpha1[coord.data.slices.alpha1.length-1]),
              Math.max(...coord.data.slices.alpha2[coord.data.slices.alpha2.length-1]),
              Math.max(...coord.data.slices.beta[coord.data.slices.beta.length-1]),
              Math.max(...coord.data.slices.lowgamma[coord.data.slices.lowgamma.length-1])
            ]);
          }
        }
      }
      else if (graphmode === "coherence") {
        EEG.coherenceMap.map.forEach((row,i) => {
          if(i < obj.class.series.length - 1){
            obj.class.series[i].append(Date.now(), Math.max(...row.data.slices.alpha1[row.data.slices.alpha1.length-1]));
          }
        });
      }
    }



    if(obj.mode === "brainmap") {
      var viewing = document.getElementById(obj.class.heatmapCanvasId+"bandview").value;
      obj.class.updateHeatmapFromAtlas(EEG.atlas,EEG.channelTags,viewing);

      if(session.coherenceResults.length === EEG.coherenceMap.map.length){
        obj.class.updateConnectomeFromAtlas(EEG.coherenceMap,EEG.atlas,EEG.channelTags,viewing);
      }
    }


    if(obj.mode === "spectrogram") {
      var graphmode = document.getElementById(obj.class.canvasId+"mode").value;
      var ch = parseInt(document.getElementById(obj.class.canvasId+"channel").value);
      if(graphmode === "FFT"){
        var tag = null;
        EEG.channelTags.find((o,i) => {
          if(o.ch === ch){
            tag = o.tag;
            return true;
          }
        });
        if(tag !== null){
          var coord = EEG.getAtlasCoordByTag(tag);
          obj.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length-1];
          obj.class.draw();
        }
      }
      else if(graphmode === "Coherence"){
        var coord = null;
        EEG.coherenceMap.map.find((o,i) => {
          if(o.tag === ch){
            coord = o;
          }
        });
        obj.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length - 1];
        obj.class.draw()
      }
    }



    if(obj.mode === "bars") {
      var ch = parseInt(document.getElementById(obj.class.canvasId+"channel").value);
      var tag = null;
      EEG.channelTags.find((o,i) => {
        if(o.ch === ch){
          tag = o.tag;
          return true;
        }
      });
      if(tag !== null){
        var coord = EEG.getAtlasCoordByTag(tag);
        obj.class.latestData = coord.data.amplitudes[coord.data.amplitudes.length-1];
      }

    }



    if(obj.mode === "mirror") {
      var ch1 = parseInt(document.getElementById(obj.class.canvasId+"channel").value);
      var tag1 = null;
      EEG.channelTags.find((o,i) => {
        if(o.ch === ch1){
          tag1 = o.tag;
          return true;
        }
      });

      var ch2 = parseInt(document.getElementById(obj.class.canvasId+"channel").value);
      var tag2 = null;
      EEG.channelTags.find((o,i) => {
        if(o.ch === ch2){
          tag2 = o.tag;
          return true;
        }
      });
      var coord1, coord2;
      if(tag1 !== null){
        coord1 = EEG.getAtlasCoordByTag(tag1);
        if(tag2 !== null){
          coord2 = EEG.getAtlasCoordByTag(tag2);
          obj.class.updateCharts(coord1.data.slices[coord1.data.slices.length-1],coord2.data.slices[coord2.data.slices.length-1]);
        }
      }
    }
  }
  else if(type === "RAW") {

    if(obj.mode === "uplot") {
      var graphmode = document.getElementById(obj.class.plotId+"mode").value;
      var nsamples = Math.floor(EEG.sps*session.nSecAdcGraph);
      if(nsamples > EEG.data.ms.length) {nsamples = EEG.data.ms.length-1}

      if ((graphmode === "TimeSeries") || (graphmode === "Stacked")) {
        var nsamples = Math.floor(EEG.sps*session.nSecAdcGraph);

        obj.class.uPlotData = [
            EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)
          ];

        EEG.channelTags.forEach((row,i) => {
            if(row.viewing === true) {
              obj.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
            }
        });

      }

      //console.log(uPlotData)
      if(graphmode === "Stacked"){
        obj.class.makeStackeduPlot(undefined,obj.class.uPlotData,undefined,EEG.channelTags,obj.width,obj.height);
      }
      else {
        obj.class.plot.setData(obj.class.uPlotData);
      }
    }

    if(obj.mode === "timecharts") {
      obj.class.updateTimeCharts(EEG);
    }
  }
  });

}


//-------------- BUTTON SETUP -----------

var setuPlot = (objin=null) => {
  var obj = objin;
  if(obj === null) {
    var uplot = session.visuals.find((o,i) => {
      if(o.mode === "uplot"){
        obj = o;
        return true;
      }
    });
  }
  if(obj === null) { return false; }

  var gmode = document.getElementById(obj.class.plotId+"mode").value;

  if(gmode === "TimeSeries"){
    document.getElementById(obj.class.plotId+"title").innerHTML = "ADC signals";

    if(EEG.data["A0"].length > 1) {
      var nsamples = Math.floor(EEG.sps*session.nSecAdcGraph);
      if(nsamples > EEG.data.ms.length) {nsamples = EEG.data.ms.length-1}

      obj.class.uPlotData = [
          EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)
      ];

      EEG.channelTags.forEach((row,i) => {
          if(row.viewing === true) {
            obj.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
          }
      });
      }
    else {
      obj.class.uPlotData = [session.bandPassWindow];
      EEG.channelTags.forEach((row,i) => {
        obj.class.uPlotData.push(session.bandPassWindow);
      });
    }

    obj.class.makeuPlot(obj.class.makeSeriesFromChannelTags(EEG.channelTags), obj.class.uPlotData, obj.width, obj.height);
    obj.class.plot.axes[0].values = (u, vals, space) => vals.map(v => +((v-EEG.data.ms[0])*0.001).toFixed(2) + "s");

  }
  else if (gmode === "FFT"){

        document.getElementById(obj.class.plotId+"title").innerHTML = "FFTs";
          //Animate plot(s)
        obj.class.uPlotData = [
          session.bandPassWindow
        ];
        if((session.posFFTList.length > 0) && (session.posFFTList.length <= EEG.channelTags.length)) {
          //console.log(posFFTList);
          EEG.channelTags.forEach((row,i) => {
            if(i < session.posFFTList.length){
              if(row.viewing === true) {
                obj.class.uPlotData.push(session.posFFTList[i]);
              }
            }
            else{
              obj.class.uPlotData.push(session.bandPassWindow); // Placeholder for unprocessed channel data.
            }
          });
        }
        else {
          EEG.channelTags.forEach((row,i) => {
            obj.class.uPlotData.push(session.bandPassWindow);
          });
        }

        obj.class.makeuPlot(obj.class.makeSeriesFromChannelTags(EEG.channelTags), obj.class.uPlotData, obj.width, obj.height);
  }
  else if (gmode === "Stacked") {

    if(EEG.data["A0"].length > 1){
    var nsamples = Math.floor(EEG.sps*session.nSecAdcGraph);
    if(nsamples > EEG.data.ms.length) {nsamples = EEG.data.ms.length-1}

      obj.class.uPlotData = [
          EEG.data.ms.slice(EEG.data.counter - nsamples, EEG.data.counter)
      ];

      EEG.channelTags.forEach((row,i) => {
          if(row.viewing === true) {
            obj.class.uPlotData.push(EEG.data["A"+row.ch].slice(EEG.data.counter - nsamples, EEG.data.counter));
          }
      });
    }
    else {
      obj.class.uPlotData = [session.bandPassWindow];
      EEG.channelTags.forEach((row,i) => {
        obj.class.uPlotData.push(session.bandPassWindow);
      });
    }

    document.getElementById(obj.class.plotId+"title").innerHTML = "ADC signals Stacked";

    //console.log(uPlotData)
    obj.class.makeStackeduPlot(undefined, obj.class.uPlotData, undefined, EEG.channelTags,obj.width, obj.height);
    obj.class.plot.axes[0].values = (u, vals, space) => vals.map(v => +(v*0.001).toFixed(2) + "s");

  }
  else if (gmode === "Coherence") {

    if((session.coherenceResults.length > 0) && (session.coherenceResults.length <= EEG.coherenceMap.map.length)){
      obj.class.uPlotData = [session.bandPassWindow,...session.coherenceResults];
      if(obj.class.uPlotData.length < EEG.coherenceMap.map.length+1) {
        for(var i = obj.class.uPlotData.length; i < EEG.coherenceMap.map.length+1; i++){
          obj.class.uPlotData.push(session.bandPassWindow);
        }
      }
      //console.log(uPlotData)

      var newSeries = [{}];

      var l = 1;
      var k = 0;

      EEG.coherenceMap.map.forEach((row,i) => {
        var tag1 = EEG.channelTags[k].tag;
        var tag2 = EEG.channelTags[k+l].tag;
        if(tag1 === null){tag1 = "A"+EEG.channelTags[k].ch} //Untagged, give it the channel number
        if(tag2 === null){tag2 = "A"+EEG.channelTags[k+l].ch}
        newSeries.push({
          label:tag1+":"+tag2,
          value: (u, v) => v == null ? "-" : v.toFixed(1),
          stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
        });
        l++;
        if(l+k === EEG.channelTags.length){
          k++;
          l=1;
        }
      });
    }
    else {
      obj.class.uPlotData = [session.bandPassWindow];
      EEG.channelTags.forEach((row,i) => {
        obj.class.uPlotData.push(session.bandPassWindow);
      });
    }
    //console.log(newSeries.length);
    //console.log(uPlotData.length);
    obj.class.makeuPlot(newSeries, obj.class.uPlotData, obj.width, obj.height);
    document.getElementById(obj.class.plotId+"title").innerHTML = "Coherence from tagged signals";
  }
  else if (gmode === "CoherenceTimeSeries") {
    var band = document.getElementById(obj.class.plotId+"bandview").value;
    obj.class.uPlotData = [EEG.coherenceMap.map[0].data.times];
    var newSeries = [{}];
    EEG.coherenceMap.map.forEach((row,i) => {
      newSeries.push({
        label:row.tag,
        value: (u, v) => v == null ? "-" : v.toFixed(1),
        stroke: "rgb("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")"
      });
      obj.class.uPlotData.push(row.data.means[band]);
    });
    console.log(obj.class.uPlotData)
    obj.class.makeuPlot(newSeries, obj.class.uPlotData, obj.width, obj.height);
    document.getElementById(obj.class.plotId+"title").innerHTML = "Mean Coherence over time";
    obj.class.plot.axes[0].values = (u, vals, space) => vals.map(v => +(v*0.001).toFixed(2) + "s");
  }
  //else if(graphmode === "StackedRaw") { graphmode = "StackedFFT" }//Stacked Coherence
}


var setBrainMap = (objin=null) => {
  var obj = objin;
  if(obj === null){
    var brainmap = session.visuals.find((o,i) => {
      if(o.mode === "brainmap") {
        obj = o;
        return true;
      }
    });
  }
  if(obj === null) {return false;}
  else{
    var viewing = document.getElementById(obj.class.heatmapCanvasId+"bandview").value;
    obj.class.updatePointsFromAtlas(EEG.atlas,EEG.channelTags);
    obj.class.updateHeatmapFromAtlas(EEG.atlas,EEG.channelTags,viewing);
    obj.class.updateConnectomeFromAtlas(EEG.coherenceMap,EEG.atlas,EEG.channelTags,viewing);

  }
}


EEG.onConnectedCallback = () => {
  console.log("port connected!");
  session.rawfeed = true;
  updateRawFeed();
}

document.getElementById("connect").onclick = () => {EEG.setupSerialAsync();}

document.getElementById("analyze").onclick = () => {
if(EEG.port !== null){
  if((session.analyzeloop === null) || (session.analyze === false)) {
    session.analyze = true;
    setTimeout(()=>{session.analyzeloop = requestAnimationFrame(analysisLoop);},200);
  }
  else{alert("connect the EEG first!")}}
}

document.getElementById("stop").onclick = () => { cancelAnimationFrame(session.analyzeloop); session.analyze = false; cancelAnimationFrame(session.rawfeedloop); session.rawfeedloop = false; }

document.getElementById("record").onclick = () => { alert("dummy"); }

document.getElementById("bandPass").onclick = () => {
  var freq0 = parseFloat(document.getElementById("freqStart").value);
  var freq1 = parseFloat(document.getElementById("freqEnd").value);
  if (freq0 > freq1) {
    freq0 = 0;
  }
  if(freq1 > EEG.sps*0.5){
    freq1 = EEG.sps*0.5; document.getElementById("freqEnd").value = freq1;
  }
  session.freqStart = freq0;
  session.freqEnd = freq1;

  EEG.atlas = EEG.makeAtlas10_20(); //reset atlas

  session.bandPassWindow = gpu.bandPassWindow(freq0,freq1,EEG.sps);

  EEG.atlas.shared.bandPassWindow = session.bandPassWindow;//Push the x-axis values for each frame captured as they may change - should make this lighter
  EEG.atlas.shared.bandFreqs = EEG.getBandFreqs(session.bandPassWindow); //Update bands accessed by the atlas for averaging

  if(session.fdbackmode === "coherence") {
    EEG.coherenceMap = EEG.genCoherenceMap(EEG.channelTags);
    EEG.coherenceMap.bandPasswindow - session.bandPassWindow;
    EEG.coherenceMap.shared.bandFreqs = EEG.atlas.shared.bandFreqs;
  }
}


document.getElementById("setChannelView").onclick = () => {
  var val = document.getElementById("channelView").value;
  if(val.length === 0) { return; }

  var arr = val.split(",");
  EEG.channelTags.forEach((row,j) => { EEG.channelTags[j].viewing = false; });
  var newSeries = [{}];

  arr.forEach((item,i) => {
    var found = false;
    let getTags = EEG.channelTags.find((o, j) => {

    if((o.ch === parseInt(item)) || (o.tag === item)){
      //console.log(item);
      EEG.channelTags[j].viewing = true;
      found = true;
      return true;
      }
    });


    if (found === false){ //add tag
      if(parseInt(item) !== NaN){
        EEG.channelTags.push({ch:parseInt(item), tag: null, viewing:true});
      }
      else {
        alert("Tag not assigned to channel: ", item);
      }
    }
  });

  setuPlot();

}



document.getElementById("setTags").onclick = () => {
  var val = document.getElementById("channelTags").value;
  if(val.length === 0) { return; }
  //console.log(val);
  var arr = val.split(";");
  //console.log(arr);
  //channelTags.forEach((row,j) => { channelTags[j].viewing = false; });
  //console.log(arr);
  arr.forEach((item,i) => {
    var dict = item.split(":");
    var found = false;
    let setTags = EEG.channelTags.find((o, j) => {
      if(o.ch === parseInt(dict[0])){
        if(dict[1] === "delete"){
          EEG.channelTags.splice(j,1);
        }
        else{
          let otherTags = EEG.channelTags.find((p,k) => {
            if(p.tag === dict[1]){
              EEG.channelTags[k].tag = null;
              return true;
            }
          });

          //console.log(o);
          EEG.channelTags[j].tag = dict[1];
          EEG.channelTags[j].viewing = true;

          if(dict[2] !== undefined){
            var atlasfound = false;
            var searchatlas = EEG.atlas.map.find((p,k) => {
              if(p.tag === dict[1]){
                atlasfound = true;
                return true;
              }
            });
            if(atlasfound !== true) {
              var coords = dict[2].split(",");
              if(coords.length === 3){
                EEG.addToAtlas(dict[1],parseFloat(coords[0]),parseFloat(coords[1]),parseFloat(coords[2]))
              }
            }
          }
        }
        found = true;
        return true;
        }
      else if(o.tag === dict[1]){
        EEG.channelTags[j].tag = null; //Set tag to null since it's being assigned to another channel
      }
    });
    if (found === false){
      var ch = parseInt(dict[0]);
      if(ch !== NaN) {
        if((ch >= 0) && (ch < EEG.nChannels)){
          EEG.channelTags.push({ch:parseInt(ch), tag: dict[1], viewing: true});

          if(dict[2] !== undefined){
            var atlasfound = false;
            var searchatlas = EEG.atlas.map.find((p,k) => {
              if(p.tag === dict[1]){
                atlasfound = true;
                return true;
              }
            });
            if(atlasfound !== true) {
              var coords = dict[2].split(",");
              if(coords.length === 3){
                EEG.addToAtlas(dict[1],parseFloat(coords[0]),parseFloat(coords[1]),parseFloat(coords[2]))
              }
            }
          }
        }
      }
    }
  });

  EEG.coherenceMap = EEG.genCoherenceMap(EEG.channelTags); //Reset coherence map with new tags
  EEG.coherenceMap.shared.bandPassWindow = session.bandPassWindow;
  EEG.coherenceMap.shared.bandFreqs = EEG.atlas.shared.bandFreqs;



  setBrainMap();
  setuPlot();
}





//-------------------------------------------
//-------------------TEST--------------------
//-------------------------------------------


var sine  = eegmath.genSineWave(12,500,1,512);
var sine1 = eegmath.genSineWave(30,3000,1,512);
var sine2 = eegmath.genSineWave(12,1000,1,512);
var sine3 = eegmath.genSineWave(20,500,1,512);
var sine4 = eegmath.genSineWave(12,2500,1,512);
var sine5 = eegmath.genSineWave(5,1000,1,512);
var sine6 = eegmath.genSineWave(30,750,1,512);

var bigarr = new Array(128).fill(sine[1]);

//console.log(sine)
function testGPU(){
  console.log("testGPU()");
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  window.postToWorker("multidftbandpass", [bigarr,1,session.freqStart,session.freqEnd],0);
  console.log("posted 128x dft 8 times");
}

function testCoherence(){
  console.log("testCoherence()");

  session.lastPostTime = performance.now();
  window.postToWorker("coherence", [[sine[1],sine2[1]],1,session.freqStart,session.freqEnd,1/session.stepsPeruV],1);
    setTimeout(()=>{session.lastPostTime = performance.now();
      window.postToWorker("coherence", [[sine[1],sine2[1]],1,session.freqStart,session.freqEnd,1/session.stepsPeruV],1);
      setTimeout(()=>{session.lastPostTime = performance.now()+1;
        window.postToWorker("coherence", [[sine[1],sine2[1]],1,session.freqStart,session.freqEnd,1/session.stepsPeruV],1);
        setTimeout(()=>{session.lastPostTime = performance.now()+1;
          window.postToWorker("coherence", [[sine[1],sine2[1]],1,session.freqStart,session.freqEnd,1/session.stepsPeruV],1);
      },30);
    },30);
  },30);
}



setTimeout(()=>{setTimeout(()=>{testCoherence();},500)},1000); //Need to delay this call since app.js is made before the worker script is made





