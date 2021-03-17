import 'regenerator-runtime/runtime'

// import './js/utils/webgl-heatmap'
// import './js/eeg32.js'
// import './js/eegvisuals.js'
// import './js/utils/gpuUtils.js'
// import './js/eegworker.js'
import {brainsatplay} from './js/appv2.js'
import {DOMFragment} from './js/frontend/DOMFragment.js'

let connectHTML = `
	<button id='connect'>connectDevice</button>
	<button id='server'>connectServer</button>
`;

let bcisession = new brainsatplay('guest','');

let ui = new DOMFragment(connectHTML,document.body,undefined,
	() => {
		document.getElementById('connect').onclick = () => {
			if(bcisession.info.authenticated) bcisession.connect('FreeEEG32_2',true,['EEG_Ch','FP1','all'],true,true);
			else bcisession.connect('FreeEEG32_2',false,['EEG_Ch','FP1','all'],true,true);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login();
		}
	},
	undefined,
	'NEVER');


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
