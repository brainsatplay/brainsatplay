
import {CallbackManager} from './workerCallbacks'

let manager = new CallbackManager()

self.onmessage = (event) => {
  // define gpu instance
  // console.log("worker executing...", event)
  console.time("worker");
  let output = "function not defined";

  manager.callbacks.find((o,i)=>{
    if(o.case === event.data.foo) {
      output = o.callback(event.data.input);
      return true;
    }
  });

  // output some results!
  console.timeEnd("worker");

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
