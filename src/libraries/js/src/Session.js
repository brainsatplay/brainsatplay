/*
//By Joshua Brewster, Garrett Flynn (GPL)

Stack notes:
Data Streams
- Local hardware
  -- Serial
  -- BLE
  -- Sockets/SSEs
- Server
  -- Hardware and Session state data via Websockets

Data Processing 
- eegworker.js, eegmath, bcijs, etc.

Data State
- Sort raw/filtered data
- Sort processed data
- Handle streaming data from other users

UI Templating
- StateManager.js
- UIManager.js
- ObjectListener.js
- DOMFragment.js

Local Storage
- BrowserFS for IndexedDB
- CSV saving/parsing

Frontend Execution
- UI State
- Server State
- Session/App State(s)

*/
import 'regenerator-runtime/runtime' //fixes async calls in this bundler

// UI
import { DOMFragment } from './ui/DOMFragment';

// Managers
import { StateManager } from './ui/StateManager'
import { DataAtlas } from './DataAtlas'

// Device Plugins
import { eeg32Plugin } from './devices/freeeeg32/freeeeg32Plugin';
import { musePlugin } from './devices/musePlugin';
import { hegduinoPlugin } from './devices/hegduino/hegduinoPlugin';
import { cytonPlugin } from './devices/cyton/cytonPlugin';
import { webgazerPlugin } from './devices/webgazerPlugin'
import { ganglionPlugin } from './devices/ganglion/ganglionPlugin';
import { buzzPlugin } from './devices/buzzPlugin';
import { syntheticPlugin } from './devices/synthetic/syntheticPlugin';
import { brainstormPlugin } from './devices/brainstorm/brainstormPlugin';
import { bci2000Plugin } from './devices/bci2000/bci2000Plugin';

// MongoDB Realm
import { LoginWithGoogle, LoginWithRealm } from './ui/login';
import * as Realm from "realm-web";


// Default Styling
import './ui/styles/multiplayerIntro.css'



/**
 * ```javascript
 * import {Session} from 'brainsatplay'
 * ```
 */

export class Session {
	/**
     * @constructor 
     * @alias module:brainsatplay.Session
     * @description Class for server/socket connecting and macro controls for device streaming and data accessibilty.
     * @param {string} username Username
     * @param {string} password Password
     * @param {string} urlToConnect URL to connect to 
	 * @example session = new Session();
     */

	/**
	* ```javascript
	* let session = new Session();
	* ```
	*/

	constructor(
		username = '',
		password = '',
		urlToConnect = 'http://localhost'
	) {
		this.devices = [];
		this.state = new StateManager({
			commandResult: {},
		});

		this.atlas = new DataAtlas('atlas', undefined, undefined, true, false);

		this.info = {
			nDevices: 0,
			auth: {
				url: new URL(urlToConnect),
				username: username,
				password: password,
				authenticated: false
			},
			subscribed: false,
			subscriptions: []
		}

		this.id = Math.floor(Math.random() * 10000) // Give the session an ID
		this.socket = null;
		this.streamObj = new streamSession(this.info.auth);
		this.streamObj.deviceStreams = this.devices; //reference the same object
	}

	/**
     * @method module:brainsatplay.Session.setLoginInfo
     * @description Set user information.
     * @param {string} username Username.
     * @param {string} password Password.
     * @param {string} appname Name of the app.
     */

	setLoginInfo(username = '', password = '') {
		this.info.auth.username = username;
		this.info.auth.password = password;
	}

	/**
     * @method module:brainsatplay.Session.setLoginInfo
     * @description Connect local device and add it. Use [reconnect()]{@link module:brainsatplay.Session.reconnect} if disconnecting and reconnecting device in same session.
     * @param {string} device "freeeeg32", "freeeeg32_19", "muse", "notion"
     * @param {array} analysis "eegfft", "eegcoherence", etc
	 * @param {callback} onconnect Callback function on device connection. Subscribe to device outputs after connection completed.
     * @param {callback} ondisconnect Callback function on device disconnection. Unsubscribe from outputs after device is disconnected.
     * @param {boolean} streaming Set to stream to server (must be connected)
     * @param {array} streamParams e.g. [['eegch','FP1','all']]
     * @param {boolean} useFilters Filter device output if it needs filtering (some hardware already applies filters so we may skip those).
     * @param {boolean} pipeToAtlas Send data to atlas.
	 */

	//
	async connect(
		device = "freeeeg32_2",
		analysis = ['eegfft'],
		onconnect = () => { },
		ondisconnect = () => { },
		streaming = false,
		streamParams = [], // [ ['eegch','FP1','all'] ]
		useFilters = true,
		pipeToAtlas = true
	) {
		if (streaming === true) {
			if (this.socket == null || this.socket.readyState !== 1) {
				console.error('Server connection not found, please run login() first');
				return false;
			}
		}

		if (this.devices.length > 0) {
			if (device.indexOf('eeg') > -1 || device.indexOf('muse') > -1) {
				let found = this.devices.find((o, i) => { //multiple EEGs get their own atlases just to uncomplicate things. Will need to generalize more later for other multi channel devices with shared preconfigurations if we want to try to connect multiple
					if (o.deviceType === 'eeg') {
						return true;
					}
				});
				if (!found) pipeToAtlas = this.devices[0].atlas;
			}
		}

		if (device.includes('brainstorm')) {
			this.devices.push(
				new deviceStream(
					device,
					analysis,
					useFilters,
					pipeToAtlas,
					this.info.auth,
					this
				)
			);
		} else {
			this.devices.push(
				new deviceStream(
					device,
					analysis,
					useFilters,
					pipeToAtlas,
					this.info.auth
				)
			);
		}


		let i = this.devices.length - 1;

		this.devices[i].onconnect = () => {
			this.info.nDevices++;
			if (streamParams[0]) { this.beginStream(streamParams); }
			//Device info accessible from state
			this.state.addToState("device" + (i), this.devices[i].info);
			onconnect();
			this.onconnected();
		}

		this.devices[i].ondisconnect = () => {
			ondisconnect();
			this.ondisconnected();
			if (this.devices[i].info.analysis.length > 0) {
				this.devices[i].atlas.analyzing = false; //cancel analysis loop
			}
			this.devices.splice(i, 1);
			if (this.devices.length > 1) this.atlas = this.devices[0].atlas;
			this.info.nDevices--;
		}

		// Wait for Initialization before Connection
		await this.devices[i].init();

		if (this.devices.length === 1) this.atlas = this.devices[0].atlas; //change over from dummy atlas

		this.devices[i].connect();
	}

	onconnected = () => { }

	ondisconnected = () => { }


	/**
     * @method module:brainsatplay.Session.reconnect
     * @description Reconnect a device that has already been added.
     * @param {int} deviceIdx Index of device.
	 * @param {callback} onconnect Callback function on device reconnection. 
	 */
	reconnect(deviceIdx = this.devices.length - 1, onconnect = () => { }) {
		if (deviceIdx > -1) {
			this.devices[deviceIdx].connect();
			onconnect();
		} else { console.log("No devices connected"); }
	}

	/**
     * @method module:brainsatplay.Session.disconnect
     * @description Disconnect local device.
     * @param {int} deviceIdx Index of device.
	 * @param {callback} ondisconnect Callback function on device disconnection. 
	 */
	disconnect(deviceIdx = this.devices.length - 1, ondisconnect = () => { }) {
		if (deviceIdx > -1) {
			this.devices[deviceIdx].disconnect();
			ondisconnect();
		} else { console.log("No devices connected"); }
	}

	/**
     * @method module:brainsatplay.Session.makeConnectOptions
     * @description Generate DOM fragment with a selector for available devices.
	 * @param {HTMLElement} parentNode Parent node to insert fragment into.
	 * @param {callback} onconnect Callback function on device connection. 
	 * @param {callback} ondisconnect Callback function on device disconnection. 
	 */

	makeConnectOptions(parentNode = document.body, onconnect = () => { }, ondisconnect = () => { }) {
		let id = Math.floor(Math.random() * 10000) + "devicemenu";
		let html = `
		<div class="collapsible-content-label"><span>Device Selection</span><hr></div><div class="device-gallery">`;

		// html += `<select id='`+id+`select'><option value="" disabled selected>Choose your device</option>`

		let deviceOptions = [
			'synthetic', 'brainstorm', 'muse', 'muse_aux',
			'freeeeg32_2', 'freeeeg32_19',
			'hegduinousb', 'hegduinobt', //,'hegduinowifi',
			'cyton', 'cyton_daisy', 'ganglion', 'neosensory_buzz',
			'bci2000'
		];

		deviceOptions.forEach((o, i) => {
			// html+= `<option value='`+o+`'>`+o+`</option>`;
			html += `
			<div id='brainsatplay-${o}' value='${o}' class='device-card'>
			<div id='brainsatplay-${o}-indicator' class='indicator'></div>
			${o}
			</div>`;
		});

		html += `</div>`

		// html += `</select><button id='`+id+`connect'>Connect</button>`;

		parentNode.insertAdjacentHTML('afterbegin', html);
		parentNode.insertAdjacentHTML('beforeend', `<button id='` + id + `disconnect'>Disconnect</button>`);

		deviceOptions.forEach((o, i) => {
			document.getElementById(`brainsatplay-${o}`).onclick = () => {
				if (o === 'muse') {
					this.connect('muse', ['eegcoherence'], onconnect, ondisconnect);
				} else if (o === 'muse_aux') {
					this.connect('muse_aux', ['eegcoherence'], onconnect, ondisconnect);
				}
				else if (o === 'freeeeg32_2') {
					this.connect('freeeeg32_2', ['eegcoherence'], onconnect, ondisconnect);
				}
				else if (o === 'freeeeg32_19') {
					this.connect('freeeeg32_19', ['eegfft'], onconnect, ondisconnect);
				}
				else if (o === 'hegduinousb') {
					this.connect('hegduinousb', [], onconnect, ondisconnect);
				}
				else if (o === 'hegduinobt') {
					this.connect('hegduinobt', [], onconnect, ondisconnect);
				}
				else if (o === 'hegduinowifi') {
					this.connect('hegduinowifi', [], onconnect, ondisconnect);
				}
				else if (o === 'cyton') {
					this.connect('cyton', ['eegfft'], onconnect, ondisconnect);
				}
				else if (o === 'cyton_daisy') {
					this.connect('cyton_daisy', ['eegfft'], onconnect, ondisconnect);
				} else if (o === 'ganglion') {
					this.connect('ganglion', ['eegcoherence'], onconnect, ondisconnect);
				} else if (o === 'neosensory_buzz') {
					this.connect('neosensory_buzz', [], onconnect, ondisconnect);
				} else if (o === 'synthetic') {
					this.connect('synthetic', ['eegcoherence'], onconnect, ondisconnect);
				} else if (o === 'brainstorm') {
					this.connect('brainstorm', ['eegcoherence'], onconnect, ondisconnect);
				} else if (o === 'bci2000') {
					this.connect('bci2000', ['eegcoherence'], onconnect, ondisconnect);
				}
			}
		});

		document.getElementById(id + "disconnect").onclick = () => {
			this.disconnect(); //Need to add disconnect buttons for every device added if multiple devices streaming
		}
	}

	beginStream(streamParams = undefined) { //can push app stream parameters here
		if (!this.streamObj.info.streaming) {
			if (streamParams) this.addStreamParams(streamParams);
			this.streamObj.info.streaming = true;
			this.streamObj.streamLoop();
		}
	}

	endStream() {
		this.streamObj.info.streaming = false;
	}

	//get the device stream object
	getDevice(deviceNameOrType = 'freeeeg32_2', deviceIdx = 0) {
		let found = undefined;
		this.devices.find((d, i) => {
			if (d.info.deviceName.indexOf(deviceNameOrType) > -1 && d.info.deviceNum === deviceIdx) {
				found = d;
				return true;
			}
			else if (d.info.deviceType.indexOf(deviceNameOrType) > -1 && d.info.deviceNum === deviceIdx) {
				found = d;
				return true;
			}
		});
		return found;
	}

	addAnalysisMode(name = '') { //eegfft,eegcoherence,bcijs_bandpower,bcijs_pca,heg_pulse
		if (this.devices.length > 0) {
			let found = this.atlas.settings.analysis.find((str, i) => {
				if (name === str) {
					return true;
				}
			});
			if (found === undefined) {
				this.atlas.settings.analysis.push(name);
				if (this.atlas.settings.analyzing === false) {
					this.atlas.settings.analyzing = true;
					this.atlas.analyzer();
				}
			}
		} else { console.error("no devices connected") }
	}

	stopAnalysis(name = '') { //eegfft,eegcoherence,bcijs_bandpower,bcijs_pca,heg_pulse
		if (this.devices.length > 0) {
			if (name !== '' && typeof name === 'string') {
				let found = this.atlas.settings.analysis.find((str, i) => {
					if (name === str) {
						this.atlas.settings.analysis.splice(i, 1);
						return true;
					}
				});
			} else {
				this.atlas.settings.analyzing = false;
			}
		} else { console.error("no devices connected"); }
	}

	//get data for a particular device	
	getDeviceData = (deviceType = 'eeg', tag = 'all', deviceIdx = 0) => { //get device data. Just leave deviceIdx blank unless you have multiple of the same device type connected
		this.devices.forEach((d, i) => {
			if (d.info.deviceType.indexOf(deviceType) > -1 && d.info.deviceNum === deviceIdx) {
				if (tag === 'all') {
					return d.atlas.data[deviceType]; //Return all objects
				}
				return d.atlas.getDeviceDataByTag(deviceType, tag);
			}
		});
	}

	//Get locally stored data for a particular app or user subcription. Leave propname null to get all data for that sub
	getStreamData(userOrAppname = '', propname = null) {
		// let a = []
		let o = {};
		for (const prop in this.state.data) {
			if (propname === null) {
				if (prop.indexOf(userOrAppname) > -1) {
					o[prop] = this.state.data[prop];
					// a.push(o)
				}
			}
			else if ((prop.indexOf(userOrAppname) > -1) && (prop.indexOf(propname) > -1)) {
				o[prop] = this.state.data[prop];
				// a.push(o)
			}
		}
		return o;
	}

	//listen for changes to atlas data properties
	subscribe = (deviceName = 'eeg', tag = 'FP1', prop = null, onData = (newData) => { }) => {
		let sub = undefined;
		let atlasTag = tag;
		let atlasDataProp = null;
		if (deviceName.indexOf('eeg') > -1 || deviceName.indexOf('muse') > -1 || deviceName.indexOf('notion') > -1) {//etc
			atlasDataProp = 'eeg';
			if (atlasTag === 'shared') { atlasTag = 'eeghared'; }
		}
		else if (deviceName.indexOf('heg') > -1) {
			atlasDataProp = 'heg';
			if (atlasTag === 'shared') { atlasTag = 'hegshared'; }
		}

		if (atlasDataProp !== null) {
			let device = this.devices.find((o, i) => {
				if (o.info.deviceName.indexOf(deviceName) > -1 && o.info.useAtlas === true) {
					let coord = undefined;
					if (typeof atlasTag === 'string') { if (atlasTag.indexOf('shared') > -1) coord = o.atlas.getDeviceDataByTag(atlasTag, null); }
					else if (atlasTag === null || atlasTag === 'all') { coord = o.atlas.data[atlasDataProp]; } //Subscribe to entire data object 
					else coord = o.atlas.getDeviceDataByTag(atlasDataProp, atlasTag);

					if (coord !== undefined) {
						if (prop === null || Array.isArray(coord) || typeof coord[prop] !== 'object') {
							sub = this.state.addToState(atlasTag, coord, onData);
						} else if (typeof coord[prop] === 'object') {  //only works for objects which are stored by reference only (i.e. arrays or the means/slices/etc objects, so sub to the whole tag to follow the count)
							sub = this.state.addToState(atlasTag + "_" + prop, coord[prop], onData);
						}
					}
					return true;
				}
			});
		}

		return sub;
	}

	//remove the specified onchange function via the sub index returned from subscribe()
	unsubscribe = (tag = 'FP1', sub) => {
		this.state.unsubscribe(tag, sub);
	}

	//this will remove the event listener if you don't have any logic associated with the tag (for performance)
	unsubscribeAll = (tag = 'FP1') => {
		this.state.unsubscribeAll(tag);
	}

	addAnalysisMode(mode = '', deviceName = this.state.data.device0.deviceName, n = 0) {
		let device = this.getDevice(deviceName, n);
		let found = device.info.analysis.find((s, i) => {
			if (s === mode) {
				return true;
			}
		});
		if (!found) device.info.analysis.push(mode);
		if (!device.atlas.settings.analyzing) {
			device.atlas.settings.analyzing = true;
			device.atlas.analyzer();
		}
	}

	//Add functions to run custom data analysis loops. You can then add functions to gather this data for streaming.
	addAnalyzerFunc(prop = null, callback = () => { }) {
		this.devices.forEach((o, i) => {
			if (o.atlas !== null && prop !== null) {
				if (o.atlas.analyzerOpts.indexOf(prop) < 0) {
					o.atlas.analyzerOpts.push(prop)
					o.atlas.analyzerFuncs.push(callback);
				}
				else {
					console.error("property " + prop + " exists");
				}
			}
		})
	}

	//Input an object that will be updated with app data along with the device stream.
	streamAppData(propname = 'data', props = {}, onData = (newData) => { }) {

		let id = `${propname}`; //Math.floor(Math.random()*100000000);

		this.state.addToState(id, props, onData);

		this.state.data[id + "_flag"] = true;
		let sub = this.state.subscribe(id, () => {
			this.state.data[id + "_flag"] = true;
		});

		let newStreamFunc = () => {
			if (this.state.data[id + "_flag"] === true) {
				this.state.data[id + "_flag"] = false;
				return this.state.data[id];
			}
			else return undefined;
		}

		this.addStreamFunc(id, newStreamFunc);
		this.addStreamParams([[id]]);

		return id; //this.state.unsubscribeAll(id) when done

	}

	//Add functions for gathering data to send to the server
	addStreamFunc(name, callback, idx = 0) {
		if (typeof name === 'string' && typeof callback === 'function') {
			this.streamObj.addStreamFunc(name, callback);
		} else { console.error("addStreamFunc error"); }
	}

	//add a parameter to the stream based on available callbacks [['function','arg1','arg2',etc][stream function 2...]]
	addStreamParams(params = []) {
		params.forEach((p, i) => {
			if (Array.isArray(p)) {
				let found = this.devices.find((d) => {
					if (p[0].indexOf(d.info.deviceType) > -1) {
						if (d.info.deviceType === 'eeg') {
							d.atlas.data.eegshared.eegChannelTags.find((o) => {
								if (o.tag === p[1] || o.ch === p[1]) {
									this.streamObj.info.deviceStreamParams.push(p);
									return true;
								}
							})
						}
						else {
							this.streamObj.info.deviceStreamParams.push(p);
						}

						return true;
					}
				});
				if (!found) this.streamObj.info.appStreamParams.push(p);
			}
		});
	}


	getApp = () => {
		return Realm.App.getApp("brainsatplay-tvmdj")
	}

	loginWithGoogle = async () => {
		return await LoginWithGoogle()
	}

	loginWithRealm = async (authResponse) => {
		let user = await LoginWithRealm(authResponse)
		this.info.googleAuth = user
		return user
	}



	//Server login and socket initialization
	async login(beginStream = false, dict = this.info.auth, onsuccess = (newResult) => { }) {

		//Connect to websocket
		if (this.socket == null || this.socket.readyState !== 1) {
			this.socket = this.setupWebSocket(dict).then(socket => {
				this.socket = socket
				this.info.auth.authenticated = true;
				this.subscribed = true;
				if (this.socket !== null && this.socket.readyState === this.socket.OPEN) {
					if (beginStream === true) {
						this.beginStream();
					}
				}
				let sub = this.state.subscribe('commandResult', (newResult) => {
					if (typeof newResult === 'object') {
						if (newResult.msg === 'resetUsername') {
							this.info.auth.username = newResult.username
							this.state.unsubscribe('commandResult', sub);
							onsuccess(newResult)
						}
					}
				});
			});
		} else {
			return this.info.auth
		}
	}

	async signup(dict = {}, baseURL = this.info.auth.url.toString()) {
		baseURL = this.checkURL(baseURL);
		let json = JSON.stringify(dict);
		let response = await fetch(baseURL.toString() + 'signup',
			{
				method: 'POST',
				mode: 'cors',
				headers: new Headers({
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}),
				body: json
			}).then((res) => {
				return res.json().then((message) => message);
			})
			.then((message) => {
				console.log(`\n` + message);
				return message;
			})
			.catch(function (err) {
				console.error(`\n` + err.message);
			});

		return response;
	}

	async request(body, method = "POST", pathname = '', baseURL = this.info.auth.url.toString()) {
		if (pathname !== '') {
			baseURL = this.checkURL(baseURL);
			pathname = this.checkPathname(pathname);
			let dict = {
				method: method,
				mode: 'cors',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
			};

			if (method === 'POST') {
				dict.body = JSON.stringify(body);
			}

			return await fetch(baseURL + pathname, dict).then((res) => {
				return res.json().then((dict) => {
					return dict.message;
				})
			})
				.catch(function (err) {
					console.error(`\n` + err.message);
				});
		} else {
			console.error(`You must provide a valid pathname to request resources from ` + baseURL);
			return;
		}
	}

	processSocketMessage(received = '') {
		let parsed = JSON.parse(received);

		if (!parsed.msg) {
			console.log(received);
			return;
		}

		if (parsed.msg === 'userData') {
			for (const prop in parsed.userData) {
				this.state.data["userData_" + parsed.username + "_" + prop] = parsed.userData[prop];
			}
		}
		else if (parsed.msg === 'sessionData') {
			parsed.userData.forEach((o, i) => {
				let user = o.username
				for (const prop in o) {
					if (prop !== 'username') this.state.data[`${parsed.id}_${user}_${prop}`] = o[prop]
				}
			});

			if (parsed.userLeft) {
				for (const prop in this.state.data) {
					if (prop.indexOf(parsed.userLeft) > -1) {
						this.state.unsubscribeAll(prop);
						delete this.state.data[prop]
					}
				}
			}
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getUsersResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getSessionDataResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getSessionInfoResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getSessionsResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'sessionCreated') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'subscribedToUser') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'userNotFound') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'subscribedToSession') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'leftSession') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'sessionDeleted') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'unsubscribed') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'appNotFound' || parsed.msg === 'sessionNotFound') {
			this.state.data.commandResult = parsed;
		} else if (parsed.msg === 'resetUsername') {
			this.state.data.commandResult = parsed;
		} else if (parsed.msg === 'getUserDataResult') {
			this.state.data.commandResult = parsed;
		} 
		// OSC
		else if (parsed.msg === 'oscError') {
			this.state.data.commandResult = parsed;
		} else if (parsed.msg === 'oscInfo') {
			this.state.data.commandResult = parsed;
		} else if (parsed.msg === 'oscData') {
			console.log(parsed.oscData)
			// for (const prop in parsed.userData) {
			// 	this.state.data["userData_" + parsed.username + "_" + prop] = parsed.userData[prop];
			// }
		}
		else {
			console.log(parsed);
		}

	}

	async setupWebSocket(auth = this.info.auth) {

		let encodeForSubprotocol = (info) => {
			return info.replace(' ', '%20')
		}

		let socket = null;
		let subprotocol = [
			'username&' + encodeForSubprotocol(auth.username),
			'password&' + encodeForSubprotocol(auth.password),
			'origin&' + encodeForSubprotocol('brainsatplay.js')
		];
		if (auth.url.protocol === 'http:') {
			socket = new WebSocket(`ws://` + auth.url.host, subprotocol);
		} else if (auth.url.protocol === 'https:') {
			socket = new WebSocket(`wss://` + auth.url.host, subprotocol);
		} else {
			console.log('invalid protocol');
			return;
		}

		let wsPromise = new Promise((resolve, reject) => {
			socket.onerror = (e) => {
				console.log('error', e);
			};

			socket.onopen = () => {
				this.streamObj.socket = socket;
				resolve(socket);
			};

			socket.onmessage = (msg) => {
				// console.log('Message recieved: ' + msg.data)
				this.processSocketMessage(msg.data);
			}

			socket.onclose = (msg) => {
				console.log('close');
			}
		})
		return wsPromise
	}

	subscribeToUser(username = '', userProps = [], onsuccess = (newResult) => { }) { // if successful, props will be available in state under this.state.data['username_prop']
		//check if user is subscribable
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['getUserData', username]);
			userProps.forEach((prop) => {
				let p = prop;
				if (Array.isArray(p)) p = prop.join("_"); //if props are given like ['eegch','FP1']
				this.state.data[username + "_" + p] = null; //dummy values so you can attach listeners to expected outputs
			});
			//wait for result, if user found then add the user
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (typeof newResult === 'object') {
					if (newResult.msg === 'getUserDataResult') {
						if (newResult.username === username) {
							this.sendBrainstormCommand(['subscribeToUser', username, userProps]);
							for (const [prop, value] of Object.entries(newResult.userData.props)) {
								this.state.data["userData_" + username + "_" + prop] = value;
							}
						}
						onsuccess(newResult.userData);
						this.state.unsubscribe('commandResult', sub);
					}
					else if (newResult.msg === 'userNotFound' && newResult.username === username) {
						this.state.unsubscribe('commandResult', sub);
						console.log("User not found: ", username);
					}
				}
			});
		}
	}

	unsubscribeFromUser(username = '', userProps = null, onsuccess = (newResult) => { }) { //unsubscribe from user entirely or just from specific props
		//send unsubscribe command
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['unsubscribeFromUser', username, userProps]);

			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (newResult.msg === 'unsubscribed' && newResult.username === username) {
					for (const prop in this.state.data) {
						if (prop.indexOf(username) > -1) {
							this.state.unsubscribeAll(prop);
							delete this.state.data[prop]
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult', sub);
				}
			});
		}
	}

	getUsers(appname, onsuccess = (newResult) => { }) {
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['getUsers', appname]);
			//wait for response, check result, if session is found and correct props are available, then add the stream props locally necessary for session
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (typeof newResult === 'object') {
					if (newResult.msg === 'getUsersResult') {// && newResult.appname === appname) {						
						onsuccess(newResult.userData); //list userData, then subscrie to session by id
						this.state.unsubscribe('commandResult', sub);
						return newResult.userData
					}
				}
				else if (newResult.msg === 'usersNotFound') {//} & newResult.appname === appname) {
					this.state.unsubscribe('commandResult', sub);
					console.log("USers not found: ", appname);
					return []
				}
			});
		}
	}

	startOSC(localAddress="127.0.0.1",localPort=57121, remoteAddress=null, remotePort=null, onsuccess = (newResult) => { }){
		
		// Read and Write to the Same Address if Unspecified
		if (remoteAddress == null) remoteAddress = localAddress
		if (remotePort == null) remotePort = localPort

		this.sendBrainstormCommand(['startOSC', localAddress, localPort, remoteAddress, remotePort]);
		let sub = this.state.subscribe('commandResult', (newResult) => {
			if (typeof newResult === 'object') {
				if (newResult.msg === 'oscInfo') {	
					onsuccess(newResult.oscInfo);
					this.state.unsubscribe('commandResult', sub);
					return newResult.oscInfo
				}
			}
			else if (newResult.msg === 'oscError') {
				this.state.unsubscribe('commandResult', sub);
				console.log("OSC Error", newResult.oscError);
				return []
			}
		});
	}

	// stopOSC(localAddress="127.0.0.1",localPort=57121, onsuccess = (newResult) => { }){

	// }



	getSessions(appname, onsuccess = (newResult) => { }) {
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['getSessions', appname]);
			//wait for response, check result, if session is found and correct props are available, then add the stream props locally necessary for session
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (typeof newResult === 'object') {
					if (newResult.msg === 'getSessionsResult' && newResult.appname === appname) {
						onsuccess(newResult); //list sessions, then subscrie to session by id
						this.state.unsubscribe('commandResult', sub);
						return newResult.sessions
					}
				}
				else if (newResult.msg === 'appNotFound' & newResult.appname === appname) {
					this.state.unsubscribe('commandResult', sub);
					console.log("App not found: ", appname);
					return []
				}
			});
		}
	}

	//connect using the unique id of the subscription
	subscribeToSession(sessionid, spectating = false, onsuccess = (newResult) => { }) {
		console.log(this.info.auth.username)
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['getSessionInfo', sessionid]);
			//wait for response, check result, if session is found and correct props are available, then add the stream props locally necessary for session
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (typeof newResult === 'object') {
					if (newResult.msg === 'getSessionInfoResult' && newResult.sessionInfo.id === sessionid) {
						let configured = true;
						if (spectating === false) {
							//check that this user has the correct streaming configuration with the correct connected device
							let streamParams = [];
							newResult.sessionInfo.propnames.forEach((prop) => {
								// console.log(prop);
								streamParams.push(prop.split("_"));
							});
							configured = this.configureStreamForSession(newResult.sessionInfo.devices, streamParams); //Expected propnames like ['eegch','FP1','eegfft','FP2']
						}

						if (configured === true) {
							this.sendBrainstormCommand(['subscribeToSession', sessionid, spectating]);
							newResult.sessionInfo.usernames.forEach((user) => {
								newResult.sessionInfo.propnames.forEach((prop) => {
									this.state.data[sessionid + "_" + user + "_" + prop] = null;
								});
							});
							onsuccess(newResult);
						}

						console.log('unsubscribe ' + sub)
						this.state.unsubscribe('commandResult', sub);
					}
					else if (newResult.msg === 'sessionNotFound' & newResult.id === sessionid) {
						this.state.unsubscribe('commandResult', sub);
						console.log("Session not found: ", sessionid);
					}
				}
			});
		}
	}

	unsubscribeFromSession(sessionid = '', onsuccess = (newResult) => { }) {
		//send unsubscribe command
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['leaveSession', sessionid]);
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (newResult.msg === 'leftSession' && newResult.id === sessionid) {
					for (const prop in this.state.data) {
						if (prop.indexOf(sessionid) > -1) {
							this.state.unsubscribeAll(prop);
							delete this.state.data[prop]
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult', sub);
				}
			});
		}
	}


	promptLogin = async (parentNode = document.body, onsuccess = () => { }) => {
		return new Promise((resolve, reject) => {
			let template = () => {
				return `
		<div id="${this.id}login-page" class="brainsatplay-default-container" style="z-index: 1000; opacity: 0;">
			<div>
				<h2>Choose your Username</h2>
				<div id="${this.id}login-container" class="form-container">
					<div id="${this.id}login" class="form-context">
						<p id="${this.id}login-message" class="small"></p>
						<div class='flex'>
							<form id="${this.id}login-form" action="">
								<div class="login-element" style="margin-left: 0px; margin-right: 0px">
									<input type="text" name="username" autocomplete="off" placeholder="Enter a username"/>
								</div>
							</form>
						</div>
						<div class="login-buttons" style="justify-content: flex-start;">
							<div id="${this.id}login-button" class="brainsatplay-default-button">Sign In</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`}

			let setup = () => {
				let loginPage = document.getElementById(`${this.id}login-page`)
				const loginButton = loginPage.querySelector(`[id='${this.id}login-button']`)
				let form = loginPage.querySelector(`[id='${this.id}login-form']`)
				const usernameInput = form.querySelector('input')

				form.addEventListener("keyup", function (event) {
					if (event.keyCode === 13) {
						event.preventDefault();
					}
				});

				usernameInput.addEventListener("keyup", function (event) {
					if (event.keyCode === 13) {
						event.preventDefault();
						loginButton.click();
					}
				});

				loginButton.onclick = () => {
					let formDict = {}
					let formData = new FormData(form);
					for (var pair of formData.entries()) {
						formDict[pair[0]] = pair[1];
					}

					this.setLoginInfo(formDict.username)

					this.login(true, this.info.auth, () => {
						onsuccess()
						loginPage.style.opacity = '0';
						loginPage.style.pointerEvents = 'none'
						ui.deleteNode()
						resolve(true);
					})
				}

				// Auto-set username with Google Login
				if (this.info.googleAuth != null) {
					this.info.googleAuth.refreshCustomData().then(data => {
						loginPage.querySelector("[name='username']")[0].value = data.username
						loginButton.click()
					})
				}

				loginPage.style.opacity = '1';
			}

			let ui = new DOMFragment(
				template,
				parentNode,
				undefined,
				setup
			)
		});
	}

	createBrainstormBrowser = (parentNode = document.body, onsubscribe = () => { }) => {

		let template = () => {
			return `
			<div id="${this.id}-brainstormBrowser" style="z-index: 1000; background: black; width:100%; height: 100%; position: absolute; top: 0; left: 0; display:flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 1.0s;">
				<div id="${this.id}-choiceDisplay" style="flex-grow: 1;">
					<h1>Browse the Brainstorm</h1>
					<div style="display: flex;">
						<div id="${this.id}-userDiv" style="flex-grow: 1; overflow-y: scroll; border: 1px solid white;">
						
						</div>
						<div id="${this.id}-controlsDiv" style="overflow-y: scroll; width: 200px; display: flex; flex-wrap: wrap; justify-content: center;">
							<button name="users" class="brainsatplay-default-button" style="margin: 12.5px 25px;">Users</button>
							<button name="osc" class="brainsatplay-default-button" style="margin: 12.5px 25px;">OSC</button>
							<button name="lsl" class="brainsatplay-default-button" style="margin: 12.5px 25px;">LSL</button>
						</div>
					</div>
				</div>
				<button id="${this.id}-exitBrowser" class="brainsatplay-default-button" style="position: absolute; bottom:25px; right: 25px;">Go Back</button>
			</div>`
		}

		let setup = () => {
			let browser = document.getElementById(`${this.id}-brainstormBrowser`)
			let userDiv = browser.querySelector(`[id='${this.id}-userDiv']`)
			let controlsDiv = browser.querySelector(`[id='${this.id}-controlsDiv']`)
			let usersButton = controlsDiv.querySelector(`[name='users']`)
			let oscButton = controlsDiv.querySelector(`[name='osc']`)
			let lslButton = controlsDiv.querySelector(`[name='lsl']`)


			let exitBrowser = browser.querySelector(`[id='${this.id}-exitBrowser']`)
			exitBrowser.onclick = () => {
				browser.style.opacity = '0'
				browser.style.pointerEvents = 'none'
			}

			browser.style.opacity = '1'

			const resizeDisplay = () => {
				let browser = document.getElementById(`${this.id}-brainstormBrowser`)
				let display = browser.querySelector(`[id='${this.id}-choiceDisplay']`)
				let userDiv = browser.querySelector(`[id='${this.id}-userDiv']`)
				let padding = 50;
				browser.style.padding = `${padding}px`
				userDiv.style.height = `${window.innerHeight - 2 * padding - (display.offsetHeight - userDiv.offsetHeight)}px`
			}
			resizeDisplay()
			window.addEventListener('resize', resizeDisplay)
			
			let updateUserDisplay = (users) => {
				userDiv.innerHTML = ''

				let brainstormUserStyle = `
				background: rgb(20,20,20);
				padding: 25px;
				border: 1px solid black;
				transition: 0.5s;
			`

				let onMouseOver = () => {
					this.style.background = 'rgb(35,35,35)';
					this.style.cursor = 'pointer';
				}

				let onMouseOut = () => {
					this.style.background = 'rgb(20,20,20)';
					this.style.cursor = 'default';
				}

				users.forEach(o => {
					let keys = Object.keys(o)
					let appMessage = ((o[keys[0]] == '') ? 'Idle' : `Currently in ${o[keys[0]]}`)
					if (o[keys[1]] !== this.info.auth.username) {
						userDiv.innerHTML += `
						<div  id="${this.id}-user-${o[keys[1]]}" class="brainstorm-user" style="${brainstormUserStyle}" onMouseOver="(${onMouseOver})()" onMouseOut="(${onMouseOut})()">
						<p style="font-size: 60%;">${o[keys[2]]}</p>
						<p>${o[keys[1]]}</p>
						<p style="font-size: 80%;">${appMessage}</p>
						</div>`
					} else {
						userDiv.insertAdjacentHTML('afterbegin',`
						<div  id="${this.id}-user-${o[keys[1]]}" class="brainstorm-user" style="${brainstormUserStyle}">
							<p style="font-size: 60%;">${o[keys[2]]}</p>
							<p>You</p>
							<p style="font-size: 80%;">${appMessage}</p>
						</div>`)
					}
				})

				let divs = userDiv.querySelectorAll(".brainstorm-user")
				for (let div of divs) {
					let name = div.id.split(`${this.id}-user-`)[1]
					if (name !== this.info.auth.username) {
						div.onclick = (e) => {
							this.subscribeToUser(name, [], (userData) => {
								onsubscribe(userData)
								browser.style.opacity = '0'
								browser.style.pointerEvents = 'none'
								window.removeEventListener('resize', resizeDisplay)
								ui.deleteNode()
							})
						}
					}
				}
			}

			// Display All Users on Brainstorm
			usersButton.addEventListener('click', () => {

				this.getUsers(null, (userData) => {

					updateUserDisplay(userData)
				})
			})

			// Check OSC Port
			oscButton.addEventListener('click', () => {
				this.startOSC(undefined,undefined,undefined,undefined, (oscInfo) => {
					updateUserDisplay(oscInfo)
				})
			})

			usersButton.click()
		}

		let ui = new DOMFragment(
			template,
			parentNode,
			undefined,
			setup
		)
	}


	insertMultiplayerIntro = (applet) => {

		document.getElementById(`${applet.props.id}`).innerHTML += `
			<div id='${applet.props.id}appHero' class="brainsatplay-default-container" style="z-index: 5"><div>
			<h1>${applet.info.name}</h1>
			<p>${applet.subtitle}</p>
			<div class="brainsatplay-multiplayerintro-loadingbar" style="z-index: 6;"></div>
			</div>
			</div>

			<div id='${applet.props.id}login-screen' class="brainsatplay-default-container" style="z-index: 4"><div>
				<h2>Choose your Username</h2>
				<div id="${applet.props.id}login-container" class="form-container">
					<div id="${applet.props.id}login" class="form-context">
						<p id="${applet.props.id}login-message" class="small"></p>
						<div class='flex'>
							<form id="${applet.props.id}login-form" action="">
								<div class="login-element" style="margin-left: 0px; margin-right: 0px">
									<input type="text" name="username" autocomplete="off" placeholder="Enter a username"/>
								</div>
							</form>
						</div>
						<div class="login-buttons" style="justify-content: flex-start;">
							<div id="${applet.props.id}login-button" class="brainsatplay-default-button">Sign In</div>
						</div>
					</div>
				</div>
			</div></div>

			<div id='${applet.props.id}sessionSelection' class="brainsatplay-default-container" style="z-index: 3"><div>
				<div id='${applet.props.id}multiplayerDiv'">
				<div style="
				display: flex;
				align-items: center;
				column-gap: 15px;
				grid-template-columns: repeat(2,1fr)">
					<h2>Choose a Session</h2>
					<div>
						<button id='${applet.props.id}createSession' class="brainsatplay-default-button" style="flex-grow:0; padding: 10px; width: auto; min-height: auto; font-size: 70%;">Make New Session</button>
					</div>
				</div>
				</div>
			</div></div>
			<div id='${applet.props.id}exitSession' class="brainsatplay-default-button" style="position: absolute; bottom: 25px; right: 25px;">Exit Session</div>
			`

		// Setup HTML References
		let loginScreen = document.getElementById(`${applet.props.id}login-screen`)
		let sessionSelection = document.getElementById(`${applet.props.id}sessionSelection`)
		let exitSession = document.getElementById(`${applet.props.id}exitSession`)
		const hero = document.getElementById(`${applet.props.id}appHero`)
		const loadingBarElement = document.querySelector('.brainsatplay-multiplayerintro-loadingbar')

		// Create Session Brower
		let baseBrowserId = `${applet.props.id}${applet.info.name}`
		document.getElementById(`${applet.props.id}multiplayerDiv`).innerHTML += `<button id='${baseBrowserId}search' class="brainsatplay-default-button">Search</button>`
		document.getElementById(`${applet.props.id}multiplayerDiv`).innerHTML += `<div id='${baseBrowserId}browserContainer' style="box-sizing: border-box; padding: 10px 0px; overflow-y: hidden; height: 100%; width: 100%;"><div id='${baseBrowserId}browser' style='display: flex; align-items: center; width: 100%; font-size: 80%; overflow-x: scroll; box-sizing: border-box; padding: 25px 5%;'></div></div>`;

		let waitForReturnedMsg = (msgs, callback = () => { }) => {
			if (msgs.includes(this.state.data.commandResult.msg)) {
				callback(this.state.data.commandResult.msg)
			} else {
				setTimeout(() => waitForReturnedMsg(msgs, callback), 250)
			}
		}

		let onjoined = () => {
			sessionSelection.style.opacity = 0;
			sessionSelection.style.pointerEvents = 'none'
		}
		let onleave = () => {
			sessionSearch.click()
			sessionSelection.style.opacity = 1;
			sessionSelection.style.pointerEvents = 'auto'
		}

		let sessionSearch = document.getElementById(`${baseBrowserId}search`)

		sessionSearch.onclick = () => {

			this.getSessions(applet.info.name, (result) => {

				let gridhtml = '';
				result.sessions.forEach((g, i) => {
					if (g.usernames.length < 10) { // Limit connections to the same session server
						gridhtml += `<div><h3>` + g.id + `</h3><p>Streamers: ` + g.usernames.length + `</p><div><button id='` + g.id + `connect' style="margin-top: 5px;" class="brainsatplay-default-button">Connect</button><input id='` + baseBrowserId + `spectate' type='checkbox' style="display: none"></div></div>`
					} else {
						result.sessions.splice(i, 1)
					}
				});

				document.getElementById(baseBrowserId + 'browser').innerHTML = gridhtml

				let connecToGame = (g) => {
					let spectate = true

					if (this.atlas.settings.deviceConnected) { spectate = false; }

					this.subscribeToSession(g.id, spectate, (subresult) => {

						onjoined(g);


						let leaveSession = () => {
							this.unsubscribeFromSession(g.id, () => {
								onleave(g);
							});
						}

						exitSession.addEventListener('click', leaveSession)
					});
				}


				result.sessions.forEach((g) => {
					let connectButton = document.getElementById(`${g.id}connect`)
					connectButton.addEventListener('click', () => { connecToGame(g) })
				});
			});
		}

		// Set Up Screen Two (Login)

		const loginButton = document.getElementById(`${applet.props.id}login-button`)
		let form = document.getElementById(`${applet.props.id}login-form`)
		const usernameInput = form.querySelector('input')

		form.addEventListener("keyup", function (event) {
			if (event.keyCode === 13) {
				event.preventDefault();
			}
		});

		usernameInput.addEventListener("keyup", function (event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				loginButton.click();
			}
		});

		loginButton.onclick = () => {
			let form = document.getElementById(`${applet.props.id}login-form`)
			let formDict = {}
			let formData = new FormData(form);
			for (var pair of formData.entries()) {
				formDict[pair[0]] = pair[1];
			}

			let onsocketopen = () => {
				if (this.socket.readyState === 1) {
					sessionSearch.click()
					waitForReturnedMsg(['getSessionsResult', 'appNotFound'], (msg) => {
						if (msg === 'appNotFound') {
							createSession.click()
							waitForReturnedMsg('sessionCreated', () => {
								sessionSearch.click()
								loginScreen.style.opacity = 0;
								loginScreen.style.pointerEvents = 'none'
							})
						} else {
							loginScreen.style.opacity = 0;
							loginScreen.style.pointerEvents = 'none'
						}
					})
				} else {
					setTimeout(() => onsocketopen(), 500)
				}
			}

			this.setLoginInfo(formDict.username)
			this.login(true).then(() => {
				onsocketopen(this.socket)
			})
		}

		// Auto-set username with Google Login
		if (this.info.googleAuth != null) {
			this.info.googleAuth.refreshCustomData().then(data => {
				document.getElementsByName("username")[0].value = data.username
				loginButton.click()
			})
		}


		exitSession.onclick = () => {
			sessionSelection.style.opacity = 1;
			sessionSelection.style.pointerEvents = 'auto'
		}

		let createSession = document.getElementById(`${applet.props.id}createSession`)

		createSession.onclick = () => {
			this.sendBrainstormCommand(['createSession', applet.info.name, applet.info.devices, applet.streams]);

			waitForReturnedMsg(['sessionCreated'], () => { sessionSearch.click() })
		}
		// createSession.style.display = 'none'
		sessionSearch.style.display = 'none'

		let loaded = 0
		const loadInc = 5
		const loadTime = 3000
		setTimeout(() => {
			loadingBarElement.style.transition = `transform ${(loadTime - 1000) / 1000}s`;
			loadingBarElement.style.transform = `scaleX(1)`
		}, 1000)
		setTimeout(() => {
			if (loadingBarElement) {
				loadingBarElement.classList.add('ended')
				loadingBarElement.style.transform = ''
			}
			const hero = document.getElementById(`${applet.props.id}appHero`)
			if (hero) {
				hero.style.opacity = 0;
				hero.style.pointerEvents = 'none'
			}
		}, loadTime)
	}


	getBrainstormData(value, type = 'app') {

		let usernameInd;
		let propInd;
		let structureFilter;

		if (type === 'user') {
			usernameInd = 1
			propInd = 2
			structureFilter = (input) => {
				let val = input.split('_')[0]
				return val === 'userData'
			}
		} else {
			usernameInd = 2
			propInd = 3
			structureFilter = (input) => {
				return input.split('_')[0] !== 'userData'
			}
		}

		let arr = []
		if (value != null) {
			var regex = new RegExp(value);
			let returnedStates = Object.keys(this.state.data).filter(k => {
				let test1 = regex.test(k)
				let test2 = structureFilter(k)
				if (test1 && test2) return true
			})

			let usedNames = []

			returnedStates.forEach(str => {
				const strArr = str.split('_')
				if (!usedNames.includes(strArr[usernameInd])) {
					usedNames.push(strArr[usernameInd])
					arr.push({ username: strArr[usernameInd] })
				}

				arr.find(o => {
					if (o.username === strArr[usernameInd]) {
						o[strArr.slice(propInd).join('_')] = this.state.data[str]
					}
				})
			})
		} else {
			console.error('please specify a query for the Brainstorm (app, username, prop)')
		}
		return arr

	}

	kickUserFromSession = (sessionid, userToKick, onsuccess = (newResult) => { }) => {
		if (this.socket !== null && this.socket.readyState === 1) {
			this.sendBrainstormCommand(['leaveSession', sessionid, userToKick]);
			let sub = this.state.subscribe('commandResult', (newResult) => {
				if (newResult.msg === 'leftSession' && newResult.id === sessionid) {
					for (const prop in this.state.data) {
						if (prop.indexOf(userToKick) > -1) {
							this.state.unsubscribeAll(prop);
							delete this.state.data[prop]
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult', sub);
				}
			});
		}
	}

	configureStreamForSession(deviceTypes = [], streamParams = []) { //Set local device stream parameters based on what the session wants
		let params = streamParams;
		let d = undefined;
		if (this.devices.length === 0) { //no devices, add params anyway
			params.forEach((p) => {
				if (!this.streamObj.deviceStreams.find((ds) => { if (p[0].indexOf(ds.info.deviceType) > -1) { return true; } })) {
					if (!this.streamObj.info.appStreamParams.find((sp) => { if (sp.toString() === p.toString()) return true; })) {
						this.streamObj.info.appStreamParams.push(p);
					}
				}
			});
			if (this.streamObj.info.streaming === false) {
				this.streamObj.info.streaming = true;
				this.streamObj.streamLoop();
			}
		} else {

			deviceTypes.forEach((name, i) => { // configure named device
				d = this.devices.find((o, j) => {
					if (o.info.deviceType.toLowerCase() === name.toLowerCase()) {
						let deviceParams = [];
						params.forEach((p) => {
							if (p[0].indexOf(o.info.deviceType) > -1 && !this.streamObj.info.deviceStreamParams.find(dp => dp.toString() === p.toString())) { //stream parameters should have the device type specified (in case multiple devices are involved)
								if ('eeg' === o.info.deviceType.toLowerCase()) {
									o.atlas.data.eegshared.eegChannelTags.find((o) => {
										if (o.tag === p[1] || o.ch === p[1]) {
											deviceParams.push(p);
											return true;
										}
									})
								}
								else deviceParams.push(p);
							}
							else if (!this.streamObj.deviceStreams.find((ds) => { if (p[0].indexOf(ds.info.deviceType) > -1) { return true; } })) {
								if (!this.streamObj.info.appStreamParams.find((sp) => { if (sp.toString() === p.toString()) return true; })) {
									this.streamObj.info.appStreamParams.push(p);
								}
							}
						});
						if (deviceParams.length > 0 || this.streamObj.info.appStreamParams.length > 0) {
							this.streamObj.info.deviceStreamParams.push(...deviceParams);
							if (this.streamObj.info.streaming === false) {
								this.streamObj.info.streaming = true;
								this.streamObj.streamLoop();
							}
							return true;
						}
					}
				});
			});
		}
		if (this.streamObj.info.deviceStreamParams.length === 0 && this.streamObj.info.appStreamParams.length === 0) {
			console.error('Compatible device not found');
			return false;
		}
		else {
			return true;
		}
	}

	async sendBrainstormCommand(command = '', dict = {}) {

		// Create Message
		let o = { cmd: command, username: this.info.auth.username };
		Object.assign(o, dict);
		let json = JSON.stringify(o);

		if (this.socket.readyState !== this.socket.OPEN) {
			// Try to Send Message
			try {
				await waitForOpenConnection(this.socket)
				this.socket.send(json)
			} catch (err) { console.error(err) }
		} else {
			this.socket.send(json)
		}
	}

	waitForOpenConnection = (socket) => {
		return new Promise((resolve, reject) => {
			const maxNumberOfAttempts = 10
			const intervalTime = 200 //ms

			let currentAttempt = 0
			const interval = setInterval(() => {
				if (currentAttempt > maxNumberOfAttempts - 1) {
					clearInterval(interval)
					reject(new Error('Maximum number of attempts exceeded'))
				} else if (socket.readyState === socket.OPEN) {
					clearInterval(interval)
					resolve()
				}
				currentAttempt++
			}, intervalTime)
		})
	}

	closeSocket() {
		this.socket.close();
	}

	onconnectionLost(response) { //If a user is removed from the server
		let found = false; let idx = 0;
		let c = this.info.subscriptions.find((o, i) => {
			if (o.username === response.username) {
				found = true;
				return true;
			}
		});
		if (found === true) {
			this.info.subscriptions.splice(idx, 1);
			this.info.nDevices--;
		}
	}

	checkURL(url) {
		if (url.slice(-1) !== '/') {
			url += '/';
		}
		return url;
	}

	checkPathname(pathname) {
		if (pathname.slice(0) === '/') {
			pathname.splice(0, 1);
		}
		return pathname;
	}

}

//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------

//Class for handling local device streaming as well as automating data organization/analysis and streaming to server.
class deviceStream {
	constructor(
		device = "freeeeg32_2",
		analysis = ['eegfft'],
		useFilters = true,
		pipeToAtlas = true,
		auth = {
			username: 'guest'
		},
		session = null
	) {
		this.info = {
			deviceName: device,
			deviceType: null,
			analysis: analysis, //['eegcoherence','eegfft' etc]
			session: session,

			deviceNum: 0,

			googleAuth: null,
			auth: auth,
			sps: null,
			useFilters: useFilters,
			useAtlas: false,
			simulating: false
		};

		this.device = null, //Device object, can be instance of eeg32, MuseClient, etc.

			this.deviceConfigs = [
				{ name: 'freeeeg32', cls: eeg32Plugin },
				{ name: 'muse', cls: musePlugin },
				{ name: 'hegduino', cls: hegduinoPlugin },
				{ name: 'cyton', cls: cytonPlugin },
				{ name: 'webgazer', cls: webgazerPlugin },
				{ name: 'ganglion', cls: ganglionPlugin },
				{ name: 'neosensory_buzz', cls: buzzPlugin },
				{ name: 'synthetic', cls: syntheticPlugin },
				{ name: 'brainstorm', cls: brainstormPlugin },
				{ name: 'bci2000', cls: bci2000Plugin },

			];

		this.filters = [];   //BiquadChannelFilterer instances 
		this.atlas = null;
		this.pipeToAtlas = pipeToAtlas;
		//this.init(device,useFilters,pipeToAtlas,analysis);
	}

	init = async (info = this.info, pipeToAtlas = this.pipeToAtlas) => {
		return new Promise(async (resolve, reject) => {
			async function findAsync(arr, asyncCallback) {
				const promises = arr.map(asyncCallback);
				const results = await Promise.all(promises);
				const index = results.findIndex(result => result);
				return arr[index];
			}

			findAsync(this.deviceConfigs, async (o, i) => {
				if (info.deviceName.indexOf(o.name) > -1) {
					if (info.deviceName.includes('brainstorm')) {
						this.device = new o.cls(info.deviceName, info.session, this.onconnect, this.ondisconnect);
					} else {
						this.device = new o.cls(info.deviceName, this.onconnect, this.ondisconnect);
					}
					await this.device.init(info, pipeToAtlas)
					this.atlas = this.device.atlas;
					this.filters = this.device.filters;
					if (this.atlas !== null) {
						this.pipeToAtlas = true;
					}
					resolve(true)
					return true
				}
			});
		})
	}

	connect = () => {
		this.device.connect();
	}

	disconnect = () => {
		this.device.disconnect();
	}

	//Generic handlers to be called by devices, you can stage further processing and UI/State handling here
	onconnect() { }

	ondisconnect() { }

}



class streamSession {
	constructor(auth, socket) {

		this.deviceStreams = [];

		this.info = {
			auth: auth,
			streaming: false,
			deviceStreamParams: [],
			nDevices: 0,
			appStreamParams: [],
			streamCt: 0,
			streamLoopTiming: 50
		};

		this.streamTable = []; //tags and callbacks for streaming
		this.socket = socket;

		this.configureDefaultStreamTable();
	}

	configureDefaultStreamTable(params = []) {
		//Stream table default parameter callbacks to extract desired data from the data atlas
		let getEEGChData = (device, channel, nSamples = 'all') => {
			let get = nSamples;
			if (device.info.useAtlas === true) {
				let coord = false;
				if (typeof channel === 'number') {
					coord = device.atlas.getEEGDataByChannel(channel);
				}
				else {
					coord = device.atlas.getEEGDataByTag(channel);
				}
				if (coord !== undefined) {
					if (get === 'all') {
						if (coord.count === 0) return undefined;
						get = coord.count - coord.lastRead;
						coord.lastRead = coord.count; //tracks count of last reading for keeping up to date
						if (get === 0) return undefined;
					}
					if (coord.filtered.length > 0) {
						let times = coord.times.slice(coord.times.length - get, coord.times.length);
						let samples = coord.filtered.slice(coord.filtered.length - get, coord.filtered.length);
						return { times: times, samples: samples };
					}
					else if (coord.raw.length > 0) {
						let times = coord.times.slice(coord.times.length - get, coord.times.length);
						let samples = coord.raw.slice(coord.raw.length - get, coord.raw.length);
						return { times: times, samples: samples };
					}
					else {
						return undefined;
					}
				}
				else {
					return undefined;
				}
			}
		}

		let getEEGFFTData = (device, channel, nArrays = 'all') => {
			let get = nArrays;
			if (device.info.useAtlas === true) {
				let coord = false;
				if (typeof channel === 'number') {
					coord = device.atlas.getEEGFFTData(channel);
				}
				else {
					coord = device.atlas.getEEGDataByTag(channel);
				}
				if (coord !== undefined) {
					if (get === 'all') {
						if (coord.fftCount === 0) return undefined;
						get = coord.fftCount - coord.lastReadFFT;
						coord.lastReadFFT = coord.fftCount;
						if (get === 0) return undefined;
					}
					let fftTimes = coord.fftTimes.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get, coord.ffts.length);
					return { times: fftTimes, ffts: ffts };
				}
				else {
					return undefined;
				}
			}
		}

		let getEEGBandpowerMeans = (device, channel) => {
			if (device.info.useAtlas === true) {
				let coord = false;

				coord = device.atlas.getLatestFFTData(channel)[0];

				if (coord !== undefined) {
					return { time: coord.time, bandpowers: coord.mean };
				}
				else {
					return undefined;
				}
			}
		}

		let getEEGCoherenceBandpowerMeans = (device, channel) => {
			if (device.info.useAtlas === true) {
				let coord = false;

				coord = device.atlas.getLatestCoherenceData(channel);

				if (coord !== undefined) {
					return { time: coord.time, bandpowers: coord.mean };
				}
				else {
					return undefined;
				}
			}
		}

		let getEEGBandpowerSlices = (device, channel) => {
			if (device.info.useAtlas === true) {
				let coord = false;

				coord = device.atlas.getLatestFFTData(channel)[0];

				if (coord !== undefined) {
					return { time: coord.time, bandpowers: coord.slice };
				}
				else {
					return undefined;
				}
			}
		}

		let getEEGCoherenceBandpowerSlices = (device, channel) => {
			if (device.info.useAtlas === true) {
				let coord = false;

				coord = device.atlas.getLatestCoherenceData(channel)[0];

				if (coord !== undefined) {
					return { time: coord.time, bandpowers: coord.slice };
				}
				else {
					return undefined;
				}
			}
		}

		let getCoherenceData = (device, tag, nArrays = 'all') => {
			let get = nArrays;
			if (device.info.useAtlas === true) {
				let coord = device.atlas.getCoherenceByTag(tag);
				if (coord !== undefined) {
					if (get === 'all') {
						if (coord.fftCount === 0) return undefined;
						get = coord.fftCount - coord.lastRead;
						coord.lastRead = coord.fftCount;
						if (get === 0) return undefined;
					}
					let cohTimes = coord.times.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get, coord.ffts.length);
					return { times: cohTimes, ffts: ffts };
				}
				else {
					return undefined;
				}
			}
		}

		let getHEGData = (device, tag = 0, nArrays = 'all', prop = undefined) => {
			let get = nArrays;
			if (device?.info?.useAtlas === true) {
				let coord = device.atlas.getDeviceDataByTag('heg', tag);
				if (get === 'all') {
					get = coord.count - coord.lastRead;
					coord.lastRead = coord.count;
					if (get <= 0) return undefined;
				}
				if (coord !== undefined) {
					if (prop !== undefined) {
						let times = coord.times.slice(coord.times.length - get, coord.times.length);
						let data = coord[prop].slice(coord.ffts.length - get, coord.ffts.length);
						let obj = { times: times }; obj[prop] = data;
						return obj;
					}
					else return coord;
				}
				else {
					return undefined;
				}
			}
		}

		this.streamTable = [
			{ prop: 'eegch', callback: getEEGChData },
			{ prop: 'eegfft', callback: getEEGFFTData },
			{ prop: 'eegcoherence', callback: getCoherenceData },
			{ prop: 'eegfftbands', callback: getEEGBandpowerMeans },
			{ prop: 'eegcoherencebands', callback: getEEGCoherenceBandpowerMeans },
			{ prop: 'eegfftbandslices', callback: getEEGBandpowerSlices },
			{ prop: 'eegcoherencebandslices', callback: getEEGCoherenceBandpowerSlices },
			{ prop: 'hegdata', callback: getHEGData }
		];

		if (params.length > 0) {
			this.streamTable.push(...params);
		}
	}

	addStreamFunc(name = '', callback = () => { }) {
		this.streamTable.push({ prop: name, callback: callback });
	}

	configureStreamParams(params = [['prop', 'tag']]) { //Simply defines expected data parameters from the user for server-side reference
		let propsToSend = [];
		params.forEach((param, i) => {
			propsToSend.push(param.join('_'));
		});
		this.sendBrainstormCommand(['addProps', propsToSend]);
	}

	//pass array of arrays defining which datasets you want to pull from according to the available
	// functions and additional required arguments from the streamTable e.g.: [['eegch','FP1'],['eegfft','FP1']]
	getDataForSocket = (device = undefined, params = [['prop', 'tag', 'arg1']]) => {
		let userData = {};
		params.forEach((param, i) => {
			this.streamTable.find((option, i) => {
				if (param[0] === option.prop) {
					let args;
					if (device) args = [device, ...param.slice(1)];
					else args = param.slice(1);
					let result = (args.length !== 0) ? option.callback(...args) : option.callback()
					if (result !== undefined) {
						userData[param.join('_')] = result;
					}
					return true;
				}
			});
		});

		return userData;
		// if(Object.keys(streamObj.userData).length > 0) {
		// 	this.socket.send(JSON.stringify(streamObj));
		// }
	}

	streamLoop = (prev = {}) => {
		let streamObj = {
			username: this.info.auth.username,
			userData: {}
		}
		if (this.info.streaming === true) {
			this.deviceStreams.forEach((d) => {
				if (this.info.nDevices < this.deviceStreams.length) {
					if (!streamObj.userData.devices) streamObj.userData.devices = [];
					streamObj.userData.devices.push(d.info.deviceName);
					this.info.nDevices++;
				}
				let params = [];
				this.info.deviceStreamParams.forEach((param, i) => {
					if (this.info.deviceStreamParams.length === 0) { console.error('No stream parameters set'); return false; }
					if (param[0].indexOf(d.info.deviceType) > -1) {
						params.push(param);
					}
				});
				if (params.length > 0) {
					Object.assign(streamObj.userData, this.getDataForSocket(d, params));
				}
			});
			Object.assign(streamObj.userData, this.getDataForSocket(undefined, this.info.appStreamParams));
			//if(params.length > 0) { this.sendDataToSocket(params); }
			if (Object.keys(streamObj.userData).length > 0) {
				this.socket.send(JSON.stringify(streamObj));
			}
			this.info.streamCt++;
			setTimeout(() => { this.streamLoop(); }, this.info.streamLoopTiming);
		}
		else {
			this.info.streamCt = 0;
		}
	}
}