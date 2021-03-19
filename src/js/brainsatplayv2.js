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
import {Biquad, makeNotchFilter, makeBandpassFilter, DCBlocker} from './bciutils/signal_analysis/BiquadFilters'
import {MuseClient} from 'muse-js'
import {StateManager} from './frontend/utils/StateManager'


export class brainsatplay {
	constructor(
		username='',
		password='',
		access='public',
		appname='',
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
				consent:{raw:false, brains:false},
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
		streaming=false,
		streamParams=[['EEG_Ch','FP1','all']], //Device properties to stream
		useFilters=true, //Filter device output if it needs filtering (some hardware already applies filters so we may skip those)
		pipeToAtlas=true,
		
		) {
			if(streaming === true) {
				console.log(this.socket)
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

			//Device info accessible from state
			this.state.addToState("device"+this.devices.length,this.devices[this.devices.length-1].info);
			
			this.devices[this.devices.length-1].connect();
			this.info.nDevices++;
	}
	
	//disconnect local device
	disconnect(deviceIdx=this.devices[this.devices.length-1]) {
		this.devices[deviceIdx].disconnect();
	}

	//listen for changes to atlas data properties
	subscribe = (deviceName='freeeeg32_2',tag='FP1',prop=null,onData=()=>{}) => {
		let sub = undefined;
		let atlasTag = tag;
		let atlasDataProp = null; //Atlas has an object of named properties based on device or if there is shared data
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
				if (o.name === deviceName && o.useAtlas === true) {
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

	//Server login and socket initialization
	async login(dict=this.info.auth, baseURL=this.info.auth.url.toString()) {
		//Connect to websocket
		if (this.socket == null  || this.socket.readyState !== 1){
			this.socket = this.setupWebSocket(dict);
			this.info.auth.authenticated = true;
			this.subscribed=true;
			this.info.nDevices++;
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
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'getUsersResult') {		
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'getGameDataResult') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'getGameInfoResult') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'subscribedToUser') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'userNotFound') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'subscribedToGame') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'leftGame') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'gameDeleted') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'unsubscribed') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'gameNotFound') {
			this.state.commandResult = parsed;
		}
		else if (parsed.msg === 'pong') {
			console.log(parsed.msg);
		}
		else {
			console.log(parsed.msg);
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
            socket.send(JSON.stringify({msg:['ping'],username:this.info.auth.username}));
        };

        socket.onmessage = (msg) => {
			this.processSocketMessage(msg.data);
        }

        socket.onclose = (msg) => {
            console.log('close');
        }

		return socket;
	}

	subscribeToUser(username='',userProps=[],onsuccess=()=>{}) { // if successful, props will be available in state under this.state.data['username_prop']
		//check if user is subscribable
		this.socket.send(JSON.stringify([this.info.auth.username,'getUsers',username]));
		userProps.forEach((prop) => {
			this.state[username+"_"+prop] = null; //dummy values so you can attach listeners to expected outputs
		});
		//wait for result, if user found then add the user
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(newResult.msg === 'getUsersResult') {
				if(newResult.userData[0] === username) {
					this.socket.send(JSON.stringify([this.info.auth.username,'subscribeToUser',username,userProps])); //resulting data will be available in state
				}
				onsuccess();
				this.state.unsubscribe('commandResult',sub);
			}
			else if (newResult.msg === 'userNotFound' && newResult.userData[0] === username) {
				this.state.unsubscribe('commandResult',sub);
				console.log("User not found: ", username);
			}
		});
	}

	subscribeToGame(appname='',spectating=false,onsuccess=()=>{}) {
		this.socket.send(JSON.stringify([this.info.auth.username,'getGameInfo',appname]));
		//wait for response, check result, if game is found and correct props are available, then add the stream props locally necessary for game
		let sub = this.state.subscribe('commandResult',(newResult) => {
			if(newResult.msg === 'getGameInfoResult' && newResult.appname === 'appname') {
				
				if(spectating === false) {
					//check that this user has the correct streaming configuration with the correct connected device
					this.configureStreamForGame(appname,newResult.gameData.propnames); //Expected propnames like ['EEG_Ch_FP1','EEG_FFT_FP2']
				}

				this.socket.send(JSON.stringify([this.info.auth.username,'subscribeToGame',appname,spectating]));
				newResult.gameData.usernames.forEach((user) => {
					newResult.gameData.propnames.forEach((prop) => {
						this.state[appname+"_"+user+"_"+prop] = null;
					});
				});
				onsuccess();
				this.state.unsubscribe('commandResult',sub);
			}
			else if (newResult.msg === 'gameNotFound' & newResult.appname === appname) {
				this.state.unsubscribe('commandResult',sub);
				console.log("Game not found: ", appname);
			}
		});
	}

	unsubscribeFromUser(username='',userProps=null,onsuccess=()=>{}) { //unsubscribe from user entirely or just from specific props
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
				onsuccess();
				this.state.unsubscribe('commandResult',sub);
			}
		});
	}

	unsubscribeFromGame(appname='',onsuccess=()=>{}) {
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
				onsuccess();
				this.state.unsubscribe('commandResult',sub);
			}
		});
	}

	configureStreamForGame(appname='',streamParams=[]) { //Set local device stream parameters based on what the game wants
		
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
				this.socket.send(JSON.stringify({msg:command,username:this.info.auth.username}));
			}
		}
	}

	closeSocket() {
		this.socket.close();
	}

	getUsersOld(dict={ 
		destination:'initializeBrains',
		appname:'',
		msg:'',
		nBrains:0,
		privateBrains:0,
		privateInfo:'',
		ninterfaces:0,
		ids:[],
		channelNames:[]
	}) {
		this.socket.send(JSON.stringify(dict));
	}

	onNewConnectionOld(response){ //If a user is added to the server
		this.info.connections.push({
			username:response.id,
			access:response.access,
			channelNames:response.channelNames,
			destination:response.destination
		});
		this.info.nDevices++;
	}

	onConnectionLost(response){ //If a user is removed from the server
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


class biquadChannelFilterer {
    constructor(channel="A0",sps=512, filtering=true, scalingFactor=1) {
        this.channel=channel; this.idx = 0; this.sps = sps;
        this.filtering=filtering;
        this.bplower = 3; this.bpupper = 45;
		this.scalingFactor = scalingFactor;

		this.useSMA4 = false; this.last4=[];
		this.useNotch50 = true; this.useNotch60 = true;
		this.useLp1 = false; this.useBp1 = false;
		this.useDCB = true; this.useScaling = false;

        this.notch50 = [
                    makeNotchFilter(50,sps,1)
                ];
        this.notch60 = [
                    makeNotchFilter(60,sps,1)
                ];
        this.lp1 = [
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps)
                ];
        this.bp1 = [
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75)
                ];
        this.dcb = new DCBlocker(0.995);
    }

    reset(sps=this.sps) {
        this.notch50 = makeNotchFilter(50,sps,1);
        this.notch60 = makeNotchFilter(60,sps,1);
        this.lp1 = [
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps),
                    new Biquad('lowpass', 50, sps)
                ];
		this.bp1 = [
					makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
					makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
					makeBandpassFilter(this.bplower,this.bpupper,sps,9.75),
					makeBandpassFilter(this.bplower,this.bpupper,sps,9.75)
				];
        this.dcb = new DCBlocker(0.995);
    }

    setBandpass(bplower=this.bplower,bpupper=this.bpupper,sps=this.sps) {
        this.bplower=bplower; this.bpupper = bpupper;
        this.bp1 = [
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps)
        ];
    }

    apply(latestData=0, idx=this.lastidx+1) {
        let out=latestData; 
        if(this.filtering === true) {
			if(this.useDCB === true) { //Apply a DC blocking filter
                out = this.dcb.applyFilter(out);
            }
            if(this.useSMA4 === true) { // 4 sample simple moving average (i.e. low pass)
                if(idx < 4) {
					this.last4.push(out);
				}
				else {
					out = this.last4.reduce((accumulator, currentValue) => accumulator + currentValue)/this.last4.length;
					this.last4.shift();
					this.last4.push(out);
				}
            }
            if(this.useNotch50 === true) { //Apply a 50hz notch filter
                this.notch50.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(this.useNotch60 === true) { //Apply a 60hz notch filter
                this.notch60.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            } 
            if(this.useLp1 === true) { //Apply 4 50Hz lowpass filters
                this.lp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(this.useBp1 === true) { //Apply 4 Bandpass filters
                this.bp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
				out *= this.bp1.length;
            }
            if(this.useScaling === true){
                out *= this.scalingFactor;
            }
        }
        this.lastidx=idx;
        //console.log(this.channel, out)
        return out;
    }
}


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
			deviceName : device,

			streaming : streaming,
			streamParams : streamParams, //[['EEG_Ch','FP1','all'],['EEG_FFT','AF7','all']]
	
			eegChannelTags : [],
			streamLoopTiming : 100, //ms between update checks
	
			auth : auth,
			sps : null,
			useFilters : useFilters,
			useAtlas : false,
			simulating = false,
		};

		this.device = null, //Device object, can be instance of eeg32, MuseClient, etc.
		
		this.socket = socket;
		
		this.streamTable=[]; //tags and callbacks for streaming
		this.filters = [];   //biquadChannelFilterers 
		this.atlas = null;

		this.init(device,useFilters,pipeToAtlas,analysis);
	}

	init = (device,useFilters,pipeToAtlas,analysis=[]) => {


		if(device.indexOf("freeeeg32") > -1) {
			this.info.sps = 512;
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
								if(f.channel === "A"+o.ch) {
									latest.forEach((sample,k) => { 
										latestFiltered[k] = f.apply(sample); 
									});
								}
							});
							if(this.info.useAtlas === true) {
								let coord;
								if(o.tag !== null) { coord = this.atlas.getEEGDataByTag(o.tag); } 
								else { coord = this.atlas.getEEGDataByChannel(o.ch); }
								coord.count = this.device.data.count;
								coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
								coord.filtered.push(...latestFiltered);
								//console.log(coord);
								coord.raw.push(...latest);
								//console.log(coord);
							}
						}
						else {
							if(this.useAtlas === true) {
								let coord = this.atlas.getEEGDataByChannel(o.ch); 
								coord.count = this.device.data.count;
								coord.times.push(...this.device.data.ms.slice(this.device.data.count-newLinesInt,this.device.data.count));
								//coord.raw.push(...latest);
							}
						}
					});
					//this.onMessage(newLinesInt);
				},
				()=>{	
					if(this.useAtlas){
						setTimeout(() => {this.atlas.analyzer();},1200);
					}
				},
				()=>{
				}
			);
			if(useFilters === true) {
				this.eegChannelTags.forEach((row,i) => {
					if(row.tag !== 'other') {
						this.filters.push(new biquadChannelFilterer("A"+row.ch,this.info.sps,true,this.device.uVperStep));
					}
					else { 
						this.filters.push(new biquadChannelFilterer("A"+row.ch,this.info.sps,false,this.device.uVperStep)); 
					}
				});
			}
		}
		else if(device === "muse") {
			this.info.sps = 256;
			this.info.eegChannelTags = [
				{ch: 0, tag: "T9", analyze:true},
				{ch: 1, tag: "AF7", analyze:true},
				{ch: 2, tag: "AF8", analyze:true},
				{ch: 3, tag: "T10", analyze:true},
				{ch: 4, tag: "other", analyze: false}
			];
			this.device = new MuseClient();
		}
		else if(device === "cyton") {

		}
		else if(device === "ganglion") {

		}
		else if(device === "hegduino") {

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
			this.useAtlas = true;
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
	
		if(this.info.deviceName === "freeeeg32_2" || this.info.deviceName === "freeeeg32_19") {
			await this.device.setupSerialAsync();
		}
		else if (this.info.deviceName === "muse") {
			//connect muse and begin streaming
			await this.device.connect();
			await this.device.start();
			this.device.eegReadings.subscribe(reading => {

			});
			this.device.telemetryData.subscribe(telemetry => {

			});
			this.device.accelerometerData.subscribe(accel => {

			});
		}
		else if (this.info.deviceName === "cyton" || this.info.deviceName === "ganglion") {
			//connect boards and begin streaming (See WIP cyton.js in /js/utils/hardware_compat)
		}
		this.info.connected = true;
		this.onConnect();
		
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
					return {fftTimes:fftTimes, ffts:ffts};
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
					return {cohTimes:cohTimes, ffts:ffts};
				}
			}
		}

		this.streamTable = [
			{prop:'EEG_Ch',  callback:getEEGChData},
			{prop:'EEG_FFT', callback:getEEGFFTData},
			{prop:'EEG_Coh', callback:getCoherenceData}
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
	sendDataToSocket(params=[['prop','tag','count']],dataObj={}) {
		let streamObj = {
			msg:'data',
			username:this.info.auth.username
		};
		Object.assign(streamObj,dataObj); //Append any extra data not defined by parameters from the stream table
		params.forEach((param,i) => {
			this.streamTable.find((option,i) => {
				if(param[0].indexOf(option.prop) > -1) {
					let args = [...param].shift();
					let result = option.callback(...args);
					if(result !== undefined) streamObj[param.prop+"_"+tag] = result;
					return true;
				}
			});
		});
		
		this.socket.send(JSON.stringify(streamObj));
	}

	//old method
	sendDataToServerOld(times=[],signals=[],electrodes='',fields='') {
		this.socket.send(JSON.stringify({
			destination:'bci',
			id:this.info.auth.username,
			consent:this.info.auth.consent,
			time:times,
			signal:signals,
			electrode:electrodes,
			field:fields
		}));
	}

	streamLoop(prev={}) {
		let params = [];
		if(this.info.streamParams.length === 0) { console.error('No stream parameters set'); return false;}
		this.info.streamParams.forEach(([param],i) => {
			let c = this.streamTable.find((o,i) => {
				let newParam = [...param];
				if(o.prop === param[0]) {
					params.push(newParam);
					return true;
				}
			});
		});
		if(params.length > 0) { this.sendDataToSocket(params); }

		setTimeout(() => {this.streamLoop();}, this.info.streamLoopTiming);
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

	disconnect() {
		if(this.info.deviceName.indexOf("FreeEEG") > -1) {
			this.device.disconnect();
		}
		else if (this.info.deviceName.indexOf("muse") > -1) {
			this.device.disconnect(); 
		}
		this.info.connected = false;
		this.onDisconnect();
	}

	//Generic handlers to be called by devices, you can stage further processing and UI/State handling here
	onMessage(msg="") {
	}

	onConnect(msg="") {}

	onDisconnect(msg="") {}
}


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
			console.log(this.data.eegshared.bandFreqs)
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
			window.workerResponses.push(this.workerOnMessage);
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
			midpoint = [];
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
			O2: [25.0, -95.2, 6.2],
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
			if(taggedOnly === false || (taggedOnly === true && ((channelTags[k].tag !== null && channelTags[k+l].tag !== null)&&(channelTags[k].tag !== 'other' && channelTags[k+l].tag !== 'other')&&(channelTags[k].analyze !== true && channelTags[k+l].analyze !== true)))) {
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

	workerOnMessage = (msg) => {
		console.log(msg);
		if(msg.origin === this.name) {
			if(msg.foo === "multidftbandpass" || msg.foo === "multidft") { 
				//parse data into atlas
				var ffts = [...msg.output[1]];
				let fftIdx = 0;
				this.data.eegshared.eegChannelTags.forEach((row,i) => {
					if(row.tag !== null && row.tag !== 'other' && row.analyze === true) {
						this.mapFFTData(ffts[fftIdx],this.workerPostTime,row.tag);
						fftIdx++;
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
					}
					console.log(this.data.eeg[i]);
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
