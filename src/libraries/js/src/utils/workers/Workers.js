// import Worker from 'web-worker'
let defaultWorkerThreads = 0;

import {CallbackManager} from './workerCallbacks' 

// WEBPACK
// import worker from './eeg.worker.js'
import * as worker from './eeg.worker.js'

export class WorkerManager {
    constructor(workerURL= new URL('./eeg.worker.js', import.meta.url)){
        this.workerURL = workerURL;
        this.workerResponses = [];
        this.workers = [];
        this.workerThreads = defaultWorkerThreads;
        this.workerThreadrot = 0;

        for(var i = 0; i < defaultWorkerThreads; i++){
          this.addWorker()
        }
    }

    addWorker = (workerurl=this.workerURL) => {
        console.log('add worker');

        let newWorker;

        // Swapped with webpack and snowpack
        try {
          newWorker = new worker()
        } catch {
          try {
            newWorker = new Worker(workerurl, {name:'eegworker_'+this.workers.length, type: 'module'})
          } catch (err) {
            console.log("Error, creating dummy worker (WARNING: Single Threaded). ERROR:", err);
            newWorker =  new dummyWorker(this.workerResponses)
          }
        } finally {

          let id = "worker_"+Math.floor(Math.random()*10000000000);
            
          this.workers.push({worker:newWorker, id:id});
          newWorker.onmessage = (ev) => {

              var msg = ev.data;
              this.workerResponses.forEach((foo,i) => {
                if(typeof foo === 'object') foo.callback(msg);
                else if (typeof foo === 'function') foo(msg);
              });
          };

          newWorker.onerror = (e) => {
            console.error(e)
          }

          console.log("worker threads: ", this.workers.length)
          return id; //worker id
        }
    }

    addCallback(name='',callback=(msg)=>{}) {
      if(name.length > 0 && !this.workerResponses.find((o)=>{if(typeof o === 'object') {if(o.name === name) return true;}})) {
        this.workerResponses.push({name:'',callback:callback});
      }
    }

    removeCallback(nameOrIdx='') {
      if(nameOrIdx.length > 0) {
        let idx;
        if(this.workerResponses.find((o,i)=>{if(typeof o === 'object') {if(o.name === nameOrIdx) { idx = i; return true;}}})) {
          this.workerResponses.splice(idx,1);
        }
      } else if (typeof nameOrIdx === 'number') {
        this.workerResponses.splice(nameOrIdx,1);
      }
    }

    postToWorker = (input, id = null, transfer=undefined) => {

        if (Array.isArray(input.input)){
        input.input = input.input.map(v => {
          if (typeof v === 'function') return v.toString()
          else return v
        })} 

        if(id === null) {
            this.workers[this.workerThreadrot].worker.postMessage(input,transfer);
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
                    o.worker.postMessage(input,transfer); 
                    return true;
                  }
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

        this.manager = new CallbackManager()

    }

    postMessage=(input)=>{
        let result = this.onMessage({data:input}); 
        this.workerResponses.forEach((foo,i) => {
            foo(result);
        });
    }

    terminate(){}

    onMessage = (event) => {
      // define gpu instance
      //console.log("worker executing...")
      console.time("worker");
      let output = "function not defined";
    
      this.manager.callbacks.find((o,i)=>{
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