import {State} from './State'
//import {applyFilter, IIRNotchFilter, IIRLowPassFilter} from '../utils/signal_analysis/IIRFilter'
import {Biquad, makeNotchFilter, makeBandpassFilter, DCBlocker} from '../utils/signal_analysis/BiquadFilters'

import {eeg32, eegAtlas} from '../utils/eeg32'

import {cyton} from '../utils/hardware_compat/cyton'


export var EEG = new eeg32( //cyton(
    (newLinesInt) => { //on decoded
        //if(EEG.data.counter === EEG.maxBufferedSamples) debugger;
        
        //console.log(State.data.saveCounter)
        if(newLinesInt > 0) {
            State.data.saveCounter -= newLinesInt;
            if(State.data.useFilters === true) {
                let linesFiltered = 0;
                while(linesFiltered < newLinesInt){
                    let ct = State.data.counter;
                    if(State.data.counter > EEG.data.counter) { 
                        ct -= 5120;
                    }
                    State.data.filterers.forEach((filterer,i) => {
                        let out = filterer.apply(ct);
                        State.data.filtered[filterer.channel].push(out);
                    });
                    if(State.data.counter > EEG.data.counter) {
                        State.data.counter -= 5120;
                        State.data.filterers.forEach((filterer,i) => {
                            State.data.filtered[filterer.channel].splice(0,5120);
                        });
                    }
                    State.data.counter++;
                    linesFiltered++;
                } 
            }
            else {
                State.data.counter = EEG.data.counter;
            }
        }
    }, () => { //on connected
        State.data.sessionName = new Date().toISOString();
        State.setState({connected:true, rawFeed:true});
    }, () => { //on disconnected
        State.setState({connected:false,rawFeed:false,analyze:false});
    }); //connection callbacks to set state on front end.


let defaultTags = [
    {ch: 4, tag: "Fp2", viewing: true},
    {ch: 24, tag: "Fp1", viewing: true},
    {ch: 8, tag: "other", viewing: true}
];

export const ATLAS = new eegAtlas(defaultTags);
/*
class iirChannelFilterer { //Feed-forward IIR filters
    constructor(channel="A0",sps=512, filtering=true) {
        this.channel=channel; this.idx = 0; this.sps = sps;
        this.filtering=filtering;

        State.data.filtered[this.channel] = [];//Add placeholder to state

        this.notch50 = new IIRNotchFilter(sps,50,0.5);
        this.notch50_2 = new IIRNotchFilter(sps,50,0.5);
        this.notch50_3 = new IIRNotchFilter(sps,50,0.5);
        this.notch60 = new IIRNotchFilter(sps,60,0.5);
        this.notch60_2 = new IIRNotchFilter(sps,60,0.5);
        this.notch60_3 = new IIRNotchFilter(sps,60,0.5);
        this.lp1 = new IIRLowPassFilter(sps,50);
        this.lp2 = new IIRLowPassFilter(sps,50);
        this.lp3 = new IIRLowPassFilter(sps,50);
        this.dcb = new DCBlocker(0.995);
    }

    reset(sps=this.sps) {
        this.notch50 = new IIRNotchFilter(sps,50,0.5);
        this.notch50_2 = new IIRNotchFilter(sps,50,0.5);
        this.notch50_3 = new IIRNotchFilter(sps,50,0.5);
        this.notch60 = new IIRNotchFilter(sps,60,0.5);
        this.notch60_2 = new IIRNotchFilter(sps,60,0.5);
        this.notch60_3 = new IIRNotchFilter(sps,60,0.5);
        this.lp1 = new IIRLowPassFilter(sps,50);
        this.lp2 = new IIRLowPassFilter(sps,50);
        this.lp3 = new IIRLowPassFilter(sps,50);
        this.dcb = new DCBlocker(0.995);
    }

    apply(idx=this.lastidx+1) {
        let out=EEG.data[this.channel][idx]; 
        if(State.data.uVScaling === true){
            out = out*EEG.uVperStep;
        }
        if(this.filtering === true) {
            if(State.data.sma4 === true) {
                if(State.data.counter >= 4) { //Apply a 4-sample moving average
                    out = (State.data.filtered[this.channel][State.data.filtered[this.channel].length-3] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-2] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-1] + out)*.25;
                }
                else if(EEG.data.counter >= 4){
                    //console.log(State.data.counter, State.data.filtered[this.channel].length)
                    out = (EEG.data[this.channel][EEG.data.counter-4] + EEG.data[this.channel][EEG.data.counter-3] + EEG.data[this.channel][EEG.data.counter-2] + out)*.25;
                }
            }
            if(State.data.dcblocker === true) { //Apply a DC blocking filter
                out = this.dcb.step(out);
            }
            if(State.data.notch50 === true) { //Apply a 50hz notch filter
                out = applyFilter(out,this.notch50);
                out = applyFilter(out,this.notch50_2);
                out = applyFilter(out,this.notch50_3);
            }
            if(State.data.notch60 === true) { //Apply a 60hz notch filter
                out = applyFilter(out,this.notch60);
                out = applyFilter(out,this.notch60_2);
                out = applyFilter(out,this.notch60_3);
            }
            if(State.data.lowpass50 === true) { //Apply 3 50Hz lowpass filters
                out = applyFilter(out,this.lp1);
                out = applyFilter(out,this.lp2);
                out = applyFilter(out,this.lp3);
            }
        }
        this.lastidx=idx;
        return out;
    }
    
}
*/

class biquadChannelFilterer {
    constructor(channel="A0",sps=512, filtering=true) {
        this.channel=channel; this.idx = 0; this.sps = sps;
        this.filtering=filtering;
        this.bplower = 3; this.bpupper = 45;

        State.data.filtered[this.channel] = [];//Add placeholder to state

        this.notch50 = [
                    makeNotchFilter(50,sps,1)
                ];
        this.notch60 = [
                    makeNotchFilter(60,sps,1)
                ];
        this.lp1 = [
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512)
                ];
        this.bp1 = [
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1),
                    makeBandpassFilter(this.bplower,this.bpupper,sps,1)
                ];
        this.dcb = new DCBlocker(0.995);
    }

    reset(sps=this.sps) {
        this.notch50 = makeNotchFilter(50,sps,1);
        this.notch60 = makeNotchFilter(60,sps,1);
        this.lp1 = [
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512),
                    new Biquad('lowpass', 50, 512)
                ];
        this.bp1 = [
                    makeBandpassFilter(this.bplower,this.bpupper,sps,9.75)
                ];
        this.dcb = new DCBlocker(0.995);
    }

    setBandpass(bplower=this.bplower,bpupper=this.bpupper) {
        this.bplower=bplower; this.bpupper = bpupper;
        this.bp1 = [
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps),
            makeBandpassFilter(bplower,bpupper,sps)
        ];
    }

    apply(idx=this.lastidx+1) {
        let out=EEG.data[this.channel][idx]; 
        if(this.filtering === true) {
            if(State.data.sma4 === true) {
                if(State.data.counter >= 4) { //Apply a 4-sample moving average
                    out = (State.data.filtered[this.channel][State.data.filtered[this.channel].length-3] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-2] + State.data.filtered[this.channel][State.data.filtered[this.channel].length-1] + out)*.25;
                }
                else if(EEG.data.counter >= 4){
                    //console.log(State.data.counter, State.data.filtered[this.channel].length)
                    out = (EEG.data[this.channel][EEG.data.counter-4] + EEG.data[this.channel][EEG.data.counter-3] + EEG.data[this.channel][EEG.data.counter-2] + out)*.25;
                }
            }
            if(State.data.dcblocker === true) { //Apply a DC blocking filter
                out = this.dcb.applyFilter(out);
            }
            if(State.data.notch50 === true) { //Apply a 50hz notch filter
                this.notch50.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.notch60 === true) { //Apply a 60hz notch filter
                this.notch60.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            } 
            if(State.data.lowpass50 === true) { //Apply 4 50Hz lowpass filters
                this.lp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.bandpass === true) { //Apply 4 Bandpass filters
                this.bp1.forEach((f,i) => {
                    out = f.applyFilter(out);
                });
            }
            if(State.data.uVScaling === true){
                out = out*EEG.uVperStep;
            }
        }
        this.lastidx=idx;
        //console.log(this.channel, out)
        return out;
    }
}

defaultTags.forEach((row,i) => {
    if(row.tag !== 'other') {
        State.data.filterers.push(new biquadChannelFilterer("A"+row.ch,EEG.sps,true));
    }
    else { 
        State.data.filterers.push(new biquadChannelFilterer("A"+row.ch,EEG.sps,false)); 
    }
});
    


//class EEGInterface { constructor () { } }

export const EEGInterfaceSetup = () => {
    //EEG interface setup

    let bandPassWindow = ATLAS.bandPassWindow(State.data.freqStart,State.data.freqEnd,EEG.sps)
    ATLAS.fftMap = ATLAS.makeAtlas10_20();
    ATLAS.coherenceMap = ATLAS.genCoherenceMap(ATLAS.channelTags);
    ATLAS.fftMap.shared.bandPassWindow = bandPassWindow;
    ATLAS.fftMap.shared.bandFreqs = ATLAS.getBandFreqs(bandPassWindow);
    ATLAS.coherenceMap.shared.bandPassWindow = bandPassWindow;
    ATLAS.coherenceMap.shared.bandFreqs = ATLAS.fftMap.shared.bandFreqs;

    window.receivedMsg = (msg) => { //Set worker message response
        //console.log("received!");
        if(msg.foo === "multidftbandpass" || msg.foo === "multidft") {
            var ffts = [...msg.output[1]];
          
            //console.log("out", ffts)
            ATLAS.channelTags.forEach((row, i) => {
                if(row.tag !== null && row.tag !== 'other' && i < EEG.nChannels){
                    
                    ATLAS.mapFFTData(ffts, State.data.lastPostTime, i, row.tag);
                    ATLAS.fftMap.map.find((o,i) => {
                        if(o.tag === row.tag){
                            if(o.data.count > 5000) {
                                o.data.times.shift();
                                o.data.amplitudes.shift();
                                for(const prop in o.data.slices){
                                    o.data.slices[prop].shift();
                                    o.data.means[prop].shift();
                                }
                                o.data.count-=1;
                            }
                            return true;
                        }
                    });
                }
            });

            State.setState({FFTResult:ffts,coherenceResult:coher});
        }
        else if(msg.foo === "coherence"){
            var ffts = [...msg.output[1]];
            var coher = [...msg.output[2]];
            //console.log("out", ffts)
            ATLAS.channelTags.forEach((row, i) => {
                if(row.tag !== null && row.tag !== 'other' && i < EEG.nChannels){
                    
                    ATLAS.mapFFTData(ffts, State.data.lastPostTime, i, row.tag);
                    ATLAS.fftMap.map.find((o,i) => {
                        if(o.tag === row.tag){
                            if(o.data.count > 5000) {
                                o.data.times.shift();
                                o.data.amplitudes.shift();
                                for(const prop in o.data.slices){
                                    o.data.slices[prop].shift();
                                    o.data.means[prop].shift();
                                }
                                o.data.count-=1;
                            }
                            return true;
                        }
                    });
                }
            });
            
            ATLAS.mapCoherenceData(coher, State.data.lastPostTime);

            ATLAS.coherenceMap.map.forEach((row,i) => {
                if(row.data.count > 5000) {
                    row.data.times.shift();
                    row.data.amplitudes.shift();
                    for(const prop in row.data.slices){
                        row.data.slices[prop].shift();
                        row.data.means[prop].shift();
                    }
                    row.data.count-=1;
                }
                
            });

            //console.log(ATLAS.coherenceMap.map[0].data.count,EEG.data.counter); 

            State.setState({FFTResult:ffts,coherenceResult:coher});
            
        }
        
        if(State.data.analyze === true) {
            runEEGWorker();
        }
        
    }
}



export const resetSession = () => {
    State.data.analyze = false;
    State.data.rawFeed = false;

    setTimeout(()=>{
        EEG.resetDataBuffers();
        ATLAS.regenAtlasses();
    }, 100);

}

export const bufferEEGData = (taggedOnly=true) => {
    var buffer = [];
    var dat;
    for(var i = 0; i < ATLAS.channelTags.length; i++){
        if(i < EEG.nChannels) {
            if(taggedOnly===true) {
                if(ATLAS.channelTags[i].tag !== null && ATLAS.channelTags[i].tag !== 'other') {
                    var channel = "A"+ATLAS.channelTags[i].ch;       
                    if(State.data.useFilters === true) { 
                        dat = State.data.filtered[channel].slice(State.data.filtered[channel].length - EEG.sps, State.data.filtered[channel].length);
                    }
                    else{ 
                        dat = EEG.data[channel].slice(EEG.data.counter - EEG.sps, EEG.data.counter); 
                    }
                    //console.log(dat);
                    buffer.push(dat);
                }
            }
            else{
                var channel = "A"+ATLAS.channelTags[i].ch;
                if(State.data.useFilters === true) { dat = State.data.filtered[channel].slice(State.data.counter - EEG.sps, State.data.counter); }
                else{ dat = EEG.data[channel].slice(EEG.data.counter - EEG.sps, EEG.data.counter); }
                //console.log(channel);
                buffer.push(dat);
            }
        }
    }
    return buffer;
}    

export const runEEGWorker = () => {

    var s = State.data;
    if(EEG.data.ms[EEG.data.counter-1] - s.lastPostTime < s.workerMaxSpeed) {
        //console.log(EEG.data.ms[EEG.data.counter-1])
        setTimeout(()=>{runEEGWorker();}, s.workerMaxSpeed - (EEG.data.ms[EEG.data.counter-1] - s.lastPostTime) );
    }
    else{
        State.data.lastPostTime = EEG.data.ms[EEG.data.counter-1];
        if(s.fdBackMode === 'coherence') {
            //console.log("post to worker")
            var buf = bufferEEGData(true);

            window.postToWorker({foo:'coherence', input:[buf, s.nSec, s.freqStart, s.freqEnd, 1]});
        }
        else if (s.fdBackMode === 'multidftbandpass') {
            //console.log("post to worker")
            var buf = bufferEEGData(true);

            window.postToWorker({foo:'multidftbandpass', input:[buf, s.nSec, s.freqStart, s.freqEnd, 1]});
        }
    }
}

export const readyDataForWriting = (from=0,to=State.data.counter) => {
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
    let fft_ref_ch = null;
    ATLAS.channelTags.forEach((row,j) => {
        if(row.tag !== null && row.tag !== 'other') {
            fft_ref_ch = ATLAS.getAtlasCoordByTag(row.tag);
        }
    });
    if(fft_ref_ch !== null) {
        if(from!==0) { 
            console.log(EEG.data.ms[from])
            while (fft_ref_ch.data.times[mapidx] < EEG.data.ms[from]) {
                mapidx++;
            }
        }
    }
    for(let i = from; i<to; i++){
        let line=[];
        line.push(toISOLocal(new Date(EEG.data.ms[i])),EEG.data.ms[i]);
        ATLAS.channelTags.forEach((tag,j) => {
            if(typeof tag.ch === "number"){
                if(State.data.useFilters) {
                    line.push(State.data.filtered["A"+tag.ch][i].toFixed(3));
                }
                else { 
                    line.push(EEG.data["A"+tag.ch][i]); 
                }
                if(i===0) {
                    header.push("A"+tag.ch + ":"+tag.tag);
                }
            }
        });
        if(fft_ref_ch.data.times[mapidx] === EEG.data.ms[i]) {
            ATLAS.channelTags.forEach((tag,j) => {
                if(tag.tag !== null && tag.tag !== 'other') {
                    let coord = ATLAS.getAtlasCoordByTag(tag.tag);
                    if(mapidx===0) {
                        let bpfreqs = [...ATLAS.fftMap.shared.bandPassWindow].map((x,i) => x = x.toFixed(3));
                        header.push(coord.tag+"; FFT Hz:",bpfreqs.join(","));
                    }
                    let fftamps = [...coord.data.amplitudes[mapidx]].map((x,i) => x = x.toFixed(3));
                    line.push("fft:",fftamps.join(","));
                }
            });
            if(State.data.fdBackMode === 'coherence'){
                ATLAS.coherenceMap.map.forEach((row,j) => {
                    if(mapidx===0){
                        let bpfreqs = [...ATLAS.coherenceMap.shared.bandPassWindow].map((x,i) => x = x.toFixed(3));
                        header.push(row.tag+"; COH Hz:",bpfreqs.join(','));
                    }
                    let cohamps = [...row.data.amplitudes[mapidx]].map((x,i) => x = x.toFixed(3));
                    line.push("coh:",cohamps.join(","));
                });
            }
            mapidx++;
        }
        data.push(line.join(","));
    }
    if(State.data.useFilters) {
        header.push("No filters.");
    }
    else {
        header.push("Filters used (unless tagged 'other'): Notch 50Hz:"+State.data.notch50+"; Notch 60Hz:"+State.data.notch60+" SMA(4):"+State.data.sma4+"; Low pass 50Hz:"+State.data.lowpass50+"; Bandpass ("+State.data.filterers[0].bplower+"Hz-"+State.data.filterers[0].bpupper+"Hz):"+State.data.bandpass)
    }
    //console.log(data)
    return [header.join(",")+"\n",data.join("\n")];
}

export const updateBandPass = (freqStart, freqEnd) => {
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

export const updateChannelView = (input) => {
    var val = input; //s.channelView

    if(val.length === 0) { return; }

    var arr = val.split(",");
    ATLAS.channelTags.forEach((row,j) => { ATLAS.channelTags[j].viewing = false; });
    var newSeries = [{}];

    arr.forEach((item,i) => {
        var found = false;
        let getTags = ATLAS.channelTags.find((o, j) => {

        if((o.ch === parseInt(item)) || (o.tag === item)){
            //console.log(item);
            ATLAS.channelTags[j].viewing = true;
            found = true;
            return true;
        }
        });


        if (found === false){ //add tag
            if(!isNaN(parseInt(item))){
                ATLAS.channelTags.push({ch:parseInt(item), tag: null, viewing:true});
            }
            else {
                alert("Tag not assigned to channel: ", item);
            }
        }
    });

    //console.log(ATLAS.channelTags)
    var no_ffts_active = true; //Temp, am phasing out this option
    ATLAS.channelTags.forEach((o,i) => {
        if(o.viewing === true){
            if(o.tag !== null && o.tag !== 'other') {
                no_ffts_active = false;
            }
        }
    });
    if(no_ffts_active === true) {     
        ATLAS.channelTags.forEach((row,j) => { ATLAS.channelTags[j].viewing = true; });
    }

    if(State.data.fdBackMode === "coherence") {
        ATLAS.coherenceMap = ATLAS.genCoherenceMap(ATLAS.channelTags);
        ATLAS.coherenceMap.bandPasswindow = ATLAS.fftMap.shared.bandPassWindow;
        ATLAS.coherenceMap.shared.bandFreqs = ATLAS.fftMap.shared.bandFreqs;
        //console.log(ATLAS.coherenceMap.map);
    }

}

export function updateChannelTags (input) {
    var val = input; //s.channelTags

    if(val.length === 0) { return; }
    //console.log(val);
    var arr = val.split(";");
    //console.log(arr);
    //channelTags.forEach((row,j) => { channelTags[j].viewing = false; });

    var atlasUpdated = false;
    arr.forEach((item,i) => {
        var dict = item.split(":");
        var found = false;
        let setTags = ATLAS.channelTags.find((o, j) => {
            if(o.ch === parseInt(dict[0])){
                if(dict[1] === "delete"){
                    ATLAS.channelTags.splice(j,1);
                    atlasUpdated = true;
                }
                else{
                    let otherTags = ATLAS.channelTags.find((p,k) => {
                        if(p.tag === dict[1]){
                            ATLAS.channelTags[k].tag = null;
                            atlasUpdated = true;
                            return true;
                        }
                    });

                    //console.log(o);
                    ATLAS.channelTags[j].tag = dict[1];
                    ATLAS.channelTags[j].viewing = true;
                   
                    if(dict[2] !== undefined){
                        var atlasfound = false;
                        var searchatlas = ATLAS.fftMap.map.find((p,k) => {
                        if(p.tag === dict[1]){
                            atlasfound = true;
                            return true;
                        }
                        });
                        if(atlasfound !== true) {
                            var coords = dict[2].split(",");
                            if(coords.length === 3){
                                ATLAS.addToAtlas(dict[1],parseFloat(coords[0]),parseFloat(coords[1]),parseFloat(coords[2]))
                                atlasUpdated = true;
                            }
                        }
                    }
                }
                found = true;
                return true;
            }
            else if(o.tag === dict[1]){
                ATLAS.channelTags[j].tag = null; //Set tag to null since it's being assigned to another channel
                atlasUpdated = true;
            }
        });
        if (found === false){
            var ch = parseInt(dict[0]);
            if(!isNaN(ch) && dict[1] !== undefined) {
                if((ch >= 0) && (ch < EEG.nChannels)){
                    ATLAS.channelTags.push({ch:parseInt(ch), tag: dict[1], viewing: true});
                    if(dict[1] !== 'other') {
                        State.data.filterers.push(new biquadChannelFilterer("A"+ch,EEG.sps,true));
                    }
                    else { 
                        State.data.filterers.push(new biquadChannelFilterer("A"+ch,EEG.sps,false)); 
                    }

                    if(dict[2] !== undefined){
                        var atlasfound = false;
                        var searchatlas = ATLAS.fftMap.map.find((p,k) => {
                            if(p.tag === dict[1]){
                                atlasfound = true;
                                return true;
                            }
                        });
                        if(atlasfound !== true) {
                            var coords = dict[2].split(",");
                            if(coords.length === 3){
                                ATLAS.addToAtlas(dict[1],parseFloat(coords[0]),parseFloat(coords[1]),parseFloat(coords[2]))
                                atlasUpdated = true;
                            }
                        }
                    }
                }
            }
        }
    });

    if(atlasUpdated === true){
        ATLAS.regenAtlasses(State.data.freqStart,State.data.freqEnd,EEG.sps);
    }
    //setBrainMap();
    //setuPlot();
}


export const addChannelOptions = (selectId, taggedOnly=true, additionalOptions=[]) => {
    var select = document.getElementById(selectId);
    select.innerHTML = "";
    var opts = ``;
    ATLAS.channelTags.forEach((row,i) => {
    if(taggedOnly === true){
        if(row.tag !== null && row.tag !== 'other') {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.tag+`</option>`
              }
              else {
                opts += `<option value='`+row.ch+`'>`+row.tag+`</option>`
              }
        }
    }
    else{
        if(row.tag !== null && row.tag !== 'other') {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.tag+`</option>`
            }
            else {
                opts += `<option value='`+row.ch+`'>`+row.tag+`</option>`
            }
        }
        else {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.ch+`</option>`
            }
            else {
                opts += `<option value='`+row.ch+`'>`+row.ch+`</option>`
            }
        }
    }
    });
    if(additionalOptions.length > 0) {
        additionalOptions.forEach((option,i) => {
            opts+=`<option value='`+option+`'>`+option+`</option>`
        });
    }
    select.innerHTML = opts;
  }

export const addCoherenceOptions = (selectId, additionalOptions=[]) => {
    var select = document.getElementById(selectId);
    select.innerHTML = "";
    var opts = ``;
    ATLAS.coherenceMap.map.forEach((row,i) => {
      if(i===0) {
        opts += `<option value='`+row.tag+`' selected="selected">`+row.tag+`</option>`;
      }
      else{
        opts += `<option value='`+row.tag+`'>`+row.tag+`</option>`;
      }
    });
    if(additionalOptions.length > 0) {
        additionalOptions.forEach((option,i) => {
            opts+=`<option value='`+option+`'>`+option+`</option>`
        });
    }
    select.innerHTML = opts;

  }

export function genBandviewSelect(id){
    return `
    <select id='`+id+`'>
      <option value="scp">SCP (0.1Hz-1Hz)</option>
      <option value="delta">Delta (1Hz-4Hz)</option>
      <option value="theta">Theta (4Hz-8Hz)</option>
      <option value="alpha1" selected="selected">Alpha1 (8Hz-10Hz)</option>
      <option value="alpha2">Alpha2 (10Hz-12Hz)</option>
      <option value="beta">Beta (12Hz-35Hz)</option>
      <option value="lowgamma">Low Gamma (35Hz-48Hz)</option>
      <option value="highgamma">High Gamma (48Hz+)</option>
    </select>`;
  }