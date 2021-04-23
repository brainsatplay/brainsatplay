/*
//By Joshua Brewster, Garrett Flynn (GPL)

Stack notes:
Data Streams
- Local hardware
  -- Serial
  -- BLE
  -- Sockets/SSEs
- Server
  -- Hardware and Game state data via Websockets

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
- Game/App State(s)

*/
import 'regenerator-runtime/runtime' //fixes async calls in this bundler

import {StateManager} from './ui/StateManager'
import {DataAtlas} from './DataAtlas'

import { eeg32Plugin } from './devices/freeeeg32/freeeeg32Plugin';
import { musePlugin } from './devices/musePlugin';
import { hegduinoPlugin } from './devices/hegduino/hegduinoPlugin';
import { cytonPlugin } from './devices/cyton/cytonPlugin';
import { webgazerPlugin } from './devices/webgazerPlugin'
import { ganglionPlugin } from './devices/ganglion/ganglionPlugin';


export class Session {
	/**
     * @constructor 
     * @alias module:brainsatplay.Session
     * @description Class for server/socket connecting and macro controls for device streaming and data accessibilty.
     * @param {string} username Username
     * @param {string} password Password
     * @param {string} appname App name
     * @param {string} remoteHostURL Server URL
     * @param {string} localHostURL Local URL
     */
	constructor(
		username='',
		password='',
		appname='',
		access='public',
		remoteHostURL='http://localhost:8000',//https://brainsatplay.azurewebsites.net/',
		localHostURL='http://127.0.0.1:8000'
	) {
		this.devices = [];
		this.state = new StateManager({
			commandResult:{},
		});

		this.atlas = new DataAtlas('atlas',undefined,undefined,true,false);

		this.info = {
			nDevices: 0,
			auth:{
				url: new URL(remoteHostURL), 
				username:username, 
				password:password, 
				access:access, 
				appname:appname.toLowerCase().split(' ').join('').replace(/^[^a-z]+|[^\w]+/gi, ""),
				authenticated:false
			},
			subscribed: false,
			connections: [],
			localHostURL: localHostURL
		}
		this.socket = null;
	}

	/**
     * @method module:brainsatplay.Session.setLoginInfo
     * @description Set user information.
     * @param {string} username Username.
     * @param {string} password Password.
	 * @param {string} access Access level ('public' or 'private').
     * @param {string} appname Name of the app.
     */

	setLoginInfo(username='',password='',access='public',appname='') {
		this.info.auth.username = username;
		this.info.auth.password = password;
		this.info.auth.access = access;
		this.info.auth.appname = appname;
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
	connect(
		device="freeeeg32_2", 
		analysis=['eegfft'], 
		onconnect=()=>{},
		ondisconnect=()=>{}, 
		streaming=false, 
		streamParams=[['eegch','FP1','all']], 
		useFilters=true, 
		pipeToAtlas=true
		) {
			if(streaming === true) {
				console.log(this.socket);
				if(this.socket == null || this.socket.readyState !== 1) {
					console.error('Server connection not found, please run login() first');
					return false;
				}
			}

			if(this.devices.length > 0) {
				if(device.indexOf('eeg') > -1 || device.indexOf('muse') > -1) {
					let found = this.devices.find((o,i) => { //multiple EEGs get their own atlases just to uncomplicate things. Will need to generalize more later for other multi channel devices with shared preconfigurations if we want to try to connect multiple
						if(o.deviceType === 'eeg'){
							return true;
						}
					});
					if(!found) pipeToAtlas = this.devices[0].atlas;
				}
			}

			this.devices.push(
				new deviceStream(
					device,
					analysis,
					useFilters,
					pipeToAtlas,
					streaming,
					this.socket,
					streamParams,
					this.info.auth
				)
			);

			let i = this.devices.length-1;

			this.devices[i].onconnect = () => {
				this.info.nDevices++;
				onconnect();
				this.onconnected();
			}

			this.devices[i].ondisconnect = () => {
				ondisconnect();
				this.ondisconnected();
				if(Array.isArray(this.devices[i].info.analysis) && this.devices[i].info.analysis.length > 0) {
					this.devices[i].info.analyzing = false; //cancel analysis loop
				}
				this.devices[i].info.streaming = false; //cancel stream loop
				this.devices.splice(i,1);			
				this.info.nDevices--;
			}

			this.devices[i].init();

			if(this.devices.length === 1) this.atlas = this.devices[0].atlas; //change over from dummy atlas
			//Device info accessible from state
			this.state.addToState("device"+(i),this.devices[i].info);
			
			this.devices[i].connect();
	}

	onconnected = () => {}

	ondisconnected = () => {}


	/**
     * @method module:brainsatplay.Session.reconnect
     * @description Reconnect a device that has already been added.
     * @param {int} deviceIdx Index of device.
	 * @param {callback} onconnect Callback function on device reconnection. 
	 */
	reconnect(deviceIdx=this.devices.length-1,onconnect=()=>{}) { 
		if(deviceIdx > -1) {
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
	disconnect(deviceIdx=this.devices.length-1,ondisconnect=()=>{}) {
		if(deviceIdx > -1) {
			this.devices[deviceIdx].info.streaming = false;
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

	makeConnectOptions(parentNode=document.body, onconnect=()=>{}, ondisconnect=()=>{}) {
		let id = Math.floor(Math.random()*10000)+"devicemenu";
		let html = `<div><span class="collapsible-content-label">Device Selection</span><hr></div><div class="device-gallery">`;
	
		// html += `<select id='`+id+`select'><option value="" disabled selected>Choose your device</option>`
	
		let deviceOptions = [
			'muse',
			'freeeeg32_2','freeeeg32_19',
			'hegduinousb','hegduinobt', //,'hegduinowifi',
			'cyton','cyton_daisy', 'ganglion', 
		];

		deviceOptions.forEach((o,i) => {
			// html+= `<option value='`+o+`'>`+o+`</option>`;
			html+= `
			<div id='brainsatplay-${o}' value='${o}' class='device-card'>
			<div id='brainsatplay-${o}-indicator' class='indicator'></div>
			${o}
			</div>`;
		});

		html += `</div>`

		// html += `</select><button id='`+id+`connect'>Connect</button>`;

		parentNode.insertAdjacentHTML('afterbegin',html);
		parentNode.insertAdjacentHTML('beforeend',`<button id='`+id+`disconnect'>Disconnect</button>`);

		deviceOptions.forEach((o,i) => {
			document.getElementById(`brainsatplay-${o}`).onclick = () => {
				if(o === 'muse') {
					this.connect('muse',['eegcoherence'],onconnect,ondisconnect);
				}
				else if (o === 'freeeeg32_2') {
					this.connect('freeeeg32_2',['eegcoherence'],onconnect,ondisconnect);
				}
				else if (o === 'freeeeg32_19') {
					this.connect('freeeeg32_19',['eegfft'],onconnect,ondisconnect);
				}
				else if (o === 'hegduinousb') {
					this.connect('hegduinousb',[],onconnect,ondisconnect);
				}
				else if (o === 'hegduinobt') {
					this.connect('hegduinobt',[],onconnect,ondisconnect);
				}
				else if (o === 'hegduinowifi') {
					this.connect('hegduinowifi',[],onconnect,ondisconnect);
				}
				else if (o === 'cyton') {
					this.connect('cyton',['eegfft'],onconnect,ondisconnect);
				}
				else if (o === 'cyton_daisy') {
					this.connect('cyton_daisy',['eegfft'],onconnect,ondisconnect);
				} else if (o === 'ganglion') {
					this.connect('ganglion',['eegcoherence'],onconnect,ondisconnect);
				}
			}
		});

		document.getElementById(id+"disconnect").onclick = () => { 
			this.disconnect(); //Need to add disconnect buttons for every device added if multiple devices streaming
		}
	}

	beginStream(deviceIdx=0,streamParams=null) {
		if(this.devices[deviceIdx].info.streaming ) {
			this.devices[deviceIdx].info.streaming = true;
			if(streamParams !== null) {
				this.devices[deviceIdx].info.streamParams = streamParams;
			}
			this.devices[deviceIdx].streamLoop();
		}
	}

	endStream(deviceIdx=0) {
		this.devices[deviceIdx].info.streaming = false;
	}

	//get the device stream object
	getDevice(deviceNameOrType='freeeeg32_2',deviceIdx=0) {
		let found = undefined;
		this.devices.find((d,i) => {
			if(d.info.deviceName.indexOf(deviceNameOrType) > -1  && d.info.deviceNum === deviceIdx) {
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

	addAnalysisMode(name='') { //eegfft,eegcoherence,bcijs_bandpower,bcijs_pca,heg_pulse
		if(this.devices.length > 0) {
			let found = this.atlas.settings.analysis.find((str,i) => {
				if(name === str) {
					return true;
				}
			});
			if(found === undefined) {
				this.atlas.settings.analysis.push(name);
				if(this.atlas.settings.analyzing === false) {
					this.atlas.settings.analyzing = true;
					this.atlas.analyzer();
				}
			}
		} else {console.error("no devices connected")}
	}

	stopAnalysis(name='') { //eegfft,eegcoherence,bcijs_bandpower,bcijs_pca,heg_pulse
		if(this.devices.length > 0) {
			if(name !== '' && typeof name === 'string') {
				let found = this.atlas.settings.analysis.find((str,i) => {
					if(name === str) {
						this.atlas.settings.analysis.splice(i,1);
						return true;
					}
				});
			} else {
				this.atlas.settings.analyzing = false;
			}
		} else {console.error("no devices connected")}
	}

	//get data for a particular device	
	getDeviceData = (deviceType='eeg', tag='all', deviceIdx=0) => { //get device data. Just leave deviceIdx blank unless you have multiple of the same device type connected
		this.devices.forEach((d,i) => {
			console.log('get')
			if(d.info.deviceType.indexOf(deviceType) > -1 && d.info.deviceNum === deviceIdx) {
				if(tag === 'all') {
					return d.atlas.data[deviceType]; //Return all objects
				}
				return d.atlas.getDeviceDataByTag(deviceType,tag);
			}
		});
	}

	//Get locally stored data for a particular app or user subcription. Leave propname null to get all data for that sub
	getStreamData(userOrAppname='',propname=null) {
		let o = {};
		for(const prop in this.state.data) {
			if(propname === null) {
				if(prop.indexOf(userOrAppname) > -1) {
					o[prop] = this.state.data[prop];
				}
			}
			else if((prop.indexOf(userOrAppname) > -1) && (prop.indexOf(propname) > -1)) {
				o[prop] = this.state.data[prop];
			}
		}
		return o;
	}

	//listen for changes to atlas data properties
	subscribe = (deviceName='eeg',tag='FP1',prop=null,onData=(newData)=>{}) => {
		let sub = undefined;
		let atlasTag = tag;
		let atlasDataProp = null;
		if (deviceName.indexOf('eeg') > -1 || deviceName.indexOf('muse') > -1 || deviceName.indexOf('notion') > -1) {//etc
			atlasDataProp = 'eeg';	
			if(atlasTag === 'shared') { atlasTag = 'eeghared'; }
		}
		else if (deviceName.indexOf('heg') > -1) {
			atlasDataProp = 'heg';
			if(atlasTag === 'shared') { atlasTag = 'hegshared'; }
		}
		
		if(atlasDataProp !== null) { 
			let device = this.devices.find((o,i) => {
				if (o.info.deviceName.indexOf(deviceName) > -1 && o.info.useAtlas === true) {
					let coord = undefined;
					if(typeof atlasTag === 'string') {if(atlasTag.indexOf('shared') > -1 ) coord = o.atlas.getDeviceDataByTag(atlasTag,null);}
					else if (atlasTag === null || atlasTag === 'all') { coord = o.atlas.data[atlasDataProp]; } //Subscribe to entire data object 
					else coord = o.atlas.getDeviceDataByTag(atlasDataProp,atlasTag);
					
					if(coord !== undefined) {
						if(prop === null || Array.isArray(coord) || typeof coord[prop] !== 'object') {
							sub=this.state.addToState(atlasTag,coord,onData);
						} else if (typeof coord[prop] === 'object') {  //only works for objects which are stored by reference only (i.e. arrays or the means/slices/etc objects, so sub to the whole tag to follow the count)
							sub=this.state.addToState(atlasTag+"_"+prop,coord[prop],onData);
						}
					}
					return true;
				}
			});
		}

		return sub;
	}

	//remove the specified onchange function via the sub index returned from subscribe()
	unsubscribe = (tag='FP1',sub) => {
		this.state.unsubscribe(tag,sub);
	}

	//this will remove the event listener if you don't have any logic associated with the tag (for performance)
	unsubscribeAll = (tag='FP1') => {
		this.state.unsubscribeAll(tag);
	}

	addAnalysisMode(mode='',deviceName=this.state.data.device0.deviceName,n=0) {
		let device = this.getDevice(deviceName,n);
		let found = device.info.analysis.find((s,i) => {
			if(s === mode) {
				return true;
			}
		});
		if(!found) device.info.analysis.push(mode);
		if(!device.atlas.settings.analyzing) {
			device.atlas.settings.analyzing = true;
			device.atlas.analyzer();
		}
	}

	//Add functions to run custom data analysis loops. You can then add functions to gather this data for streaming.
	addAnalyzerFunc(prop=null,callback=()=>{}) {
		this.devices.forEach((o,i) => {
			if(o.atlas !== null && prop !== null) {
				if(o.atlas.analyzerOpts.indexOf(prop) < 0) {
					o.atlas.analyzerOpts.push(prop)
					o.atlas.analyzerFuncs.push(callback);
				}
				else {
					console.error("property "+prop+" exists");
				}
			}
		})
	}

	//Input an object that will be updated with app data along with the device stream.
	streamAppData(name='',props={}) {
		if(this.info.nDevices > 0) {
			let key = name+Math.floor(Math.random()*10000); //Add a little randomization in case you are streaming multiple of the same appname
			let obj = Object.assign({[key+"newData"]:true},props);

			this.state.addToState(key,obj,(newData) => {
				if(!this.state.data[key][key+"newData"]) this.state.data[key][key+"newData"] = true;
			});

			let newStreamFunc = () => {
				if(this.state.data[key][key+"newData"] === true) {
					this.state.data[key][key+"newData"] = false;
					return this.state.data[key];
				}
				else {
					return undefined;
				}
			}

			this.addStreamFunc(key,newStreamFunc);
			this.addStreamParam([key]);
		}
	}

	//Add functions for gathering data to send to the server
	addStreamFunc(name,callback,idx=0) {
		if(typeof name === 'string' && typeof callback === 'function' && this.devices[idx] !== undefined) {
			this.devices[idx].addStreamFunc(name,callback);
		} else { console.error("addStreamFunc error"); }
	}

	//add a parameter to the stream based on available callbacks [['function','arg1','arg2',etc][stream function 2...]]
	addStreamParam(params=[]) {
		params.forEach((p,i) => {
			if(Array.isArray(p)) {
				this.devices.find((d) => {
					if(p[0].indexOf(d.info.deviceType) > -1) {
						if(d.info.deviceType === 'eeg') {
							d.atlas.data.eegshared.eegChannelTags.find((o) => {
								if(o.tag === p[1] || o.ch === p[1]) {
									d.info.streamParams.push(p);
									return true;
								}
							})
						}
						else {
							d.info.streamParams.push(p); 
						}

						return true;
					}
				});
				
			}
		});
	}



	//Server login and socket initialization
	async login(beginStream=false, dict=this.info.auth, baseURL=this.info.auth.url.toString()) {
		//Connect to websocket
		if (this.socket == null  || this.socket.readyState !== 1){
			this.socket = this.setupWebSocket(dict);
			this.info.auth.authenticated = true;
			this.subscribed=true;
			//this.info.nDevices++;
		}
		if(this.socket !== null && this.socket.readyState === 1) {
			if(beginStream === true) {
				if(this.devices.length > 0) {
					this.devices.forEach((d,i) => {
						this.beginStream(i);
					});
				}
			}
		}
	} 

	async signup(dict={}, baseURL=this.info.auth.url.toString()) {
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
                console.log(`\n`+message);
                return message;
            })
            .catch(function (err) {
                console.error(`\n`+err.message);
            });

        return response;
	}

	async request(body,method="POST",pathname='',baseURL=this.info.auth.url.toString()){
		if (pathname !== ''){
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
            
            if (method === 'POST'){
                dict.body = JSON.stringify(body);
            }

            return await fetch(baseURL + pathname, dict).then((res) => {
            return res.json().then((dict) => {                 
                return dict.message;
            })
        })
            .catch(function (err) {
                console.error(`\n`+err.message);
            });
        } else {
            console.error(`You must provide a valid pathname to request resources from ` + baseURL);
            return;
        }
	}

	processSocketMessage(received='') {
		let parsed = JSON.parse(received);

		if(!parsed.msg) {
			console.log(received);
			return;
		}

		if(parsed.msg === 'userData') {
			for (const prop in parsed.userData) {
				this.state.data[parsed.username+"_userData"][prop] = parsed.userData[prop]; 
			}
		}
		else if (parsed.msg === 'gameData') {
			if (this.state.data.multiplayer[parsed.id] == null) this.state.data.multiplayer[parsed.id] = {userData: {}}
			if(this.state.data.multiplayer[parsed.id].userData) {
				parsed.userData.forEach((o,i) => {
					let user = this.state.data.multiplayer[parsed.id].userData[o.username]
					if (user != null){
						for(const prop in o) {
							if (user.latest[prop] == null) user.latest[prop] = null
							user.latest[prop] = o[prop];
							if (o[prop].constructor == Object){
								Object.keys(o[prop]).forEach(k => {
									if (user.history[prop] == null) user.history[prop] = o[prop]
									else user.history[prop][k].push(o[prop][k])
								});
							}
						}
					} else {
						this.state.data.multiplayer[parsed.id].userData[o.username] = {latest: {},history: o}
					}
				});
				//Should check if usernames are still present to splice them off but should do it only on an interval
				//this.state.data.multiplayer[parsed.id]["userData"].forEach((u,i) => {
				//	let found = parsed.usernames.find((name) => { if(u.username === name) return true; });
				//  if(!found) { this.state.data.multiplayer[parsed.id]["userData"].splice(i,1); }
				//});
			}
			else { this.state.data.multiplayer[parsed.id].userData = {} }
			this.state.data.multiplayer[parsed.id].spectators = parsed.spectators;
			this.state.data.multiplayer[parsed.id].usernames = parsed.usernames;
			this.state.data.multiplayer[parsed.id].t = Date.now();
		}
		else if (parsed.msg === 'getUserDataResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getUsersResult') {		
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getGameDataResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getGameInfoResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'getGamesResult') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'gameCreated') {
			this.state.data.commandResult = parsed;
			this.info.auth.appname = parsed.gameInfo.id;
		}
		else if (parsed.msg === 'subscribedToUser') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'userNotFound') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'subscribedToGame') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'leftGame') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'gameDeleted') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'unsubscribed') {
			this.state.data.commandResult = parsed;
		}
		else if (parsed.msg === 'gameNotFound') {
			this.state.data.commandResult = parsed;
		}else if (parsed.msg === 'resetUsername') {
			this.info.auth.username = parsed.username;
		}
		else if (parsed.msg === 'ping') {
		}
		else {
			console.log(parsed);
		}
		
	}

	setupWebSocket(auth=this.info.auth) {

		let socket = null;
        let subprotocol = [
			'username&'+auth.username,
     	   	'password&'+auth.password,
     	   	'appname&'+auth.appname
		];
		// if (auth.url.protocol === 'http:') {
		if (location.protocol === 'http:') {
            socket = new WebSocket(`ws://` + auth.url.host, subprotocol);
		} else if (location.protocol === 'https:') {
		// if (auth.url.protocol === 'https:') {
            socket = new WebSocket(`wss://` + auth.url.host, subprotocol);
        } else {
            console.log('invalid protocol');
            return;
		}

        socket.onerror = () => {
            console.log('error');
        };

        socket.onopen = () => {
			console.log('socket opened')
		};

        socket.onmessage = (msg) => {
			// console.log('Message recieved: ' + msg.data)
			this.processSocketMessage(msg.data);
        }

        socket.onclose = (msg) => {
            console.log('close');
        }

		return socket;
	}

	subscribeToUser(username='',userProps=[],userToSubscribe=this.info.auth.username,onsuccess=(newResult)=>{}) { // if successful, props will be available in state under this.state.data['username_prop']
		//check if user is subscribable
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify({username:this.info.auth.username,cmd:['getUserData',username]}));
			userProps.forEach((prop) => {
				let p = prop;
				if(Array.isArray(p)) p = prop.join("_"); //if props are given like ['eegch','FP1']
				this.state.data[username+"_"+p] = null; //dummy values so you can attach listeners to expected outputs
			});
			//wait for result, if user found then add the user
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(typeof newResult === 'object') {
					if(newResult.msg === 'getUserDataResult') {
						if(newResult.username === username) {
							this.socket.send(JSON.stringify(
								{username:this.info.auth.username,cmd:['subscribeToUser',userToSubscribe,username,userProps]}
							)); //resulting data will be available in state
						}
						onsuccess(newResult);
						this.state.unsubscribe('commandResult',sub);
					}
					else if (newResult.msg === 'userNotFound' && newResult.username === username) {
						this.state.unsubscribe('commandResult',sub);
						console.log("User not found: ", username);
					}
				}
			});
		}
	}

	unsubscribeFromUser(username='',userProps=null, userToUnsubscribe=this.info.auth.username,onsuccess=(newResult)=>{}) { //unsubscribe from user entirely or just from specific props
		//send unsubscribe command
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify({cmd:['unsubscribeFromUser',userToUnsubscribe,username,userProps],username:this.info.auth.username}))
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(newResult.msg === 'unsubscribed' && newResult.username === username) {
					for(const prop in this.state.data) {
						if(prop.indexOf(username) > -1) {
							this.state.unsubscribeAll(prop);
							this.state.data[prop] = undefined;
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult',sub);
				}
			});
		}
	}

	getGames(appname=this.info.auth.appname, onsuccess=(newResult)=>{}) {
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify({username:this.info.auth.username,cmd:['getGames',appname]}));
			//wait for response, check result, if game is found and correct props are available, then add the stream props locally necessary for game
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(typeof newResult === 'object') {
					if(newResult.msg === 'getGamesResult' && newResult.appname === appname) {
						
						console.log(newResult.gameInfo);
						onsuccess(newResult); //list games, then subscrie to game by id
						this.state.unsubscribe('commandResult',sub);
					}
				}
				else if (newResult.msg === 'gameNotFound' & newResult.appname === appname) {
					this.state.unsubscribe('commandResult',sub);
					console.log("Game not found: ", appname);
				}
			});
		}
	}

	//connect using the unique id of the subscription
	subscribeToGame(gameid=this.info.auth.appname,spectating=false,userToSubscribe=this.info.auth.username,onsuccess=(newResult)=>{}) {		
		console.log(this.info.auth.username)
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify({username:this.info.auth.username,cmd:['getGameInfo',gameid]}));
			//wait for response, check result, if game is found and correct props are available, then add the stream props locally necessary for game
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(typeof newResult === 'object') {
					if(newResult.msg === 'getGameInfoResult' && newResult.gameInfo.id === gameid) {
						let configured = true;
						if(spectating === false) {
							//check that this user has the correct streaming configuration with the correct connected device
							let streamParams = [];
							newResult.gameInfo.propnames.forEach((prop) => {
								// console.log(prop);
								streamParams.push(prop.split("_"));
							});
							configured = this.configureStreamForGame(newResult.gameInfo.devices,streamParams); //Expected propnames like ['eegch','FP1','eegfft','FP2']
						}

						if(configured === true) {
							this.socket.send(JSON.stringify({username:this.info.auth.username,cmd:['subscribeToGame',userToSubscribe,gameid,spectating]}));
							let userData = {}
							newResult.gameInfo.usernames.forEach((user) => {
								userData[user] = {latest: {}, history: {}}
								newResult.gameInfo.propnames.forEach((prop) => {
									userData[user].latest[prop] = null
									userData[user].history[prop] = null
								})
							})

							this.state.data.multiplayer = {
								[newResult.gameInfo.id]: {
									usernames: [],
									spectators: [],
									userData: userData
								}
							}

							onsuccess(newResult);
						}
						this.state.unsubscribe('commandResult',sub);
					}
					else if (newResult.msg === 'gameNotFound' & newResult.appname === gameid) {
						this.state.unsubscribe('commandResult',sub);
						console.log("Game not found: ", gameid);
					}
				}
			});
		}
	}

	unsubscribeFromGame(gameId='',onsuccess=(newResult)=>{}) {
		//send unsubscribe command
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify({cmd:['leaveGame',gameId],username:this.info.auth.username}))
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(newResult.msg === 'leftGame' && newResult.appname === gameId) {
					for(const prop in this.state.data) {
						if(prop.indexOf(gameId) > -1) {
							this.state.unsubscribeAll(prop);
							this.state.data[prop] = undefined;
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult',sub);
				}
			});
		}
	}

	//Browse multiplayer instances for an app
	makeGameBrowser = (appname, parentNode, onjoined=(gameInfo)=>{}, onleave=(gameInfo)=>{}) => {
		let id = Math.floor(Math.random()*1000000)+appname;
		let html = `<div id='`+id+`'><button id='`+id+`search'>Search</button><table id='`+id+`browser'></table></div>`;
		if (typeof parentNode === 'string' || parentNode instanceof String) parentNode = document.getElementById(parentNode)
		parentNode.insertAdjacentHTML('beforeend',html);

		document.getElementById(id+'search').onclick = () => {
			this.getGames(appname, (result) => {
				let tablehtml = '';
				result.gameInfo.forEach((g) => {
					tablehtml += `<tr><td>`+g.id+`</td><td>`+g.usernames.length+`</td><td><button id='`+g.id+`connect'>Connect</button>Spectate:<input id='`+id+`spectate' type='checkbox'></td></tr>`
				});

				document.getElementById(id+'browser').insertAdjacentHTML('afterbegin',tablehtml);

				result.gameInfo.forEach((g) => { 
					document.getElementById(g.id+'connect').onclick = () => {
						this.subscribeToGame(g.id,document.getElementById(id+'spectate').checked,undefined,(subresult) => {
							onjoined(g);
							document.getElementById(id).insertAdjacentHTML('afterbegin',`<button id='`+id+`disconnect'>Disconnect</button>`)
							document.getElementById(id+'disconnect').onclick = () => {
								this.unsubscribeFromGame(g.id,()=>{
									onleave(g);
									let node = document.getElementById(id+'disconnect');
									node.parentNode.removeChild(node);
								});
							}
						});
					}
				});
			});
		}
	}

	kickPlayerFromGame = (gameId, userToKick, onsuccess=(newResult)=>{}) => {
		if(this.socket !== null && this.socket.readyState === 1) {
			this.socket.send({cmd:['leaveGame',gameId,userToKick],username:this.info.auth.username});
			let sub = this.state.subscribe('commandResult',(newResult) => {
				if(newResult.msg === 'leftGame' && newResult.appname === gameId) {
					for(const prop in this.state.data) {
						if(prop.indexOf(userToKick) > -1) {
							this.state.unsubscribeAll(prop);
							this.state.data[prop] = undefined;
						}
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult',sub);
				}
			});
		}
	}

	configureStreamForGame(deviceTypes=[],streamParams=[]) { //Set local device stream parameters based on what the game wants
		let params = [];
		streamParams.forEach((p,i) => {
			if(p[2] === undefined)
				params.push([p[0],p[1],'all']);
			else params.push([...p]);
		});
		let d = undefined;
		let found = false;
		deviceTypes.forEach((name,i) => { // configure named device
			d = this.devices.find((o,j) => {
				if(o.info.deviceType === name) {
					if(o.socket === null) o.socket = this.socket;
					let deviceParams = [];
					params.forEach((p) => {
						if(p[0].indexOf(o.info.deviceType) > -1) { //stream parameters should have the device type specified (in case multiple devices are involved)
							if(o.info.deviceType === 'eeg') {
								o.atlas.data.eegshared.eegChannelTags.find((o) => {
									if(o.tag === p[1] || o.ch === p[1]) {
										deviceParams.push(p);
										return true;
									}
								})
							}
							else deviceParams.push(p);
						}
					});
					if(deviceParams.length > 0) {
						o.info.streamParams = deviceParams;
						if(o.info.streaming === false) {
							o.info.streaming = true;
							o.streamLoop();
						}
						found = true; //at least one device was found (if multiple types allowed)
						return true;
					}
				}
			});
		});
		if(!found) {
			console.error('Compatible device not found');
			return false;
		}
		else {
			return true;
		}
	}

	sendWSCommand(command='',dict={}){
		if(this.socket != null  && this.socket.readyState === 1){
				let o = {cmd:command,username:this.info.auth.username};
				Object.assign(o,dict);
				let json = JSON.stringify(o);
				console.log('Message sent: ', json);
				this.socket.send(json);
		}
	}

	closeSocket() {
		this.socket.close();
	}

	onconnectionLost(response){ //If a user is removed from the server
		let found = false; let idx = 0;
		let c = this.info.connections.find((o,i) => {
			if(o.username === response.username) {
				found = true;
				return true;
			}
		});
		if (found === true) {
			this.info.connections.splice(idx,1);
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
            pathname.splice(0,1);
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
		device="freeeeg32_2",
		analysis=['eegfft'],
		useFilters=true,
		pipeToAtlas=true,
		streaming=false,
		socket=null,
		streamParams=[],
		auth={
			username:'guest'
		}
	) {

		this.info = {
			deviceName:device,
			deviceType:null,
			streaming:streaming,
			streamParams:streamParams, //[['eegch','FP1','all'],['eegfft','AF7','all']]
			analysis:analysis, //['eegcoherence','eegfft' etc]

			deviceNum:0,
			streamLoopTiming:100, //ms between update checks
			streamCt:0,

			auth:auth,
			sps: null,
			useFilters:useFilters,
			useAtlas:false,
			simulating:false
		};

		this.device = null, //Device object, can be instance of eeg32, MuseClient, etc.
		
		this.deviceConfigs = [
			{  name:'freeeeg32',   cls:eeg32Plugin        },
			{  name:'muse', 	   cls:musePlugin         },
			{  name:'hegduino',    cls:hegduinoPlugin 	  },
			{  name:'cyton', 	   cls:cytonPlugin	      },
			{  name:'webgazer',    cls:webgazerPlugin     },
			{  name:'ganglion',    cls:ganglionPlugin     },
		];

		this.socket = socket;
		//console.log(this.socket);
		
		this.streamTable=[]; //tags and callbacks for streaming
		this.filters = [];   //BiquadChannelFilterer instances 
		this.atlas = null;
		this.pipeToAtlas = pipeToAtlas;

		//this.init(device,useFilters,pipeToAtlas,analysis);
	}

	init = (info=this.info, pipeToAtlas=this.pipeToAtlas) => {
		this.deviceConfigs.find((o,i) => {
			if(info.deviceName.indexOf(o.name) > -1 ) {
				this.device = new o.cls(info.deviceName,this.onconnect,this.ondisconnect);
				this.device.init(info,pipeToAtlas);
				this.atlas = this.device.atlas;
				this.filters = this.device.filters;
				if(this.atlas !== null) {
					this.pipeToAtlas = true;
					this.configureDefaultStreamTable();
					if(this.info.streaming === true) this.streamLoop();
				}

				return true;
			}
		});
	}

	connect = () => {
		this.device.connect();
	}

	disconnect = () => {
		this.device.disconnect();
	}

	//Generic handlers to be called by devices, you can stage further processing and UI/State handling here
	onconnect() {}

	ondisconnect() {}

	configureDefaultStreamTable(params=[]) {
		//Stream table default parameter callbacks to extract desired data from the data atlas
		let getEEGChData = (channel,nSamples='all') => {
			let get = nSamples;
			if(this.info.useAtlas === true) {
				let coord = false;
				if(typeof channel === 'number') {
					coord = this.atlas.getEEGDataByChannel(channel);
				}
				else {
					coord = this.atlas.getEEGDataByTag(channel);
				}
				if(coord !== undefined) { 
					if(get === 'all') {
						if(coord.count === 0) return undefined;
						get = coord.count-coord.lastRead;
						coord.lastRead = coord.count; //tracks count of last reading for keeping up to date
						if(get === 0) return undefined;
					}
					if (coord.filtered.length > 0) {
						let times = coord.times.slice(coord.times.length - get,coord.times.length);
						let samples = coord.filtered.slice(coord.filtered.length - get,coord.filtered.length);
						return {times:times, samples:samples};
					}
					else if (coord.raw.length > 0){
						let times = coord.times.slice(coord.times.length - get,coord.times.length);
						let samples = coord.raw.slice(coord.raw.length - get,coord.raw.length);
						return {times:times, samples:samples};
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

		let getEEGFFTData = (channel,nArrays='all') => {
			let get = nArrays;
			if(this.info.useAtlas === true) {
				let coord = false;
				if(typeof channel === 'number') {
					coord = this.atlas.getEEGFFTData(channel);
				}
				else {
					coord = this.atlas.getEEGDataByTag(channel);
				}
				if(coord !== undefined) {
					if(get === 'all') {
						if(coord.fftCount === 0) return undefined;
						get = coord.fftCount-coord.lastReadFFT;
						coord.lastReadFFT = coord.fftCount;
						if(get === 0) return undefined;
					}
					let fftTimes = coord.fftTimes.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get,coord.ffts.length);
					return {times:fftTimes, ffts:ffts};
				}
				else {
					return undefined;
				}
			}
		}

		let getCoherenceData = (tag, nArrays='all') => {
			let get = nArrays;
			if(this.info.useAtlas === true) {
				console.log(tag)
				let coord = this.atlas.getCoherenceByTag(tag);
				if(coord !== undefined) {
					if(get === 'all') {
						if(coord.fftCount === 0) return undefined;
						get = coord.fftCount-coord.lastRead;
						coord.lastRead = coord.fftCount;
						if(get === 0) return undefined;
					}
					let cohTimes = coord.times.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get,coord.ffts.length);
					return {times:cohTimes, ffts:ffts};
				}
				else {
					return undefined;
				}
			}
		}

		let getHEGData = (tag=0,nArrays='all',prop=undefined) => {
			let get = nArrays;
			if(this.info.useAtlas === true) {
				let coord = this.atlas.getDeviceDataByTag('heg',tag);
				if(get === 'all') {
					get = coord.count-coord.lastRead;
					coord.lastRead = coord.count;
					if(get <= 0) return undefined;
				}
				if(coord !== undefined) {
					if(prop !== undefined) {
						let times = coord.times.slice(coord.times.length - get, coord.times.length);
						let data = coord[prop].slice(coord.ffts.length - get,coord.ffts.length);
						let obj = {times:times}; obj[prop] = data;
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
			{prop:'eegch',  		callback:getEEGChData	 	},
			{prop:'eegfft', 		callback:getEEGFFTData	 	},
			{prop:'eegcoherence', 	callback:getCoherenceData	},
			{prop:'hegdata',        callback:getHEGData			}
		];

		if(params.length > 0) {
			this.streamTable.push(...params);
		}
	} 

	addStreamFunc(name = '',callback = () => {}) {
		this.streamtable.push({prop:name,callback:callback});
	}

	configureStreamParams(params=[['prop','tag']]) { //Simply defines expected data parameters from the user for server-side reference
		let propsToSend = [];
		params.forEach((param,i) => {
			propsToSend.push(param.join('_'));
		});
		this.socket.send(JSON.stringify({cmd:['addProps',propsToSend],username:this.info.auth.username}));
	}

	//pass array of arrays defining which datasets you want to pull from according to the available
	// functions and additional required arguments from the streamTable e.g.: [['EEG_Ch','FP1',10],['EEG_FFT','FP1',1]]
	sendDataToSocket = (params=[['prop','tag','arg1']],dataObj={}) => {
		let streamObj = {
			username:this.info.auth.username,
			userData:{}
		};
		Object.assign(streamObj.userData,dataObj); //Append any extra data not defined by parameters from the stream table
		params.forEach((param,i) => {
			this.streamTable.find((option,i) => {
				if(param[0].indexOf(option.prop) > -1) {
					let args = param.slice(1);
					let result = option.callback(...args);
					if(result !== undefined) {
						let prop = '';
						streamObj.userData[param.join('_')] = result;
					}
					return true;
				}
			});
		});
		if(Object.keys(streamObj.userData).length > 0) {
			this.socket.send(JSON.stringify(streamObj));
		}
	}

	streamLoop = (prev={}) => {
		if(this.info.streaming === true) {
			let params = [];
			if(this.info.streamParams.length === 0) { console.error('No stream parameters set'); return false;}
			this.info.streamParams.forEach((param,i) => {
				let c = this.streamTable.find((o,i) => {
					if(o.prop === param[0]) {
						params.push(param);
						return true;
					}
				});
			});
			//console.log(params);
			if(params.length > 0) { this.sendDataToSocket(params); }
			this.info.streamCt++;
			setTimeout(() => {this.streamLoop();}, this.info.streamLoopTiming);
		}
		else{
			this.info.streamCt = 0;
		}
	}

	simulateData() {
		let delay = 100;
		if(this.info.simulating === true) {
			let nSamplesToSim = Math.floor(this.info.sps*delay/1000);
			for(let i = 0; i<nSamplesToSim; i++) {
				//For each tagged channel generate fake data
				//let sample = Math.sin(i*Math.PI/180);
			}
			setTimeout(requestAnimationFrame(this.simulateData),delay);
		}
	}


}

