import { Service, Routes, ServiceMessage, ServiceOptions, Route } from "../Service";
import Worker from 'web-worker' //cross platform for node and browser
import { GraphNodeProperties } from "../../Graph";

declare var WorkerGlobalScope;

export type WorkerRoute = {
    worker: string|URL|Blob,
    workerId?: string
} & GraphNodeProperties & WorkerProps

export type WorkerProps = {
    url?:URL|string|Blob,
    _id?:string,
    port?:MessagePort, //message channel for this instance
    onmessage?:(ev)=>void,
    onerror?:(ev)=>void
}

export type WorkerInfo = {
    worker:Worker,
    send:(message:any,transfer?:any)=>void,
    request:(message:any, transfer?:any, origin?:string, method?:string)=>Promise<any>,
    post:(route:any, args?:any, transfer?:any)=>void,
    run:(route:any, args?:any, transfer?:any, origin?:string, method?:string)=>Promise<any>
} & WorkerProps

//this spawns the workers
export class WorkerService extends Service {
    
    name='workers'
    
    workers:{
        [key:string]:WorkerInfo
    }={}

    threadRot = 0; //thread rotation if not specifying

    constructor(options?:ServiceOptions) {
        super(options);
        this.load(this.routes);
    }

    customRoutes:ServiceOptions["customRoutes"] = {
        'worker':(route:Route | WorkerRoute,routeKey:string,routes:Routes) => {
            let rt = route as WorkerRoute;
            if(rt.worker || rt.workerId) { //each set of props with a worker will instantiate a new worker, else you can use the same worker elsewhere by passing the corresponding tag
                if(rt.worker) rt.url = rt.worker;
                if(rt.workerId) rt.tag = rt.workerId;
                if(!rt.tag) rt.tag = routeKey;
                if(!rt._id) rt._id = routeKey;

                let worker;
                if(this.workers[rt._id]) worker = this.workers[rt._id];
                if(!worker) worker = this.addWorker(rt);
        
                if(worker) {
                    if(!rt.operator) {
                        rt.operator = (...args) => {
                            if(!this.nodes.get(rt.tag)?.children) worker.send(args);
                            else return worker.request(args);
                        }
                    }
                }
            }
        }
    }

    //customChildren:ServiceOptions["customChildren"] = {} //todo, create message ports between workers with parent/child relationships and set up pipes

    addWorker = (options:{
        url?:URL|string|Blob,
        port?:MessagePort,
        _id?:string,
        onmessage?:(ev)=>void,
        onerror?:(ev)=>void
    }) => { //pass file location, web url, or javascript dataurl string
        let worker;

        if(!options._id) 
            options._id = `worker${Math.floor(Math.random()*1000000000000000)}`;

        if(options.url) worker = new Worker(options.url);
        else if (options.port) {
            worker = options.port;
        } else if (this.workers[options._id]) {
            if(this.workers[options._id].port) worker = this.workers[options._id].port;
            else worker = this.workers[options._id].worker;
        }

        if(!worker) return;

        let send = (message:any,transfer?:any) => {
            //console.log('sent', message)
            return this.transmit(message,worker,transfer);
        }

        let post = (route:any,args?:any,transfer?:any, origin?:string, method?:string) => {
            //console.log('sent', message)
            let message:any = {
                route,
                args
            };
            if(origin) message.origin = origin;
            if(method) message.method = method;

            return this.transmit(message,worker,transfer);
        }

        let run = (route:any,args?:any, transfer?:any, origin?:string, method?:string) => {
            return new Promise ((res,rej) => {
                let callbackId = Math.random();
                let req = {route:'runRequest', args:[{route, args}, options._id, callbackId]} as any;
                //console.log(req)
                if(origin) req.args[0].origin = origin;
                if(method) req.args[0].method = method;
                let onmessage = (ev)=>{
                    if(typeof ev.data === 'object') {
                        if(ev.data.callbackId === callbackId) {
                            worker.removeEventListener('message',onmessage);
                            res(ev.data.args); //resolve the request with the corresponding message
                        }
                    }
                }
                worker.addEventListener('message',onmessage)
                this.transmit(req, worker, transfer);
            });
        }
        
        let request = (message:ServiceMessage|any, transfer?:any, origin?:string, method?:string) => {
            return new Promise ((res,rej) => {
                let callbackId = Math.random();
                let req = {route:'runRequest', args:[message,options._id,callbackId]} as any;
                //console.log(req)
                if(origin) req.origin = origin;
                if(method) req.method = method;
                let onmessage = (ev)=>{
                    if(typeof ev.data === 'object') {
                        if(ev.data.callbackId === callbackId) {
                            worker.removeEventListener('message',onmessage);
                            res(ev.data.args); //resolve the request with the corresponding message
                        }
                    }
                }
                worker.addEventListener('message',onmessage)
                this.transmit(req, worker, transfer);
            });
        }

        if(!options.onmessage) options.onmessage = (ev) => {
            let res = this.receive(ev.data);
            this.setState({[options._id as string]:res});
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
            post,
            run,
            request,
            ...options
        }

        return this.workers[options._id];
    }

    //new Worker(urlFromString)
    toObjectURL = (scriptTemplate:string) => {
        let blob = new Blob([scriptTemplate],{type:'text/javascript'});
        return URL.createObjectURL(blob);
    }

    transmit = (message:ServiceMessage|any, worker?:Worker|MessagePort|string, transfer?:StructuredSerializeOptions ) => {
        if(worker instanceof Worker || worker instanceof MessagePort) {
            worker.postMessage(message,transfer);
        } else if(typeof worker === 'string') {
            if(this.workers[worker as string]) {
            if(this.workers[worker as string].port)
                (this.workers[worker as string].port as any).postMessage(message,transfer);
            else if (this.workers[worker as string].worker) this.workers[worker as string].worker.postMessage(message,transfer);
            }
        } else {
            let keys = Object.keys(this.workers);
            this.workers[keys[this.threadRot]].worker.postMessage(message,transfer);
            this.threadRot++;
            if(this.threadRot === keys.length) this.threadRot = 0;
        }
        return message;
    }

    terminate = (worker:Worker|MessagePort|string) => {
        if(typeof worker === 'string') {
            let obj = this.workers[worker];
            if(obj) delete this.workers[worker];
            worker = obj.worker;
        }
        if(worker instanceof Worker) {
            worker.terminate();
            return true;
        }
        if(worker instanceof MessagePort) {
            worker.close();
            return true;
        }
        return false;
    }

    //if no second id provided, message channel will exist to this thread
    establishMessageChannel = (worker:Worker|string|MessagePort, worker2?:Worker|string|MessagePort) => {
        
        let workerId;
        if(typeof worker === 'string') {
            workerId = worker;
            if(this.workers[worker]){
                if(this.workers[worker].port) worker = this.workers[worker].port;
                else worker2 = this.workers[worker].worker;
            }
        }
        if(typeof worker2 === 'string') {
            if(this.workers[worker2]){
                if(this.workers[worker2].port) worker2 = this.workers[worker2].port;
                else worker2 = this.workers[worker2].worker;
            }
        } 

        if(worker instanceof Worker || worker instanceof MessagePort) {
            let channel = new MessageChannel();
            let portId = `port${Math.floor(Math.random()*1000000000000000)}`;

            worker.postMessage({route:'addWorker',args:{port:channel.port1, _id:portId}},[channel.port1]);

            if(worker2 instanceof Worker || worker2 instanceof MessagePort) {
                worker2.postMessage({route:'addWorker',args:{port:channel.port2, _id:portId}},[channel.port2]);
            } else if(workerId && this.workers[workerId]) this.workers[workerId].port = channel.port2;
        
            return portId;
        }

        return false;
        
    }

    request = (message:ServiceMessage|any, workerId:string, transfer?:any, origin?:string, method?:string) => {
        let worker = this.workers[workerId].worker;
        return new Promise ((res,rej) => {
            let callbackId = Math.random();
            let req = {route:'runRequest', args:[message, callbackId]} as any;
            if(origin) req.origin = origin;
            if(method) req.method = method;
            let onmessage = (ev)=>{
                if(typeof ev.data === 'object') {
                    if(ev.data.callbackId === callbackId) {
                        worker.removeEventListener('message',onmessage);
                        res(ev.data.args); //resolve the request with the corresponding message
                    }
                }
            }
            worker.addEventListener('message',onmessage)
            this.transmit(req, worker, transfer);
        });
    }

    runRequest = (message:ServiceMessage|any, worker:undefined|string|Worker|MessagePort, callbackId:string|number) => {  
        let res = this.receive(message);
        if(typeof worker === 'string' && this.workers[worker]) {
            if(this.workers[worker].port) worker = this.workers[worker].port;
            else worker = this.workers[worker].worker;
        }
        //console.log('running request', message, 'for worker', worker, 'callback', callbackId)
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

        return res;
    }

    routes:Routes={
        addWorker:this.addWorker,
        toObjectURL:this.toObjectURL,
        request:this.request,
        runRequest:this.runRequest,
        establishMessageChannel:this.establishMessageChannel
    }

}