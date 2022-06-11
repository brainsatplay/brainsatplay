import { Service, Routes, ServiceMessage } from "../Service";
import Worker from 'web-worker' //cross platform 

declare var WorkerGlobalScope;

export type WorkerProps = {
    url:URL|string,
    _id?:string|number,
    port?:MessagePort, //message channel for this instance
    onmessage?:(ev)=>void,
    onerror?:(ev)=>void
}

export type WorkerInfo = {
    worker:Worker,
    send:(message:any)=>void,
    request:(message:any)=>Promise<any>
} & WorkerProps

//this spawns the workers
export class WorkerService extends Service {
    
    name='worker'
    
    workers:{
        [key:string]:WorkerInfo
    }={}

    threadRot = 0; //thread rotation if not specifying

    constructor(routes?:Routes, name?:string, ) {
        super(routes, name);
    }

    addWorker = (options:{
        url:URL|string,
        _id:string,
        onmessage?:(ev)=>void,
        onerror?:(ev)=>void
    }) => { //pass file location, web url, or javascript dataurl string
        if(options.url) {
            
            let worker = new Worker(options.url);
            if(!options._id) 
                options._id = `worker${Math.floor(Math.random()*1000000000000000)}`;

            let send = (message:any,transfer?:any) => {
                return this.transmit(message,worker,transfer);
            }

            let request = (message:ServiceMessage|any, transfer?:any, origin?:string, method?:string) => {
                return new Promise ((res,rej) => {
                    let callbackId = Math.random();
                    let req = {route:'runRequest', args:[message,options._id,callbackId]} as any;
                    if(origin) req.origin = origin;
                    if(method) req.method = method;
                    let onmessage = (ev)=>{
                        if(ev.data instanceof Object) {
                            if(ev.data.callbackId === callbackId) {
                                worker.removeEventListener('message',onmessage);
                                res(ev.data); //resolve the request with the corresponding message
                            }
                        }
                    }
                    worker.addEventListener('message',onmessage)
                    this.transmit(req, worker, transfer);
                });
            }

            if(!options.onmessage) options.onmessage = (ev) => {
                let res = this.receive(ev.data);
                this.setState({[options._id]:res});
            }

            if(!options.onerror) {
                options.onerror = (ev) => {
                    console.error(ev.data);
                }
            }

            worker.onmessage = options.onmessage;
            worker.onerror = options.onerror;

            this.workers[options._id] = {
                worker,
                send,
                request,
                ...options
            }
        }
    }

    transmit = (message:ServiceMessage|any, worker?:Worker|string, transfer?:any[]) => {
        if(worker instanceof Worker) {
            worker.postMessage(message,transfer);
        } else if(Object.getPrototypeOf(worker) === String.prototype) {
            this.workers[worker as string].worker.postMessage(message,transfer);
        } else {
            let keys = Object.keys(this.workers);
            this.workers[keys[this.threadRot]].worker.postMessage(message,transfer);
            this.threadRot++;
            if(this.threadRot === keys.length) this.threadRot = 0;
        }
        return message;
    }

    terminate = (worker:Worker|string) => {
        if(typeof worker === 'string') {
            let obj = this.workers[worker];
            if(obj) delete this.workers[worker];
            worker = obj.worker;
        }
        if(worker instanceof Worker) {
            worker.terminate();
        }
    }

    //if no second id provided, message channel will exist to this thread
    establishMessageChannel = (workerId:Worker, worker2Id?:Worker) => {

    }

    request = (message:ServiceMessage|any, worker:Worker, transfer?:any, origin?:string, method?:string) => {
        return new Promise ((res,rej) => {
            let callbackId = Math.random();
            let req = {route:'runRequest', args:message, callbackId} as any;
            if(origin) req.origin = origin;
            if(method) req.method = method;
            let onmessage = (ev)=>{
                if(ev.data instanceof Object) {
                    if(ev.data.callbackId === callbackId) {
                        worker.removeEventListener('message',onmessage);
                        res(ev.data); //resolve the request with the corresponding message
                    }
                }
            }
            worker.addEventListener('message',onmessage)
            this.transmit(req, worker, transfer);
        })
    }

    runRequest = (message:ServiceMessage|any, worker:undefined|string|Worker|MessagePort, callbackId:string|number) => {   
        let res = this.receive(message);
        if(typeof worker === 'string' && this.workers[worker]) {
            if(this.workers[worker].port) worker = this.workers[worker].port;
            else worker = this.workers[worker].worker;
        }
        if(res instanceof Promise) {
            res.then((r) => {
                if(worker instanceof Worker || worker instanceof MessagePort) 
                    worker.postMessage({args:res,callbackId})
                else if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
                    globalThis.postMessage({args:res,callbackId});
            });
        } else {
            if(worker instanceof Worker || worker instanceof MessagePort) 
                worker.postMessage({args:res,callbackId})
            else if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
                globalThis.postMessage({args:res,callbackId});
        }
    }

    routes:Routes={
        addWorker:this.addWorker,
        request:this.request,
        runRequest:this.runRequest
    }

}