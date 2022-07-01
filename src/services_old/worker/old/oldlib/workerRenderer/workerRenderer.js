//canvas and threejs rendering utilities on the worker
import { ProxyManager } from './ProxyListener';

import { parseFunctionFromText, dynamicImport } from '../utils/Parsing';

export class workerRenderer {
    constructor(callbackManager) {

        this.callbackManager = callbackManager;
        // callbackManager.canvas = new OffscreenCanvas(512, 512); //can add fnctions and refer to this.offscreen 
        callbackManager.ANIMATION = undefined;
        callbackManager.ANIMATIONFUNC = undefined;
        callbackManager.ANIMATING = false;
        callbackManager.ANIMFRAMETIME = performance.now(); //ms based on UTC stamps
        callbackManager.threeUtil = undefined;
        callbackManager.PROXYMANAGER = new ProxyManager();

        try{
          if(window) console.log('worker in window!');
        } catch(err) {
          self.document = {}; //threejs hack
        }


        this.callbacks = [
              { //resize an offscreen canvas
                case: 'resizecanvas', callback: (self, args, origin) => {
                  self.canvas.width = args[0];
                  self.canvas.height = args[1];
                  return true;
                }
              }, 
              { //args[0] = ProxyManager Id returned from startProxy, args[1] = event object
                case:'proxyHandler', callback: (self, args, origin) => {
        
                  if(args.type === 'makeProxy') {
                    self.PROXYMANAGER.makeProxy(args);
        
                    const proxy = self.PROXYMANAGER.getProxy(args.id); 
                    proxy.ownerDocument = proxy; // HACK!
                    self[args.id] = proxy;
                  } else if (args.type === 'event') {
                    self.PROXYMANAGER.handleEvent(args);
                  }
                  else return false;
        
                  return true;
                }
              },
              {
                case: 'initThree', callback: async (self, args, origin) => {
                  if (self.ANIMATING) {
                    self.ANIMATING = false;
                    cancelAnimationFrame(self.ANIMATION);
                  }
                  if (!self.threeUtil) {
                    let module = await dynamicImport('./lib/workerRenderer/workerThreeUtils.js');
                    self.threeUtil = new module.threeUtil(self.canvas,self,self.PROXYMANAGER.getProxy(args[0]));
                    self.THREE = self.threeUtil.THREE; //add another reference for the hell of it
                  }
                  if (typeof args[1] === 'object') { //first is the setup function
                    await self.runCallback('setValues',args[1]);
                  }
                  //console.log(args)
                  if (args[2]) { //first is the setup function
                    self.threeUtil.setup = parseFunctionFromText(args[2]);
                  }
                  if (args[3]) { //next is the draw function (for 1 frame)
                    self.threeUtil.draw = parseFunctionFromText(args[3]);
                  }
                  if (args[4]) {
                    self.threeUtil.clear = parseFunctionFromText(args[4]);
                  }
                  self.threeUtil.clear(self, args, origin);
                  self.threeUtil.setup(self, args, origin);
                  //console.log(self.threeUtil);
                  return true;
                }
              },
              {
                case: 'startThree', callback: async (self, args, origin) => { //run the setup to start the three animation
                  if (self.ANIMATING) {
                    self.ANIMATING = false;
                    cancelAnimationFrame(self.ANIMATION);
                  }
                  if (!self.threeUtil) {
                    let module = await dynamicImport('./lib/workerRenderer/workerThreeUtils.js'); //not sure about right url till we test again
                    //console.log(module);
                    self.threeUtil = new module.threeUtil(self.canvas,self,self.PROXYMANAGER.getProxy(args[0]));
                  }
                  if (self.threeUtil) {
                    self.threeUtil.clear(self, args, origin);
                    self.threeUtil.setup(self, args, origin);
                  }
                  return true;
                }
              },
              {
                case: 'clearThree', callback: (self, args, origin) => { //run the clear function to stop three
                  if (self.threeUtil) {
                    self.threeUtil.clear(self, args, origin);
                  }
                  return true;
                }
              },
              {case: 'setAnimation', callback: (self, args, origin) => { //pass a draw function to be run on an animation loop. Reference this.canvas and this.context or canvas and context. Reference values with this.x etc. and use setValues to set the values from another thread
                  self.animationFunc = parseFunctionFromText(args[0]);
                  return true;
                }
              },
              {
                case: 'startAnimation', callback: (self, args, origin) => {
                  //console.log(this.animationFunc.toString(), this.canvas, this.angle, this.angleChange, this.bgColor)
                  let anim = () => {
                    if (self.ANIMATING) {
                      self.animationFunc(self, args, origin);
                      self.ANIMFRAMETIME = performance.now() - self.ANIMFRAMETIME;
                      let emitevent = self.checkEvents('render', origin);
                      let dict = { foo: 'render', output: self.ANIMFRAMETIME, origin: origin};
                      self.ANIMFRAMETIME = performance.now();
                      if (emitevent) {
                        self.EVENTS.emit('render', dict);
                      }
                      else {
                        postMessage(dict);
                      }
                      requestAnimationFrame(anim);
                    }
                  }
        
                  if (this.ANIMATING) {
                    self.ANIMATING = false;
                    cancelAnimationFrame(self.ANIMATION);
                    setTimeout(() => {
                      self.ANIMATING = true;
                      self.ANIMATION = requestAnimationFrame(anim);
                    }, 300);
                  } else {
                    self.ANIMATING = true;
                    console.log('begin animation');
                    self.ANIMATION = requestAnimationFrame(anim);
                  }
                  return true;
                }
              },
              {
                case: 'stopAnimation', callback: (self, args, origin) => {
                  if (self.ANIMATING) {
                    self.ANIMATING = false;
                    cancelAnimationFrame(self.ANIMATION);
                    return true;
                  } else return false;
                }
              },
              {
                case: 'render', callback: (self, args, origin) => { //runs the animation function
                  self.animationFunc(self, args, origin);
                  let time = performance.now() - self.ANIMFRAMETIME
                  tselfhis.ANIMFRAMETIME = performance.now();
                  return time;
                }
              }
        ];

        this.addCallbacks();
    }

    addCallbacks(callbacks=this.callbacks) {
      callbacks.forEach((fn) => {
          this.callbackManager.addCallback(fn.case, fn.callback);
          if(fn.aliases) {
              fn.aliases.forEach((c) => {
                  this.callbackManager.addCallback(c, fn.callback);
              })
          }
      });
    }
}