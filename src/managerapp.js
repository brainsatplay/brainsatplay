
import {brainsatplay} from './js/brainsatplay'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {DOMFragment} from './js/frontend/utils/DOMFragment'

import {AppletExample} from './js/applets/AppletExample'
import {uPlotApplet} from './js/applets/uPlotApplet'
import {SpectrogramApplet} from './js/applets/SpectrogramApplet'
import { BrainMapApplet } from './js/applets/BrainMapApplet'
import { SmoothieApplet } from './js/applets/SmoothieApplet'

let applets = [
	{name:"Smooth",         cls: SmoothieApplet},
	{name:"uPlot", 			cls: uPlotApplet   },
	{name:"Spectrogram",    cls: SpectrogramApplet},
	{name:"Brain Map",      cls: BrainMapApplet},
    {name:"Example Applet", cls: AppletExample },
];

let bcisession = new brainsatplay('guest','','game');


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
			
		}

		document.getElementById('connect').onclick = () => {
			if(bcisession.info.auth.authenticated) bcisession.connect('freeeeg32_2',['eegcoherence'],onconnected,undefined,true,[['eegch','FP1','all'],['eegch','FP2','all']]);
			else bcisession.connect('freeeeg32_2',['eegcoherence'],onconnected);
			// if(bcisession.info.auth.authenticated) bcisession.connect('muse',['eegcoherence'],true,[['eegch','AF7','all'],['eegch','AF8','all']]);
			// else bcisession.connect('muse',['eegcoherence']);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login(true);
			//console.log(bcisession.socket.url);
    	}
    	document.getElementById('ping').onclick = () => {
			bcisession.sendWSCommand(['ping']); //send array of arguments
		}
		document.getElementById('getusers').onclick = () => {
			bcisession.sendWSCommand(['getUsers']);
		}
		document.getElementById('createGame').onclick = () => {
			bcisession.sendWSCommand(['createGame',bcisession.info.auth.appname,['freeeeg32'],['eegch_FP1','eegch_FP2']]);
			//bcisession.sendWSCommand(['createGame','game',['muse'],['eegch_AF7','eegch_AF8']]);
		}
		document.getElementById('subscribeToGame').onclick = () => {
			bcisession.subscribeToGame(undefined,false,(res)=>{console.log("subscribed!", res)});
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

