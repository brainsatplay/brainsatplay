
import {CallbackManager} from './workerCallbacks'

let manager = new CallbackManager()
let canvas = manager.canvas;
let ctx = manager.canvas.context;
let counter = 0;

self.onmessage = (event) => {
    // define gpu instance
  // console.log("worker executing...", event)
  console.time("worker");
  let output;

  if(event.data.canvas !== undefined) { //if a new canvas is sent (event.data.canvas = htmlCanvasElement.transferControlToOffscreen()).
    manager.canvas = event.data.canvas; 
    canvas = manager.canvas;
  }
  if(event.data.context !== undefined ) { //set the context
    manager.ctx = manager.canvas.getContext(event.data.context);
    ctx = manager.ctx;
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

  output = manager.checkCallbacks(event);

  // output some results!
  console.timeEnd("worker");
  counter++; //just tracks the number of calls made to the worker

  let dict = {output: output, foo: event.data.foo, origin: event.data.origin}
  
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
      self.postMessage(dict);
      return 0;
  } else return dict
}

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    addEventListener('message', self.onmessage);
} 

