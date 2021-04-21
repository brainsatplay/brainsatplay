# OpenBCI Ganglion

WebBluetooth client for the Ganglion EEG board by OpenBCI

## Installation

`npm install --save ganglion-ble`

## Usage

``` js
import Ganglion from 'ganglion-ble';

async function init () {
  const ganglion = new Ganglion();
  await ganglion.connect();
  await ganglion.start();

  ganglion.stream.subscribe(sample => {
      console.log('sample', sample);
  });
}

init();
```

A sample follows this data structure:

``` js
{
  data: [Number, Number, Number, Number],
  timestamp: Date
};
```

> For security reasons, Web Bluetooth must be started from user interaction. Add a connect button that would start the BLE connection. See ./examples/basic/index.js

## Accelerometer data example

``` js
ganglion.accelData.subscribe(sample => {
    console.log('sample with accelData', sample);
});
```

## Demo

* Clone this repo
* `npm install`
* `npm start`
* Go to http://localhost:9000/examples/basic

### License

MIT
