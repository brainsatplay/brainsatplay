
//multithreaded event manager, spawn one per thread and import a single instance elsewhere.

/**
 * This is both a simple wrapper for a trigger-only state manager as well 
 * as an interface for multithreaded events for simpler, more dynamic threading pipelines
 * 
 * From any thread:
 * emit -> tx
 * rx -> run trigger 
 * 
 */

 import {StateManager} from 'anotherstatemanager'

 export class Events {
     constructor(manager=undefined) {
 
         this.state = new StateManager({},undefined,false); //trigger only state (no overhead)
         this.manager = manager;
 
         if(manager !== undefined) { //only in window
            let found = manager.responses.find((foo) => {
                if(foo.name === 'eventmanager') return true;
            });
            if(!found) {
                manager.addCallback('eventmanager',this.callback);
            }
         } 
 
     }
 
     //subscribe a to an event, default is the port reponse 
     subEvent(eventName, response=(output)=>{console.log(eventName,output);}) {
         return this.state.subscribeTrigger(eventName,response);
     }
 
     unsubEvent(eventName, sub) {
         return this.state.unsubscribeTrigger(eventName,sub);
     }
 
     //add an event name, can optionally add them to any threads too from the main thread
     async addEvent(eventName,workerId=undefined,functionName=undefined,origin=undefined) {
         this.state.setState({[eventName]:undefined});
         if(this.manager !== undefined) {
             if(origin !== undefined || functionName !== undefined) {
                 if(workerId !== undefined) {
                    return await this.manager.post({origin:origin,foo:'addevent',input:[eventName,functionName]},workerId);
                 } else {
                    this.manager.workers.forEach((w)=>{
                        this.manager.post({origin:origin,foo:'addevent',input:[eventName,functionName]},w.id); //add it to all of them since we're assuming we're rotating threads
                    });
                    return true;
                 }
             }
         }
     }
 
     //remove an event
     removeEmitter(eventName) {
         this.state.unsubscribeAllTriggers(eventName);
     }
 
     //use this to set values by event name, will post messages on threads too
     emit = (eventName, input, workerId=undefined,transfer=undefined,port=undefined) => {
        let output = {eventName:eventName, output:input};
        
        if(!input || !eventName) return;
        if (this.manager !== undefined) { //when emitting values for workers, input should be an object like {input:0, foo'abc', origin:'here'} for correct worker callback usage
            if(workerId !== undefined) this.manager.post(output,workerId,transfer);
            else {this.manager.workers.forEach((w)=>{this.manager.post(output,w.id,transfer);});}
        } else if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // run this in global scope of window or worker. since window.self = window, we're ok
            //if(port) console.log(port,output);
            if(port) port.postMessage(output,undefined,transfer);
            else self.postMessage(output,undefined,transfer); //thread event 
        }
        this.state.setState({[eventName]:input}); //local event 
     }
 
    callback = (msg) => {
        if(typeof msg === 'object') {
            if(msg.eventName !== undefined && msg.output !== undefined) {
                this.state.setState({[msg.eventName]:msg.output});
            }
        }
    }

    export = () => {
        return this;
    }

 }