
//alert('Hello World!');

import * as visualscript from '../../../src/visualscript/src/index'
console.log('window.visualscript:', visualscript);
import './styles.css'

// const elm = new visualscript.Button({content: 'Test'})
// document.body.insertAdjacentElement('afterbegin',elm);


  // import * as visualscript from "./dist/index.esm.js"
//   import * as visualscript from "https://cdn.jsdelivr.net/npm/brainsatplay-components@latest/dist/index.esm.js"

  // Bypass the usual requirement for user action
  const start = document.getElementById('start')
  const audioInputSelect = document.getElementById('in')
  const audioOutputSelect = document.getElementById('out')
  const videoSelect = document.getElementById('video')
  var fileInput = document.getElementById('files');
  var main = document.getElementById('main');
  var videos = document.getElementById('videos');
  var analysesDiv = document.getElementById('analyses');

  var overlay = document.getElementById('overlay');

  navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
  // .catch(errorCallback);


  let context = null; // Initialize on user action
  let analyser = null;
  let highPassNode = null;
  let lowPassNode = null;
  let gainNode = null;
  let outNode = null;
  let frequencyBinCount = Math.pow(2,11);
  let minFreq = 7000
  let maxFreq = 0
  const nodes = []

  const initializeContext = () => {
    if (!context) {
      setInterval(bigAnalysisLoop, 50); // Get Data Every 100ms
      context = new (window.AudioContext || window.webkitAudioContext)();
      // top of tree
      if (minFreq) {
        highPassNode = context.createBiquadFilter();
        nodes.push(highPassNode)
        highPassNode.type = 'highpass';
        highPassNode.frequency.value = minFreq;
      }

      // next node
      if (maxFreq) {
        lowPassNode = context.createBiquadFilter();
        nodes.push(lowPassNode)
        lowPassNode.type = 'lowpass';
        if (maxFreq) highPassNode.frequency.value = maxFreq;
        nodes[nodes.length - 1].connect(lowPassNode);
      }

      // microphone.connect(gainNode);
      // next node
      analyser = createAnalyser()
      nodes[nodes.length - 1].connect(analyser);

      // next node
      outNode = context.createGain(); // Create a gain node to change audio volume.
      outNode.gain.value = 1.0;
      outNode.connect(context.destination);
    }

  }

  let self = false

  const sourceRegistry = {}

  // video.controls = true

  function gotDevices(deviceInfos) {
    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      var option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
          'Microphone ' + (audioInputSelect.length + 1);
        audioInputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'Speaker ' +
          (audioOutputSelect.length + 1);
        audioOutputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'Camera ' +
          (videoSelect.length + 1);
        videoSelect.appendChild(option);
      }
    }
  }

  const analyses = {}
  const integrations = {}
  

  const createAnalyser = () => {
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = frequencyBinCount
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    return analyser
  }

  const analyse = (o, i) => {
      // Analyze the Data
      let volumeCallback = null;
      let volumeInterval = null;
      const frequencies = new Uint8Array(o.analyser.frequencyBinCount);

      const upperBound = Math.min(context.sampleRate, minFreq)
      const centerFreqs = Array.from({length: frequencies.length}, (e,i) => (i + 0.5)  * upperBound/(frequencies.length))
      console.log(centerFreqs)

      // let raw = new Uint8Array(1) // Only get the latest
      const getData = () => {
        o.analyser.getByteFrequencyData(frequencies);
        // o.analyser.getByteTimeDomainData(raw)
        // const arr = Array.from(raw)
        const freqArr = Array.from(frequencies)


        // o.timeseries.data = [arr]
        o.spectrogram.data = freqArr
        return {
          // timeseries: arr, 
          frequencies: freqArr
        }
      };

      analyses[i] = {
        function: getData,
        output: null
      }
  }

  const integrate = (key, o, iArr, integrator = (arr) => {}) => {

      integrations[key] = {
        function: () => {
          const o2 = integrator(iArr.map(i => analyses[i].output))
          // o.timeseries.data = [o2.timeseries]
          o.spectrogram.data = o2.frequencies
        },
        output: null
      }
  }


  const bigAnalysisLoop = () => {

    // First Analyses
    for (let k in analyses) {analyses[k].output = analyses[k].function()}

    // Then Integrations
    for (let k in integrations) {integrations[k].output =  integrations[k].function()}
  }

  const onStreamSource = (src, inputs={}) => {

      if (inputs.video) videos.insertAdjacentElement('beforeend', inputs.video)

      src.connect(nodes[0]); // Connect to top of Web Audio API Context

      // TODO: Split tracks from video
      const channels = src.channelCount ?? src.buffer?.numberOfChannels
      if (channels > 1) {
        var splitter = context.createChannelSplitter(channels);
        analyser.connect(splitter); // Connect end of main graph to the Splitter graph
        var merger = context.createChannelMerger(channels);

        for (let i = 0; i < channels; i++){
          const o = spawnStreamDisplay(count, inputs) // Create Display
          o.container.insertAdjacentHTML('afterbegin',`<h3>${i == 0 ? 'Left' : 'Right'} Channel </h3>`)
          const gainNode = context.createGain();
          gainNode.gain.setValueAtTime(1.0, context.currentTime);
          o.analyser = createAnalyser()
          splitter.connect(o.analyser, i) // Connect Analyser to Channel i
          o.analyser.connect(gainNode);
          gainNode.connect(merger, 0, i) // Merge split inputs
          analyse(o, count) // Start analysis
          count++
        }

        const difference = (arr1, arr2, key) => {
            return arr1.map((v, i) => {
                const diff = Math.abs(v - arr2[i])
                return diff
            })
          }

        // Additive (first two)
        const o2 = spawnStreamDisplay(count, inputs) // Create Display
        o2.container.insertAdjacentHTML('afterbegin',`<h3>Additive</h3>`)
        const add = (arr1, arr2) => {
            return arr1.map((v, i) => {
                return v + arr2[i]
            })
          }

        integrate('additive', o2, [0, 1], (arr) => {
          const o = {}
          const addedFreqs = add(arr[0].frequencies, arr[1].frequencies)
          o.frequencies = addedFreqs
          return o
        })
        count++

        // Remove common (first two)
        const o3 = spawnStreamDisplay(count, inputs) // Create Display
        o3.container.insertAdjacentHTML('afterbegin',`<h3>Difference</h3>`)

        integrate('common', o3, [0, 1], (arr) => {
          const o = {}
          const addedFreqs = difference(arr[0].frequencies, arr[1].frequencies)
          o.frequencies = addedFreqs
          return o
        })
        count++

        const thisGain = context.createGain()
        merger.connect(thisGain); 
        thisGain.connect(outNode); // Output to the speakers
        if (!self) thisGain.gain.value = 1
        else thisGain.gain.value = 0 // Force Off Volume

      } 
      else {
        const o = spawnStreamDisplay(count, inputs) // Create Display
        o.analyser = analyser

        const thisGain = context.createGain()
        analyser.connect(thisGain); 
        thisGain.connect(outNode) // Output to the speakers
        if (!self) thisGain.gain.value = 1
        else thisGain.gain.value = 0 // Force Off Volume

        analyse(o, count) // Start analysis
      }

      if (video){
        video.onended = () => {
          src.disconnect();
          gainNode.disconnect();
          filterNode.disconnect()
        }
      }

      if (src.start instanceof Function) src.start()
  }

  const spawnStreamDisplay = (count, o = {}) => {
        const container = document.createElement('div')
        container.classList.add('container')
        // if (!o.video) o.video = document.createElement('video')
        analysesDiv.insertAdjacentElement('beforeend', container)

        if (o.video){
          // Real-Time Input
          if (o.stream) {
            o.video.srcObject = o.stream
            o.video.controls = true
            o.video.muted = true // No volume on self
          } 
          else {
            o.video.controls = true
          }
          o.video.autoplay = true
        }

        
        sourceRegistry[count] = {
            container,
            video: o.video,
            stream: o.stream,
            spectrogram: new visualscript.streams.data.Spectrogram(),
            // timeseries: new visualscript.streams.data.TimeSeries(),
        }

        container.insertAdjacentElement('beforeend', sourceRegistry[count].spectrogram)
        // container.insertAdjacentElement('beforeend', sourceRegistry[count].timeseries)
        return sourceRegistry[count]
    }


  let count = 0

  fileInput.onchange = async (ev) => {
    initializeContext()
    count = 0 // Reset count with new file...
    for (let file of fileInput.files) {
      const type = file.type.split('/')[0]
      let source, video;

      if (type === 'video'){
          video = document.createElement('video')
          video.src = URL.createObjectURL(file)
          source = context.createMediaElementSource(video);
      } else {
        source = await onAudio(file);
      }

      onStreamSource(source, {video}) // Get Audio Features + Wire Audio Analysis + Create Display
      // count added in here
    }

    // main.style.gridTemplateColumns = `repeat(${count},1fr)`
  }

  start.onclick = () => {

    initializeContext()

    self = true
    navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: audioInputSelect.value }
      }, 
      video: { exact: videoSelect.value }
    }).then((stream) => {
      const video = document.createElement('video')
      const microphone = context.createMediaStreamSource(stream);
      onStreamSource(microphone, {video, stream})
    })
  }


  // var reader1 = new FileReader();

  const onAudio =(file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (ev) => {

      overlay.classList.add('open')
      context.decodeAudioData(ev.target.result, (data) => {
        overlay.classList.remove('open')
        const source = context.createBufferSource();
        source.buffer = data;


        console.log('Data', data)
        const offlineAudioContext = new OfflineAudioContext(
          data.numberOfChannels,
          data.length,
          data.sampleRate
        );
          
      const bufferSourceNode = offlineAudioContext.createBufferSource();
      
      bufferSourceNode.start(0);
      
      offlineAudioContext
        .startRendering()
        .then(renderedBuffer => {
      
          const data = renderedBuffer.getChannelData(0);
      
          for (let i = 0, length = data.length; i < length; i += 1) {
      
            // careful here, as you can hang the browser by logging this data
            // because 1 second of audio contains 22k ~ 96k samples!
            if (!(i % 1000) && i < 250000) console.log(data[i]);
          }
        })


        resolve(source);
      })
    };

    function handleEvent(event) {
    console.log(`${event.type}: ${event.loaded} bytes transferred\n`)

    if (event.type === "load") {
        // preview.src = reader.result;
    }
}

    // reader.addEventListener('loadstart', handleEvent);
    // reader.addEventListener('load', handleEvent);
    // reader.addEventListener('loadend', handleEvent);
    // reader.addEventListener('progress', handleEvent);
    reader.addEventListener('error', handleEvent);
    // reader.addEventListener('abort', handleEvent);

    reader.readAsArrayBuffer(file);
  })
}


