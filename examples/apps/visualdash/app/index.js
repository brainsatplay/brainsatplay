
//alert('Hello World!');

import * as visualscript from '../../../../src/visualscript/src/index'
console.log('window.visualscript:', visualscript);
// import './styles.css'
import AudioManager from './AudioManager'

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

  var overlay = document.querySelector('visualscript-overlay');

  let frequencyBinCount = Math.pow(2,11);
  let minFreq = 7000
  let maxFreq = 0

  const audioInfo = {
    smoothingTimeConstant: 0.2,
    fftSize: frequencyBinCount,
    minDecibels: -127,
    maxDecibels: 0,
    minFreq,
    maxFreq
  }

  const audioManager = new AudioManager(audioInfo)

  navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
  // .catch(errorCallback);

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
        audioInputSelect.add(option);
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'Speaker ' +
          (audioOutputSelect.length + 1);
        audioOutputSelect.add(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'Camera ' +
          (videoSelect.length + 1);
        videoSelect.add(option);
      }
    }
  }


  const spawnStreamDisplay = (count, o = {}) => {
        const container = document.createElement('div')
        container.classList.add('container')
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
    audioManager.initializeContext()
    count = 0 // Reset count with new file...
    for (let file of fileInput.files) {
      const type = file.type.split('/')[0]
      let source, video;

      if (type === 'video'){
          video = document.createElement('video')
          video.src = URL.createObjectURL(file)
          source = audioManager.context.createMediaElementSource(video);
      } else {
        source = await onAudio(file);
      }

      if (video) videos.insertAdjacentElement('beforeend', video)
      audioManager.addSource(source, () => {
        const o = spawnStreamDisplay(count, {video})
        count++
        return o
      })// Get Audio Features + Wire Audio Analysis + Create Display
      // count added in here
    }

    // main.style.gridTemplateColumns = `repeat(${count},1fr)`
  }

  start.onclick = () => {

    audioManager.initializeContext()
    audioManager.listen(false)

    navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: audioInputSelect.value }
      }, 
      video: { exact: videoSelect.value }
    }).then((stream) => {
      const video = document.createElement('video')
      const microphone = audioManager.context.createMediaStreamSource(stream);
      videos.insertAdjacentElement('beforeend', video)
      audioManager.addSource(microphone, () => {
        const o = spawnStreamDisplay(count, {video, stream})
        count++
        return o
      })
    })
  }

  const onAudio =(file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (ev) => {


      overlay.innerHTML = 'Decoding audio data from file...'
      overlay.open = true
      audioManager.context.decodeAudioData(ev.target.result, (data) => {

          overlay.innerHTML = 'Audio decoded! Analysing audio data...'
          // Preanalyze Audio
          audioManager.fft(data, null, (ev) => {
              overlay.innerHTML = 'Analysis complete!'
              overlay.open = false
              // Play Audio
              const source = audioManager.context.createBufferSource();
              source.buffer = data;
              resolve(source);
          })
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


