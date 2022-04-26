
//multithreaded event manager, spawn one per thread and import a single instance elsewhere.

/**
 * How it'll work:
 * Function output --> Event Emitter Tx
 * 
 * Event Emitter Rx[] --> State sub triggers to pass output to subscribed ports.
 * 
 * So set the worker onmessage up with the event manager as well (when it's done).
 * This is going to be integral with the node/plugin system so that's what will handle wiring up event i/o
 * and enable native multithreaded graphs. 
 * Use flags, intervals, and animation loops where appropriate to avoid overrun. 
 * 
 * EX:
 * Thread 1:
 * Say ports a b and c emit events x y and z respectively at different times
 * 
 * This creates 3 events that can call postEvent separately
 * 
 * postEvent tags the output object with the event tag based on the port emitting to it
 * 
 * 
 * 
 * 
 */

import {StateManager} from './ui/StateManager'

export class Event {
    constructor() {

        if(window) {
            if(!window.workers) { 
                window.workers = new WorkerManager();
            } //if on main thread
            else {
                let found = window.workers.workerResponses.find((foo) => {
                    if(foo.name === 'eventmanager') return true;
                });
                if(!found) {
                    window.workers.addCallback('eventmanager',this.workerCallback);
                }
            }
        } 

        this.eventState = new StateManager({},undefined,false); //trigger only state (no overhead)

        this.events = new Map(); 
    }

    //subscribe a port to an event
    subEvent(eventName, port) {
        let event = this.events.get(eventName);
        if(event) return this.eventState.subscribeTrigger(event.id,(val)=>{port.set(val);});
        else return undefined;
    }

    unsubEvent(eventName, sub) {
        let event = this.events.get(eventName);
        if(event) this.eventState.unsubscribe(event.id,sub);
    }

    //add an event when a port emits a value (sets state)
    eventEmitter(eventName, port) {
        let event = {name:eventName, id:randomId('event'), port:port, sub:undefined};
        if(port) event.sub = this.eventState.subscribeTrigger(port.id,(val)=>{this.emit(eventName,val);});
        this.events.set(eventName,event);
        
        return event;
    }

    //remove an event
    removeEmitter(eventName) {
        let event = this.events.get(eventName);
        this.eventState.unsubscribeAll(event.id);
        if(event.sub) this.eventState.unsubscribe(event.port.id,event.sub);
        this.events.delete(eventName);
    }

    emit(eventName, val) {
        let output = val;
        if(typeof output === 'object') {
            output.event = eventName;
        }
        else {
            output = {event:eventName, output:output};
        }
        // run this in global scope of window or worker. since window.self = window, we're ok
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage(output); //thread event 
        }

        let event = this.events.get(eventName);
        this.eventState.setState({[event.id]:output}); //local event 
      
    }

    workerCallback = (msg) => {
        if(msg.event) {
            let event = this.events.get(msg.event);
            if(!event) {  
                event = this.eventEmitter(msg.event);
            }
            
            this.eventState.setState({[event.id]:msg.output});

        }
    }

    export = () => {
        return this
    }
}