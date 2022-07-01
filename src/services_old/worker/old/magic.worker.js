
import {CallbackManager} from './lib/workerCallbacks'

let manager = new CallbackManager();
let id = `worker_${Math.floor(Math.random()*10000000000)}`;
let counter = 0;

self.onmessage = async (event) => {
  let input;
  if(event.data.output) input = event.data.output; //from events
  else input = event.data;
  //console.log(input)

  let dict;
  let output = undefined;
  if(event.data?.eventName) { //pipe events to the event manager system
    manager.EVENTS.callback(event.data);
  }
  else if(typeof input === 'object'){
    if(input.canvas !== undefined) { //if a new canvas is sent (event.data.canvas = htmlCanvasElement.transferControlToOffscreen()).
      manager.canvas = input.canvas; 
    }
    if(input.context !== undefined ) { //set the context
      manager.ctx = manager.canvas.getContext(input.context);
      manager.context = manager.ctx; //alt name
    } 

    let eventSetting = manager.checkEvents(input.foo,input.origin);
    //console.log(event)

    output = await manager.checkCallbacks(event);  // output some results!
    counter++; //just tracks the number of calls made to the worker

    //we are gonna assume typedarrays are to be transferred for speed so throw those all into the transfer array
    let transfer = undefined;
    if(output) {
      if(output.__proto__?.__proto__?.constructor.name === 'TypedArray') { 
        transfer = [output.buffer];
      } else if (output.constructor?.name === 'Object') {
          for(const key in output) {
              if(output[key].__proto__?.__proto__?.constructor.name === 'TypedArray') {
                  if(!transfer) transfer = output[key].buffer;
                  else transfer.push(output[key].buffer);
              }
          }
      }
    }
    //if(input.foo === 'particleStep') console.log(eventSetting);

    dict = {output: output, foo: input.foo, origin: input.origin, callbackId: input.callbackId, counter:counter};
    if(eventSetting) {manager.EVENTS.emit(eventSetting.eventName,dict,undefined,transfer,eventSetting.port);} //if the origin and foo match an event setting on the thread, this emits output as an event
    else if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        self.postMessage(dict,transfer); // TODO: Correct proper transfer syntax
    } 
  }
  /*
    now run "addfunc" to render something in the linked canvas from the worker thread
    e.g. workers.postToWorker('addfunc',['offscreenrender',`(args)=>{
      ctx.clearRect(0,0,canvas.width,canvas.height); //or this.offscreenctx
      ctx.fillRect(25, 25, 100, 100);
      ctx.clearRect(45, 45, 60, 60);
      ctx.strokeRect(50, 50, 50, 50);
    }`]);
  */

  // console.timeEnd("worker");
  return dict;
}

manager.EVENTS.emit('newWorker',id);

export default self