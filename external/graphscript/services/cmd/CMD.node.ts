//for running parallel processes (with their own memory, as opposed to workers which share memory) in node.js
import {ChildProcess, fork, Serializable, spawn} from 'child_process'
import { Route, Routes, Service, ServiceOptions } from '../Service';
import { GraphNodeProperties } from '../../Graph';

//enable message passing between child processes.
//You can use these services across processes to enable full scripting abilities

export type CMDRoute = {
    command:string|ChildProcess,
    args?:string[],
    options?:{shell:true, stdio:'inherit',[key:string]:any},
    env?:any,
    cwd?:any,
    signal?:any,
    stdout?:(data:any)=>void,
    onerror?:(error:Error)=>void,
    onclose?:(code: number | null, signal: NodeJS.Signals | null)=>void
} & GraphNodeProperties

export type CMDInfo = {
    process:ChildProcess,
    _id:string,
    controller:AbortController
} & CMDRoute


export class CMDService extends Service {

    processes:{
        [key:string]:{
            _id:string,
            process:ChildProcess,
            controller:AbortController
        } & CMDRoute
    } 

    customRoutes:ServiceOptions['customRoutes']={
        'process':(route: CMDRoute|Route, routeKey: string, routes: Routes) => {
            if((route as CMDRoute).command) {
               this.createProcess((route as CMDRoute)); 
            }
            return route;
        }
    }

    constructor(options?:ServiceOptions) {
        super(options)
        this.load(this.routes);
    }

    createProcess = (properties:CMDRoute) => {
        let rt = properties;
        if(rt.command) {
            let p:ChildProcess;
            if(!rt.options) {
                rt.options = {shell:true, stdio:'inherit'}
            }
            rt.controller = new AbortController();
            rt.options = Object.assign({signal:(rt.controller as AbortController).signal, env:process.env, cwd:process.cwd()},rt.options)

            if(typeof rt.command === 'string') {
                if(rt.command.includes('.js')) {
                    p = fork(rt.command,rt.args,rt.options);
                } else p = spawn(rt.command,rt.args ? rt.args : [],rt.options);

                if(p instanceof ChildProcess) {
                    if(p.stderr) {
                        if(rt.onerror) {
                            p.stderr.on('data', rt.onerror);
                        } else p.stderr.on('data', console.error)
                    }
                    if(p.stdout) {
                        if(rt.stdout) {
                            p.stdout.on('data', rt.stdout)
                        } else p.stdout.on('data', this.receive)
                    }

                    if(rt.onclose) {
                        p.on('close',rt.onclose);
                    }

                    rt.process = p; //keep the process referenced locally
                    rt.controller = new AbortController();
                    rt._id = `process${Math.floor(Math.random()*1000000000000000)}`;

                    this.processes[rt._id] = rt as CMDInfo;
                }

            }
        }

        return rt;
    }

    abort = (process:ChildProcess|CMDInfo) => {
        if((process as CMDInfo).controller) 
            (process as CMDInfo).controller.abort();
        else process.kill();

        return true;
    }
    
    send = (process:ChildProcess, data:Serializable) => {
        return process.send(data);
    }

    request = () => {}

    runRequest = () => {}

    routes:Routes={
        createProcess:this.createProcess,
        send:this.send,
        request:this.request,
        runRequest:this.runRequest
    }

}