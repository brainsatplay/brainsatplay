import 'regenerator-runtime/runtime'

// import './js/utils/webgl-heatmap'
// import './js/eeg32.js'
// import './js/eegvisuals.js'
// import './js/utils/gpuUtils.js'
// import './js/eegworker.js'
import './js/app.js'


if (process.env.NODE_ENV === 'development') {
    console.log('DEV MODE');
}

if (process.env.NODE_ENV === 'production') {    
    if(!(navigator as any).serial)
        alert("navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')")

    // import * as serviceWorker from './service-worker';
    const serviceWorker = require('./service-worker');
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    serviceWorker.register();
}
