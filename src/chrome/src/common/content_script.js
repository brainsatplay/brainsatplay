console.log('CONTENT SCRIPT RUNNING');

let readout = document.getElementById('readout');

let connected;

let processTrack = track => {
  console.log('Track', track);

  const processor = new DataStreamTrackProcessor({ track }); // the source of ondata is device.readable...
  const generator = new DataStreamTrackGenerator(); // the source of ondata is device.readable...

  let transform = async (value, controller) => {
    if (readout) readout.innerHTML = value;
    return value;
  };

  const testTransformer = new TransformStream({ transform });
  processor.readable
    .pipeThrough(testTransformer)
    .pipeTo(generator.writable)
    .then(() => console.log('All data successfully written!'))
    .catch(console.error);

  track.subscribe(value => {
    if (readout) readout.innerHTML = value;
    mask.style.opacity = value;
  });
};

// ------------------------------------ Connect a Sensing Device -------------------------------------
let connect = () => {
  if (!connected) {
    connected = true;

    let dataDevices = new datastreams.DataDevices();

    dataDevices.getUserStream({ fnirs: true }).then(stream => {
      let dataTracks = stream.getDataTracks();

      console.log('Stream', stream, dataTracks);

      dataTracks.forEach(processTrack);
      stream.addEventListener('addtrack', processTrack);
      stream.addEventListener('track', e => {
        processTrack(e.detail);
      });
    });
  }
};

// ------------------------------------ Create Button to Connect Devices -------------------------------------
// Adding Button or Binding to Existing One (on new tab page)
let button = document.getElementById('connect');
if (!button) {
  button = document.createElement('button');
  button.style.zIndex = '1000000000';
  button.style.position = 'fixed';
  button.style.top = '0';
  button.style.right = '0';
  document.body.appendChild(button);
}

// Check Button Existence
if (button) {
  button.innerHTML = 'Connect to Brains@Play';
  button.onclick = connect;
}

// ------------------------------------ Animate the Brightness of the Screen -------------------------------------
let mask = document.createElement('div');
mask.style = `
          background: black;
          width: 100vw;
          height: 100vh;
          position: fixed; 
          top: 0;
          left:0;
          opacity: 0;
          z-index: 999999999;
          pointer-events: none;
      `;

document.body.insertAdjacentElement('beforeend', mask);
