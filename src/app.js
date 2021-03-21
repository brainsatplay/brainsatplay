
import {brainsatplay} from './js/brainsatplayv2.js'
import {DOMFragment} from './js/frontend/utils/DOMFragment.js'



let connectHTML = `
	<button id='connect'>Connect Device</button>
    <button id='server'>Connect to Server</button>
    <button id='ping'>Send Ping</button>
	<button id='getusers'>Get Users</button>
	<button id='createGame'>Make Game session</button>
	<button id='subscribeToGame'>Subscribe to game session (connect device first)</button>
	<button id='subscribeToSelf'>Subscribe to self</button>
`; 


let bcisession = new brainsatplay('guest','');

bcisession.state.data.x = 0;
bcisession.state.subscribe('x',(x) => {
	console.log(x);
})

setTimeout(()=>{bcisession.state.data.x = 2},300);

let ui = new DOMFragment(
	connectHTML,
	document.body,
	undefined,
	() => {

		let onconnected = () => {
			console.log("connected");

			//subscribe after connecting or the device atlas won't be available
			bcisession.subscribe('freeeeg32_2','FP1','count', (newData) => {
				console.log(newData);
			})
		}

		document.getElementById('connect').onclick = () => {
			// if(bcisession.info.auth.authenticated) bcisession.connect('freeeeg32_2',['eegcoherence'],true,[['eegch','FP1','all'],['eegch','FP2','all']]);
			// else bcisession.connect('freeeeg32_2',['eegcoherence']);
			if(bcisession.info.auth.authenticated) bcisession.connect('muse',['eegcoherence'],true,[['eegch','FP1','all'],['eegch','FP2','all']]);
			else bcisession.connect('muse',['eegcoherence']);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login();
    	}
    	document.getElementById('ping').onclick = () => {
			bcisession.sendWSCommand(['ping']); //send array of arguments
		}
		document.getElementById('getusers').onclick = () => {
			bcisession.sendWSCommand(['getUsers']);
		}
		document.getElementById('createGame').onclick = () => {
			// bcisession.sendWSCommand(['createGame','game',['freeeeg32'],['eegch_FP1','eegch_FP2']]);
			bcisession.sendWSCommand(['createGame','game',['muse'],['eegch_FP1','eegch_FP2']]);

		}
		document.getElementById('subscribeToGame').onclick = () => {
			bcisession.subscribeToGame('game',false,(res)=>{console.log("subscribed!", res)});
		}
		document.getElementById('subscribeToSelf').onclick = () => {
			bcisession.subscribeToUser('guest',['eegch_FP1','eegch_FP2'],(res)=>{console.log("subscribed!", res)});
		}
	},
	undefined,
	'NEVER'
);

//BACKEND

//Test atlas stuff again since minor tweakages were made
//Test server streaming data to
//Test server subscribing to self
//Test creating and streaming to/subbing from game.

//THEN FRONTEND

//Test UI manager again after finishing it
//Test bcisession integrated into applet with all of the above bells and whistles tested
//Update applets to new templates & referencing rules
//Build out menus and stuff, make it fly as hell

//THEN

//Add HEG support & port features to new template structure
