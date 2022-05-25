//Main thread control of workers

import { Router } from "../../core/Router";
import { Service } from "../../core/Service";
import { randomId } from "../../common/id.utils";
import { parseFunctionFromText, } from "../../common/parse.utils";

import worker from './server.worker'
//import { workerRenderer } from './old/oldlib/workerRenderer/workerRenderer';

//Runs on main thread
class WorkerService extends Service {
    id:string=randomId('worker');
    name:string='worker';
    defaultRoutes:any[];
    Router:Router;
    url:any;
    responses = [];
    workers = [];
    threads = 1;
    threadrot = 0;
    toResolve = {};
    routes = [
      {
        route:'workerPost',
        callback:(self,graphOrigin,router,origin,...args)=>{
          console.log('worker message received!', args, origin);
          return;
        }
      },
      {
        route:'addworker',
        callback:(self,graphOrigin,router,origin,...args)=>{
          let id = this.addWorker(args[0],args[1]); //can specify a url and module type 
          if(this.workers.length > 0 ) {
            this.workers.forEach((w) => { //set up message channels for each thread to talk to each other
              if(w.id !== id) {
                this.establishMessageChannel(
                  id,w.id
                );
              }
            });
          }
          return id;
        }
      },
      {
        route:'terminate',
        callback:(self,graphOrigin,router,origin,...args)=>{
          return this.terminate(args[0]); //specify worker id or terminate all workers
        }
      },
      {
        route:'addcallback',
        callback:(self,graphOrigin,router,origin,...args)=>{
            if(!args[0] && !args[1]) return;
            let func = parseFunctionFromText(args[1]);
            if(func) this.addCallback(args[0],func);
            return true;
        }
      },
      {
        route:'removecallback',
        callback:(self,graphOrigin,router,origin,...args)=>{
            if(args[0]) this.removeCallback(args[0]);
            return true;
        }
      },
      {
        route:'run',
        callback:(self,graphOrigin,router,origin,...args)=>{
            let c = this.responses.find((o) => {
                if(o.name === args[0]) {
                    return true;
                }
            });
            if(c && args[1]) return c.callback(args[1]); 
            return;
        }
      }
    ];

    constructor(Router:Router, url:string|URL, nThreads:number=0) {
        super(Router);

        this.Router = Router;
        this.threads = nThreads; 
        this.url = url;
  
        let i = 0;
  
        while(i < nThreads){
          this.addWorker(); 
          i++;
        }
  
    }
  
      //return the worker by id, or the first worker (e.g. the default one)
    getWorker(id:string|number) {
        if(id) return this.workers.find((o) => {if(o.id === id) return true}).worker;
        else return this.workers[0].worker;
    }
  
    addWorker = (url:string|URL=this.url, type:WorkerType = 'module') => {
  
          let newWorker:Worker;
          try {
            if (!url) newWorker = new Worker(worker as any); //import will be replaced with blob
            else {
              if (!(url instanceof URL)) url = new URL(url, import.meta.url)
              newWorker = new Worker(url, {name:'worker_'+this.workers.length, type});
            }
          } catch (err) {
            //   try { //blob worker which works in principle 
            //     if(!document.getElementById('blobworker')) {
            //       document.head.insertAdjacentHTML('beforeend',`
            //         <script id='blobworker' type='javascript/worker'>
            //           //gotta handle imports
            //           self.onmessage = (event) => {
            //                console.log(event);
            //            }
            //         </script>
            //       `);
            //     }
            //     let blob = new Blob([
            //       document.querySelector('#blobworker').textContent
            //     ], {type:"text/javascript"});
            //     console.log("Blob worker!");
            //     newWorker = new Worker(window.URL.createObjectURL(blob));
            //   } catch(err3) { console.error(err3); }      
          }
          finally {
            if (newWorker){
  
            let id = "worker_"+Math.floor(Math.random()*10000000000);

            let messageport = new MessageChannel();
              
            this.workers.push({worker:newWorker, id:id, port:messageport.port1});
            this[id] = messageport.port1;

            let onmessage = (ev) => {
  
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

              this.notify(msg, undefined, msg.origin);

            };

            newWorker.onmessage = onmessage;
            messageport.port1.onmessage = onmessage;
  
            let onerror  = (e) => {
              console.error(e)
            }

            newWorker.onerror = onerror;

            console.log("server threads: ", this.workers.length);
            
            newWorker.postMessage({workerId:id, port:messageport.port2, origin:this.id},[messageport.port2]);

            return id; //worker id
          } else return;
        }
    }
  
      //automated responses
    addCallback(name:string,callback:(result)=>{}) {
        if(name.length > 0 && !this.responses.find((o)=>{if(typeof o === 'object') {if(o.name === name) return true;} return})) {
          this.responses.push({name:name,callback:callback});
        }
    }
  
      //remove automated response by name
    removeCallback(nameOrIdx:string) {
        if(nameOrIdx.length > 0) {
          let idx;
          if(this.responses.find((o,i)=>{if(typeof o === 'object') {if(o.name === nameOrIdx) { idx = i; return true;}}  return})) {
            if (idx) this.responses.splice(idx,1);
          }
        } else if (typeof nameOrIdx === 'number') {
          this.responses.splice(nameOrIdx,1);
        }
    }
  
      
    //run from the list of callbacks on an available worker
    async run(
      functionName:string,
      args:any[]|{},
      workerId:string|number|undefined,
      origin:string|number|undefined,
      transfer:any[]|undefined,
      callback?:(res)=>{}
    ) {
        if(functionName) {
          if(functionName === 'transferClassObject') {
            if(typeof args === 'object' && !Array.isArray(args)) {
              for(const prop in args) {
                if(typeof args[prop] === 'object' && !Array.isArray(args[prop])) (args[prop] as any) = (args[prop] as any).toString();
              }
            }
          }
          let dict = {route:functionName, message:args, origin:origin};
          return await this.post((dict as any),workerId,transfer,callback);
        }
    }

    
    post = (
      input:{route:string,message:any[]|{},origin:string|number|undefined}, 
      workerId:string|number|undefined, 
      transfer:any[], 
      callback?:(result)=>{}
    ) => {

        return new Promise(resolve => {
          //console.log('posting',input,id);
          if(typeof input !== 'object') {
            input = {route:'',message:input, origin:this.id};
          }
          
          const resolver = (res) => 
          {    
              if (callback) {
                  callback(res);
              }
              resolve(res);
          }
        
          (input as any).callbackId = Math.floor(1000000 * Math.random());
          this.toResolve[(input as any).callbackId] = resolver;
          

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

      terminate(workerId:string|number|undefined) {
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
  
      close = this.terminate;

    //this creates a message port so particular event outputs can directly message another worker and save overhead on the main thread
    establishMessageChannel(
        worker1Id:string|number,
        worker2Id:string|number,
    ) 
    {
        let channel = new MessageChannel();
        let port1 = channel.port1;
        let port2 = channel.port2;

        //transfer the ports and hook up the responses 
        this.run('worker/addport',[port1],worker1Id,worker2Id,[port1]);
        this.run('worker/addport',[port2],worker2Id,worker1Id,[port2]);

    }
}


export default WorkerService