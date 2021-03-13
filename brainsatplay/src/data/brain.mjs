import {eegCoordinates} from './coordinates.mjs'; 

export {Brain}

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