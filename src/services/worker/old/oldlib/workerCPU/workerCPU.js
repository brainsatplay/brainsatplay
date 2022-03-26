//Adds Math functions and stuff that are CPU-based. Not much here right now

import { Math2 } from "brainsatplay-math";

export class workerCPU {

    constructor(callbackManager) {

        this.callbackManager = callbackManager;

        callbackManager.Math2 = Math2; //should be globally available anyway

        this.callbacks = [
            { 
                case: 'xcor', callback: (self, args, origin) => { 
                  return Math2.crosscorrelation(...args); 
                } 
            },
            { 
                case: 'autocor', callback: (self, args, origin) => { 
                  return Math2.autocorrelation(args); 
                } 
            },
            { 
                case: 'cov1d', callback: (self, args, origin) => { 
                  return Math2.cov1d(...args); 
                } 
            },
            { 
                case: 'cov2d', callback: (self, args, origin) => { 
                  return Math2.cov2d(args); 
                } 
            },
            { 
                case: 'sma', callback: (self, args, origin) => { 
                  return Math2.sma(...args); 
                } 
            } //etc...
        ];

        this.addCallbacks();

    }
 
    addCallbacks(callbacks = this.callbacks) {
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