import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
// import webgazer from '../../../../../src/webgazer/dist/index.esm'

export default function StreamsExample({ server, sockets, router, id }) {

  const output = useRef(null);
  const video = useRef(null);
  const audio = useRef(null);
  const start = useRef(null);
  const graph = useRef(null);

  // const audio = useRef(null);


  useEffect(async () => {
    const ganglion = (await import("https://cdn.jsdelivr.net/npm/@brainsatplay/ganglion@0.0.2/dist/index.esm.js")).default
    const muse = (await import("https://cdn.jsdelivr.net/npm/@brainsatplay/muse@0.0.1/dist/index.esm.js")).default
    const device = (await import("https://cdn.jsdelivr.net/npm/@brainsatplay/device@0.0.2/dist/index.esm.js")).default
    const hegduino = (await import("https://cdn.jsdelivr.net/npm/@brainsatplay/hegduino@0.0.4/dist/index.esm.js")).default
    const webgazer = (await import("https://cdn.jsdelivr.net/npm/@brainsatplay/webgazer@0.0.0/dist/index.esm.js")).default

    // let synthetic = await import('@brainsatplay/device/dist/module')
    // if (synthetic.default) synthetic = synthetic.default
    const datastreams = await import('https://cdn.jsdelivr.net/npm/datastreams-api@latest/dist/index.esm.js')
    const dataDevices = new datastreams.DataDevices()
    console.log(dataDevices, datastreams)
    dataDevices.load(muse)
    dataDevices.load(device)
    dataDevices.load(ganglion)
    dataDevices.load(hegduino)
    dataDevices.load(webgazer)


    const pseudo = document.createElement('button')
    pseudo.click()

    // const synthetic = await import('@brainsatplay/device')
    // const components = await import("https://cdn.jsdelivr.net/npm/brainsatplay-ui@0.0.7/dist/index.esm.js")  
    const components = await import('../../../../../src/visualscript/src/index')
    // import RouteDisplay from '../routeDisplay';
    console.log(components)

    const volume = new components.streams.audio.Volume()
    audio.current.insertAdjacentElement('beforeend', volume)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {

      // TODO: Fix DataStreams-API for Audio
      const context = new AudioContext();
      var analyser = context.createAnalyser();
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = 1024;
      analyser.minDecibels = -127;
      analyser.maxDecibels = 0;

      var filterNode = context.createBiquadFilter();
      // filterNode.type = 'highpass';
      // filterNode.frequency.value = 7000;

      var gainNode = context.createGain(); // Create a gain node to change audio volume.
      // gainNode.gain.value = 1.0;  

      const microphone = context.createMediaStreamSource(stream);
      microphone.connect(filterNode);
      filterNode.connect(gainNode);
      // microphone.connect(gainNode);
      gainNode.connect(analyser);
      // analyser.connect(context.destination); // NOTE: Comment out to block microphone audio

      stream.onended = () => {
        microphone.disconnect();
        gainNode.disconnect();
        filterNode.disconnect()
      }

      // Show Audio Volume
      let volumeCallback = null;
      let volumeInterval = null;
      const volumes = new Uint8Array(analyser.frequencyBinCount);
      volumeCallback = () => {
        analyser.getByteFrequencyData(volumes);
        let volumeSum = 0;
        for (const volume of volumes)
          volumeSum += volume;
        const averageVolume = volumeSum / volumes.length;
        volume.volume = (averageVolume / (analyser.maxDecibels - analyser.minDecibels))
      };

      if (volumeCallback !== null && volumeInterval === null) volumeInterval = setInterval(volumeCallback, 100);
    })

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.current.srcObject = stream
      video.current.autoplay = true
    }).catch(console.error)


    // const devices = await dataDevices.getSupportedDevices()

        // ------------- Setup Visualization (very rough) -------------
        graph.current.style.padding = '25px'
        const timeseries = new components.streams.data.TimeSeries()
        graph.current.insertAdjacentElement('beforeend', timeseries)
        
        // ------------- Add Custom Route -------------
        router.post({
          route: 'unsafe/createRoute',
          socket: sockets[0]
        }, {route: 'manipulateDataStream', post: (Router, args, origin) => {
          return args[0].map(v => 1000*v)
        }}).then(res => {
          if (!res?.error) output.current.innerHTML = JSON.stringify(res, undefined,2)
          else output.current.innerHTML = res.error
        }).catch(err => {
          output.current.innerHTML = err.error
        })

        // ------------- Declare Global Variables -------------
        let channels = 0
        let trackMap = new Map()
        let contentHintToIndex = {}
        
        // ------------- Declare Data Handler -------------
        const ondata = (data, timestamps, contentHint) => {
          console.log(`Data from Electrode ${contentHintToIndex[contentHint]} (${contentHint})`, data, timestamps)

          // Use the Router
          router.post({
            route: 'manipulateDataStream',
            socket: sockets[0]
          }, data, timestamps, contentHint).then(res => {
            if (!res?.error) output.current.innerHTML = JSON.stringify(res, undefined,2)
            else output.current.innerHTML = res.error
          }).catch(err => {
            output.current.innerHTML = err.error
          })
      }
  
      // ------------- Declare Track Handler -------------
      const handleTrack = (track) => { 
  
          // ------------- Map Track Information (e.g. 10-20 Coordinate) to Index -------------
          if (!trackMap.has(track.contentHint)) {
              const index = trackMap.size
              contentHintToIndex[track.contentHint] = index
              trackMap.set(index, track)
          }
          
          // ------------- Grab Index -------------
          const i = contentHintToIndex[track.contentHint]
          channels = (i > channels) ? i : channels // Assign channels as max track number
  
          // ------------- Subscribe to New Data -------------
          track.subscribe((data, timestamps) => {
  
              // Organize New Data
              let arr = []
              for (let j = 0 ; j <= channels; j++) (i === j) ? arr.push(data) : arr.push([])
  
              // Add Data to Timeseries Graph
              timeseries.data = arr
              timeseries.draw() // FORCE DRAW: Update happens too fast for UI
  
              // Run ondata Callback
              ondata(data, timestamps, track.contentHint)
          })
      }

      const startAcquisition = async (label) => {

        // ------------- Get Device Stream -------------

        // Method #1: By Label
        const dataDevice = await dataDevices.getUserDevice({
          label, 
          // bluetooth: true
        })

        // Method #2: By Class
        // const dataDevice = await dataDevices.getUserDevice(ganglion)

        // ------------- Grab DataStream from Device -------------
        const stream = dataDevice.stream

        // ------------- Handle All Tracks -------------
        stream.tracks.forEach(handleTrack)
        stream.onaddtrack = e => handleTrack(e.track)
    }

      
    // ------------- Set Button Functionality -------------
    for (let button of start.current.querySelectorAll('button')) button.onclick = () => startAcquisition(button.id)

  }, []);

  return (
    <header className={clsx('hero hero--primary')}>

        <div ref={start}>
          <p>This example processes data from the <strong>datastreams-api</strong> unsafely on the server.</p>
          <div ref={start}>
            <button id="device">Synthetic</button>
            <button id="muse">Muse</button>
            <button id="ganglion">Ganglion</button>
            <button id="hegduino">HEGduino</button>
            <button id="webgazer">Webgazer</button>
          </div>
        </div>

        <div className={styles.conference}>
          <video ref={video} className={styles.video}></video>
          <div ref={audio}>
          </div>
        </div>
        

        <div ref={graph}>
        </div>

        <div className={styles.terminal} ><textarea ref={output} disabled></textarea></div>
    </header>
  );
}
