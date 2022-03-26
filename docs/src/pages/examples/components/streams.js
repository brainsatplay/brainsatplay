import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'

export default function StreamsExample({ server, endpoints, router, id }) {

  const output = useRef(null);
  const video = useRef(null);
  const audio = useRef(null);
  const start = useRef(null);

  // const audio = useRef(null);


  useEffect(async () => {
    
    let synthetic = await import('@brainsatplay/device/dist/module')
    if (synthetic.default) synthetic = synthetic.default
    const datastreams = await import('datastreams-api/dist/index.esm')


    const pseudo = document.createElement('button')
    pseudo.click()

    // const synthetic = await import('@brainsatplay/device')
    const components = await import('../../../../libraries/brainsatplay-components/dist/module')
    // import RouteDisplay from '../routeDisplay';
    console.log(datastreams)
    console.log(synthetic)

    // const muse = await import('../../../../libraries/muse/dist/module.js')

    const volume = new components.Volume()
    audio.current.insertAdjacentElement('beforeend', volume)

    const dataDevices = new datastreams.DataDevices()

    dataDevices.getUserDevice({ audio: true }).then((device) => {

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

      const microphone = context.createMediaStreamSource(device.stream);
      microphone.connect(filterNode);
      filterNode.connect(gainNode);
      // microphone.connect(gainNode);
      gainNode.connect(analyser);
      // analyser.connect(context.destination); // NOTE: Comment out to block microphone audio

      device.stream.onended = () => {
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

    dataDevices.getUserDevice({ video: true }).then((device) => {
      video.current.srcObject = device.stream
      video.current.autoplay = true
    }).catch(console.error)


    // const devices = await dataDevices.getSupportedDevices()

    start.current.onclick = () => {

      dataDevices.getUserDevice(synthetic).then((device) => {

        console.log(
          'Data',
          device,
          device.stream,
          device.stream.getDataTracks()[0]
        )

      }).catch(console.error)

    }


  }, []);

  return (
    <header className={clsx('hero hero--primary')}>
      <div className={'container'}>
        <div className={styles.conference}>
          <video ref={video} className={styles.video}></video>
          <div ref={audio}>
          </div>
          <button ref={start}>Start</button>
        </div>
        <div className={styles.terminal}><span ref={output}></span></div>
      </div>
    </header>
  );
}
