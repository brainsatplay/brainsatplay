document.body.innerHTML = 'Hello World!';

import { BleClient } from '@capacitor-community/bluetooth-le';

BleClient.initialize({ 
    androidNeverForLocation: true 
}).then((initialized) => {
    console.log("BLE initialized!", initialized);

    BleClient.requestDevice().then((requested) => {
        console.log("Connected to ",requested);
    })
});