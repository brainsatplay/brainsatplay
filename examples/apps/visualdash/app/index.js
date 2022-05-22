
//alert('Hello World!');

import * as visualscript from '../../../../src/visualscript/src/index'

// export const spectrogram = new visualscript.streams.data.InteractiveSpectrogram({
//   Plotly
// })

// const plotData = [
//   {
//     x: [1,2],
//     z: [],
//     showscale: true,
//     colorscale: 'Electric',
//     type: 'heatmap'
//   }
// ];

// const config = {
// responsive: true
// }


// Plotly.newPlot(document.body, plotData, config);

// document.body.insertAdjacentElement('beforeend', spectrogram)

import './controls'
import * as controls from './controls'
import transformations from "./transformations"

  // Bypass the usual requirement for user action
  const app = document.getElementById('app')
  const dataContainer = document.getElementById('data')
  const start = document.getElementById('start')
  const audioInputSelect = document.getElementById('in')
  const audioOutputSelect = document.getElementById('out')
  const videoSelect = document.getElementById('video')
  var fileInput = document.getElementById('files');
  var main = document.getElementById('main');
  var videos = document.getElementById('videos');
  var analysesDiv = document.getElementById('analyses');
  var main = document.getElementById('volume');



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
          'Microphone ' + (audioInputSelect.options.length + 1);
        audioInputSelect.options = [...audioInputSelect.options, option]
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'Speaker ' +
          (audioOutputSelect.options.length + 1);
        audioOutputSelect.options = [...audioOutputSelect.options, option]
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'Camera ' +
          (videoSelect.options.length + 1);
        videoSelect.options = [...videoSelect.options, option]
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
            // spectrogram: new visualscript.streams.data.InteractiveSpectrogram(),
            spectrogram: new visualscript.streams.data.Spectrogram(),
            // timeseries: new visualscript.streams.data.TimeSeries(),
        }

        container.insertAdjacentElement('beforeend', sourceRegistry[count].spectrogram)
        // container.insertAdjacentElement('beforeend', sourceRegistry[count].timeseries)
        return sourceRegistry[count]
    }


  let count = 0

  fileInput.onChange = async (ev) => {

    controls.audio.initializeContext()
    count = 0 // Reset count with new file...

    for (let file of ev.target.files) {
      const type = file.type.split('/')[0]
      let source, video;

      if (type === 'video'){
          video = document.createElement('video')
          video.src = URL.createObjectURL(file)
          source = controls.audio.context.createMediaElementSource(video);
          onAudio(file).then(res => {
            console.log('Audio done')
          })
      } else {
        source = await onAudio(file);
      }

      if (video) videos.insertAdjacentElement('beforeend', video)
      controls.audio.addSource(source, () => {
        const o = spawnStreamDisplay(count, {video})
        count++
        return o
      })// Get Audio Features + Wire Audio Analysis + Create Display
      // count added in here
    }

    // main.style.gridTemplateColumns = `repeat(${count},1fr)`
  }

  start.onClick = () => {

    controls.audio.initializeContext()
    controls.audio.listen(false)


    navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: audioInputSelect.element.value } }, 
      video: { deviceId: { exact: videoSelect.element.value } }
    }).then((stream) => {
      const video = document.createElement('video')
      const microphone = controls.audio.context.createMediaStreamSource(stream);
      videos.insertAdjacentElement('beforeend', video)
      controls.audio.addSource(microphone, () => {
        const o = spawnStreamDisplay(count, {video, stream})
        count++
        return o
      })
    })
  }

  const onAudio =(file) => {

    const type = file.type.split('/')[0]
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (ev) => {


      controls.overlayDiv.innerHTML = `Decoding audio data from ${type} file...`
      controls.overlay.open = true
      controls.audio.context.decodeAudioData(ev.target.result, (data) => {

        controls.overlayDiv.innerHTML = 'Audio decoded! Analysing audio data...'
          // Preanalyze Audio
          controls.audio.fft(data, null, async (o) => {
            
              await controls.plotData(o)
            
              controls.overlay.open = false
              
              // if (type === 'audio'){
                const source = controls.audio.context.createBufferSource(); // Get audio to play in the AudioContext
                source.buffer = data;
                resolve(source);
              // } else resolve()
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
