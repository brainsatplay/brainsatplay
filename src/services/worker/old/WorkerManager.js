
import {CallbackManager} from './lib/workerCallbacks' 

import worker from './magic.worker' // internal worker

import { Events } from './lib/utils/Event';
import { ProxyElement, initProxyElement } from './lib/frontend/ProxyElement';
import { ThreadedCanvas } from './lib/frontend/ThreadedCanvas';

export class WorkerManager {
    url;
    responses = [];
    workers = [];
    threads = 0;
    threadrot = 0;
    events;
    subEvent;
    unsubEvent;
    addEvent;
    toResolve = {};
    ProxyElement = ProxyElement;
    initProxyElement = initProxyElement;
    ThreadedCanvas = ThreadedCanvas; //class reference

    constructor(url, nThreads=1, Router){
      this.url = url;
      this.responses = [];
      this.workers = [];
      this.threads = nThreads;
      this.threadrot = 0;

      this.EVENTS = new Events(this);
      this.subEvent = (eventName, result=(_)=>{})=>{this.EVENTS.subEvent(eventName,result);}
      this.unsubEvent = (eventName, sub) => {this.EVENTS.unsubEvent(eventName,sub)};
      this.addEvent = async (eventName, origin, foo, id) => {return await this.EVENTS.addEvent(eventName, origin, foo, id)};

      let i = 0;

      while(i < nThreads){
        this.addWorker(); 
        i++;
      }

    }

    //return the worker by id, or the first worker (e.g. the default one)
    getWorker(id) {
      if(id) return this.workers.find((o) => {if(o.id === id) return true}).worker;
      else return this.workers[0].worker;
    }

    addWorker = (url=this.url, type = 'module') => {

        let newWorker;
        try {
          if (url == null) newWorker = worker()
          else {
            if (!(url instanceof URL)) url = new URL(url, import.meta.url)
            newWorker = new Worker(url, {name:'worker_'+this.workers.length, type})
          }
        } catch (err) {
          try{
            console.log("Error, creating dummy worker (WARNING: Single Threaded). ERROR:", err);
            newWorker =  new DummyWorker(this.responses);
          } catch(err2) {console.error("DummyWorker Error: ",err2);}
            // try { //blob worker which works in principle but gpujs doesn't want to transfer correctly, how do we fix it?
            //   let threeUtil;
            //   if(includeThree) {
            //     await new Promise(async (resolve)=>{
            //       let module = await this.dynamicImport('./workerThreeUtils.js');
            //       resolve(module);
            //     }).then((module) => {
            //       threeUtil = new module.threeUtil();
            //     });
            //   }

            //   let mgr = CallbackManager;

            //   if(!document.getElementById('blobworker')) {
            //     document.head.insertAdjacentHTML('beforeend',`
            //       <script id='blobworker' type='javascript/worker'>
            //         //gotta handle imports
            //         const GPU = ${mgr.GPUUTILSCLASS.GPU.toString()};
            //         console.log(GPU, GPU.__proto__.constructor.name);
            //         const gpuUtils = ${mgr.GPUUTILSCLASS.toString()};
            //         const Math2 = ${mgr.MATH2.toString()};
            //         const ProxyManager = ${mgr.PROXYMANAGERCLASS.toString()};
            //         const StateManager = ${mgr.EVENTSCLASS.STATEMANAGERCLASS.toString()};
            //         const Events = ${mgr.EVENTSCLASS.toString()};
                    
            //         ${CallbackManager.toString()}

            //         let manager = new CallbackManager();
            //         manager.threeUtil = ${threeUtil?.toString()}
            //         let canvas = manager.canvas; 
            //         let ctx = manager.canvas.context;
            //         let context = ctx; //another common reference
            //         let counter = 0;

            //         self.onmessage = ${worker.onmessage.toString()}
            //       </script>
            //     `);
            //   }
            //   let blob = new Blob([
            //     document.querySelector('#blobworker').textContent
            //   ], {type:"text/javascript"});

            //   console.log("Blob worker!");
            //   newWorker = new Worker(window.URL.createObjectURL(blob));
            // } catch(err3) { console.error(err3); }
          
        }
        finally {
          if (newWorker){

          let id = "worker_"+Math.floor(Math.random()*10000000000);
            
          this.workers.push({worker:newWorker, id:id});

          newWorker.onmessage = (ev) => {

              var msg = ev.data;

              // Resolve 
              let toResolve = this.toResolve[ev.data.callbackId];
              if (toResolve) {
                toResolve(msg.output);
                delete this.toResolve[ev.data.callbackId]
              }

              // Run Response Callbacks
              this.responses.forEach((foo,_) => {
                if(typeof foo === 'object') foo.callback(msg);
                else if (typeof foo === 'function') foo(msg);
              });
          };

          newWorker.onerror = (e) => {
            console.error(e)
          }

          console.log("magic threads: ", this.workers.length)
          return id; //worker id
        } else return
      }
    }

    //automated responses
    addCallback(name='',callback=(result)=>{}) {
      if(name.length > 0 && !this.responses.find((o)=>{if(typeof o === 'object') {if(o.name === name) return true;} return})) {
        this.responses.push({name:name,callback:callback});
      }
    }

    //remove automated response by name
    removeCallback(nameOrIdx='') {
      if(nameOrIdx.length > 0) {
        let idx;
        if(this.responses.find((o,i)=>{if(typeof o === 'object') {if(o.name === nameOrIdx) { idx = i; return true;}}  return})) {
          if (idx) this.responses.splice(idx,1);
        }
      } else if (typeof nameOrIdx === 'number') {
        this.responses.splice(nameOrIdx,1);
      }
    }

    //add a callback to a worker
    async addFunction(functionName,fstring,workerId,origin,callback=(result)=>{}) {
      if(functionName && fstring) {
        if(typeof fstring === 'function') fstring = fstring.toString();
        let dict = {foo:'addfunc',args:[functionName,fstring],origin:origin}; //post to the specific worker
        if(!workerId) {
          this.workers.forEach((w) => {this.post(dict,w.id,callback);});
          return true;
        } //post to all of the workers
        else return await this.post(dict,workerId,callback);
      }
    }

    //alias
    addWorkerFunction = this.addFunction

    //run from the list of callbacks on an available worker
    async run(functionName,args,workerId,origin,transfer,callback=(result)=>{}) {
        if(functionName) {
          if(functionName === 'transferClassObject') {
            if(typeof args === 'object' && !Array.isArray(args)) {
              for(const prop in args) {
                if(typeof args[prop] === 'object' && !Array.isArray(args[prop])) args[prop] = args[prop].toString();
              }
            }
          }
          let dict = {foo:functionName, args:args, origin:origin};
          return await this.post(dict,workerId,transfer,callback);
        }
    }

    //aliases
    runWorkerFunction = this.run
    runFunction = this.run

    //a way to set variables on a thread
    async setValues(values={},id,origin,transfer) {
      if(id)
        return await this.run('setValues',values,id,origin,transfer);
      else {
        this.workers.forEach((w) => {
          this.run('setValues',values,w.id,origin,transfer);
        })
      }
    }

    //this creates a message port so particular event outputs can directly message another worker and save overhead on the main thread
    establishMessageChannel(
      eventName,
      worker1Id,
      worker2Id,
      worker2Response, //onEvent=(self,args,origin)=>{} //args will be the output
      functionName, 
      origin) 
    {
      let channel = new MessageChannel();
      let port1 = channel.port1;
      let port2 = channel.port2;

      this.run(
        'addevent',
        [
          eventName,
          functionName,
          port1
        ],
        worker1Id,
        origin,
        [port1]
      );

      this.run(
        'addevent',
        [
          eventName,
          eventName,
          port2
        ],
        worker2Id,
        origin,
        [port2]
      );

      if(typeof worker2Response === 'function')
        this.run(
          'subevent',
          [
            eventName,
            worker2Response.toString()
          ],
          worker2Id,
          origin
        );

    }

    post = (input, workerId, transfer, callback=(result)=>{}) => {

      return new Promise(resolve => {
        //console.log('posting',input,id);
        if (Array.isArray(input.input)){
        input.input = input.input.map((v) => {
          if (typeof v === 'function') return v.toString();
          else return v;
        })} 

        const resolver = (res) => 
          {    
              if (callback) {
                  callback(res);
              }
              resolve(res);
          }

        input.callbackId = Math.floor(1000000 * Math.random());
        this.toResolve[input.callbackId] = resolver;

        if(workerId == null) {
            const worker = this.workers?.[this.threadrot]?.worker
            if (worker){
              worker.postMessage(input,transfer);
              if(this.threads > 1){
                  this.threadrot++;
                  if(this.threadrot >= this.threads){
                      this.threadrot = 0;
                  }
              }
            }
        }
        else{
            this.workers.find((o)=>{
                if(o.id === workerId) {
                    o.worker.postMessage(input,transfer); 
                    return true;
                  } else return;
            });
        }

      })
    }

    postToWorker = this.post

    terminate(workerId) {
      if(!workerId) {
        this.workers.forEach((o) => o.worker.terminate()); //terminate all
      }
      else {
        let idx;
        let found = this.workers.find((o,i)=>{
            if(o.id === workerId) {
                idx=i;
                o.worker.terminate();
                return true;
            } else return
        });
        if(found && idx) {
            this.workers.splice(idx,1);
            return true;
        } else return false;
      }
    }

    close = this.terminate

}




//for single threaded applications

class DummyWorker {

  responses
  manager

    constructor(responses) {
        this.responses = responses;

        this.manager = new CallbackManager();
        this.counter = 0;

    }

    postMessage= async (input)=>{
        let result = await this.onmessage({data:input}); 
        this.responses.forEach((foo,_) => {
            foo(result);
        });
    }

    terminate(){}

    onerror = () => {}

    onmessage = async (event) => {
      // define gpu instance
      //console.log("worker executing...")
      //console.time("single threaded worker");
      if(!event.data) return undefined;
      let output = undefined;
    
      let functionName; 
      
      if(event.data.foo) functionName = event.data.foo;
      else if(event.data.case) functionName = event.data.case;
      else if (event.data.cmd) functionName = event.data.cmd;
      else if (event.data.command) functionName = event.data.command;

      let callback = this.manager.callbacks.get(functionName);

      if(callback && event.data.input) output = await callback(this, event.data.input, event.data.origin);
      else if(callback && event.data.args) output = await callback(this, event.data.args, event.data.origin);
      else if (callback) output = await callback(this,undefined,event.data.origin);

      // output some results!
      //console.timeEnd("single threaded worker");
    
      return {output: output, foo: event.data.foo, origin: event.data.origin, callbackId: event.data.callback, counter:this.counter++};
    
    }
  }