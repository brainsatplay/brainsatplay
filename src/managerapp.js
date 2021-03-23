
import {brainsatplay} from './js/brainsatplay'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {DOMFragment} from './js/frontend/utils/DOMFragment'

import {AppletExample} from './js/frontend/applets/AppletExample'


let applets = [
    {name:"Example Applet", cls:AppletExample}
];

let bcisession = new brainsatplay('guest');


let connectHTML = `
	<button id='connect'>Connect Device</button>
    <button id='server'>Connect to Server</button>
    <button id='ping'>Send Ping</button>
	<button id='getusers'>Get Users</button>
	<button id='createGame'>Make Game session</button>
	<button id='subscribeToGame'>Subscribe to game session (connect device first)</button>
	<button id='subscribeToSelf'>Subscribe to self</button>
`; 



let ui = new DOMFragment(
	connectHTML,
	document.body,
	undefined,
	() => {

		let onconnected = () => {
			console.log("connected");

			//subscribe after connecting or the device atlas won't be available
            //bcisession.subscribe('muse','AF7',undefined, (newData) => {
			bcisession.subscribe('freeeeg32_2','FP1',undefined, (newData) => {
				console.log(newData);
			});
		}

		document.getElementById('connect').onclick = () => {
			if(bcisession.info.auth.authenticated) bcisession.connect('freeeeg32_2',['eegcoherence'],onconnected,true,[['eegch','FP1','all'],['eegch','FP2','all']]);
			else bcisession.connect('freeeeg32_2',['eegcoherence'],onconnected);
			// if(bcisession.info.auth.authenticated) bcisession.connect('muse',['eegcoherence'],true,[['eegch','AF7','all'],['eegch','AF8','all']]);
			// else bcisession.connect('muse',['eegcoherence']);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login(true);
    	}
    	document.getElementById('ping').onclick = () => {
			bcisession.sendWSCommand(['ping']); //send array of arguments
		}
		document.getElementById('getusers').onclick = () => {
			bcisession.sendWSCommand(['getUsers']);
		}
		document.getElementById('createGame').onclick = () => {
			bcisession.sendWSCommand(['createGame','game',['freeeeg32'],['eegch_FP1','eegch_FP2']]);
			//bcisession.sendWSCommand(['createGame','game',['muse'],['eegch_AF7','eegch_AF8']]);
		}
		document.getElementById('subscribeToGame').onclick = () => {
			bcisession.subscribeToGame('game',false,(res)=>{console.log("subscribed!", res)});
		}
		document.getElementById('subscribeToSelf').onclick = () => {
			bcisession.subscribeToUser('guest',['eegch_FP1','eegch_FP2'],(res)=>{console.log("subscribed!", res)});
            //bcisession.subscribeToUser('guest',['eegch_AF7','eegch_AF8'],(res)=>{console.log("subscribed!", res)});
		}
	},
	undefined,
	'NEVER'
);




let mgr = new BCIAppManager(bcisession,applets,undefined,false);

mgr.initUIManager();

