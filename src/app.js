
import {brainsatplay} from './js/brainsatplayv2.js'
import {DOMFragment} from './js/frontend/DOMFragment.js'

let connectHTML = `
	<button id='connect'>Connect Device</button>
    <button id='server'>Connect to Server</button>
    <button id='send'>Send Ping</button>
`;

let bcisession = new brainsatplay('guest','');

let ui = new DOMFragment(connectHTML,document.body,undefined,
	() => {
		document.getElementById('connect').onclick = () => {
			if(bcisession.info.authenticated) bcisession.connect('FreeEEG32_2',true,['EEG_Ch','FP1','all'],true,true,['eegfft']);
			else bcisession.connect('FreeEEG32_2',false,['EEG_Ch','FP1','all'],true,true,['eegcoherence']);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login();
    }
    document.getElementById('send').onclick = () => {
			bcisession.sendWSCommand(["ping"]); //send array of arguments
		}
	},
	undefined,
	'NEVER');
