import Worker from 'web-worker'

let workerURL = './_dist_/libraries/js/src/utils/eeg.worker.js';
let defaultWorkerThreads = 0;

let eegWorkers = [];

import { gpuUtils } from './utils/gpuUtils.js';
import { eegmath } from './utils/eegmath';

const gpu = new gpuUtils();

// // WEBPACK
import worker from './utils/eeg.worker.js'

for(var i = 0; i < defaultWorkerThreads; i++){
    eegWorkers.push(new worker())
}

// SNOWPACK
 
// for(var i = 0; i < defaultWorkerThreads; i++){
//     eegWorkers.push(
//         new Worker(
//             workerURL,
//             {name:'eegworker_'+i, type: 'module'}
//         )
//     )
// }



export class WorkerManager {
    constructor(){
        this.workerResponses = []
        this.workers = []
        this.workerThreads = defaultWorkerThreads
        this.workerThreadrot = 0

        // Setup EEG Workers
        try {
            for(var i = 0; i < eegWorkers.length; i++){

                eegWorkers[i].onmessage = (e) => {
                    var msg = e.data;
                    //console.log(msg)
                    //window.receivedMsg(msg);
                    this.workerResponses.forEach((foo,i) => {
                        foo(msg);
                    });
                };
                let id = "worker_"+Math.floor(Math.random()*10000000000);
                this.workers.push({worker:eegWorkers[i],id:id});
            }
            console.log("worker threads: ", this.workers.length)
        }
        catch (err) {
            console.error(err);
        }
    }

    addWorker = (workerurl='./_dist_/libraries/js/src/utils/eeg.worker.js') => {
        console.log('add worker');
        try {
            let id = "worker_"+Math.floor(Math.random()*10000000000);
            let newWorker = new Worker(workerurl,//new URL(workerurl, import.meta.url),
            {name:'eegworker_'+this.workers.length, type: 'module',});
            this.workers.push({worker:newWorker, id:id});
            newWorker.onmessage = (ev) => {
                var msg = ev.data;
                //console.log(msg)
                //window.receivedMsg(msg);
                this.workerResponses.forEach((foo,i) => {
                    foo(msg);
                });
            };
            console.log("worker threads: ", this.workers.length)
            return id; //worker id
        } catch (err) {
            console.log("Error, creating dummy worker (WARNING: Single Threaded). ERROR:", err);
            return this.createDummyWorker();
        }
    }

    createDummyWorker = () => {
        let id = "worker_"+Math.floor(Math.random()*10000000000);
        this.workers.push({worker:new dummyWorker(this.workerResponses), id:id});
        return id;
    }

    postToWorker = (input, id = null) => {
        if(id === null) {
            this.workers[this.workerThreadrot].worker.postMessage(input);
            if(this.workerThreads > 1){
                this.workerThreadrot++;
                if(this.workerThreadrot >= this.workerThreads){
                    this.workerThreadrot = 0;
                }
            }
        }
        else{
            this.workers.find((o)=>{
                if(o.id === id) {
                    o.worker.postMessage(input); 
                    return true;}
            })
        }
    }

    terminate(id) {
        let idx;
        let found = this.workers.find((o,i)=>{
            if(o.id === id) {
                idx=i;
                o.worker.terminate();
                return true;
            }
        });
        if(found) {
            this.workers.splice(idx,1);
            return true;
        } else return false;
    }
}

//for single threaded applications
class dummyWorker {
    constructor(workerResponses) {
        this.workerResponses = workerResponses;
    }
    onmessage(msg){
        this.workerResponses.forEach((foo,i) => {
            foo(msg);
        });
    }

    postMessage=(input)=>{
        let result = this.onMessage({data:input}); 
        this.onmessage(result);
    }
    terminate(){}

    onMessage=(event) => {
        // define gpu instance
        //console.log("worker executing...")
        console.time("worker");
        let output = "function not defined";
      
        let callbacks = [
          {case:'addfunc',callback:(args)=>{ //arg0 = name, arg1 = function string (arrow or normal)
      
            //Get the text inside of a function (regular or arrow);
            getFunctionBody = (methodString) => {
              return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
            }
      
            getFunctionHead = (methodString) => {
              return methodString.slice(0,methodString.indexOf('{') + 1);
            }
      
            let newFuncHead = getFunctionHead(args[1]);
            let newFuncBody = getFunctionBody(args[1]);
            let newFunc = eval(newFuncHead+newFuncBody+"}");
      
            let newCallback = {case:args[0],callback:newFunc};
            callbacks.push(newCallback);
      
          }},
          {case:'xcor', callback:(args)=>{return eegmath.crosscorrelation(...args);}},
          {case:'autocor', callback:(args)=>{return eegmath.autocorrelation(args);}},
          {case:'cov1d', callback:(args)=>{return eegmath.cov1d(...args);}},
          {case:'cov2d', callback:(args)=>{return eegmath.cov2d(args);}},
          {case:'sma', callback:(args)=>{return eegmath.sma(...args);}},
          {case:'dft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return gpu.gpuDFT(...args);
          }},
          {case:'multidft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return gpu.MultiChannelDFT(...args);
          }},
          {case:'multidftbandpass', callback:(args)=>{
            if(args[4] == undefined) args[4] = 1;
            return gpu.MultiChannelDFT_Bandpass(...args);
          }},
          {case:'fft', callback:(args)=>{ 
            if(args[2] == undefined) args[2] = 1;
            return gpu.gpuFFT(...args);
          }},
          {case:'multifft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return gpu.MultiChannelFFT(...args);
          }},
          {case:'multifftbandpass', callback:(args)=>{
            if(args[4] == undefined) args[4] = 1;
            return gpu.MultiChannelFFT_Bandpass(...args);
          }},
          {case:'gpucoh', callback:(args)=>{return gpu.gpuCoherence(...args);}},
          {case:'coherence', callback:(args)=>{
            const correlograms = eegmath.correlograms(args[0]);
            const buffer = [...args[0],...correlograms];
            var dfts;
      
            var scalar = 1;
            //console.log(mins)
            //console.log(buffer);
            dfts = gpu.MultiChannelDFT_Bandpass(buffer, args[1], args[2], args[3], scalar);
            //console.log(dfts)
            const cordfts = dfts[1].splice(args[0].length, buffer.length-args[0].length);
            //console.log(cordfts)
      
            const coherenceResults = [];
            const nChannels = args[0].length;
      
            //cross-correlation dfts arranged like e.g. for 4 channels: [0:0, 0:1, 0:2, 0:3, 1:1, 1:2, 1:3, 2:2, 2:3, 3:3] etc.
            var k=0;
            var l=0;
            cordfts.forEach((row,i) => { //move autocorrelation results to front to save brain power
              if (l+k === nChannels) {
                var temp = cordfts.splice(i,1);
                k++;
                cordfts.splice(k,0,...temp);
                l=0;
                //console.log(i);
              }
              l++;
            });
            //Now arranged like [0:0,1:1,2:2,3:3,0:1,0:2,0:3,1:2,1:3,2:3]
      
            //Outputs FFT coherence data in order of channel data inputted e.g. for 4 channels resulting DFTs = [0:1,0:2,0:3,1:2,1:3,2:3];
      
            var autoFFTproducts = [];
            k = 0;
            l = 1;
            cordfts.forEach((dft,i) => {
              var newdft = new Array(dft.length).fill(0);
              if(i < nChannels) { //sort out autocorrelogram FFTs
                dft.forEach((amp,j) => {
                  newdft[j] = amp//*dfts[1][i][j];
                });
                autoFFTproducts.push(newdft);
              }
              else{ //now multiply cross correlogram ffts and divide by autocorrelogram ffts (magnitude squared coherence)
                dft.forEach((amp,j) => {
                    newdft[j] = amp*amp/(autoFFTproducts[k][j]*autoFFTproducts[k+l][j]);//Magnitude squared coherence;
                    if(newdft[j] > 1) { newdft[j] = 1; } //caps the values at 1
                    //newdft[j] = Math.pow(newdft[j],.125)
                });
                l++;
                if((l+k) === nChannels) {
                  k++;
                  l = 1;
                }
                coherenceResults.push(newdft);
              }
            });
            return [dfts[0], dfts[1], coherenceResults];
          }}
        ];
      
        callbacks.find((o,i)=>{
          if(o.case === event.data.foo) {
            output = o.callback(event.data.input);
            return true;
          }
        });
      
        // output some results!
        console.timeEnd("worker");
      
          return {output: output, foo: event.data.foo, origin: event.data.origin};

    }
}