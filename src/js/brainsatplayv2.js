/*

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

import {eeg32, eegmath} from './bciutils/eeg32'
import {MuseClient} from 'muse-js'

import {BiquadChannelFilterer} from './bciutils/signal_analysis/BiquadFilters'
import {StateManager} from './frontend/utils/StateManager'
import { raw } from 'express'


//Class for server/socket connecting and macro controls for device streaming and data accessibilty.
export class brainsatplay {
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
			commandResult:{}
		});

		this.info = {
			nDevices: 0,
			auth:{
				url: new URL(remoteHostURL), 
				username:username, 
				password:password, 
				access:access, 
				appname:appname,
				authenticated:false
			},
			subscribed: false,
			connections: [],
			localHostURL: localHostURL
		}

		this.socket = null;
	}

	setLoginInfo(username='',password='',access='public',appname='') {
		this.info.auth.username = username;
		this.info.auth.password = password;
		this.info.auth.access = access;
		this.info.auth.appname = appname;
	}

	//connect local device
	connect(
		device="freeeeg32_2", //"freeeeg32","freeeeg32_19","muse","notion"
		analysis=['eegfft'], //'eegfft','eegcoherence',etc
		onconnect=()=>{}, //onconnect callback, subscribe to device outputs after connection completed
		streaming=false,
		streamParams=[['eegch','FP1','all']], //Device properties to stream
		useFilters=true, //Filter device output if it needs filtering (some hardware already applies filters so we may skip those)
		pipeToAtlas=true
		) {
			if(streaming === true) {
				console.log(this.socket);
				if(this.socket == null || this.socket.readyState !== 1) {
					console.error('Server connection not found, please run login() first');
					return false;
				}
			}
			this.devices.push(
				new deviceStream(
					device,
					streaming,
					useFilters,
					pipeToAtlas,
					this.socket,
					streamParams,
					analysis,
					this.info.auth
				)
			);

			this.devices[this.devices.length-1].onconnect = onconnect;

			//Device info accessible from state
			this.state.addToState("device"+this.devices.length,this.devices[this.devices.length-1].info);
			
			this.devices[this.devices.length-1].connect();
			this.info.nDevices++;

	}
	
	//disconnect local device
	disconnect(deviceIdx=this.devices[this.devices.length-1],ondisconnect=()=>{}) {
		this.devices.ondisconnect = ondisconnect;
		this.devices[deviceIdx].disconnect();
	}

	beginStream(deviceIdx=0,streamParams=null) {
		if(this.devices[deviceIdx].info.streaming ) {
			this.devices[deviceIdx].info.streaming = true;
			if(streamProps !== null) {
				this.devices[deviceIdx].info.streamParams = streamParams;
			}
			this.devices[deviceIdx].streamLoop();
		}
	}

	endStream(deviceIdx=0) {
		this.devices[deviceIdx].info.streaming = false;
	}

	//listen for changes to atlas data properties
	subscribe = (deviceName='freeeeg32_2',tag='FP1',prop=null,onData=(newData)=>{}) => {
		let sub = undefined;
		let atlasTag = tag;
		let atlasDataProp = null; //Atlas has an object of named properties based on device or if there is shared data
		if (deviceName.indexOf('eeg') > -1 || deviceName.indexOf('muse') > -1 || deviceName.indexOf('notion') > -1) {//etc
			atlasDataProp = 'eeg';	
			if(atlasTag === 'shared') { atlasTag = 'eeghared'; }
		}
		else if (deviceName.indexOf('heg') > -1) {
			atlasDataProp = 'heg';
			if(atlasTag === 'shared') { atlasTag = 'hegshared'; }d
		}
		if(atlasDataProp !== null) {
			let device = this.devices.find((o,i) => {
				if (o.info.deviceName.indexOf(deviceName) > -1 && o.info.useAtlas === true) {
					let coord = undefined;
					if(atlasTag.indexOf('shared') > -1 )coord = o.atlas.getDeviceDataByTag(atlasTag,null);
					else coord = o.atlas.getDeviceDataByTag(atlasDataProp,atlasTag);
					
					if(coord !== undefined) {
						if(prop === null) {
							sub=this.state.addToState(atlasTag,coord,onData);
						} else if (typeof coord[prop] === 'object') {  //only works for objects which are stored by reference only
							sub=this.state.addToState(atlasTag,coord[prop],onData);
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

	getData = (tag='FP1', deviceType='eeg') => { //get device data
		this.devices.forEach((d,i) => {
			if(d.info.deviceType === deviceType) {
				return d.atlas.getDeviceDataByTag(deviceType,tag);
			}
		});
	}

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

	//Server login and socket initialization
	async login(beginStream=false, dict=this.info.auth, baseURL=this.info.auth.url.toString()) {
		//Connect to websocket
		if (this.socket == null  || this.socket.readyState !== 1){
			this.socket = this.setupWebSocket(dict);
			this.info.auth.authenticated = true;
			this.subscribed=true;
			this.info.nDevices++;
		}
		if(beginStream === true) {
			this.devices.forEach((d,i) => {
				this.beginStream(i);
			})
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
		console.log(parsed);
		if(parsed.msg === 'userData') {
			for(const prop in parsed) {
			 if (prop !== 'msg' && prop !== 'username') 
				this.state.data[parsed.username+"_"+prop] = parsed[prop]; 
			}
			
		}
		else if (parsed.msg === 'gameData') {
			this.state.data[parsed.appname+"_userData"] = parsed.userData;
			this.state.data[parsed.appname+"_spectators"] = parsed.spectators;
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
		}
		else if (parsed.msg === 'ping') {
		}
		else {
		}
	}

	setupWebSocket(auth=this.info.auth) {

		let socket = null;
        let subprotocol = [
			'username'+auth.username,
     	   	'password'+auth.password,
     	   	'appname'+auth.appname
		];
		if (auth.url.protocol === 'http:') {
            socket = new WebSocket(`ws://` + auth.url.host, subprotocol);
        } else if (auth.url.protocol === 'https:') {
            socket = new WebSocket(`wss://` + auth.url.host, subprotocol);
        } else {
            console.log('invalid protocol');
            return;
		}

        socket.onerror = () => {
            console.log('error');
        };

        socket.onopen = () => {
            console.log('ping');
            socket.send(JSON.stringify({username:this.info.auth.username,msg:['ping']}));
        };

        socket.onmessage = (msg) => {
			this.processSocketMessage(msg.data);
        }

        socket.onclose = (msg) => {
            console.log('close');
        }

		return socket;
	}

	subscribeToUser(username='',userProps=[],onsuccess=(newResult)=>{}) { // if successful, props will be available in state under this.state.data['username_prop']
		//check if user is subscribable
		this.socket.send(JSON.stringify({username:this.info.auth.username,msg:['getUserData',username]}));
		userProps.forEach((prop) => {
			if(typeof prop === 'object') prop.join("_"); //if props are given like ['eegch','FP1']
			this.state[username+"_"+prop] = null; //dummy values so you can attach listeners to expected outputs
		});
		//wait for result, if user found then add the user
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(typeof newResult === 'object') {
				if(newResult.msg === 'getUserDataResult') {
					if(newResult.username === username) {
						this.socket.send(JSON.stringify({username:this.info.auth.username,msg:['subscribeToUser',username,userProps]})); //resulting data will be available in state
					}
					onsuccess(newResult);
					this.state.unsubscribe('commandResult',sub);
				}
				else if (newResult.msg === 'userNotFound' && newResult.userData[0] === username) {
					this.state.unsubscribe('commandResult',sub);
					console.log("User not found: ", username);
				}
			}
		});
	}

	subscribeToGame(appname='',spectating=false,onsuccess=(newResult)=>{}) {
		this.socket.send(JSON.stringify({username:this.info.auth.username,msg:['getGameInfo',appname]}));
		//wait for response, check result, if game is found and correct props are available, then add the stream props locally necessary for game
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(typeof newResult === 'object') {
				if(newResult.msg === 'getGameInfoResult' && newResult.appname === appname) {
					let configured = true;
					if(spectating === false) {
						//check that this user has the correct streaming configuration with the correct connected device
						let streamParams = [];
						newResult.gameInfo.propnames.forEach((prop) => {
							console.log(prop);
							streamParams.push(prop.split("_"));
						});
						configured = this.configureStreamForGame(newResult.gameInfo.devices,streamParams); //Expected propnames like ['eegch','FP1','eegfft','FP2']
					}
					if(configured === true) {
						this.socket.send(JSON.stringify({username:this.info.auth.username,msg:['subscribeToGame',appname,spectating]}));
						newResult.gameInfo.usernames.forEach((user) => {
							newResult.gameInfo.propnames.forEach((prop) => {
								this.state[appname+"_"+user+"_"+prop] = null;
							});
						});
						onsuccess(newResult);
					}
					this.state.unsubscribe('commandResult',sub);
				}
				else if (newResult.msg === 'gameNotFound' & newResult.appname === appname) {
					this.state.unsubscribe('commandResult',sub);
					console.log("Game not found: ", appname);
				}
			}
		});
	}

	unsubscribeFromUser(username='',userProps=null,onsuccess=(newResult)=>{}) { //unsubscribe from user entirely or just from specific props
		//send unsubscribe command
		this.socket.send(JSON.stringify({msg:['unsubscribeFromUser',username,userProps],username:this.info.auth.username}))
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(newResult.msg === 'leftGame' && newResult.appname === appname) {
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

	unsubscribeFromGame(appname='',onsuccess=(newResult)=>{}) {
		//send unsubscribe command
		this.socket.send({msg:['leaveGame',appname],username:this.info.auth.username})
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(newResult.msg === 'leftGame' && newResult.appname === appname) {
				for(const prop in this.state.data) {
					if(prop.indexOf(appname) > -1) {
						this.state.unsubscribeAll(prop);
						this.state.data[prop] = undefined;
					}
				}
				onsuccess(newResult);
				this.state.unsubscribe('commandResult',sub);
			}
		});
	}

	configureStreamForGame(deviceNames=[],streamParams=[]) { //Set local device stream parameters based on what the game wants
		let params = [];
		streamParams.forEach((p,i) => {
			if(p[2] === undefined)
				params.push([p[0],p[1],'all']);
			else params.push([p[0],p[1],p[3]]);
		});
		let d = undefined;
		deviceNames.forEach((name,i) => { //configure named device
			d = this.devices.find((o,j) => {
				if(o.info.deviceName.indexOf(name) > -1) {
					if(o.socket === null) o.socket = this.socket;
					let deviceParams = [];
					params.forEach((p,k) => {
						if(p[0].indexOf(o.info.deviceType) > -1) { //stream parameters should have the device type specified (in case multiple devices are involved)
							deviceParams.push(p);
						}
					});
					o.info.streamParams = deviceParams;
					o.info.streaming = true;
					if(o.info.streamCt === 0) {
						o.streamLoop();
					}
					return true;
				}
			});
		});
		if(d === undefined) {
			console.error('Compatible device not found');
			return false;
		}
		else {
			return true;
		}
	}

	sendWSCommand(command='',dict={}){
		if(this.socket != null  && this.socket.readyState === 1){
			if(command === 'initializeBrains') {
				this.socket.send(JSON.stringify({'destination':'initializeBrains','public':this.info.auth.access === 'public'}))
			}
			else if (command === 'bci') {
				dict.destination = 'bci';
				dict.id = this.info.auth.username;
				dict.consent = this.info.auth.consent;
				if(auth.consent.game === true) {
					//let reserved = ['voltage','time','electrode','consent'];
					//let me = this.brains[this.info.access].get(this.me.username);
					//if (me !== undefined){
					//	Object.keys(me.data).forEach((key) => {
					//		if (!reserved.includes(key)){
					//			dict[key] = me.data[key];
					//		}
					//	});
					//}
				}
				if(this.info.auth.consent.raw === false) {
					dict.signal = [];
					dict.time = [];
				}
				dict = JSON.stringify(dict);
				this.socket.send(dict);
			} else {
				let json = JSON.stringify({msg:command,username:this.info.auth.username});
				console.log('Message sent: ', json);
				this.socket.send(json);
			}
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
		streaming=true,
		useFilters=true,
		pipeToAtlas=true,
		socket=null,
		streamParams=[],
		analysis=['eegfft'],
		auth={
			username:'guest', 
			consent:{raw:false, brains:false}
		}
	) {

		this.info = {
			deviceName:device,
			deviceType:null,
			streaming:streaming,
			streamParams:streamParams, //[['eegch','FP1','all'],['eegfft','AF7','all']]
	
			eegChannelTags:[],
			streamLoopTiming:100, //ms between update checks
			streamCt:0,

			auth:auth,
			sps: null,
			useFilters:useFilters,
			useAtlas:false,
			simulating:false
		};

		this.device = null, //Device object, can be instance of eeg32, MuseClient, etc.
		
		this.addedDeviceNames = [];
		this.addedDeviceInit = [];
		this.addedDeviceConnect = [];

		this.socket = socket;
		//console.log(this.socket);
		
		this.streamTable=[]; //tags and callbacks for streaming
		this.filters = [];   //BiquadChannelFilterer instances 
		this.atlas = null;

		this.init(device,useFilters,pipeToAtlas,analysis);
	}

	init = (device,useFilters,pipeToAtlas,analysis=[]) => {

		if(device.indexOf("freeeeg32") > -1) {
			this.info.sps = 512;
			this.info.deviceType = 'eeg';
			if(device === "freeeeg32_2") { 
				this.info.eegChannelTags = [
					{ch: 4, tag: "FP2", analyze:true},
					{ch: 24, tag: "FP1", analyze:true},
					{ch: 8, tag: "other", analyze:false}
				];
			}
			else if (device === 'freeeeg32_19') {
				this.info.eegChannelTags = [
					{ch: 4, tag: "FP2", analyze:true},
					{ch: 24, tag: "FP1", analyze:true},
					{ch: 8, tag: "other", analyze:false}
				];
			}
			else {
				this.info.eegChannelTags = [
					{ch: 4, tag: "FP2", analyze:true},
					{ch: 24, tag: "FP1", analyze:true},
					{ch: 8, tag: "other", analyze:false}
				];
			}
			this.device = new eeg32(
				(newLinesInt) => {
					this.info.eegChannelTags.forEach((o,i) => {
						let latest = this.device.getLatestData("A"+o.ch,newLinesInt);
						let latestFiltered = new Array(latest.length).fill(0);
						if(o.tag !== "other" && this.info.useFilters === true) { 
							this.filters.forEach((f,j) => {
								if(f.channel === o.ch) {
									latest.forEach((sample,k) => { 
										latestFiltered[k] = f.apply(sample); 
									});
								}
							});
							if(this.info.useAtlas === true) {
								let coord;
								if(o.tag !== null) { coord = this.atlas.getEEGDataByTag(o.tag); } 
								else { coord = this.atlas.getEEGDataByChannel(o.ch); }
								//console.log(coord)
								coord.count = this.device.data.count;
								coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
								coord.filtered.push(...latestFiltered);
								//console.log(coord);
								coord.raw.push(...latest);
							}
						}
						else {
							if(this.info.useAtlas === true) {
								let coord = this.atlas.getEEGDataByChannel(o.ch); 
								coord.count = this.device.data.count;
								coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
								//coord.raw.push(...latest);
							}
						}
					});
				},
				()=>{	
					if(this.info.useAtlas === true){
						setTimeout(() => {this.atlas.analyzer();},1200);		
						this.onconnect();
					}
				},
				()=>{
					this.ondisconnect();
				}
			);
			if(useFilters === true) {
				this.info.eegChannelTags.forEach((row,i) => {
					if(row.tag !== 'other') {
						this.filters.push(new BiquadChannelFilterer(row.ch,this.info.sps,true,this.device.uVperStep));
					}
					else { 
						this.filters.push(new BiquadChannelFilterer(row.ch,this.info.sps,false,this.device.uVperStep)); 
					}
				});
			}
		}
		else if(device === "muse") {
			this.info.sps = 256;
			this.info.deviceType = 'eeg';
			this.info.eegChannelTags = [
				{ch: 0, tag: "TP9", analyze:true},
				{ch: 1, tag: "AF7", analyze:true},
				{ch: 2, tag: "AF8", analyze:true},
				{ch: 3, tag: "TP10", analyze:true},
				{ch: 4, tag: "other", analyze: false}
			];
			this.device = new MuseClient();
		}
		else if(device === "cyton") {
			this.info.sps = 256;
			this.info.deviceType = 'eeg';
		}
		else if(device === "ganglion") {
			this.info.sps = 256;
			this.info.deviceType = 'eeg';
		}
		else if(device === "hegduino") {
			this.info.sps = 256;
			this.info.deviceType = 'heg';
		}
		else if (this.addedDeviceNames.indexOf(device) > -1) {
			let idx = this.addedDeviceNames.indexOf(device);
			if(this.addedDeviceProps[idx].eegChannelTags !== undefined)
				this.info.eegChannelTags = this.addedDeviceProps[idx].eegChannelTags;
			this.info.sps = this.addedDeviceProps[idx].sps;
			this.info.deviceType = this.addedDeviceProps[idx].deviceType;
			this.addedDeviceInit[idx]();
		}
				
		if(pipeToAtlas === true) {
			let eegConfig;
			if(device === 'muse') { eegConfig = 'muse'; }
			else if(device.indexOf('freeeeg32') > -1) {	eegConfig = '10_20'; }
			this.atlas = new dataAtlas(
				location+":"+device,
				{eegshared:{eegChannelTags:this.info.eegChannelTags, sps:this.info.sps}},
				eegConfig,true,true,
				analysis
				);
			this.info.useAtlas = true;
			this.configureDefaultStreamTable();
		} else if (pipeToAtlas !== false) {
			this.atlas = pipeToAtlas; //External atlas reference
			this.atlas.analysis.push(...analysis)
			if(device==='muse') { this.atlas.data.eeg = this.atlas.genMuseAtlas(); }
			else if(device.indexOf('freeeeg32') > -1) { this.atlas.data.eeg = this.atlas.gen10_20Atlas(); }
			
			this.info.useAtlas = true;
			this.configureDefaultStreamTable();
		}

		if(this.info.streaming === true) this.streamLoop();
	}

	async connect() {
	
		if(this.info.deviceName.indexOf("freeeeg32_2") > -1) {
			await this.device.setupSerialAsync();
		}
		else if (this.info.deviceName === "muse") {
			//connect muse and begin streaming
			await this.device.connect();
			await this.device.start();
			this.device.eegReadings.subscribe(o => {
					let time = Array(o.samples.length).fill(o.timestamp);
					time = time.map((t,i) => {return t-(1-(this.info.sps/time.length)*i)})	
					let coord = this.atlas.getEEGDataByChannel(o.electrode);
					coord.times.push(...time);
					coord.raw.push(...o.samples);
					coord.count += o.samples.length
		})
			// this.device.telemetryData.subscribe(telemetry => {
			// });
			// this.device.accelerometerData.subscribe(accel => {
			// });
		}
		else if (this.info.deviceName === "cyton" || this.info.deviceName === "ganglion") {
			//connect boards and begin streaming (See WIP cyton.js in /js/utils/hardware_compat)
		}
		else if (this.addedDeviceNames.indexOf(this.info.deviceName) > -1){
			let idx = this.addedDeviceNames.indexOf(this.info.deviceName)
			this.addedDeviceConnect[idx]();
		}
		this.info.connected = true;
		
	}

	addDeviceCompatibility = (props={deviceName:'', deviceType:'eeg', sps:0}, init = () => {}, connect = () => {}) => {
		this.addedDeviceNames.push(deviceName);
		this.addedDeviceInit.push(init);
		this.addedDeviceConnect.push(connect);
		for(const prop in props) {
			this.info[prop] = props[prop];
		}
	}

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
				if(coord !== false) { 
					if(get === 'all') {
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
				if(coord !== false) {
					if(get === 'all') {
						get = coord.fftCount-coord.lastReadFFT;
						coord.lastReadFFT = coord.fftCount;
						if(get === 0) return undefined;
					}
					let fftTimes = coord.fftTimes.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get,coord.ffts.length);
					return {times:fftTimes, ffts:ffts};
				}
			}
		}

		let getCoherenceData = (tag, nArrays='all') => {
			let get = nArrays;
			if(this.info.useAtlas === true) {
				let coord = this.atlas.getCoherenceByTag(tag);
				if(get === 'all') {
					get = coord.fftCount-coord.lastRead;
					coord.lastRead = coord.fftCount;
					if(get === 0) return undefined;
				}
				if(coord !== false) {
					let cohTimes = coord.times.slice(coord.fftTimes.length - get, coord.fftTimes.length);
					let ffts = coord.ffts.slice(coord.ffts.length - get,coord.ffts.length);
					return {times:cohTimes, ffts:ffts};
				}
			}
		}

		this.streamTable = [
			{prop:'eegch',  		callback:getEEGChData	 	},
			{prop:'eegfft', 		callback:getEEGFFTData	 	},
			{prop:'eegcoherence', 	callback:getCoherenceData	}
		];

		if(params.length > 0) {
			this.streamTable.push(...params);
		}
	} 

	configureStreamParams(props=[['prop','tag']]) { //Simply defines expected data parameters from the user for server-side reference
		let propsToSend = [];
		props.forEach((prop,i) => {
			propsToSend.push(prop[0]+"_"+prop[1]);
		});
		this.socket.send(JSON.stringify({msg:['addProps',propsToSend],username:this.info.auth.username}));
	}

	//pass array of arrays defining which datasets you want to pull from according to the available
	// functions and additional required arguments from the streamTable e.g.: [['EEG_Ch','FP1',10],['EEG_FFT','FP1',1]]
	sendDataToSocket = (params=[['prop','tag','count']],dataObj={}) => {
		let streamObj = {
			msg:'data',
			username:this.info.auth.username
		};
		Object.assign(streamObj,dataObj); //Append any extra data not defined by parameters from the stream table
		params.forEach((param,i) => {
			this.streamTable.find((option,i) => {
				if(param[0].indexOf(option.prop) > -1) {
					let args = param.slice(1);
					let result = option.callback(...args);
					if(result !== undefined) streamObj[param[0]+"_"+param[1]] = result;
					return true;
				}
			});
		});
		for(const prop in streamObj) {
			if(prop !== 'msg' && prop !== 'username') {
				//console.log(streamObj);
				this.socket.send(JSON.stringify(streamObj));
				break;
			}	
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

	disconnect = () => {
		if(this.info.deviceName.indexOf("FreeEEG") > -1) {
			this.device.disconnect();
		}
		else if (this.info.deviceName.indexOf("muse") > -1) {
			this.device.disconnect(); 
			this.ondisconnect();
		}
		this.info.connected = false;
	}

	//Generic handlers to be called by devices, you can stage further processing and UI/State handling here
	onconnect(msg="") {}

	ondisconnect(msg="") {}
}


//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------

//Class for organizing data and automating analysis protcols.
class dataAtlas {
    constructor(
		name="atlas",
		initialData={eegshared:{eegChannelTags:[{ch: 0, tag: null},{ch: 1, tag: null}],sps:512}},
		eegConfig='10_20', //'muse','big'
		useCoherence=true,
		useAnalyzer=false,
		analysis=['eegfft'] //'eegfft','eegcoherence','bcijs_bandpowers','heg_pulse'
	) {
        this.name = name;

        this.data = {
			eegshared:{
				eegChannelTags:initialData.eegshared.eegChannelTags, 
				sps:initialData.eegshared.sps, 
				frequencies:[], 
				bandFreqs:{scp:[[],[]], delta:[[],[]], theta:[[],[]], alpha1:[[],[]], alpha2:[[],[]], beta:[[],[]], lowgamma:[[],[]], highgamma:[[],[]]}},
			eeg:[],
			coherence:[],
			heg:[],
			fnirs:[],
			accelerometer:[],
			hrv:[],
			spo2:[],
			emg:[],
			ecg:[],
			eyetracker:[]
		};

		this.rolloverLimit = 30000; //Max samples allowed in arrays before rollover kicks in

        if(eegConfig === '10_20') {
            this.data.eeg = this.gen10_20Atlas();
        }
		else if (eegConfig === 'muse') {
			this.data.eeg = this.genMuseAtlas();
		}
		else if (eegConfig === 'big') {
			this.data.eeg = this.genBigAtlas();
		}
        if(useCoherence === true) {
            this.data.coherence = this.genCoherenceMap(this.data.eegshared.eegChannelTags);
			//console.log(this.data.coherence);
        }

		if(this.data.eegshared.eegChannelTags) { //add structs for non-specified channels
			this.data.eegshared.eegChannelTags.forEach((row,i) => {
				if( this.getEEGDataByTag(row.tag) === false ) {
					this.addEEGCoord(row.ch);
				}
			});
		}

		if(this.data.eegshared.sps) {
			this.data.eegshared.frequencies = this.bandpassWindow(0,this.data.eegshared.sps*0.5,this.data.eegshared.sps*0.5);
			this.data.eegshared.bandFreqs = this.getBandFreqs(this.data.eegshared.frequencies);
			//console.log(this.data.eegshared.bandFreqs)
		}
		
		this.analyzing = useAnalyzer;
		this.analysis = analysis; // ['eegfft']
		this.analyzerOpts = []; //'eegfft','eegcoherence','bcijs_bandpower','bcijs_pca','heg_pulse'
		this.analyzerFuncs = [];
		this.workerPostTime = 0;
		this.workerWaiting = false;
		this.workerIdx = 0;

		if(useAnalyzer === true) {
			this.addDefaultAnalyzerFuncs();
			if(!window.workerResponses) { window.workerResponses = []; } //placeholder till we can get webworkers working outside of the index.html
			//this.workerIdx = window.addWorker(); // add a worker for this dataAtlas analyzer instance
			window.workerResponses.push(this.workeronmessage);
			//this.analyzer();
		}
    }

    genEEGCoordinateStruct(tag,x=0,y=0,z=0){
        let bands = {scp:[],delta:[],theta:[],alpha1:[],alpha2:[],beta:[],lowgamma:[],highgamma:[]} 
        let struct = {
            tag:tag, 
            position:{x:x,y:y,z:z}, 
            count:0,
            times:[], 
            raw:[], 
            filtered:[], 
			fftCount:0,
			fftTimes:[], //Separate timing for ffts on workers
            ffts:[], 
            slices:JSON.parse(JSON.stringify(bands)), 
            means:JSON.parse(JSON.stringify(bands)),
			lastReadFFT:0, // counter value when this struct was last read from (using get functions)
			lastRead:0
		};
        return struct;
    }
    
    addEEGCoord(tag,x=999,y=999,z=999){
		this.data.eeg.push(this.genEEGCoordinateStruct(tag,x,y,z));
	}

	genMuseAtlas() { //Muse coordinates (estimated)

		let eegmap = [];

		let c = [[-21.5,70.2,-0.1],[28.4,69.1,-0.4],[-54.8,33.9,-3.5],
		[56.6,30.8,-4.1]]; //FP1, FP2, F7, F8

		function mid(arr1,arr2) { //midpoint
			let midpoint = [];
			arr1.forEach((el,i) => {
				midpoint.push(0.5*(el*arr2[i]));
			})
			return midpoint;
		}

		let tags = ['FPZ','AF7','AF8','TP9','TP10'];
		let coords = [
			[0.6,40.9,53.9],
			[mid(c[0],c[2])], //estimated
			[mid(c[1],c[3])], //estimated
			[-80.2,-31.3,-10.7], //estimated
			[81.9,-34.2,-8.2] //estimated
		];

		tags.forEach((tag,i) => {
            eegmap.push(this.genEEGCoordinateStruct(tag,coords[i][0],coords[i][1],coords[i][2]));
        });

        return eegmap;
	}

    gen10_20Atlas() { //19 channel EEG
        let eegmap = [];
        let tags = ["FP1","FP2","FPZ","F3","F4","F7","F8",
                    "CZ","C3","C4","T3","T4","T5","T6","PZ","P3","P4","O1","O2"];
        let coords=[[-21.5,70.2,-0.1],[28.4,69.1,-0.4], //MNI coordinates
                    [0.6,40.9,53.9],[-35.5,49.4,32.4],
                    [40.2,47.6,32.1],[-54.8,33.9,-3.5],
                    [56.6,30.8,-4.1],[0.8,-14.7,73.9],
                    [-52.2,-16.4,57.8],[54.1,-18.0,57.5],
                    [-70.2,-21.3,-10.7],[71.9,-25.2,-8.2],
                    [-61.5,-65.3,1.1],[59.3,-67.6,3.8],
                    [0.2,-62.1,64.5],[-39.4,-76.3,47.4],
                    [36.8,-74.9,49.2],[-26.8,-100.2,12.8],
                    [24.1,-100.5,14.1]];

        tags.forEach((tag,i) => {
            eegmap.push(this.genEEGCoordinateStruct(tag,coords[i][0],coords[i][1],coords[i][2]));
        });

        return eegmap;
    }

	genBigAtlas() {

		const eegCoordinates = {

			FP1: [-21.2, 66.9, 12.1],
			FPZ: [1.4, 65.1, 11.3],
			FP2: [24.3, 66.3, 12.5],
			AF7: [-41.7, 52.8, 11.3],
			AF3: [-32.7, 48.4, 32.8],
			AFZ: [1.8, 54.8, 37.9],
			AF4: [35.1, 50.1, 31.1],
			AF8: [43.9, 52.7, 9.3],
			F5: [-51.4, 26.7, 24.7],
			F3: [-39.7, 25.3, 44.7],
			F1: [-22.1, 26.8, 54.9],
			FZ: [0.0, 26.8, 60.6],
			F2: [23.6, 28.2, 55.6],
			F4: [41.9, 27.5, 43.9],
			F6: [52.9, 28.7, 25.2],
			F7: [-52.1, 28.6, 3.8],
			F8: [53.2, 28.4, 3.1],
			FC5: [-59.1, 3.0, 26.1],
			FC3: [-45.5, 2.4, 51.3],
			FC1: [-24.7, 0.3, 66.4],
			FCZ: [1.0, 1.0, 72.8],
			FC2: [26.1, 3.2, 66.0],
			FC4: [47.5, 4.6, 49.7,],
			FC6: [60.5, 4.9, 25.5],
			FT9: [-53.8, -2.1, -29.1],
			FT7: [-59.2, 3.4, -2.1],
			FT8: [60.2, 4.7, -2.8],
			FT10: [55.0, -3.6, -31.0],
			T7: [-65.8, -17.8, -2.9],
			T5: [-61.5, -65.3, 1.1],
			T3: [-70.2, -21.3, -10.7],
			T4: [71.9,-25.2,-8.2],
			T6: [59.3, -67.6,  3.8],
			T8: [67.4, -18.5, -3.4],
			C5: [-63.6, -18.9, 25.8],
			C3: [-49.1, -20.7, 53.2],
			C1: [-25.1, -22.5, 70.1],
			CZ: [0.8, -21.9, 77.4],
			C2: [26.7, -20.9, 69.5],
			C4: [50.3, -18.8, 53.0],
			C6: [65.2, -18.0, 26.4],
			CP5: [-61.8, -46.2, 22.5],
			CP3: [-46.9, -47.7, 49.7],
			CP1: [-24.0, -49.1, 66.1],
			CPZ: [0.7, -47.9, 72.6],
			CP2: [25.8, -47.1, 66.0],
			CP4: [49.5, -45.5, 50.7],
			CP6: [62.9, -44.6, 24.4],
			TP9: [-73.6, -46.7, -4.0], // estimated
			TP7: [-63.6, -44.7, -4.0],
			TP8: [64.6, -45.4, -3.7],		
			TP10: [74.6, -47.4, -3.7], // estimated
			P9: [-50.8, -51.3, -37.7],
			P7: [-55.9, -64.8, 0.0],
			P5: [-52.7, -67.1, 19.9],
			P3: [-41.4, -67.8, 42.4],
			P1: [-21.6, -71.3, 52.6],
			PZ: [0.7, -69.3, 56.9],
			P2: [24.4, -69.9, 53.5],
			P4: [44.2, -65.8, 42.7],
			P6: [54.4, -65.3, 20.2],
			P8: [56.4, -64.4, 0.1],
			P10: [51.0, -53.9, -36.5],
			PO7: [-44.0, -81.7, 1.6],
			PO3: [-33.3, -84.3, 26.5],
			POZ: [0.0, -87.9, 33.5],
			PO4: [35.2, -82.6, 26.1],
			PO8: [43.3, -82.0, 0.7],
			O1: [-25.8, -93.3, 7.7],
			Oz: [0.3, -97.1, 8.7],
			O2: [25.0, -95.2, 6.2]
		}

		let eegmap = [];
		for(const prop in eegCoordinates) {
			eegmap.push(this.genEEGCoordinateStruct(prop,eegCoordinates[prop][0],eegCoordinates[prop][1],eegCoordinates[prop][2]));
		}
	}

	genCoherenceStruct(tag0,tag1,coord0,coord1) {
		var freqBins = {scp: [], delta: [], theta: [], alpha1: [], alpha2: [], beta: [], lowgamma: [], highgamma: []};
		
		return {
			tag: tag0+"_"+tag1,
			x0: coord0?.x,
			y0: coord0?.y,
			z0: coord0?.z,
			x1: coord1?.x,
			y1: coord1?.y,
			z1: coord1?.z,
			fftCount: 0,
			fftTimes:[],
			ffts:[],
			slices: JSON.parse(JSON.stringify(freqBins)),
			means: JSON.parse(JSON.stringify(freqBins)),  // counter value when this struct was last read from (for using get functions)
			lastRead:0
		}
	}

    genCoherenceMap(channelTags = this.data.eegshared.eegChannelTags, taggedOnly = true) {
		var cmap = [];
		var l = 1, k = 0;
		
		for( var i = 0; i < (channelTags.length*(channelTags.length + 1)/2)-channelTags.length; i++){
			if(taggedOnly === false || (taggedOnly === true && ((channelTags[k].tag !== null && channelTags[k+l].tag !== null)&&(channelTags[k].tag !== 'other' && channelTags[k+l].tag !== 'other')&&(channelTags[k].analyze === true && channelTags[k+l].analyze === true)))) {
				var coord0 = this.getEEGDataByTag(channelTags[k].tag);
				var coord1 = this.getEEGDataByTag(channelTags[k+l].tag);

				cmap.push(this.genCoherenceStruct(channelTags[k].tag,channelTags[k+l].tag,coord0.position,coord1.position))
			}
			l++;
			if (l + k === channelTags.length) {
				k++;
				l = 1;
			}
		}
		//console.log(cmap,channelTags);
		return cmap;
	}

	genHEGStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},times:[],red:[],ir:[],ambient:[],ratio:[],lastRead:0}
	}

	addHEGCoord(tag="heg1",x,y,z) {
		this.data.heg.push(this.genHEGStruct(tag,x,y,z));
	}

	genFNIRSStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},times:[],red:[],ir:[],ir2:[],ambient:[],lastRead:0}
	}

	addFNIRSCoord(tag="banana1",x,y,z) {
		this.data.fnirs.push(this.genHEGStruct(tag,x,y,z));
	}

	genAccelerometerStruct(tag,x,y,z) {
		return {tag:tag,position:{x:x,y:y,z:z},times:[],Ax:[],Ay:[],Az:[],Gx:[],Gy:[],Gz:[],lastRead:0};
	}

	addAccelerometerCoord(tag="accel1",x,y,z){
		this.data.accelerometer.push(this.genAccelerometerStruct(tag,x,y,z));
	}

	genHRVStruct(tag){
		return {tag:tag, times:[], raw:[], filtered:[], bpm:[], hrv:[],lastRead:0}
	}

	addHRV(tag="hrv1") {
		this.data.hrv.push(genHRVStruct(tag));
	}

	//ecg,emg,eyetracker

	getEEGDataByChannel(ch=0) {
		let found = false;
		let search = this.data.eegshared.eegChannelTags.find((o,i) => {
			if(o.ch === ch) {
				if(o.tag === null || o.tag === 'other') {
					found = this.getEEGDataByTag(o.ch);
				}
				else { 
					found = this.getEEGDataByTag(o.tag);
				}
				if(found !== false) return true;
			}
		});
		return found;
	}

	getDeviceDataByTag(device='eeg',tag='FP1') { //put eegshared for device to get shared info
		var found = false;
		if(device.indexOf("shared") < 0) {
			let atlasCoord = this.data[device].find((o, i) => {
				if(o.tag === tag){
					found = o;
					return true;
				}
			});
			return found;
		}
		else {
			return this.data[device]; //return shared data structs which are laid out a little differetly
		}
	}

    //Return the object corresponding to the atlas tag
	getEEGDataByTag(tag="FP1"){
		var found = false;
		let atlasCoord = this.data.eeg.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}


    //Return the object corresponding to the atlas tag
	getCoherenceByTag(tag="FP1_FZ"){
		var found = undefined;
		let atlasCoord = this.data.coherence.find((o, i) => {
			if(o.tag === tag){
				found = o;
				return true;
			}
		});
		return found;
	}

    //Return an array of Array(3)s for each coordinate. Useful e.g. for graphics
	getCoordPositions() {
		var coords = [];
		for(var i = 0; i< this.data.eeg.length; i++) {
			coords.push([this.data.eeg[i].position.x,this.data.eeg[i].position.y,this.data.eeg[i].position.z]);
		}
		return coords;
	}

    //Get the latest data pushed to tagged channels
	getLatestFFTData() {
		let dat = [];
		this.data.eegshared.eegChannelTags.forEach((r, i) => {
			let row = this.getEEGDataByTag(r.tag);
			let lastIndex = row.fftCount - 1;
			dat.push({
                tag:row.tag,
				fftCount:row.fftCount,
				time: row.fftTimes[lastIndex],
				fft: row.ffts[lastIndex],
				slice:{delta:row.slices.delta[lastIndex], theta:row.slices.theta[lastIndex], alpha1:row.slices.alpha1[lastIndex], alpha2:row.slices.alpha2[lastIndex], beta:row.slices.beta[lastIndex], gamma:row.slices.gamma[lastIndex]},
				mean:{delta:row.means.delta[lastIndex], theta:row.means.theta[lastIndex], alpha1: row.means.alpha1[lastIndex], alpha2: row.means.alpha2[lastIndex], beta: row.means.beta[lastIndex], gamma: row.means.gamma[lastIndex]}
			});
		});
		return dat;
	}

	getLatestCoherenceData() {
		let dat = [];
		this.data.coherence.forEach((row,i) => {
			let lastIndex = row.fftCount - 1;
			dat.push({
				tag:row.tag,
				fftCount:row.fftCount,
				time: row.times[lastIndex],
				fft: row.ffts[lastIndex],
				slice:{delta:row.slices.delta[lastIndex], theta:row.slices.theta[lastIndex], alpha1:row.slices.alpha1[lastIndex], alpha2:row.slices.alpha2[lastIndex], beta:row.slices.beta[lastIndex], gamma:row.slices.gamma[lastIndex]},
				mean:{delta:row.means.delta[lastIndex], theta:row.means.theta[lastIndex], alpha1: row.means.alpha1[lastIndex], alpha2: row.means.alpha2[lastIndex], beta: row.means.beta[lastIndex], gamma: row.means.gamma[lastIndex]}
			});
		});
		return dat;
	}

    setDefaultTags() {
		return [
			{ch: 0, tag: null},{ch: 1, tag: null},{ch: 2, tag: null},{ch: 3, tag: null},
			{ch: 4, tag: null},{ch: 5, tag: null},{ch: 6, tag: null},{ch: 7, tag: null},
			{ch: 8, tag: null},{ch: 9, tag: null},{ch: 10, tag: null},{ch: 11, tag: null},
			{ch: 12, tag: null},{ch: 13, tag: null},{ch: 14, tag: null},{ch: 15, tag: null},
			{ch: 16, tag: null},{ch: 17, tag: null},{ch: 18, tag: null},{ch: 19, tag: null},
			{ch: 20, tag: null},{ch: 21, tag: null},{ch: 22, tag: null},{ch: 23, tag: null},
			{ch: 24, tag: null},{ch: 25, tag: null},{ch: 26, tag: null},{ch: 27, tag: null},
			{ch: 28, tag: null},{ch: 29, tag: null},{ch: 30, tag: null},{ch: 31, tag: null}
		];
	}

    getBandFreqs(frequencies) {//Returns an object with the frequencies and indices associated with the bandpass window (for processing the FFT results)
		var scpFreqs = [[],[]], deltaFreqs = [[],[]], thetaFreqs = [[],[]], alpha1Freqs = [[],[]], alpha2Freqs = [[],[]], betaFreqs = [[],[]], lowgammaFreqs = [[],[]], highgammaFreqs = [[],[]]; //x axis values and indices for named EEG frequency bands
		frequencies.forEach((item,idx) => {
			if((item >= 0.1) && (item <= 1)){
				scpFreqs[0].push(item); scpFreqs[1].push(idx);
			}
			else if((item >= 1) && (item <= 4)){
				deltaFreqs[0].push(item); deltaFreqs[1].push(idx);
			}
			else if((item > 4) && (item <= 8)) {
				thetaFreqs[0].push(item); thetaFreqs[1].push(idx);
			}
			else if((item > 8) && (item <= 10)){
				alpha1Freqs[0].push(item); alpha1Freqs[1].push(idx);
			}
			else if((item > 10) && (item <= 12)){
				alpha2Freqs[0].push(item); alpha2Freqs[1].push(idx);
			}
			else if((item > 12) && (item <= 35)){
				betaFreqs[0].push(item); betaFreqs[1].push(idx);
			}
			else if((item > 35) && (item <= 48)) {
				lowgammaFreqs[0].push(item); lowgammaFreqs[1].push(idx);
			}
			else if(item > 48) {
				highgammaFreqs[0].push(item); highgammaFreqs[1].push(idx);
			}
		});
		return {scp: scpFreqs, delta: deltaFreqs, theta: thetaFreqs, alpha1: alpha1Freqs, alpha2: alpha2Freqs, beta: betaFreqs, lowgamma: lowgammaFreqs, highgamma: highgammaFreqs}
	}

    mapFFTData = (fft, lastPostTime, tag) => {
		let atlasCoord = this.data.eeg.find((o, i) => {
		if(o.tag === tag){
			this.data.eeg[i].fftCount++;
			this.data.eeg[i].fftTimes.push(lastPostTime);
			this.data.eeg[i].ffts.push(fft);
			if(this.data.eegshared.bandFreqs.scp[1].length > 0){
				var scp = fft.slice( this.data.eegshared.bandFreqs.scp[1][0], this.data.eegshared.bandFreqs.scp[1][this.data.eegshared.bandFreqs.scp[1].length-1]+1);
				this.data.eeg[i].slices.scp.push(scp);
				this.data.eeg[i].means.scp.push(eegmath.mean(scp));
			}
			if(this.data.eegshared.bandFreqs.scp[1].length > 0){
				var delta = fft.slice( this.data.eegshared.bandFreqs.delta[1][0], this.data.eegshared.bandFreqs.delta[1][this.data.eegshared.bandFreqs.delta[1].length-1]+1);
				this.data.eeg[i].slices.delta.push(delta);
				this.data.eeg[i].means.delta.push(eegmath.mean(delta));
			}
			if(this.data.eegshared.bandFreqs.theta[1].length > 0){
				var theta = fft.slice( this.data.eegshared.bandFreqs.theta[1][0], this.data.eegshared.bandFreqs.theta[1][this.data.eegshared.bandFreqs.theta[1].length-1]+1);
				this.data.eeg[i].slices.theta.push(theta);
				this.data.eeg[i].means.theta.push(eegmath.mean(theta));
			}
			if(this.data.eegshared.bandFreqs.alpha1[1].length > 0){
				var alpha1 = fft.slice( this.data.eegshared.bandFreqs.alpha1[1][0], this.data.eegshared.bandFreqs.alpha1[1][this.data.eegshared.bandFreqs.alpha1[1].length-1]+1);
				this.data.eeg[i].slices.alpha1.push(alpha1);
				this.data.eeg[i].means.alpha1.push(eegmath.mean(alpha1));
			}
			if(this.data.eegshared.bandFreqs.alpha2[1].length > 0){
				var alpha2 = fft.slice( this.data.eegshared.bandFreqs.alpha2[1][0], this.data.eegshared.bandFreqs.alpha2[1][this.data.eegshared.bandFreqs.alpha2[1].length-1]+1);
				this.data.eeg[i].slices.alpha2.push(alpha2);
				this.data.eeg[i].means.alpha2.push(eegmath.mean(alpha2));
			}
			if(this.data.eegshared.bandFreqs.beta[1].length > 0){
				var beta  = fft.slice( this.data.eegshared.bandFreqs.beta[1][0],  this.data.eegshared.bandFreqs.beta[1][this.data.eegshared.bandFreqs.beta[1].length-1]+1);
				this.data.eeg[i].slices.beta.push(beta);
				this.data.eeg[i].means.beta.push(eegmath.mean(beta));
			}
			if(this.data.eegshared.bandFreqs.lowgamma[1].length > 0){
				var lowgamma = fft.slice( this.data.eegshared.bandFreqs.lowgamma[1][0], this.data.eegshared.bandFreqs.lowgamma[1][this.data.eegshared.bandFreqs.lowgamma[1].length-1]+1);
				this.data.eeg[i].slices.lowgamma.push(lowgamma);
				this.data.eeg[i].means.lowgamma.push(eegmath.mean(lowgamma));
			}
			if(this.data.eegshared.bandFreqs.highgamma[1].length > 0){
				var highgamma = fft.slice( this.data.eegshared.bandFreqs.highgamma[1][0], this.data.eegshared.bandFreqs.highgamma[1][this.data.eegshared.bandFreqs.highgamma[1].length-1]+1);
				this.data.eeg[i].slices.highgamma.push(highgamma);
				this.data.eeg[i].means.highgamma.push(eegmath.mean(highgamma));
			}
			//console.timeEnd("slicing bands");
			return true;
		}
		});
	}

    mapCoherenceData = (data, lastPostTime) => { //Expects data in correct order
	  data.forEach((row,i) => {
		  this.data.coherence[i].fftCount++;
		  this.data.coherence[i].ffts.push(row);
		  this.data.coherence[i].fftTimes.push(lastPostTime);

		if(this.data.eegshared.bandFreqs.scp[1].length > 0){
		  var scp = row.slice( this.data.eegshared.bandFreqs.scp[1][0], this.data.eegshared.bandFreqs.scp[1][this.data.eegshared.bandFreqs.scp[1].length-1]+1);
		  this.data.coherence[i].slices.scp.push(scp);
		  this.data.coherence[i].means.scp.push(eegmath.mean(scp));
		}
		if(this.data.eegshared.bandFreqs.delta[1].length > 0){
		  var delta = row.slice( this.data.eegshared.bandFreqs.delta[1][0], this.data.eegshared.bandFreqs.delta[1][this.data.eegshared.bandFreqs.delta[1].length-1]+1);
		  this.data.coherence[i].slices.delta.push(delta);
		  this.data.coherence[i].means.delta.push(eegmath.mean(delta));
		}
		if(this.data.eegshared.bandFreqs.theta[1].length > 0){
		  var theta = row.slice( this.data.eegshared.bandFreqs.theta[1][0], this.data.eegshared.bandFreqs.theta[1][this.data.eegshared.bandFreqs.theta[1].length-1]+1);
		  this.data.coherence[i].slices.theta.push(theta);
		  this.data.coherence[i].means.theta.push(eegmath.mean(theta));
		}
		if(this.data.eegshared.bandFreqs.alpha1[1].length > 0){
		  var alpha1 = row.slice( this.data.eegshared.bandFreqs.alpha1[1][0], this.data.eegshared.bandFreqs.alpha1[1][this.data.eegshared.bandFreqs.alpha1[1].length-1]+1);
		  this.data.coherence[i].slices.alpha1.push(alpha1);
		  this.data.coherence[i].means.alpha1.push(eegmath.mean(alpha1));
		}
		if(this.data.eegshared.bandFreqs.alpha2[1].length > 0){
		  var alpha2 = row.slice( this.data.eegshared.bandFreqs.alpha2[1][0], this.data.eegshared.bandFreqs.alpha2[1][this.data.eegshared.bandFreqs.alpha2[1].length-1]+1);
		  this.data.coherence[i].slices.alpha2.push(alpha2);
		  this.data.coherence[i].means.alpha2.push(eegmath.mean(alpha2));
		}
		if(this.data.eegshared.bandFreqs.beta[1].length > 0){
		  var beta = row.slice( this.data.eegshared.bandFreqs.beta[1][0],  this.data.eegshared.bandFreqs.beta[1][this.data.eegshared.bandFreqs.beta[1].length-1]+1);
		  this.data.coherence[i].slices.beta.push(beta);
		  this.data.coherence[i].means.beta.push(eegmath.mean(beta));
		}
		if(this.data.eegshared.bandFreqs.lowgamma[1].length > 0){
		  var lowgamma = row.slice( this.data.eegshared.bandFreqs.lowgamma[1][0], this.data.eegshared.bandFreqs.lowgamma[1][this.data.eegshared.bandFreqs.lowgamma[1].length-1]+1);
		  this.data.coherence[i].slices.lowgamma.push(lowgamma);
		  this.data.coherence[i].means.lowgamma.push(eegmath.mean(lowgamma));
		}
		if(this.data.eegshared.bandFreqs.highgamma[1].length > 0){
		  var highgamma = row.slice( this.data.eegshared.bandFreqs.highgamma[1][0], this.data.eegshared.bandFreqs.highgamma[1][this.data.eegshared.bandFreqs.highgamma[1].length-1]+1);
		  this.data.coherence[i].slices.highgamma.push(highgamma);
		  this.data.coherence[i].means.highgamma.push(eegmath.mean(highgamma));
		}
		});
	}
    
    //Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.
	bandpassWindow(freqStart,freqEnd,nSteps) {

		let diff = (freqEnd - freqStart)/nSteps;
		let fftwindow = [];
		let i = 0;
		while(i < freqEnd) {
			fftwindow.push(i);
			i += diff;
		}
		return fftwindow;
	}

	bufferEEGSignals = (seconds=1) => { //Buffers 1 second of all tagged eeg signals (unless null or 'other'). Data buffered in order of objects in the eeg array
		let nSamples = Math.floor(this.data.eegshared.sps * seconds);
		let buffer = [];
		let syncTime = null;
		for(var i = 0; i < this.data.eegshared.eegChannelTags.length; i++){
			if(this.data.eegshared.eegChannelTags[i].analyze === true && this.data.eegshared.eegChannelTags[i].tag !== null && this.data.eegshared.eegChannelTags[i].tag !== 'other') {
				let dat = this.getEEGDataByTag(this.data.eegshared.eegChannelTags[i].tag);
				if(dat !== undefined) {
					//console.log(dat);
					if(dat.filtered.length > 0) {buffer.push(dat.filtered.slice(dat.filtered.length-nSamples,dat.filtered.length));}
					else if (dat.raw.length > 0) {buffer.push(dat.raw.slice(dat.raw.length-nSamples,dat.raw.length));}
					if(syncTime === null) {
						syncTime = dat.times[dat.times.length-1];
					}
				}
			}
		}
		if(this.analyzing === true) { this.workerPostTime = syncTime; }
		return buffer;
	} 

	readyEEGDataForWriting = (from=0,to='end') => {
		function toISOLocal(d) {
			var z  = n =>  ('0' + n).slice(-2);
			var zz = n => ('00' + n).slice(-3);
			var off = d.getTimezoneOffset();
			var sign = off < 0? '+' : '-';
			off = Math.abs(off);
		  
			return d.getFullYear() + '-' //https://stackoverflow.com/questions/49330139/date-toisostring-but-local-time-instead-of-utc
				   + z(d.getMonth()+1) + '-' +
				   z(d.getDate()) + 'T' +
				   z(d.getHours()) + ':'  + 
				   z(d.getMinutes()) + ':' +
				   z(d.getSeconds()) + '.' +
				   zz(d.getMilliseconds()) + 
				   "(UTC" + sign + z(off/60|0) + ':00)'
		  }
		  
		let header = ["TimeStamps","UnixTime"];
		let data = [];
		let mapidx = 0;
		let datums = [];
		this.data.eegshared.eegChannelTags.forEach((row,j) => {
			datums.push(this.getEEGDataByChannel(row.ch));
		});
		
		if(to === 'end') { to = datums[0].count; }

		for(let i = from; i<to; i++){
			let line=[];
			line.push(toISOLocal(new Date(datums[0].times[i])),datums[0].times[i]);
			//first get the raw/filtered
			datums.forEach((row,j) => {
				if(row.filtered.length > 0) {
					line.push(row.filtered[i].toFixed(0));
				} else if (row.raw.length > 0) {
					line.push(row.raw[i].toFixed(0));
				}
			});
			//then get the fft/coherence data
			datums.forEach((row,j) => {
				if(row.times[i] === row.fftTimes[mapidx]) {
					if(from === 0) {
						let bpfreqs = [...this.data.eegshared.frequencies].map((x,i) => x = x.toFixed(3));
							header.push(coord.tag+"; FFT Hz:",bpfreqs.join(","));
					}
					line.push(row.ffts[mapidx]);
				}
			});
			this.data.coherence.forEach((row,i) => {
				if(from===0) {
					let bpfreqs = [...this.data.eegshared.frequencies].map((x,i) => x = x.toFixed(3));
					header.push(coord.tag+"; FFT Hz:",bpfreqs.join(","));
				}
				if(row.times[i] === row.fftTimes[mapidx]) {
					line.push(row.ffts[mapidx]);
				}
			});
			if(row.fftTimes[mapidx] === this.datum[0].times[i]){
				mapidx++;
			}
			data.push(line.join(","));
		}
		if(datums[0].filtered.length === 0 ) {
			header.push("No filters.");
		}
		else {
			header.push("Filters used (unless tagged 'other'): Notch 50Hz:"+State.data.notch50+"; Notch 60Hz:"+State.data.notch60+" SMA(4):"+State.data.sma4+"; Low pass 50Hz:"+State.data.lowpass50+"; Bandpass ("+State.data.filterers[0].bplower+"Hz-"+State.data.filterers[0].bpupper+"Hz):"+State.data.bandpass)
		}
		//console.log(data)
		return [header.join(",")+"\n",data.join("\n")];
	}

	regenAtlasses(freqStart,freqEnd,sps=512) {
		this.data.eeg = this.makeAtlas10_20(); //reset atlas

		let bandPassWindow = this.bandPassWindow(freqStart,freqEnd,sps);

		this.data.eegshared.frequencies = bandPassWindow;//Push the x-axis values for each frame captured as they may change - should make this lighter
		this.data.eegshared.bandFreqs = this.getBandFreqs(bandPassWindow); //Update bands accessed by the atlas for averaging

		this.coherenceMap = this.genCoherenceMap();
	}
	
	updateFrequencies = (freqStart, freqEnd) => {
		var freq0 = freqStart; var freq1 = freqEnd;
		if (freq0 > freq1) {
			freq0 = 0;
		}
		if(freq1 > EEG.sps*0.5){
			freq1 = EEG.sps*0.5;
			State.data.freqEnd=freq1;
		}
	
		ATLAS.regenAtlasses(State.data.freqStart,State.data.freqEnd,EEG.sps);
	}

	workeronmessage = (msg) => {
		//console.log(msg);
		if(msg.origin === this.name) {
			if(msg.foo === "multidftbandpass" || msg.foo === "multidft") { 
				//parse data into atlas
				var ffts = [...msg.output[1]];
				let fftIdx = 0;
				this.data.eegshared.eegChannelTags.forEach((row,i) => {
					if(row.tag !== null && row.tag !== 'other' && row.analyze === true) {
						this.mapFFTData(ffts[fftIdx],this.workerPostTime,row.tag);
						fftIdx++;
						//console.log(this.data.eeg[i]);
					}
				});
			}
			else if(msg.foo === "coherence"){ 
				var ffts = [...msg.output[1]];
				var coher = [...msg.output[2]];
				let fftIdx = 0;
				this.data.eegshared.eegChannelTags.forEach((row,i) => {
					if(row.tag !== null && row.tag !== 'other' && row.analyze === true) {
						this.mapFFTData(ffts[fftIdx],this.workerPostTime,row.tag);
						fftIdx++;
						//console.log(this.data.eeg[i]);
					}
					
				});
				//coherence
				this.mapCoherenceData(coher,this.workerPostTime);
			}
			this.workerWaiting = false;
		}
	}

	addDefaultAnalyzerFuncs() {
		this.analyzerOpts.push('eegfft','eegcoherence');
		let fftFunc = () => {
			if(this.workerWaiting === false){
				let buf = this.bufferEEGSignals(1);
				window.postToWorker({foo:'multidftbandpass', input:[buf, 1, 0, this.data.eegshared.sps*0.5, 1], origin:this.name}, this.workerIdx);
				//window.postToWorker({foo:'gpucoh', input:[buf, 1, 0, this.data.eegshared.sps*0.5, 1], origin:this.name},this.workerIdx);
				this.workerWaiting = true;
			}
		}
		let coherenceFunc = () => {
			if(this.workerWaiting === false){
				let buf = this.bufferEEGSignals(1);
				window.postToWorker({foo:'coherence', input:[buf, 1, 0, this.data.eegshared.sps*0.5, 1], origin:this.name}, this.workerIdx);
				this.workerWaiting = true;
			}
		}	
		//add other worker functions (see eegworker.js)

		this.analyzerFuncs.push(fftFunc,coherenceFunc);
		//'bcijs_bandpowers','bcijs_pca','heg_pulse'
	}

	addAnalyzerFunc(name='',foo=()=>{}) {
		let n = this.analyzerOpts.find((name,i) => {
			if(name === name) {
				this.analyzerFuncs[i] = foo;
				return true;
			}
		});
		if(n === undefined) {
			this.analyzerOpts.push(name);
			this.analyzerFuncs.push(foo);
		}
	}

	addAnalysisMode(name='') { //eegfft,eegcoherence,bcijs_bandpower,bcijs_pca,heg_pulse
		let found = this.analysis.find((str,i) => {
			if(name === str) {
				return true;
			}
		});
		if(found === undefined) {
			this.analysis.push(name);
		}
	}

	checkRollover(dataArr=null) { //'eeg','heg', etc
		if(dataArr === null) {
			for(const prop in this.data) {
				if(Array.isArray(this.data[prop])) {
					this.data[prop].forEach((row,i) => {
						for(const p in row) {
							if((!Array.isArray(row[p])) && typeof row[p] === 'object') {
								for(const pz in row[p]) {
									if(Array.isArray(row[p][pz])) {
										if(row[p][pz].length > this.rolloverLimit) {row[p][pz].splice(0,this.row[p][pz].length-this.rolloverLimit);}
									}
								}
							}
							else if(Array.isArray(row[p])) {
								if(row[p].length > this.rolloverLimit) {row[p].splice(0,this.row[p].length-this.rolloverLimit);}
							}
						}
					});
				}
			}
		}
		else { //spaghetti
			if(Array.isArray(this.data[dataArr])) {
				this.data[dataArr].forEach((row,i) => {
					for(const p in row) {
						if((!Array.isArray(row[p])) && typeof row[p] === 'object') { //nested object with arrays
							for(const pz in row[p]) {
								if(Array.isArray(row[p][pz])) {
									if(row[p][pz].length > this.rolloverLimit) {row[p][pz].splice(0,this.row[p][pz].length-this.rolloverLimit);}
								}
							}
						}
						else if(Array.isArray(row[p])) { //arrays
							if(row[p].length > this.rolloverLimit) {row[p].splice(0,this.row[p].length-this.rolloverLimit);}
						}
					}
				});
			}
		}
	}

	analyzer = () => { //Make this stop when streaming stops
		//fft,coherence,bcijs_bandpowers,bcijs_pca,heg_pulse

		this.analysis.forEach((run,i) => {
			this.analyzerOpts.forEach((opt,j) => {
				if(opt === run) {
					this.analyzerFuncs[j]();
				}
			});
		});
			
		setTimeout(()=>{requestAnimationFrame(this.analyzer)},50);
	}
}
