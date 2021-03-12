import { GPU } from 'gpu.js'
import { addGpuFunctions, createGpuKernels as krnl } from './gpuUtils-functs';

function makeKrnl(gpu, f, opts = {
  setDynamicOutput: true,
  setDynamicArguments: true,
  setPipeline: true,
  setImmutable: true
}) {
  const k = gpu.createKernel(f);

  if (opts.setDynamicOutput)    k.setDynamicOutput(true);
  if (opts.setDynamicArguments) k.setDynamicArguments(true);
  if (opts.setPipeline)         k.setPipeline(true)
  if (opts.setImmutable)        k.setImmutable(true);

  //.setOutput([signal.length]) //Call before running the kernel
  //.setLoopMaxIterations(signal.length);

  return k;
}

export class gpuUtils {
  
  constructor(gpu = new GPU()) {
    this.gpu = gpu;

    this.kernel;
    this.PI = 3.141592653589793;
    this.SQRT1_2 = 0.7071067811865476

    this.addFunctions();

    this.imgkernels = {
      edgeDetection: [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
      ], boxBlur: [
        1/9, 1/9, 1/9,
        1/9, 1/9, 1/9,
        1/9, 1/9, 1/9
      ], sobelLeft: [
        1,  0, -1,
        2,  0, -2,
        1,  0, -1
      ], sobelRight: [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
      ], sobelTop: [
        1,  2,  1,
        0,  0,  0,
        -1, -2, -1  
      ], sobelBottom: [
        -1, 2, 1,
        0, 0, 0,
        1, 2, 1
      ], identity: [
        0, 0, 0, 
        0, 1, 0, 
        0, 0, 0
      ], gaussian3x3: [
        1,  2,  1, 
        2,  4,  2, 
        1,  2,  1
      ], guassian7x7: [
        0, 0,  0,   5,   0,   0,  0,
        0, 5,  18,  32,  18,  5,  0,
        0, 18, 64,  100, 64,  18, 0,
        5, 32, 100, 100, 100, 32, 5,
        0, 18, 64,  100, 64,  18, 0,
        0, 5,  18,  32,  18,  5,  0,
        0, 0,  0,   5,   0,   0,  0,
      ], emboss: [
        -2, -1,  0, 
        -1,  1,  1, 
        0,  1,  2
      ], sharpen: [
        0, -1,  0,
        -1,  5, -1,
        0, -1,  0
      ]
    };
  }

  addFunctions() { 
    addGpuFunctions.forEach(f => this.gpu.addFunction(f));

    this.correlograms = makeKrnl(this.gpu, krnl.correlogramsKern);
    this.correlogramsPC = makeKrnl(this.gpu, krnl.correlogramsKern);
    this.dft = makeKrnl(this.gpu, krnl.dftKern);
    this.idft = makeKrnl(this.gpu, krnl.idftKern);
    this.dft_windowed = makeKrnl(this.gpu, krnl.dft_windowedKern);
    this.idft_windoed = makeKrnl(this.gpu, krnl.idft_windowedKern);
    this.fft = makeKrnl(this.gpu, krnl.fftKern);
    this.ifft = makeKrnl(this.gpu, krnl.ifftKern);
    this.fft_windowed = makeKrnl(this.gpu, krnl.fft_windowedKern);
    this.ifft_windowed = makeKrnl(this.gpu, krnl.ifft_windowedKern);
    this.listdft2D = makeKrnl(this.gpu, krnl.listdft2DKern);
    this.listdft1D = makeKrnl(this.gpu, krnl.listdft1DKern);
    this.listdft1D_windowed = makeKrnl(this.gpu, krnl.listdft1D_windowedKern);
    this.listidft1D_windowed = makeKrnl(this.gpu, krnl.listidft1D_windowedKern);
    this.bulkArrayMul = makeKrnl(this.gpu, krnl.bulkArrayMulKern);
    this.multiConv2D = makeKrnl(this.gpu, krnl.multiImgConv2DKern);
    
    //----------------------------------- Easy gpu pipelining
    //------------Combine Kernels-------- gpu.combineKernels(f1,f2,function(a,b,c) { f1(f2(a,b),c); });
    //----------------------------------- TODO: Make this actually work (weird error)

    //Bandpass FFT+iFFT to return a cleaned up waveform
    const signalBandpass = (signal, sampleRate, freqStart, freqEnd, scalar) => { //Returns the signal wave with the bandpass filter applied
      var dft = this.fft_windowed(signal, sampleRate, freqStart, freqEnd, scalar, 0);
      var filtered_signal = this.ifft_windowed(dft, sampleRate, freqStart, freqEnd, scalar); 
      return filtered_signal;
    }

    //this.signalBandpass = this.gpu.combineKernels(this.dft_windowedKern,this.idft_windowedKern, signalBandpass);
    
    const signalBandpassMulti = (signals, sampleRate, freqStart, freqEnd, scalar) => {
      var dfts = this.listdft1D_windowed(signals,sampleRate,freqStart,freqEnd,scalar, new Array(Math.ceil(signals/sampleRate)).fill(0));
      var filtered_signals = this.listidft1D_windowed(dfts,sampleRate,freqStart,freqEnd,scalar);
      return filtered_signals;
    }

    //this.signalBandpassMulti = this.gpu.combineKernels(this.listdft1D_windowed,this.listidft1D_windowed, signalBandpassMulti);

    //TODO: automatic auto/cross correlation and ordering.
    //Input signals like this : [signal1,signal2,autocor1,autocor2,crosscor,...repeat for desired coherence calculations] or any order of that.
    this.gpuCoherence = (signals, sampleRate, freqStart, freqEnd, scalar) => { //Take FFTs of the signals, their autocorrelations, and cross correlation (5 FFTs per coherence), then multiply.
      var dfts = this.listdft1D_windowed(signals, sampleRate, freqStart, freqEnd, scalar, new Array(Math.ceil(signals/sampleRate)).fill(0) );
      var products = this.bulkArrayMul(dfts, sampleRate, 5, 1);
      return products;
    }

    //this.gpuCoherence = this.gpu.combineKernels(this.listdft1D_windowedKern, this.bulkArrayMulKern, function gpuCoherence(signals,sampleRate,freqStart,freqEnd,scalar) {
    //  var dfts = this.listdft1D_windowed(signals, sampleRate, freqStart, freqEnd, scalar, new Array(Math.ceil(signals/sampleRate)).fill(0) );
    //  var products = this.bulkArrayMul(dfts, sampleRate, 5, 1);
    //  return products;
    //});

  }

  gpuXCors(arrays, precompute=false, texOut = false) { //gpu implementation for bulk cross/auto correlations, outputs [[0:0],[0:1],...,[1:1],...[n:n]]
 
    var outputTex;
   
    if(precompute === true) { //Precompute the means and estimators rather than in every single thread
      var means = [];
      var ests = [];
      arrays.forEach((arr,i) => {
        means.push(arr.reduce((prev,curr)=> curr += prev)/arr.length);
        ests.push(Math.sqrt(means[i].reduce((sum,item) => sum += Math.pow(item-mean1,2))));
      });

      var meansbuf = [];
      var estsbuf = [];
      var buffer = [];
      for(var i = 0; i < arrays.length; i++) {
        for(var j = i; j < arrays.length; j++){
          buffer.push(...arrays[i],...arrays[j]);
          meansbuf.push(means[i],means[j]);
          estsbuf.push(ests[i],ests[j]);
        }
      }

      this.correlogramsPC.setOutput([buffer.length]);
      this.correlogramsPC.setLoopMaxIterations(arrays[0].length*2);
      outputTex = this.correlogramsPC(buffer, arrays[0].length, meansbuf, estsbuf)
    }
    else{
      var buffer = [];
      for(var i = 0; i < arrays.length; i++) {
        for(var j = i; j < arrays.length; j++){
          buffer.push(...arrays[i],...arrays[j]);
        }
      }

      this.correlograms.setOutput([buffer.length]);
      this.correlograms.setLoopMaxIterations(arrays[0].length*2);

      outputTex = this.correlograms(buffer, arrays[0].length);
    }

    if(texOut === true) { return outputTex; }
    var outputbuf = outputTex.toArray();
    outputTex.delete();
    var outputarrs = [];

    for(var i = 0; i < arrays.length; i++){
      outputarrs.push(outputbuf.splice(0, arrays[0].length));
    }

    return outputarrs;

  } 

  //Input array buffer and the number of seconds of data
  gpuDFT(signalBuffer, nSeconds, scalar=1, texOut = false){

    var nSamples = signalBuffer.length;
    var sampleRate = nSamples/nSeconds;

    this.dft.setOutput([signalBuffer.length]);
    this.dft.setLoopMaxIterations(nSamples);

    var outputTex = this.dft(signalBuffer, nSamples, scalar, DCoffset);
    var output = null;
    if(texOut === false){
      var freqDist = this.makeFrequencyDistribution(nSamples, sampleRate);
      var signalBufferProcessed = outputTex.toArray();
      //console.log(signalBufferProcessed);
      outputTex.delete();
      return [freqDist,this.orderMagnitudes(signalBufferProcessed)]; //Returns x (frequencies) and y axis (magnitudes)
    }
    else {
      var tex = outputTex; 
      outputTex.delete(); 
      return tex;
    }
  }

  //Input array of array buffers of the same length and the number of seconds recorded
  MultiChannelDFT(signalBuffer, nSeconds, scalar=1, texOut=false) {
    
    var signalBufferProcessed = [];
      
    signalBuffer.forEach((row) => {
      signalBufferProcessed.push(...row);
    });
    //console.log(signalBufferProcessed);
  
    var nSamplesPerChannel = signalBuffer[0].length;
    var sampleRate = nSamplesPerChannel/nSeconds

    this.listdft1D.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals
    this.listdft1D.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)
        
    var outputTex = this.listdft1D(signalBufferProcessed,nSamplesPerChannel, scalar);
    if(texOut === false){
      var orderedMagsList = [];

      var freqDist = this.makeFrequencyDistribution(nSamplesPerChannel, sampleRate);
      signalBufferProcessed = outputTex.toArray();
      //console.log(signalBufferProcessed);

      for(var i = 0; i < signalBufferProcessed.length; i+=nSamplesPerChannel){
        orderedMagsList.push(this.orderMagnitudes([...signalBufferProcessed.slice(i,i+nSamplesPerChannel)]));
      }
      //Now slice up the big buffer into individual arrays for each signal

      outputTex.delete();
      return [freqDist,orderedMagsList]; //Returns x (frequencies) and y axis (magnitudes)
    }
    else {
      var tex = outputTex; 
      outputTex.delete(); 
      return tex;
    }
  }

      
  //Input buffer of signals [[channel 0],[channel 1],...,[channel n]] with the same number of samples for each signal. Returns arrays of the positive DFT results in the given window.
  MultiChannelDFT_Bandpass(signalBuffer=[],nSeconds,freqStart,freqEnd, scalar=1, texOut = false) {

    var signalBufferProcessed = [];
      
    signalBuffer.forEach((row) => {
      signalBufferProcessed.push(...row);
    });
    //console.log(signalBufferProcessed);

    var freqEnd_nyquist = freqEnd*2;
    var nSamplesPerChannel = signalBuffer[0].length;
    var sampleRate = nSamplesPerChannel/nSeconds;
    
    this.listdft1D_windowed.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals
    this.listdft1D_windowed.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)
        
    var outputTex = this.listdft1D_windowed(signalBufferProcessed,sampleRate,freqStart,freqEnd_nyquist, scalar);
    if(texOut === true) { return outputTex; }
    
    signalBufferProcessed = outputTex.toArray();
    outputTex.delete();

    //console.log(signalBufferProcessed)
    //TODO: Optimize for SPEEEEEEED.. or just pass it str8 to a shader
    var freqDist = this.bandPassWindow(freqStart,freqEnd,sampleRate);
    return [freqDist, this.orderBPMagnitudes(signalBufferProcessed,nSeconds,sampleRate,nSamplesPerChannel)]; //Returns x (frequencies) and y axis (magnitudes)
  
  }

  orderMagnitudes(unorderedMags){
    return [...unorderedMags.slice(Math.ceil(unorderedMags.length*.5),unorderedMags.length),...unorderedMags.slice(0,Math.ceil(unorderedMags.length*.5))];  
  }

  makeFrequencyDistribution(FFTlength, sampleRate) {
    var N = FFTlength; // FFT size
    var df = sampleRate/N; // frequency resolution
    
    var freqDist = [];
    for(var i=(-N/2); i<(N/2); i++) {
      var freq = i*df;
      freqDist.push(freq);
    }
    return freqDist;
  }

  //Order and sum positive magnitudes from bandpass DFT
  orderBPMagnitudes(signalBufferProcessed,nSeconds,sampleRate,nSamplesPerChannel) {
    var magList = [];

      for(var i = 0; i < signalBufferProcessed.length; i+=nSamplesPerChannel){
        magList.push([...signalBufferProcessed.slice(i,Math.ceil(nSamplesPerChannel*.5+i))]);
      }


    var summedMags = [];
    var _sampleRate = 1/sampleRate;
    if(nSeconds > 1) { //Need to sum results when sample time > 1 sec
      magList.forEach((row, k) => {
        summedMags.push([]);
        var _max = 1/Math.max(...row); //uhh
        for(var i = 0; i < row.length; i++ ){
          if(i == 0){
              summedMags[k]=row.slice(i,Math.floor(sampleRate));
              i = Math.floor(sampleRate);
          }
          else {
              var j = i-Math.floor(Math.floor(i*_sampleRate)*sampleRate)-1; //console.log(j);
              summedMags[k][j] = summedMags[k][j] * row[i-1]*_max; 
          }
        }
        summedMags[k] = [...summedMags[k].slice(0,Math.ceil(summedMags[k].length*0.5))]

      });
      //console.log(summedMags);
      return summedMags;  
    }
    
    else {return magList;}
  }

  //Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.
  bandPassWindow(freqStart,freqEnd,nSteps,posOnly=true) {
 
    var freqEnd_nyquist = freqEnd*2;
    let increment = (freqEnd_nyquist - freqStart)/nSteps;

    var fftwindow = [];
    if(posOnly === true){
      for (var i = 0; i < Math.ceil(0.5*nSteps); i+=increment){
          fftwindow.push(freqStart + (freqEnd_nyquist-freqStart)*i/(nSteps));
      }
    }
    else{
      for (var i = -Math.ceil(0.5*nSteps); i < Math.ceil(0.5*nSteps); i+=increment){
        fftwindow.push(freqStart + (freqEnd_nyquist-freqStart)*i/(nSteps));
      }
    }
    return fftwindow;
  }
}










var mandebrotFrag = 
`
uniform sampler1D tex;
uniform vec2 center;
uniform float scale;
uniform int iter;

void main() {
    vec2 z, c;

    c.x = 1.3333 * (gl_TexCoord[0].x - 0.5) * scale - center.x;
    c.y = (gl_TexCoord[0].y - 0.5) * scale - center.y;

    int i;
    z = c;
    for(i=0; i<iter; i++) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
    }

    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);
}
`;

var juliaSetFrag =
`
uniform sampler1D tex;
uniform vec2 c;
uniform int iter;

void main() {
    vec2 z;
    z.x = 3.0 * (gl_TexCoord[0].x - 0.5);
    z.y = 2.0 * (gl_TexCoord[0].y - 0.5);

    int i;
    for(i=0; i<iter; i++) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
    }

    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);
}
`;
