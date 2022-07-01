import {gpuUtils} from 'gpujsutils'
import {Math2} from 'brainsatplay-math'
import { parseFunctionFromText } from '../utils/Parsing';

//GPU.js utilities for the web worker callback manager
export class workerGPU {
    constructor(callbackManager) {

      try{
        this.gpu = new gpuUtils();
      }
      catch(err) {
        return undefined;
      }
        this.callbackManager = callbackManager;
        callbackManager.gpu = this.gpu;

        this.callbacks = [
            { //add a gpu function call usable in kernels, follow gpujs's tutorials and pass stringified functions using their format
                case: 'addgpufunc', callback: (self, args, origin) => { //arg0 = gpu in-thread function string
                  return self.gpu.addFunction(parseFunctionFromText(args[0]));
                }
              },
              { //add a gpu kernels, follow gpujs's tutorials and pass stringified functions using their format
                case: 'addkernel', callback: (self, args, origin) => { //arg0 = kernel name, arg1 = kernel function string
                  return self.gpu.addKernel(args[0], parseFunctionFromText(args[1]));
                }
              },
              { //call a custom gpu kernel
                case: 'callkernel', callback: (self, args, origin) => { //arg0 = kernel name, args.slice(1) = kernel input arguments
                  return self.gpu.callKernel(args[0], args.slice(1)); //generalized gpu kernel calls
                }
              },
              {
                case: 'dft', callback: (self, args, origin) => {
                  if (args[2] == undefined) args[2] = 1;
                  return self.gpu.gpuDFT(...args);
                }
              },
              {
                case: 'multidft', callback: (self, args, origin) => {
                  if (args[2] == undefined) args[2] = 1;
                  return self.gpu.MultiChannelDFT(...args);
                }
              },
              {
                case: 'multidftbandpass', callback: (self, args, origin) => {
                  if (args[4] == undefined) args[4] = 1;
                  return self.gpu.MultiChannelDFT_Bandpass(...args);
                }
              },
              {
                case: 'fft', callback: (self, args, origin) => {
                  if (args[2] == undefined) args[2] = 1;
                  return self.gpu.gpuFFT(...args);
                }
              },
              {
                case: 'multifft', callback: (self, args, origin) => {
                  if (args[2] == undefined) args[2] = 1;
                  return self.gpu.MultiChannelFFT(...args);
                }
              },
              {
                case: 'multifftbandpass', callback: (self, args, origin) => {
                  if (args[4] == undefined) args[4] = 1;
                  return self.gpu.MultiChannelFFT_Bandpass(...args);
                }
              },
              { 
                case: 'gpucoh', callback: (self, args, origin) => { 
                  return self.gpu.gpuCoherence(...args); } 
                },
              {
                case: 'coherence', callback: (self, args, origin) => {
                  const correlograms = Math2.correlograms(args[0]); //should get this onto the GPU also, an untested function exists
                  const buffer = [...args[0], ...correlograms];
                  //console.log(buffer)
                  var dfts;
        
                  var scalar = 1;
                  //console.log(mins)
                  //console.log(buffer);
                  dfts = self.gpu.MultiChannelDFT_Bandpass(buffer, args[1], args[2], args[3], scalar);
                  //console.log(dfts)
                  const cordfts = dfts[1].splice(args[0].length, buffer.length - args[0].length);
                  //console.log(cordfts)
        
                  const coherenceResults = [];
                  const nChannels = args[0].length;
        
                  //cross-correlation dfts arranged like e.g. for 4 channels: [0:0, 0:1, 0:2, 0:3, 1:1, 1:2, 1:3, 2:2, 2:3, 3:3] etc.
                  var k = 0;
                  var l = 0;
                  cordfts.forEach((row, i) => { //move autocorrelation results to front to save brain power
                    if (l + k === nChannels) {
                      var temp = cordfts.splice(i, 1);
                      k++;
                      cordfts.splice(k, 0, ...temp);
                      l = 0;
                      //console.log(i);
                    }
                    l++;
                  });
                  //Now arranged like [0:0,1:1,2:2,3:3,0:1,0:2,0:3,1:2,1:3,2:3]
        
                  //Outputs FFT coherence data in order of channel data inputted e.g. for 4 channels resulting DFTs = [0:1,0:2,0:3,1:2,1:3,2:3];
        
                  var autoFFTproducts = [];
                  k = 0;
                  l = 1;
                  cordfts.forEach((dft, i) => {
                    var newdft = new Array(dft.length).fill(0);
                    if (i < nChannels) { //sort out autocorrelogram FFTs
                      dft.forEach((amp, j) => {
                        newdft[j] = amp//*dfts[1][i][j];
                      });
                      autoFFTproducts.push(newdft);
                    }
                    else { //now multiply cross correlogram ffts and divide by autocorrelogram ffts (magnitude squared coherence)
                      dft.forEach((amp, j) => {
                        newdft[j] = amp * amp / (autoFFTproducts[k][j] * autoFFTproducts[k + l][j]);//Magnitude squared coherence;
                        if (newdft[j] > 1) { newdft[j] = 1; } //caps the values at 1
                        //newdft[j] = Math.pow(newdft[j],.125)
                      });
                      l++;
                      if ((l + k) === nChannels) {
                        k++;
                        l = 1;
                      }
                      coherenceResults.push(newdft);
                    }
                  });
                  return [dfts[0], dfts[1], coherenceResults];
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