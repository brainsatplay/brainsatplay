import muse from "muse-js";
import bci from "bcijs";
import {eeg32} from './hardware/eeg32.mjs';
import {eegCoordinates} from './data/coordinates.mjs'; 
import {Biquad} from './processing/biquad.mjs';

/** @module brainsatplay */

export {Game}
 
/**
 * @class module:brainsatplay.Game
 * @description Manage game data.
 */
class Game {
    constructor(name) 
    {
        this.initialize()
        // this.settings = settings;
        this.name = name // this.settings.name;

        this.callbacks = {}

        this.bluetooth = {
            devices: {
                'muse': new muse.MuseClient()
            },
            device: false,
            connected: false,
            channelNames: [],
        }

        this.info = {
            interfaces: 0,
            brains: 0,
            access: 'public',
            simulated: 0,
        }
        // this.simulate(this.settings.players.teams.names.length*this.settings.players.teams.size)
    }

     /**
     * @method module:brainsatplay.Game.initialize
     * @description Initialize the game.
     */

    initialize(ignoreMe=false) {

        // if (!ignoreMe || this.brains === undefined){
            this.brains = {
                public: new Map(),
                private: new Map()
            }         
        // } else {
        //     let usernames = this.getUsernames()
        //     let accessLevels = ['public','private']
        //     accessLevels.forEach(access => {
        //         if (access === this.info.access){
        //             usernames.forEach(username => {
        //         if (username !== this.me.username){
        //             this.brains[this.info.access].delete(username)
        //         }
        //         })
        //         } else {
        //             this.brains[access] = new Map();
        //         }
        //     })
        // }

        this.eegCoordinates = eegCoordinates

        this.usedChannels = []
        this.commonChannels = []
        this.usedChannelNames = []
        this.commonChannelNames = [];
        this.connectionMessageBuffer = [];

        if (this.connection === undefined || !(this.connection.status)) {
            this.connection = {}
            this.connection.ws = undefined
            this.connection.status = false
        } 
        if (!ignoreMe || this.me === undefined){
            this.me = {
                username: 'me',
                index: undefined,
                consent: {raw: false, game:false}
            };
        }

        this.metrics = {
            synchrony: {
                value: 0,
                channels: Array(Object.keys(this.eegCoordinates).length).fill(0),
            }
        }

        this.data = {}

        this.initializeSession()
        this.setUpdateMessage()
    }

    /**
     * @method module:brainsatplay.Game.newGame
     * @description Switch to a new game.
     * @param name {string} Name of the new game.
     * @param settings {dict} The settings of the game.
     */

    newGame(name,){//settings={}){
      this.initialize()
      this.name = name;
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.setUpdateMessage
     * @description Log update messages from an active Websocket connection.
     */
    setUpdateMessage(obj) {
        if (obj === undefined) {
            this.connectionMessageBuffer = [{destination: []}];
        } else {
            if (this.connectionMessageBuffer[0].destination === undefined || this.connectionMessageBuffer[0].destination.length === 0) {
                this.connectionMessageBuffer = [obj]
            } else {
                this.connectionMessageBuffer.push(obj)

            }
        }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.getMyIndex
     * @description Update the current index of your username in the Game class.
     */
    getMyIndex() {
        let user = 0;
        let gotMe = false;

        this.brains[this.info.access].forEach((_, key) => {
            if (key === this.me.username) {
                this.me.index = user;
                gotMe = true;
            }
            user++
        })

        if (!gotMe) {
            this.me.index = undefined;
        }
    }

    /**
     * @method module:brainsatplay.Game.getUsernames
     * @description Returns all usernames in the current game.
     */
    getUsernames(){
        return Array.from( this.brains[this.info.access].keys())
    }

    /**
     * @method module:brainsatplay.Game.simulate
     * @description Simulate brains for your game.
     */

    simulate(count, amplitudes,frequencies) {

        if (amplitudes === undefined){
            amplitudes = Array.from({length: count}, e => e = undefined)
        }

        if (frequencies === undefined){
            frequencies = Array.from({length: count}, e => e = undefined)
        }

        if (!this.bluetooth.connected){
            this.add('me',undefined, undefined,{
                on: true,
                duration: .24, // s
                t: Date.now(),
                frequencies: frequencies[0],
                amplitudes: amplitudes[0]
            }) 
        }
        for (let i = 0; i < count-1; i++) {
            this.add('other' + (i+1), undefined, undefined,{
                on: true,
                duration: .24, // s
                t: Date.now(),
                frequencies: frequencies[i],
                amplitudes: amplitudes[i]
            });
        }
        this.info.simulated = count;
        this.getMyIndex()
        this.updateUsedChannels()
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.add
     * @description Add a brain to your game.
     */
    add(id, channelNames, samplerate, simulationParams, access = 'public') {
        let brain = new Brain(id,channelNames,samplerate,simulationParams)
        this.brains[access].set(id, brain)
        this.info.brains = this.brains[access].size

        if (access === this.info.access) {
            this.getMyIndex()
            this.updateUsedChannels()
        }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.remove
     * @description Remove brains from your game.
     */

    remove(id, access = 'public') {
        this.brains[access].delete(id)
        this.info.brains = this.brains[access].size
        this.getMyIndex()
        this.updateUsedChannels()
    }

    /**
     * @method module:brainsatplay.Game.update
     * @description Update the game by (1) generating synthetic voltage streams, (2) broadcasting your data to other clients, (3) updating the Websocket connetion status, (4) logging any update messages from the Websocket connection, and (5) updating the Session object for any ongoing experiments. Include in the animation loop of your front-end code.
     */
    update() {
        // Generate synthetic data if specified
        this.brains[this.info.access].forEach((user) => {
            if (user.simulation.on){
                if ((Date.now() - user.simulation.t) > user.simulation.duration*1000) {
                    user.generateVoltageStream()
                    user.simulation.t = Date.now()
                }
            }
        })

        // FreeEEG Update
        if (this.bluetooth.device === 'freeEEG32'){
            let me = this.brains[this.info.access].get(this.me.username)
            if (me !== undefined) {
                let data = new Array(this.bluetooth.adcNames.length)
                Object.keys(this.bluetooth.adcMap).forEach((name,ind) => {
                    if (this.bluetooth.adcNames.includes(name)){
                        data[ind] = this.bluetooth.devices['freeEEG32'].data[name]
                    }
                })
                if ((this.connection.status)) {
                    if (!this.me.consent.raw){
                        this.send('bci',{signal:data,time:[]})

                    } else {
                        this.send('bci',{signal:[],time:[]})
                    }
                } else {
                    if (this.brains[this.info.access].get(this.me.username)){
                    this.brains[this.info.access].get(this.me.username).loadData({signal:data,time:[],consent:{raw:true,game:true}})
                    }
                }
            }
        }

        // // Update Data
        // let me = this.brains[this.info.access].get(this.me.username)
        // if (me !== undefined){
        //     for (const [key, callback] of Object.entries(this.settings.data.local.player.game)) {
        //         me.data[key] = callback()
        //     }
        // }

        // Broadcast Data
        this.send('bci',{signal:[],time:[]})


        // Update Websocket Status
        if (this.connection.ws !== undefined){
            this.connection.status = this.connection.ws.readyState === 1
        }

        this.setUpdateMessage()
        this.updateSession()
    }

    /**
     * @method module:brainsatplay.Game.getBrain
     * @description Returns the specified brain.
     * @param username {string} The user to return the brain of.
     */
    getBrain(username) {
        return this.brains[this.info.access].get(username)
    }

    /**
     * @method module:brainsatplay.Game.getVoltage
     * @description Return the voltage buffer for the specified user.
     * @param username {string} The user to return voltage data from.
     * @param normalize {boolean} Normalize voltage data between 0 and 1.
     */
    getVoltage(username,normalize,filter) {
        if (this.brains[this.info.access].has(username)){
            return this.brains[this.info.access].get(username).getVoltage(normalize,filter)              
        } else {
            return this.brains[this.info.access].get(this.me.username).getVoltage(normalize,filter)              
        }
    }

    /**
     * @method module:brainsatplay.Game.createBuffer
     * @description Return a blank buffer array.
     * @param allChannels {boolean} Return a buffer array of length (true) eegCoordinates or (false) usedChannels.
     * @param bufferSize {integer} The length of each buffer in the buffer array.
     */
    createBuffer(allChannels = true, bufferSize) {
        if (allChannels){
            return Array.from(Object.keys(this.eegCoordinates), e => {if (this.usedChannelNames.includes(e)){
                return Array(bufferSize).fill(0)
            } else {
                return [NaN]
            }})
        } else {
            return Array.from({length:this.usedChannelNames.length}, e => {return Array(bufferSize).fill(0)})
        }
    }

    /**
     * @async
     * @method module:brainsatplay.Game.getMetric
     * @description Returns the specified metric for the specified username.
     * @param metricName {string} Choose between 'synchrony','power', 'delta', 'theta', 'alpha', 'beta', 'gamma'
     * @param username {string} [username=this.me.username] The user to return voltage data from.
     */

    async getMetric(metricName,username,relative,filter) {
        // if ((this.connection === undefined) || (location === 'local')){
            if (metricName !== undefined){
        if (metricName === 'synchrony') {
            let dict = {}
            dict.channels = this.synchrony('pcc')
            let valuesOfInterest = [];
            this.usedChannels.forEach((channelInfo) => {
                valuesOfInterest.push(dict.channels[channelInfo.index])
            })
            let avg = valuesOfInterest.reduce((a, b) => a + b, 0) / valuesOfInterest.length;
            if (!isNaN(avg)) {
                dict.average = avg;
            } else {
                dict.average = 0;
            }
            return dict
        } else {
            if (this.brains[this.info.access].has(username)){
                return this.brains[this.info.access].get(username).getMetric(metricName,relative,filter)              
            } else {
                if (this.brains[this.info.access].has(this.me.username)){
                    return this.brains[this.info.access].get(this.me.username).getMetric(metricName,relative,filter);      
                } else {
                    return Array.from(Object.keys(this.eegCoordinates), e => [NaN])
                }    
            }
        } 
    } else {
        return {channels: Array.from({length: Object.keys(this.eegCoordinates).length}, e => NaN), average: NaN}
    }
    // } else {
    //     if (this.connection === undefined){
    //         val = 0
    //     } else {
    //         val = await this.request({game:this.name},'POST',metricName)
    //     }
    // }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.updateUsedChannels
     * @description Updates the used channels in the game.
     */

    updateUsedChannels() {
        this.usedChannels = [];
        this.usedChannelNames = [];
        this.commonChannels = [];
        this.commonChannelNames = [];

        // Extract All Used EEG Channels
        this.brains[this.info.access].forEach((user) => {
            user.usedChannels.forEach((channelData) => {
            let name = channelData.name
            if (channelData.index !== -1 && this.usedChannelNames.indexOf(name) === -1) {
                this.usedChannels.push({name: name, index: channelData.index})
                this.usedChannelNames.push(name)
            } else if (this.usedChannelNames.indexOf(name) !== -1 && this.commonChannelNames.indexOf(name) === -1){
                this.commonChannels.push({name: name, index: channelData.index})
                this.commonChannelNames.push(name)
            }
        })
    })
    }

    /**
     * @method module:brainsatplay.Game.synchrony
     * @description Returns the similarity of the brains. When your brain is in the game (i.e. this.me.username !== undefined), then synchrony is relative to you.
     */

    synchrony(method = "pcc") {
        let channelSynchrony = Array.from({length: Object.keys(this.eegCoordinates).length}, e => Array());
        if (this.brains[this.info.access].size > 1) {
            let edgesArray = [];
            let usernames = this.getUsernames()
            if (this.me.index && usernames.includes(this.me.username)) {
                usernames.splice(usernames.indexOf(this.me.username),1)
                usernames.forEach((username) => {
                    edgesArray.push([this.me.username, username])
                })
            } else {
                let pairwise = (list) => {
                    if (list.length < 2) {
                        return [];
                    }
                    var first = list[0],
                        rest = list.slice(1),
                        pairs = rest.map(function (x) {
                            return [first, x];
                        });
                    return pairs.concat(pairwise(rest));
                }
                edgesArray = pairwise(usernames)
            }

            if (method === 'pcc') {
                // Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/

                edgesArray.forEach((edge) => {
                    let xC = this.brains[this.info.access].get(edge[0]).getVoltage();
                    let yC = this.brains[this.info.access].get(edge[1]).getVoltage();
                    
                    this.usedChannelNames.forEach((_,ind) => {
                        let channel = this.usedChannels[ind].index
                        let x = xC[channel]
                        let y = yC[channel]

                        var shortestArrayLength = 0;

                        if (x.length === y.length) {
                            shortestArrayLength = x.length;
                        } else if (x.length > y.length) {
                            shortestArrayLength = y.length;
                            // console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
                        } else {
                            shortestArrayLength = x.length;
                            // console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
                        }
                        var xy = [];
                        var x2 = [];
                        var y2 = [];

                        for (var i = 0; i < shortestArrayLength; i++) {
                            xy.push(x[i] * y[i]);
                            x2.push(x[i] * x[i]);
                            y2.push(y[i] * y[i]);
                        }

                        var sum_x = 0;
                        var sum_y = 0;
                        var sum_xy = 0;
                        var sum_x2 = 0;
                        var sum_y2 = 0;

                        for (var i = 0; i < shortestArrayLength; i++) {
                            sum_x += x[i];
                            sum_y += y[i];
                            sum_xy += xy[i];
                            sum_x2 += x2[i];
                            sum_y2 += y2[i];
                        }

                        var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
                        var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
                        var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
                        var step4 = Math.sqrt(step2 * step3);
                        var answer = step1 / step4;

                        if (!channelSynchrony[channel]) {
                            channelSynchrony[channel] = [];
                        }
                    channelSynchrony[channel].push(answer)
                    })
                })

                return channelSynchrony.map((channelData) => {
                    return channelData.reduce((a, b) => a + b, 0) / channelData.length
                })
            } else {
                return Array.from({length: Object.keys(this.eegCoordinates).length}, e => 0)
            }
        } else {
            return Array.from({length: Object.keys(this.eegCoordinates).length}, e => 0)
        }
    }

    /**
     * @method module:brainsatplay.Game.access
     * @description Set or return the current access level of the game.
     * @param type {string} Choose from 'public' or 'private'
     */

    access(type) {
        if (type !== undefined) {
            if (this.bluetooth.connected){
                this.brains[type].set(this.me.username,this.brains[this.info.access].get(this.me.username))
                this.brains[this.info.access].delete(this.me.username)
            }
            this.info.access = type;
            this.info.brains = this.brains[this.info.access].size
            this.getMyIndex()
            this.updateUsedChannels()
            this.setUpdateMessage({destination: 'update'})
        }
        return this.info.access
    }

        /**
     * @method module:brainsatplay.Game.consent
     * @description Consent to sending data through our servers.
     */
    consent(type, value){
        if (type === undefined) {
            return this.me.consent
        } else {
            if (value === undefined) {
                return this.me.consent[type]
            } else {
                this.me.consent[type] = value
            }
        }
    }

    /**
     * @async
     * @method module:brainsatplay.Game.connectBluetoothDevice
     * @description Connect a Bluetooth Low Energy Device (BLE) from the browser. Connection to a BLE device can only be initiated when the game is not connected to the server (i.e. this.connection.status === false).
     * @param type {string} Choose from 'muse'
     */


    async connectBluetoothDevice(type='muse',map){

        let acceptedTypes = ['muse','freeEEG32']
        // only allow connection if not sending data to server
        if (!(this.connection.status)){
            if (acceptedTypes.includes(type)){
            if (type === 'muse'){
        this.bluetooth.devices['muse'].start().then(() => {
            this.bluetooth.channelNames = 'TP9,AF7,AF8,TP10,AUX' // Muse 
            this.bluetooth.devices[type].eegReadings.subscribe(r => {
                let me = this.brains[this.info.access].get(this.me.username)
                if (me !== undefined) {
                    if (this.connection.status) {
                        let data = new Array(me.numChannels)
                        data[r.electrode] = r.samples;
                        if (this.me.consent.raw){
                            this.send('bci',{signal:[r.samples],time:[r.timestamp],electrode:r.electrode})
                        } else {
                            this.send('bci',{signal:[],time:[]})
                        }
                    } else {
                        if (this.brains[this.info.access].get(this.me.username)){
                        this.brains[this.info.access].get(this.me.username).loadData({signal:[r.samples],time:Array(r.samples.length).fill(r.timestamp),electrode:r.electrode,consent:{raw:true,game:true}})
                        }
                    }
                }
              })
            
            this.commonBluetoothSetup(type)
        });
        } else if (type='freeEEG32'){
            this.bluetooth.devices['freeEEG32'] = new eeg32();
            this.bluetooth.devices[type].setupSerialAsync().then(() => {
                if (map){
                    this.bluetooth.adcMap = map;
                } else {
                    this.bluetooth.adcMap = {
                        A0: 'O2',
                        A1: 'T6',
                        A2: 'T4',
                        A3: 'F8',
                        A4: 'Fp2',
                        A5: 'F4',
                        A6: 'C4',
                        A7: 'P4',
                        A8: '',
                        A9: '',
                        A10: '',
                        A11: '',
                        A12: 'Pz',
                        A13: '',
                        A14: '',
                        A15: '',
                        A16: 'Fz',
                        A17: '',
                        A18: '',
                        A19: '',
                        A20: '',
                        A21: '',
                        A22: '',
                        A23: '',
                        A24: 'Fp1',
                        A25: 'F3',
                        A26: 'C3',
                        A27: 'P3',
                        A28: 'O1',
                        A29: 'T5',
                        A30: 'T3',
                        A31: 'F7',
                    }
                }
                this.bluetooth.adcNames = Object.keys(this.bluetooth.adcMap).filter(key => this.bluetooth.adcMap[key] != '')
                this.bluetooth.channelNames =this.bluetooth.adcNames.map((key) => key=this.bluetooth.adcMap[key])
                this.bluetooth.channelNames = this.bluetooth.channelNames.join(',')
                this.bluetooth.samplerate = this.bluetooth.devices['freeEEG32'].sps;
                this.commonBluetoothSetup(type)
            })
        }
    } else {
            console.error('No Bluetooth compatibility with devices of type: ' + type)
        }
    } else {
        console.error('Please connect your Muse before connecting to the server.')
    }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.commonBluetoothSetup
     * @description A utility function to replace existing synthetic data with a Bluetooth stream.
     */
    commonBluetoothSetup(type){
        this.bluetooth.device = type
        this.remove(this.me.username)
        this.add(this.me.username, this.bluetooth.channelNames,this.bluetooth.samplerate,{on:false})
        this.updateBrainRoutine()
        this.bluetooth.connected = true;
    }

    /**
     * @method module:brainsatplay.Game.disconnect
     * @description Disconnect the game from the server by terminating the Websocket connection.
     * @param type {string} Choose from 'muse'
     */

    disconnect() {
        this.connection.ws.close();
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.updateBrainRoutine
     * @description A shortcut to call updateUsedChannels(), getMyIndex(), and setUpdateMessate() when Brains are added or removed from the game.
     */

    updateBrainRoutine(obj = {}) {
        this.updateUsedChannels()
        this.getMyIndex()
        obj.destination = 'update'
        this.setUpdateMessage(obj)
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.establishWebsocket
     * @description Establish a Websocket connection. Sets the connection parameters.
     */
    
    establishWebsocket(type='interfaces'){
        
        let connection;
        let cookies;
        
        if (this.bluetooth.connected){
            type = 'bidirectional';
            cookies = [this.me.username,type,this.name,this.info.access,...this.bluetooth.channelNames.split(',')]
        } else {
            type = 'interfaces';
            cookies = [this.me.username, type, this.name]
        }

        if (this.url.protocol === 'http:') {
            connection = new WebSocket(`ws://` + this.url.hostname, cookies);
        } else if (this.url.protocol === 'https:') {
            connection = new WebSocket(`wss://` + this.url.hostname, cookies);
        } else {
            console.log('invalid protocol')
            return
        }
        connection = this.setWebsocketMethods(connection,type)
        this.connection.ws = connection
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.setWebsocketMethods
     * @description Sets onerror, onopen, onmessage, and onclose methods for the Websocket connection.
     */
    setWebsocketMethods(connection=undefined){
        if (connection){
                connection.onerror = () => {
                    this.setUpdateMessage({destination: 'error'})
                };
        
                connection.onopen = () => {
                    this.connection.status = true
                    this.initialize(true)
                    this.send('initializeBrains')
                };
        
                connection.onmessage = (msg) => {
        
                    let obj = JSON.parse(msg.data);
                    if (obj.destination === 'bci') {
                        if (this.brains[this.info.access].get(obj.id) !== undefined) {
                            this.brains[this.info.access].get(obj.id).loadData(obj)
                        }
                    } else if (obj.destination === 'init') {
                        if (obj.privateBrains) {
                            this.add(obj.privateInfo.id, obj.privateInfo.channelNames, undefined,{on:false}, 'private')
                        } else {
                            for (let newUser = 0; newUser < obj.nBrains; newUser++) {
                                if (this.brains.public.get(obj.ids[newUser]) === undefined && obj.ids[newUser] !== undefined) {
                                    this.add(obj.ids[newUser], obj.channelNames[newUser],undefined,{on:false})
                                }
                            }
                        }
                        this.updateUsedChannels()
                        if (obj.nInterfaces === undefined){
                            this.info.interfaces = 0;
                        } else{
                            this.info.interfaces = obj.nInterfaces;
                        }
                        this.getMyIndex()
                        this.setUpdateMessage(obj)
                    } else if (obj.destination === 'brains') {
                        let update = obj.n;
                        // Only update if access matches
                        if (update === 1) {
                            this.add(obj.id, obj.channelNames, undefined, {on:false}, obj.access)
                        } else if (update === -1) {
                            this.remove(obj.id, obj.access)
                        }
                        this.updateBrainRoutine(obj)
                    } else if (obj.destination === 'interfaces') {
                        this.info.interfaces += obj.n;
                        obj.destination = 'update'
                        this.setUpdateMessage(obj)
                    } else if (obj.destination === 'bidirectional') {
                        let update = obj.n;
                        // Only update if access matches
                        if (update === 1) {
                            this.add(obj.id, obj.channelNames, undefined, {on:false}, obj.access)
                        } else if (update === -1) {
                            this.remove(obj.id, obj.access)
                        }
                        this.info.interfaces += update;
                        obj.destination = 'update'
                        this.setUpdateMessage(obj)
                    } else {
                        console.log(obj)
                    }
                };
        
                connection.onclose = () => {
                    this.connection.status = false;
                    let notRemoved = true;
                    Object.keys(this.brains).forEach(access => {
                        this.brains[access].forEach((brain,username) => {
                            if (username !== this.me.username){
                                this.remove(username,access)
                            } else if (notRemoved){
                                this.brains[access].get(this.me.username).username = 'me'
                                this.brains[access].set('me',this.brains[access].get(this.me.username))
                                this.brains[access].delete(this.me.username)
                                this.me.username = 'me'
                                notRemoved = false;
                            }
                        })
                    })
                    this.info.brains = 0;
                    this.info.interfaces = 0;
                    this.info.access = "public"
                    this.simulate(this.info.simulated)
                    // this.simulate(this.settings.players.teams.names.length*this.settings.players.teams.size)
                    this.getMyIndex()
                    this.setUpdateMessage({destination: 'closed'})
                };
        }
        return connection
    }

    /**
     * @async
     * @method module:brainsatplay.Game.connect
     * @description Connect game to a brainsatplay server.
     * @param dict {dict} Login parameters.
     * @param dict {string} Server URL.
     */

    async connect(dict = {'guestaccess': true}, url = 'https://brainsatplay.azurewebsites.net/') {

        let resDict;
        resDict = await this.login(dict, url)
        this.establishWebsocket()
        return resDict
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.send
     * @description Send a message over Websockets to the server.
     */

    send(command,dict) {
        if (this.connection.status){
        if (command === 'initializeBrains') {
            this.connection.ws.send(JSON.stringify({'destination': 'initializeBrains', 'public': this.info.access === 'public'}));
            this.setUpdateMessage({destination: 'opened'})
        } else if (command === 'bci'){
            dict.destination = 'bci';
            dict.id = this.me.username;
            dict.consent = this.me.consent;

            if (this.me.consent.game){
                let reserved = ['voltage','time','electrode','consent']
                let me = this.brains[this.info.access].get(this.me.username)
                if (me !== undefined){
                    Object.keys(me.data).forEach((key) => {
                        if (!reserved.includes(key)){
                            dict[key] = me.data[key]
                        }
                    })
                }
            }

            if (!this.me.consent.raw){
                dict.signal = [];
                dict.time = [];
            }
                
            dict = JSON.stringify(dict)
            this.connection.ws.send(dict)
        }
    }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.checkURL
     * @description Check if a request href is properly formatted
     * @param url {string} URL href
     */
    checkURL(url) {
        if (url.slice(-1) !== '/') {
            url += '/'
        }
        return url
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.checkPathname
     * @description Check if a request pathname is properly formatted
     * @param pathname {string} URL pathname
     */

    checkPathname(pathname) {
        if (pathname.slice(0) === '/') {
            pathname.splice(0,1)
        }
        return pathname
    }


    /**
     * @ignore
     * @async
     * @method module:brainsatplay.Game.request
     * @description Send an HTTP request
     * @param body {dict} A dictionary to pass to the receiving server
     * @param method {string} Choose between 'GET' and 'POST'
     * @param pathname {string} The pathname of the server
     * @param baseURL {string} The href of the server
     */
    
    async request(body,method='POST',pathname='',baseURL=this.url.href){
        if (pathname !== ''){
            baseURL = this.checkURL(baseURL)
            pathname = this.checkPathname(pathname)
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
                return dict.message
            })
        })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });
        } else {
            console.log(`You must provide a valid pathname to request resources from ${baseURL}`)
            return
        }
    }

    /**
     * @ignore
     * @async
     * @method module:brainsatplay.Game.login
     * @description Login to a brainsatplay server. Called by [brainsatplay.Game.connect()]{@link module:brainsatplay.Game.connect}.
     * @param dict {dict} Login parameters.
     * @param dict {string} Server URL.
     */

    async login(dict, url = 'https://brainsatplay.azurewebsites.net/') {
        url = this.checkURL(url)
        this.url = new URL(url);

        let json = JSON.stringify(dict)

        let resDict = await fetch(url + 'login',
            {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: json
            }).then((res) => {
            return res.json().then((message) => message)
        })
            .then((message) => {
                return message
            })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });

        if (resDict.result === 'OK') {
            this.me.username = resDict.msg;
        }
        return resDict
    }

    /**
     * @async
     * @method module:brainsatplay.Game.signup
     * @description Sign up for a brainsatplay account. Account details are used for [brainsatplay.Game.connect()]{@link module:brainsatplay.Game.connect}.
     * @param dict {dict} Login parameters.
     * @param dict {string} Server URL.
     */
    async signup(dict, url = 'https://brainsatplay.azurewebsites.net/') {
        url = this.checkURL(url)
        this.url = new URL(url);
        let json = JSON.stringify(dict)
        let resDict = await fetch(url + 'signup',
            {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: json
            }).then((res) => {
            return res.json().then((message) => message)
        })
            .then((message) => {
                console.log(`\n${message}`);
                return message
            })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });

        return resDict
    }


    /**
     * @method module:brainsatplay.Game.initializeSession
     * @description Initialize an experimental session for recording data. 
     * @param dict {dict} Setting dictionary.
     */
    initializeSession(settings){
        this.session = {
            samples: 0,
            count: 0,
            trial: 0,
            iti: 0,
            numTrials: 0,
            t:0,
            state:'',
            type: '',
            subset: 0,
            eventDuration: 0,
            currentEventState: {state: {}, chosen: []},
            data: {events:[], voltage:[], time: []},
            results: []
        };

        if (settings !== undefined){
            this.setSessionSettings(settings)
        }
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.setSessionSettings
     * @description Set session settings.
     * @param settings {dict} Setting dictionary.
     */

    setSessionSettings(settings) {
        this.session.samples = settings.numSamples
        this.session.trial = 0;
        this.session.numTrials = settings.trials;
        this.session.iti = settings.iti;
        this.session.t = Date.now();
        this.session.state = 'pre-session';
        this.session.type = settings.name;
        this.session.subset = settings.subset;
        this.session.eventDuration = settings.eventDuration;
        this.session.currentEventState = {state: {}, chosen: []};

        let stateDict = {};

        settings.objects.forEach((name) => {
            stateDict[name] = false;
        })
        let objectDict = {state: stateDict, chosen: []}
        this.session.data.events = Array.from({length: settings.trials}, e => objectDict)
        this.session.results = Array(settings.trials).fill(NaN)
        this.session.data.voltage = Array.from({length: settings.trials}, e => Array.from({length: Object.keys(this.eegCoordinates).length}, e => []))
        this.session.data.time = Array.from({length: settings.trials}, e => Array.from({length: Object.keys(this.eegCoordinates).length}, e => []))
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.updateSession
     * @description Update session based on settings.
     */

    updateSession(){
        if (this.session && this.session.state !=='done'){
        if (['pre-session','iti'].includes(this.session.state)){
            if (this.session.t+(this.session.iti) <= Date.now()){
                this.session.state = 'trial-on';
                this.brains[this.info.access].forEach((brain) => {
                        brain.initializeStorage()
                        brain.storage.store = true;
                        brain.storage.samples = this.session.samples;
                })
                this.session.currentEventState = this.objectSelection()
                this.session.t = Date.now();
            }
        } if (['trial-on','trial-off'].includes(this.session.state)){
            let ready = [];
            let brain = this.brains[this.info.access].get(this.me.username)
            brain.usedChannels.forEach((_,ind) => {
                ready.push(brain.storage.count[ind] === this.session.samples)
            })
            if (ready.every((val) => val === true)){
                    let brain = this.brains[this.info.access].get(this.me.username)
                    brain.storage.record = false;
                    brain.storage.count = brain.storage.count.map((val) => 0);
                    this.session.data.voltage[this.session.trial] = brain.storage.data.voltage
                    this.session.data.time[this.session.trial] = brain.storage.data.time
                this.session.trial++;
                if ((this.session.trial) === this.session.numTrials){
                    this.session.state = 'done';
                    this.session.trial = NaN;
                    this.session.currentEventState = this.objectSelection(false)
                } else {
                    this.session.state = 'iti';
                    this.session.currentEventState = this.objectSelection(false)
                    this.session.t = Date.now();
                }
            } else if (this.session.t+(this.session.eventDuration) <= Date.now() && this.session.state === 'trial-on'){
                this.session.state = 'trial-off';
                this.session.currentEventState = this.objectSelection(false)
            }
        }
    }
    }
    
    /**
     * @method module:brainsatplay.Game.objectSelection
     * @description Choose a subset of the objects declared in the session settings.
     */

    objectSelection(choose=true){
        let eventState;

        if (this.session.state !=='done'){
            eventState = this.session.data.events[this.session.trial].state
        } else {
            eventState = this.session.currentEventState.state
        }

        let objKeys;
        let chosen = [];

        if (choose){
            if (this.session.trial === 0){
                objKeys = Object.keys(eventState)
            } else {
                let prevSubset = this.session.data.events[this.session.trial-1].chosen
                objKeys = Object.keys(eventState).filter((key) => !prevSubset.includes(key))
            }
            
            for (let i = 0; i < this.session.subset*objKeys.length ; i++){
                chosen.push(objKeys.splice(Math.floor(Math.random()*objKeys.length),1)[0])
            }
        }

        
        Object.keys(eventState).forEach((object) => {
            if (chosen.includes(object)){
                eventState[object] = true;
            } else {
                eventState[object] = false;
            }
        })

        if (choose){
            this.session.data.events[this.session.trial] = {state: eventState, chosen: chosen};
        } 

        return {state: eventState, chosen: chosen}
    }
}


/**
 * @class module:brainsatplay.Brain
 * @description Manage brain data from a single user
 */

class Brain {
    constructor(userId, channelNames, samplerate,simulationParams={on:false}){
        this.username = userId;
        this.eegCoordinates = eegCoordinates
        this.usedChannels = []
        this.channelNames = []
        this.samplerate = {estimate: 0}
        this.samplerate.default = samplerate
        if (samplerate){
            this.samplerate.default = samplerate
        } else {
            this.samplerate.default = 200;
        }

        this.simulation = simulationParams

        this.blink.threshold = 400 // uV
        this.blink.duration = 50 // samples
        this.blink.lastBlink = 0;

        this.cleared = {
            raw: false,
            game: false
        }

        if (channelNames === undefined){
            channelNames = 'TP9,AF7,AF8,TP10,AUX' // Muse 
            // channelNames = 'Fz,C3,Cz,C4,Pz,PO7,Oz,PO8,F5,F7,F3,F1,F2,F4,F6,F8' // OpenBCI
        }

        channelNames = channelNames.toLowerCase().split(',')
        channelNames.forEach((name) => {
            let capName = name.charAt(0).toUpperCase() + name.slice(1)
            if (capName.charAt(1) == 'o'){
                capName = capName.charAt(0) + 'O' + capName.slice(2)
            }
            if (Object.keys(this.eegCoordinates).indexOf(capName) !== -1){
                this.channelNames.push(capName)
                this.usedChannels.push({name:capName, index: Object.keys(this.eegCoordinates).indexOf(capName)})
            } else {
                console.log(capName + ' electrode is not currently supported.')
            }
        })

        this.bufferSize = 1000 // Samples
        this.data = {
            voltage: this.createBuffer(),
            time: this.createBuffer()
        }

        this.initializeStorage()
    }
    /**
     * @ignore
     * @method module:brainsatplay.Game.createBuffer
     * @description Initialize a buffer for all EEG coordinates.
     */
    
    createBuffer(){
        return Array.from(Object.keys(this.eegCoordinates), e => {if (this.channelNames.includes(e)){
            return []
        } else {
            return [NaN]
        }})
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.initializeStorage
     * @description Initialize a data storage container for the session.
     */

    initializeStorage(){
        this.storage = {
            store: false,
            count: Array(this.usedChannels.length).fill(0),
            samples: 0,
            full: false,
            data: {
                voltage: this.createBuffer(),
                time: this.createBuffer()
            }
        }
    }
 
    /**
     * @ignore
     * @method module:brainsatplay.Game.loadData
     * @description Load data passed to the Brain to the correct buffer / container.
     */

    loadData(data) {
        if ((data.consent !== undefined && data.consent.raw) || this.simulation.on){
            this.cleared.raw = false;
            let signal = data.signal
            let time = data.time

            // drop data if undefined or NaN
            signal = signal.filter((arr) => {if (!arr.includes(undefined) && !arr.includes(NaN)){return arr}})

            signal.forEach((channelData, channel) => {
                if (Array.isArray(channelData)) {
                    if (channelData.length > 0) {
                        if (Object.keys(data).includes('electrode')){
                            channel = data.electrode
                        }
                        this.data.voltage[this.usedChannels[channel].index].push(...channelData);
                        this.data.time[this.usedChannels[channel].index].push(...time);

                        let tDiff = this.data.time[this.usedChannels[channel].index].length - this.bufferSize
                        if (tDiff > 0){
                            this.data.time[this.usedChannels[channel].index].splice(0,tDiff)
                        }

                        let vDiff = this.data.voltage[this.usedChannels[channel].index].length - this.bufferSize
                        if (vDiff > 0){
                            this.data.voltage[this.usedChannels[channel].index].splice(0,vDiff)
                        }

                        if (this.storage.store === true){
                            let diff = this.storage.samples - this.storage.count[channel];
                            if (diff > 0){
                                let pushedData;
                                let pushedTime;
                                if (diff < channelData.length){
                                    pushedData = channelData.splice(0,diff)
                                    pushedTime = time.splice(0,diff)
                                } else {
                                    pushedData = channelData
                                    pushedTime = time
                                }
                                this.storage.data.voltage[this.usedChannels[channel].index].push(...pushedData)
                                this.storage.data.time.push(...pushedTime)
                                this.storage.count[channel] += pushedData.length;
                            }
                        }
                    }
                }
            })

            if (this.usedChannels.length > 0){
                let timeElapsed = ((Math.max(...this.data.time[this.usedChannels[0].index]) - Math.min(...this.data.time[this.usedChannels[0].index]))/1000)
                if (timeElapsed > 0){
                    this.samplerate.estimate = Math.floor(this.data.time[this.usedChannels[0].index].length / timeElapsed)
                } else {
                    this.samplerate.estimate = Math.floor(this.samplerate.default)
                }
            }
        } else if (this.cleared.raw === false){
            this.data.voltage = this.createBuffer()
            this.data.time = this.createBuffer()
            this.cleared.raw = true
        }

        if ((data.consent !== undefined && data.consent.game) || this.simulation.on){
            this.cleared.game = false;
            let arbitraryFields = Object.keys(data)
            arbitraryFields = arbitraryFields.filter(e => !['signal','time','electrode'].includes(e));

            arbitraryFields.forEach((field) =>{
                this.data[field] = data[field]
            })
        } else if (this.cleared.game === false){
            let voltage = this.data.voltage
            let time = this.data.time;
            let electrode = this.data.electrode;
            this.data = {
                voltage:voltage,
                time:time,
                electrode:electrode
            };
            this.cleared.game = true
        }
    }

        /**
     * @ignore
     * @method module:brainsatplay.Game.generateSignal
     * @description Generate a complex sine wave.
     */

    generateSignal(amplitudes = [], frequencies = [], samplerate = 256, duration = 1, phaseshifts = new Array(amplitudes.length).fill(0)) {
        let al = amplitudes.length;
        let fl = frequencies.length;
        let pl = phaseshifts.length;

        if (al !== fl || fl !== pl) {
            console.error('Amplitude array, frequency array, and phaseshift array must be of the same length.')
        }

        let signal = new Array(Math.round(samplerate * duration)).fill(0)

        frequencies.forEach((frequency, index) => {
            for (let point = 0; point < samplerate * duration; point++) {
                signal[point] += amplitudes[index] * Math.sin(2 * Math.PI * frequency * (point + phaseshifts[index]) / samplerate)
            }
        })

        signal = signal.map(point => point/fl)

        return signal
    }

    /**
     * @ignore
     * @method module:brainsatplay.Game.generateVoltageStream
     * @description Generate a synthetic voltage signal for each synthetic brain in the game.
     */
    generateVoltageStream() {
        let userInd = 0
        let n = 5
        let freqs;
        let amps;
            if (this.simulation.on === true){
                this.channelNames.forEach((channelName) => {
                    // Generate frequencies if none are provided
                    if (this.simulation.frequencies === undefined){
                        freqs = Array.from({length: n}, e => Math.random() * 50)
                    } else {
                        freqs = this.simulation.frequencies
                    }

                    // Generate amplitudes if none are provided
                    if (this.simulation.amplitudes === undefined){
                        amps = Array(n).fill(100)
                    } else {
                        amps = this.simulation.amplitudes
                    }
                    let samples = this.generateSignal(amps, freqs, this.samplerate.default, this.simulation.duration, Array.from({length: freqs.length}, e => Math.random() * 2*Math.PI))
                    this.loadData({signal:[samples], time:Array(samples.length).fill(Date.now()),electrode:this.channelNames.indexOf(channelName)})
                })
            }
    }

    /**
     * @method module:brainsatplay.Brain.getVoltage
     * @description Returns voltage buffer from the brain (channels x samples)
     */

    getVoltage(normalize=false, filters=[{type:'notch',freq_notch:50},{type:'notch',freq_notch:60},{type:'bandpass',freq_low:1, freq_high: 50}]){
        
        let voltage = this.removeDCOffset(this.data.voltage)
        if (Array.isArray(filters)){
            voltage = this.filter(voltage,filters)
        }

        if (normalize){
            return this.normalize(voltage)
        } else {
            return voltage
        }
    }

    /**
     * @method module:brainsatplay.Brain.getMetric
     * @description Returns the specified metric.
     * @param metricName {string} Choose between 'power', 'delta', 'theta', 'alpha', 'beta', 'gamma'
     */
    async getMetric(metricName,relative,filters){
            let dict = {};
            // Derive Channel Readouts
            if (metricName === 'power') {
                dict.channels = this.power(filters,relative)
            } else if (['delta', 'theta', 'alpha', 'beta', 'gamma'].includes(metricName)) {
                dict.channels = this.bandpower(metricName, filters, relative)
            }

            // Get Values of Interest
            let valuesOfInterest = [];
            this.usedChannels.forEach((channelInfo) => {
                valuesOfInterest.push(dict.channels[channelInfo.index])
            })

            // Derive Average Value
            let avg = valuesOfInterest.reduce((a, b) => a + b, 0) / valuesOfInterest.length;
            if (!isNaN(avg)) {
                dict.average = avg;
            } else {
                dict.average = 0;
            }
            return dict 
    }

    /**
     * @ignore
     * @method module:brainsatplay.Brain.normalize
     * @description Normalizes the passed array between 0 and 1
     */

    normalize(array) {
        return array.map((channelData) => {
            let max = Math.max(...channelData)
            let min = Math.min(...channelData)
            if (min !== max) {
                return channelData.map((val) => {
                    var delta = max - min;
                    return ((val - min) / delta)
                })
            } else {
                return channelData.map((val) => {
                    return val
                })
            }
        })
    }

    /**
     * @ignore
     * @method module:brainsatplay.Brain.stDev
     * @description Returns the standard deviation of an array of values. 
     */
    stdDev(data, ignoreNaN = true) {

        let dataOfInterest = [];
        let indicesOfInterest = [];
        if (ignoreNaN) {
            data.forEach((val,ind) => {
                if (!isNaN(val)) {
                    dataOfInterest.push(val)
                    indicesOfInterest.push(ind)
                }
            })
        }

        let avg = dataOfInterest.reduce((a, b) => a + b, 0) / dataOfInterest.length;
        let sqD = dataOfInterest.map(val => {
            let diff = val - avg;
            return diff * diff;
        })
        let aSqD = sqD.reduce((a, b) => a + b, 0) / sqD.length;
        let stdDev = Math.sqrt(aSqD);
        let dev;

        dataOfInterest.forEach((val, ind) => {
            dev = (val - avg) / stdDev;
            if (isNaN(dev)) {
                data[indicesOfInterest[ind]] = 0;
            } else {
                data[indicesOfInterest[ind]] = dev;
            }
        })

        return data
    }
    
    /**
     * @method module:brainsatplay.Brain.power
     * @description Returns voltage power.
     */
    power(filters, relative = false) {

            let voltage = this.getVoltage(false,filters);
            let power = new Array(Object.keys(this.eegCoordinates).length);
            voltage.forEach((channelData,ind) => {
                power[ind] = channelData.reduce((acc, cur) => acc + (Math.pow(cur, 2) / 2), 0) / channelData.length
            })

            if (relative) {
                power = this.stdDev(power, true)
            }

            return power
    }

    /**
     * @method module:brainsatplay.Brain.bandpower
     * @description Returns bandpower in the specified EEG band.
     */
    bandpower(band, filters,relative=true) {

            let voltage =this.getVoltage(false,filters);
            let bandpower = new Array(Object.keys(this.eegCoordinates).length).fill(NaN);
            
            voltage.forEach((channelData,ind) => {
                if (channelData.length > this.samplerate.estimate/2 || channelData.length === this.bufferSize){ // Check with Nyquist sampling theorem
                    if (!channelData.includes(NaN)){
                        bandpower[ind] = bci.bandpower(channelData, this.samplerate.estimate, band, {relative: relative});
                    }
                }
            })

            // NOTE: How to keep this...
            // if (relative) {
            //     bandpower = this.stdDev(bandpower)
            // }
            return bandpower
    }

    /**
     * @ignore
     * @method module:brainsatplay.Brain.filter
     * @description Filters the passed EEG channel data with the specified filters
     */
    filter(data, filterArray){
        let dataRed = data.filter(channelData => !isNaN(channelData[0]))
        if (dataRed.length !== 0){
            let filters = filterArray;
            filterArray.forEach((dict,ind) => {
                if (dict.filter === 'notch'){
                    filters[ind] = new Biquad('notch',parameters[ind].freq_notch,this.samplerate.estimate,Biquad.calcNotchQ(parameters[ind].freq_notch,1),0);
                } else if (dict.filter === 'bandpass'){
                    filters[ind] = new Biquad('bandpass',
                    Biquad.calcCenterFrequency(parameters[ind].freq_low,parameters[ind].freq_high),
                    this.samplerate.estimate,
                    Biquad.calcBandpassQ(Biquad.calcCenterFrequency(parameters[ind].freq_low,parameters[ind].freq_high),Biquad.calcBandwidth(parameters[ind].freq_low,parameters[ind].freq_high),9.75),
                    0);
                }
            })

            dataRed.forEach((channelData,ind) => {
                let wave_filtered = channelData
                channelData.forEach((amp,i) => {
                    filterArray.forEach((dict,ind) => {
                        if (dict.filter === 'notch'){
                            wave_filtered[i] = notch.applyFilter(channelData[i]);
                        }
                        else if (dict.filter === 'bandpass'){
                            wave_filtered[i] = 4*filters[ind].applyFilter(filters[ind].applyFilter(filters[ind].applyFilter(filters[ind].applyFilter(wave_filtered[i])))); //Need to rescale the outputs for some reason but otherwise it's accurate
                        }
                    })
                })
                data[this.usedChannels[ind].index] = wave_filtered
            })
        }
        return data
    }

    /**
     * @ignore
     * @method module:brainsatplay.Brain.removeDCOffset
     * @description Removes the average from each voltage buffer
     */
    removeDCOffset(voltages){
        voltages = voltages.map(buffer => {
            let mean = buffer.reduce((a, b) => a + b, 0) / buffer.length;
            return buffer.map(point => point-mean)
        })
        return voltages
    }

    /**
     * @method module:brainsatplay.Brain.blink
     * @description Returns a Boolean array indicating the detection of a blink (works only with Muse headbands)
     */

    blink() {
        let leftChannels = ['Af7','Fp1'] // Left
        let rightChannels = ['Af8','Fp2'] // Right
        let sideChannels = [leftChannels,rightChannels]
        let blinks = [false,false]
        let quality = this.contactQuality(this.blink.threshold,this.blink.duration)

        if (Date.now() - this.blink.lastBlink > 2*this.blink.duration){
            let voltage = this.getVoltage()
        sideChannels.forEach((channels,ind) => {
                if (this.channelNames.includes(...channels)){
                    let channelInd = this.usedChannels[this.channelNames.indexOf(...channels)].index
                    let buffer = voltage[channelInd]
                    let lastTwenty = buffer.slice(buffer.length-this.blink.duration)
                    let max = Math.max(...lastTwenty.map(v => Math.abs(v)))
                    blinks[ind] = (max > this.blink.threshold) * (quality[channelInd] > 0)
                }
            })
            this.blink.lastBlink = Date.now()
        }
        
        return blinks
    }

    /**
     * @method module:brainsatplay.Brain.contactQuality
     * @description Returns an array of values between 0 and 1 indicating signal quality for each EEG electrode.
     */

    contactQuality(threshold=100,sizeSlice=this.bufferSize){
        let quality = Array.from({length: Object.keys(this.eegCoordinates).length}, e => NaN);
        let voltage = this.getVoltage();
        this.usedChannels.forEach((channelDict) => {
            let buffer = voltage[channelDict.index]
            buffer = buffer.slice(buffer.length-sizeSlice);
            let aveAmp = buffer.reduce((a, b) => a + Math.abs(b), 0) / buffer.length
            quality[channelDict.index] = 1 - Math.max(0, Math.min(1, aveAmp / threshold))
        })

    return quality
    }

    /**
     * @method module:brainsatplay.Brain.setData
     * @description Set the arbitrary data passed about this brain to other connected clients.
     */
    setData(dict){
        let reserved = ['voltage','time','electrode','consent']
        Object.keys(dict).forEach(key => {
            if (!reserved.includes(key)){
                this.data[key] = dict[key]
            }
        })
    }
}