import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brainsatplay.bletest',
  appName: 'tinybuildapp',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins:{
    "BluetoothLe":{
      "displayStrings": {
        "scanning":"Scanning BLE...",
        "cancel":"Stop Scanning",
        "availableDevices":"Devices available!",
        "noDeviceFound": "No BLE devices found."
      }
    }
  }
};

export default config;
