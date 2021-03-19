
import {brainsatplay} from './js/brainsatplayv2.js'
import {DOMFragment} from './js/frontend/utils/DOMFragment.js'

let connectHTML = `
	<button id='connect'>Connect Device</button>
    <button id='server'>Connect to Server</button>
    <button id='send'>Send Ping</button>
`; 


let bcisession = new brainsatplay('guest','');

let ui = new DOMFragment(
	connectHTML,
	document.body,
	undefined,
	() => {
		document.getElementById('connect').onclick = () => {
			if(bcisession.info.auth.authenticated) bcisession.connect('freeeeg32_2',['eegcoherence'],true,['EEG_Ch','FP1','all']);
			else bcisession.connect('freeeeg32_2',['eegcoherence']);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login();
    	}
    	document.getElementById('send').onclick = () => {
			bcisession.sendWSCommand(["ping"]); //send array of arguments
		}
	},
	undefined,
	'NEVER'
);



//Test atlas stuff again since minor tweakages were made
//Test server streaming data to
//Test server subscribing to self
//Test creating and streaming to/subbing from game.

//THEN FRONTEND

//Test UI manager again after finishing it
//Test bcisession integrated into applet with all of the above bells and whistles tested
//Update applets to new templates & referencing rules
//Build out menus and stuff, make it fly as hell

//Add HEG support & port features to new template structure
