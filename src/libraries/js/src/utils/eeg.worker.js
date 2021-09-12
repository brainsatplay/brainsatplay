
import {CallbackManager} from './workerCallbacks'

let manager = new CallbackManager()
let canvas = manager.canvas;
let ctx = manager.canvas.context;
let counter = 0;

self.onmessage = (event) => {
  // define gpu instance
  // console.log("worker executing...", event)
  console.time("worker");
  let output = "function not defined";

  if(event.data.canvas) { //if a new canvas is sent (event.data.canvas = htmlCanvasElement.transferControlToOffscreen()).
    manager.offscreen = event.data.canvas; 
    canvas = manager.offscreen;
  }
  if(event.data.context === 'webgl' || '2d' || "webgl2" || "bitmaprenderer" ) { //set the context
    manager.offscreenctx = manager.offscreen.getContext(event.data.context);
    ctx = manager.offscreenctx;
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

  manager.callbacks.find((o,i)=>{
    if(o.case === event.data.foo) {
      output = o.callback(event.data.input);
      return true;
    }
  });
  // output some results!
  console.timeEnd("worker");
  counter++; //just tracks the number of calls made to the worker

  let dict = {output: output, foo: event.data.foo, origin: event.data.origin}
  try {
    if(window.document === undefined)
    {
      self.postMessage(dict);
      return 0;
    } else return dict
  } catch (err) {
    self.postMessage(dict);
    return 0;
  }
}

try {
  if(window.document === undefined)
  {
    addEventListener('message', self.onmessage);
  } 
} catch (err) {
  addEventListener('message', self.onmessage);
}
