import { Events } from './utils/Event';
import { parseFunctionFromText, dynamicImport } from './utils/Parsing';


//just comment these out if you don't want them
import { workerCPU } from './workerCPU/workerCPU';
import { workerGPU } from './workerGPU/workerGPU';
import { workerRenderer } from './workerRenderer/workerRenderer'

export class CallbackManager {

  canvas;
  ctx;
  context; 

  constructor(
    Router,
    options={
      cpu:true,
      gpu:true,
      renderer:true
    }
  ) {

    this.EVENTS = new Events();
    this.EVENTSETTINGS = [];


    this.ID = Math.floor(Math.random()*1000); //just a reference for discerning threads 
    

    //args = array of expected arguments
    //origin = optional tag on input object
    //self = this. scope for variables within the callbackmanager (including values set)

    this.defaultFunctions = [
      { //ping pong, just validates responsiveness
        case: 'ping', callback: (self, args, origin) => {
          return 'pong';
        }
      },
      { //return a list of function calls available on the worker
        case: 'list', callback: (self, args, origin) => {
          let list = [];
          this.callbacks.forEach((callback,name) => {
            list.push(name);
          });
          return list;
        }
      },
      { //add a local function, can implement whole algorithm pipelines on-the-fly
        case: 'addfunc', callback: (self, args, origin) => { //arg0 = name, arg1 = function string (arrow or normal)
          if(!args[0] || !args[1]) return false;
          let newFunc = parseFunctionFromText(args[1]);

          if(args[2] === true) { //adds try-catch safety
            let safeFunc = async (self,args,origin) => {
              try{
                let result = await newFunc(self,args,origin);
                return result;
              } catch(err) {
                console.error(err);
              }
            }
            self.callbacks.set(args[0], safeFunc);     
          }
          else
            self.callbacks.set(args[0], newFunc);  

          return true;
        }
      },
      { case:'removefunc', callback:(self,args,origin) => {
          if(args[0]) return this.removeCallback(args[0]);
          else return undefined;
        }
      },
      { //set locally accessible values, just make sure not to overwrite the defaults in the callbackManager
        case: 'setValues', callback: (self, args, origin) => {
          if (typeof args === 'object') {
            Object.keys(args).forEach((key) => {
              self[key] = args[key]; //variables will be accessible in functions as this.x or this['x']
              if (self.threeUtil) self.threeUtil[key] = args[key];
            });
            return true;
          } else return false;
        }
      },
      { //append array values
        case: 'appendValues', callback: (self, args, origin) => {
          if (typeof args === 'object') {
            Object.keys(args).forEach((key) => {
              if(!self[key]) self[key] = args[key];
              else if (Array.isArray(args[key])) self[key].push(args[key]); //variables will be accessible in functions as this.x or this['x']
              else self[key] = args[key];
            });
            return true;
          } else return false;
        }
      },
      { //for use with transfers
        case: 'setValuesFromArrayBuffers', callback: (self, args, origin) => {
          if (typeof args === 'object') {
            Object.keys(args).forEach((key) => { 
              if(args[key].__proto__.__proto__.constructor.name === 'TypedArray') self[key] = Array.from(args[key]);
              else self[key] = args[key];
            });
            return true;
          } else return false;
        }
      },
      { //for use with transfers
        case: 'appendValuesFromArrayBuffers', callback: (self, args, origin) => {
          if (typeof args === 'object') {
            Object.keys(args).forEach((key) => {
              if(!self[key] && args[key].__proto__.__proto__.constructor.name === 'TypedArray') self[key] = Array.from(args[key]);
              else if(!self[key]) self[key] = args[key];
              else if(args[key].__proto__.__proto__.constructor.name === 'TypedArray') self[key].push(Array.from(args[key]));
              else if(Array.isArray(args[key])) self[key].push(args[key]); //variables will be accessible in functions as this.x or this['x']
              else self[key] = args[key];
            });
            return true;
          } else return false;
        }
      },
      { //parses a stringified class prototype (class x{}.toString()) containing function methods for use on the worker
        case: 'transferClassObject', callback: (self, args, origin) => {
          if (typeof args === 'object') {
            Object.keys(args).forEach((key) => {
              if(typeof args[key] === 'string') {
                let obj = args[key];
                if(args[key].indexOf('class') === 0) obj = eval('('+args[key]+')');
                self[key] = obj; //variables will be accessible in functions as this.x or this['x'] / self.x or self['x']
                //console.log(self,key,obj);
                if (self.threeUtil) self.threeUtil[key] = obj;
              }
            });
            return true;
          } else return false;
        }
      },
      { //MessageChannel port, it just runs the whole callback system to keep it pain-free, while allowing messages from other workers
        case: 'addport', callback: (self, args, origin) => { //args[0] = eventName, args[1] = case, only fires event if from specific same origin
          let port = args[1];
          port.onmessage = onmessage; //sets up a new receiver source (from other workers, perform addevent on the other worker)
          this[args[0]] = port; //locally 
        }
      },
      { //add an event to the event manager, this helps building automated pipelines between threads
        case: 'addevent', callback: (self, args, origin) => { //args[0] = eventName, args[1] = case, only fires event if from specific same origin
          self.EVENTSETTINGS.push({ eventName: args[0], case: args[1], port:args[2], origin: origin });
          //console.log(args);
          if(args[2]){ 
            let port = args[2];
            port.onmessage = onmessage; //attach the port onmessage event
            this[args[0]+'port'] = port;
          }
          return true;
        }
      },
      { //internal event subscription, look at Event.js for usage, its essentially a function trigger manager for creating algorithms
        case: 'subevent', callback: (self, args, origin) => { //args[0] = eventName, args[1] = response function(self,args,origin) -> lets you reference self for setting variables
          if(typeof args[0] !== 'string') return false;
          
          let response = parseFunctionFromText(args[1]);
          let eventSetting = this.checkEvents(args[0]); //this will contain the port setting if there is any
          //console.log(args, eventSetting)
          return self.EVENTS.subEvent(args[0], (output) => {
            response(self,output,origin,eventSetting?.port,eventSetting?.eventName); //function wrapper so you can access self from the event subscription
          });
        }
      },
      { //internal event unsubscribe
        case: 'unsubevent', callback: (self, args, origin) => { //args[0] = eventName, args[1] = case, only fires event if from specific same origin
          return self.EVENTS.unsubEvent(args[0], args[1]);
        }
      }   
    ];


    this.callbacks = new Map();
    defaultFunctions.forEach((o) => {
      if(o.case) this.callbacks.set(o.case,o.callback);
      if(o.aliases) o.aliases.forEach((alias) => this.callbacks.set(alias,o.callback));
    });


    if(options.cpu) {
        try{
          if(workerCPU) {
            this.workerCPU = new workerCPU(this);
          }
        } catch(err) {console.error(err);}
    } 
    
    if (options.gpu) {
      try {
        if(workerGPU) {
          this.workerGPU = new workerGPU(this);
        }
      } catch(err) {console.error(err);}
    }

    if(options.renderer) {
      try{
        if(workerRenderer) {
          this.workerRenderer = new workerRenderer(this);
        }
      } catch(err) {console.error(err);}
    }
  
  }

  
  addCallback = (functionName,callback=(self,args,origin)=>{}) => {
    if(!functionName || !callback) return false;
    //this.removeCallback(functionName); //removes existing callback if it is there
    this.callbacks.set(functionName,callback);
    return true;
  }

  removeCallback = (functionName) => {
      let found = this.callbacks.get(functionName);
      if(found) {
        this.callbacks.delete(functionName);
        return true;
      }
      return false;
  }

  runCallback = async (functionName,args=[],origin) => {
    let output = undefined;
    let callback = this.callbacks.get(functionName);
    if(callback) {
      output = await callback(this, args, origin);
    }
    return output;
  }

  checkEvents = (functionName, origin) => {
    let found = this.EVENTSETTINGS.find((o) => {
      if ((o.origin && origin && o.case && functionName)) {
        if (o.origin === origin && o.case === functionName) return true;
        else return false;
      } else if (o.case && functionName) {
        if (o.case === functionName) return true;
        else return false;
      } else if (o.origin && origin) {
        if(o.origin === origin) return true;
        else return false;
      }
      else return false;
    });
    //console.log(functionName,origin,found)
    return found;
  }

  checkCallbacks = async (event) => {
    //console.log(event);
    let output = undefined;
    if(!event.data) return output;
    let callback;

    //different function name properties just for different sensibilities
    if(event.data.case) callback=this.callbacks.get(event.data.case);
    else if (event.data.foo) callback=this.callbacks.get(event.data.foo);
    else if (event.data.command) callback=this.callbacks.get(event.data.command);
    else if (event.data.cmd) callback=this.callbacks.get(event.data.cmd);

    if(callback) {
        if (event.data.input) output = await callback(this, event.data.input, event.data.origin);
        else if (event.data.args) output = await callback(this, event.data.args, event.data.origin);
        else output = await callback(this, undefined, event.data.origin); //no inputs
    }
    return output;
  }
}