// import Worker from 'web-worker'

let defaultWorkerThreads = 0;

import {CallbackManager} from './utils/workerCallbacks' 

// WEBPACK
// import worker from './utils/eeg.worker.js'

// SNOWPACK
let workerURL = new URL('./utils/eeg.worker.js', import.meta.url)

export class WorkerManager {
    constructor(){
        this.workerResponses = [];
        this.workers = [];
        this.workerThreads = defaultWorkerThreads;
        this.workerThreadrot = 0;

        for(var i = 0; i < defaultWorkerThreads; i++){
          this.addWorker(workerURL)
        }

        try {
          this.workerURL = workerURL
        } catch {this.workerURL = null}
    }

    addWorker = (workerurl=this.workerURL) => {
        console.log('add worker');
        try {

            let id = "worker_"+Math.floor(Math.random()*10000000000);
            
            let newWorker
            if (this.workerURL != null) {
              newWorker = new Worker(workerurl, {name:'eegworker_'+this.workers.length, type: 'module'})
            } else {
              newWorker = new worker()
            }
            
            
            this.workers.push({worker:newWorker, id:id});
            newWorker.onmessage = (ev) => {
                var msg = ev.data;
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

        if (Array.isArray(input.input)){
        input.input = input.input.map(v => {
          if (typeof v === 'function') return v.toString()
          else return v
        })} 

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

        this.parseFunctionFromText = (method) => {
          //Get the text inside of a function (regular or arrow);
          let getFunctionBody = (methodString) => {
            return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
          }
        
          let getFunctionHead = (methodString) => {
            return methodString.slice(0,methodString.indexOf('{') + 1);
          }
        
          let newFuncHead = getFunctionHead(method);
          let newFuncBody = getFunctionBody(method);
        
          let newFunc = eval(newFuncHead+newFuncBody+"}");
        
          return newFunc;
        
        }
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