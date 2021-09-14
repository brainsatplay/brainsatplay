import { gpuUtils } from './gpuUtils.js';
import { eegmath } from './eegmath';

function parseFunctionFromText(method){
    //Get the text inside of a function (regular or arrow);
    let getFunctionBody = (methodString) => {
      return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
    }
  
    let getFunctionHead = (methodString) => {
      return methodString.slice(0,methodString.indexOf('{') + 1);
    }
  
    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);
  
    let newFunc = eval(newFuncHead+newFuncBody+"}");
  
    return newFunc;
  
  }  

export class CallbackManager{
    constructor(){

        try {
            window.gpu = new gpuUtils();
            this.gpu = window.gpu;
        } catch {
            let gpu = new gpuUtils();
            this.gpu = gpu;
        }

        this.canvas = new OffscreenCanvas(512,512); //can add fnctions and refer to this.offscreen 
        this.context;
        this.animation = undefined;
        this.animating = false;

        this.callbacks = [
            {case:'addfunc',callback:(args)=>{ //arg0 = name, arg1 = function string (arrow or normal)
                let newFunc = parseFunctionFromText(args[1]);
              
                let newCallback = {case:args[0],callback:newFunc};
              
                let found = self.callbacks.findIndex(c => {if (c.case === newCallback.case) return c})
                if (found != -1) self.callbacks[found] = newCallback
                else self.callbacks.push(newCallback);
              }},
              {case:'addgpufunc',callback:(args)=>{ //arg0 = gpu in-thread function string
                this.gpu.addFunction(parseFunctionFromText(args[0]));
              }},
              {case:'addkernel',callback:(args)=>{ //arg0 = kernel name, arg1 = kernel function string
                this.gpu.addKernel(args[0],parseFunctionFromText(args[1]));
              }},
          {case:'callkernel',callback:(args)=>{ //arg0 = kernel name, args.slice(1) = kernel input arguments
            return this.gpu.callKernel(args[0],args.slice(1)); //generalized gpu kernel calls
          }},
          {case:'resizecanvas',callback:(args)=>{
            this.canvas.width = args[0];
            this.canvas.height = args[1];
            return true;
          }},
          {case:'setValues',callback:(args)=>{
            if(typeof args === 'object') {
              Object.keys(args).forEach((key)=>{
                this[key] = args[key]; //variables will be accessible in functions as this.x or this['x']
              });
            }
          }},
          {case:'setAnimation',callback:(args)=>{ //pass a function to be run on an animation loop

            let newAnim = parseFunctionFromText(args[0]);
            let anim = () => {
              if(this.animating) {
                newAnim();
                requestAnimationFrame(anim);
              }
            }

            if(this.animating) {
              this.animating = false; 
              cancelAnimationFrame(this.animation);
              setTimeout(()=>{
                this.animating = true;
                this.animation = requestAnimationFrame(anim);              
              },300);
            } else { 
              this.animating = true;
              this.animation = requestAnimationFrame(anim);
            }
            
          }},
          {case:'stopAnimation',callback:(args)=>{
            if(this.animating) {
              this.animating = false;
              cancelAnimationFrame(this.animation);
            }
          }},
          {case:'xcor', callback:(args)=>{return eegmath.crosscorrelation(...args);}},
          {case:'autocor', callback:(args)=>{return eegmath.autocorrelation(args);}},
          {case:'cov1d', callback:(args)=>{return eegmath.cov1d(...args);}},
          {case:'cov2d', callback:(args)=>{return eegmath.cov2d(args);}},
          {case:'sma', callback:(args)=>{return eegmath.sma(...args);}},
          {case:'dft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return this.gpu.gpuDFT(...args);
          }},
          {case:'multidft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return this.gpu.MultiChannelDFT(...args);
          }},
          {case:'multidftbandpass', callback:(args)=>{
            if(args[4] == undefined) args[4] = 1;
            return this.gpu.MultiChannelDFT_Bandpass(...args);
          }},
          {case:'fft', callback:(args)=>{ 
            if(args[2] == undefined) args[2] = 1;
            return this.gpu.gpuFFT(...args);
          }},
          {case:'multifft', callback:(args)=>{
            if(args[2] == undefined) args[2] = 1;
            return this.gpu.MultiChannelFFT(...args);
          }},
          {case:'multifftbandpass', callback:(args)=>{
            if(args[4] == undefined) args[4] = 1;
            return this.gpu.MultiChannelFFT_Bandpass(...args);
          }},
          {case:'gpucoh', callback:(args)=>{return this.gpu.gpuCoherence(...args);}},
          {case:'coherence', callback:(args)=>{
            const correlograms = eegmath.correlograms(args[0]);
            const buffer = [...args[0],...correlograms];
            var dfts;
        
            var scalar = 1;
            //console.log(mins)
            //console.log(buffer);
            dfts = this.gpu.MultiChannelDFT_Bandpass(buffer, args[1], args[2], args[3], scalar);
            //console.log(dfts)
            const cordfts = dfts[1].splice(args[0].length, buffer.length-args[0].length);
            //console.log(cordfts)
        
            const coherenceResults = [];
            const nChannels = args[0].length;
        
            //cross-correlation dfts arranged like e.g. for 4 channels: [0:0, 0:1, 0:2, 0:3, 1:1, 1:2, 1:3, 2:2, 2:3, 3:3] etc.
            var k=0;
            var l=0;
            cordfts.forEach((row,i) => { //move autocorrelation results to front to save brain power
              if (l+k === nChannels) {
                var temp = cordfts.splice(i,1);
                k++;
                cordfts.splice(k,0,...temp);
                l=0;
                //console.log(i);
              }
              l++;
            });
            //Now arranged like [0:0,1:1,2:2,3:3,0:1,0:2,0:3,1:2,1:3,2:3]
        
            //Outputs FFT coherence data in order of channel data inputted e.g. for 4 channels resulting DFTs = [0:1,0:2,0:3,1:2,1:3,2:3];
        
            var autoFFTproducts = [];
            k = 0;
            l = 1;
            cordfts.forEach((dft,i) => {
              var newdft = new Array(dft.length).fill(0);
              if(i < nChannels) { //sort out autocorrelogram FFTs
                dft.forEach((amp,j) => {
                  newdft[j] = amp//*dfts[1][i][j];
                });
                autoFFTproducts.push(newdft);
              }
              else{ //now multiply cross correlogram ffts and divide by autocorrelogram ffts (magnitude squared coherence)
                dft.forEach((amp,j) => {
                    newdft[j] = amp*amp/(autoFFTproducts[k][j]*autoFFTproducts[k+l][j]);//Magnitude squared coherence;
                    if(newdft[j] > 1) { newdft[j] = 1; } //caps the values at 1
                    //newdft[j] = Math.pow(newdft[j],.125)
                });
                l++;
                if((l+k) === nChannels) {
                  k++;
                  l = 1;
                }
                coherenceResults.push(newdft);
              }
            });
            return [dfts[0], dfts[1], coherenceResults];
          }}
        ];
    }
}