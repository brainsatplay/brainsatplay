
//------------------------------------
//---------GPU Utility Funcs---------- (gpu.addFunction())
//------------------------------------

import { Input } from "gpu.js";


function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }
function mul(a, b) { return a * b; }
function div(a, b) { return a / b; }

function cadd(a_real, a_imag, b_real, b_imag) {
    return [a_real + b_real, a_imag + b_imag];
}

function csub(a_real, a_imag, b_real, b_imag) {
    return [a_real - b_real, a_imag - b_imag];
}

function cmul(a_real, a_imag, b_real, b_imag) {
    return [a_real*b_real - a_imag*b_imag, a_real*b_imag + a_imag*b_real];
}

function cexp(a_real, a_imag) {
    const er = Math.exp(a_real);
    return [er * Math.cos(a_imag), er * Math.sin(a_imag)];
}

function mag(a, b) { // Returns magnitude
    return Math.sqrt(a*a + b*b);
}

function conj(imag) { //Complex conjugate of x + iy is x - iy
    return 0 - imag;
}

function lof(n) { //Lowest odd factor
    const sqrt_n = Math.sqrt(n);
    var factor = 3;

    while(factor <= sqrt_n) {
        if (n % factor === 0) return factor;
        factor += 2;
    }
}

function mean(arr, len) {
    var mean = 0;
    for (var i = 0; i < len; i++) {
        mean += arr[i];
    }
    return mean/len;
}

function est(arr, mean, len) {
    var est = 0;
    for (var i=0; i<len;i++){
        est += (arr[i]-mean)*(arr[i]-mean);
    }
    return Math.sqrt(est);
}

function mse(arr, mean, len) { //mean squared error
    var est = 0;
    var vari = 0;
    for (var i = 0; i < len; i++) {
        vari = arr[i]-mean;
        est += vari*vari;
    }
    return est/len;
}

function rms(arr, mean, len) { //root mean square error
    var est = 0;
    var vari = 0;
    for (var i = 0; i < len; i++) {
        vari = arr[i]-mean;
        est += vari*vari;
    }
    return Math.sqrt(est/len);
}

function xcor(arr1, arr1mean, arr1Est, arr2, arr2mean, arr2Est, len, delay) { //performs a single pass of a cross correlation equation, see correlogramsKern
    var correlation = 0;
    for (var i = 0; i < len; i++)  {
        var j = i+delay;
        var k = 0;
        if(j < len) { k = arr2[j]; }
        correlation += (arr1[i]-arr1mean)*(k-arr2mean);
    }
    return correlation/(arr1Est*arr2Est);
}

function softmax(array, len, i) { // Returns a single array value for a 1d softmax function.
    var esum = 0;
    for(var j = 0; j < len; j++){
        esum+= Math.exp(array[j]);
    }
    return Math.exp(array[i])/esum;
}

function DFT(signal, len, freq){ //Extract a particular frequency
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len;

    for(var i = 0; i<len; i++){
      var sharedi = shared*i; //this.thread.x is the target frequency
      real = real+signal[i]*Math.cos(sharedi);
      imag = imag-signal[i]*Math.sin(sharedi);
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real*_len,imag*_len]; //mag(real,imag)
}

function DFTlist(signals, len, freq, n) { //Extract a particular frequency
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len;
    for(var i = 0; i<len; i++){
      var sharedi = shared*i; //this.thread.x is the target frequency
      real = real+signals[i+(len-1)*n]*Math.cos(sharedi);
      imag = imag-signals[i+(len-1)*n]*Math.sin(sharedi);  
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real*_len,imag*_len]; //mag(real,imag)
}

//FFT, simply implements a nyquist frequency based index skip for frequencies <= sampleRate*.25.
//Other optimization: could do 4 at once and return a vec4, this is what you see in some other libs
function FFT(signal, len, freq, sr){ //Extract a particular frequency
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len;

    var skip = 1;
    var N = 0;
    var factor = sr*.25;
    if(freq <= factor){
        while(freq <= factor){
            factor=factor*.5;
            skip+=1;
        }
    }

    for(var i = 0; i<len; i+=skip){
      var j = i;
      if(j > len) { j = len; }
      var sharedi = shared*j; //this.thread.x is the target frequency
      real = real+signal[j]*Math.cos(sharedi);
      imag = imag-signal[j]*Math.sin(sharedi);
      N += 1;
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real/N,imag/N]; //mag(real,imag)
}

//Conjugated real and imaginary parts for iDFT (need to test still)
function iDFT(fft, len, freq){ //inverse DFT to return time domain
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len;

    for(var i = 0; i<len; i++){
      var sharedi = shared*i; //this.thread.x is the target frequency
      real = real+fft[i]*Math.cos(sharedi);
      imag = fft[i]*Math.sin(sharedi)-imag;  
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real*_len,imag*_len]; //mag(real,imag)
}

function iDFTlist(fft,len,freq,n){ //inverse DFT to return time domain 
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len
    for (var i = 0; i<len; i++) {
      var sharedi = shared*i; //this.thread.x is the target frequency
      real = real+fft[i+(len-1)*n]*Math.cos(sharedi);
      imag = fft[i+(len-1)*n]*Math.sin(sharedi)-imag;  
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real*_len,imag*_len]; //mag(real,imag)
}

function iFFT(fft, len, freq, sr){ //inverse FFT to return time domain
    var real = 0;
    var imag = 0;
    var _len = 1/len;
    var shared = 6.28318530718*freq*_len;

    var skip = 1;
    var N = 0;
    var factor = sr*.25;
    if(freq <= factor){
        while(freq <= factor){
            factor=factor*.5;
            skip+=1;
        }
    }

    for(var i = 0; i<len; i+=skip){
      var j = i;
      if(j > len) { j = len; }
      var sharedi = shared*j; //this.thread.x is the target frequency
      real = real+fft[j]*Math.cos(sharedi);
      imag = fft[j]*Math.sin(sharedi)-imag;  
      N += 1;
    }
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return [real/N,imag/N]; //mag(real,imag)
}


function conv2D(src, width, height, kernel, kernelRadius) {
    const kSize = 2 * kernelRadius + 1;
    let r = 0, g = 0, b = 0;

    let i = -kernelRadius;
    let imgOffset = 0, kernelOffset = 0;
    while (i <= kernelRadius) {
    if (this.thread.x + i < 0 || this.thread.x + i >= width) {
        i++;
        continue;
    }

    let j = -kernelRadius;
    while (j <= kernelRadius) {
        if (this.thread.y + j < 0 || this.thread.y + j >= height) {
        j++;
        continue;
        }

        kernelOffset = (j + kernelRadius) * kSize + i + kernelRadius;
        const weights = kernel[kernelOffset];
        const pixel = src[this.thread.y + i][this.thread.x + j];
        r += pixel.r * weights;
        g += pixel.g * weights;
        b += pixel.b * weights;
        j++;
    }
    i++;
    }
    this.color(r, g, b);
}




//------------------------------------
//---------Kernel functions----------- (gpu.createKernel(func))
//------------------------------------


function correlogramsKern(arrays, len) { //Computes cross correlations of each pair of arrays given to the function. so xcor[0,1],xcor[2,3],etc

    var k = Math.floor(this.thread.x/len)*2;
    var delay = this.thread.x - Math.floor(this.thread.x/len)*len;
    var arr1mean = mean(arrays[k],len);
    var arr2mean = mean(arrays[k+1],len);
    var arr1Est = est(arrays[k],arr1mean,len);
    var arr2Est = est(arrays[k+1],arr2mean,len);

    var y_x = xcor(arrays[k],arr1mean,arr1Est,arrays[k+1],arr2mean,arr2Est,len,delay);

    return y_x;
}

//Computes cross correlations of each pair of arrays given to the function. so xcor[0,1],xcor[2,3],etc
//Takes precomputed averages and estimators for each array for efficiency
function correlogramsPCKern(arrays, len, means, estimators) { 
    var k = Math.floor(this.thread.x/len)*2;
    var delay = this.thread.x - Math.floor(this.thread.x/len)*len;
    var arr1mean = means[k];
    var arr2mean = means[k+1];
    var arr1Est = estimators[k];
    var arr2Est = estimators[k+1];

    var y_x = xcor(arrays[k],arr1mean,arr1Est,arrays[k+1],arr2mean,arr2Est,len,delay);

    return y_x;
}


//Return frequency domain based on DFT
function dftKern(signal, len, scalar) {
    var result = DFT(signal,len, this.thread.x);
    return mag(result[0], result[1])*scalar;
}

function idftKern(amplitudes, len, scalar) {
    var result = iDFT(amplitudes, len, this.thread.x);
    return mag(result[0], result[1])*scalar;
}

function fftKern(signal, len, scalar, sampleRate) {
    var result = FFT(signal,len, this.thread.x, sampleRate);
    return mag(result[0], result[1])*scalar;
}

function ifftKern(amplitudes, len, scalar, sampleRate) {
    var result = iFFT(amplitudes, len, this.thread.x, sampleRate);
    return mag(result[0], result[1])*scalar;
}

// Takes a 2D array input [signal1[],signal2[],signal3[]]; does not work atm
function listdft2DKern(signals, scalar) {
    var len = this.output.x;
    var result = DFT(signals[this.thread.y],len,this.thread.x);
    //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);
    return mag(result[0],result[1])*scalar; //mag(real,imag)
}

// More like a vertex buffer list to chunk through lists of signals
function listdft1DKern(signals,len, scalar) {
    var result = [0, 0];
    if (this.thread.x <= len) {
      result = DFT(signals,len,this.thread.x);
    } else {
      var n = Math.floor(this.thread.x/len);
      result = DFTlist(signals,len,this.thread.x-n*len,n);
    }

    return mag(result[0],result[1])*scalar;
}

function dft_windowedKern(signal, sampleRate, freqStart, freqEnd, scalar) {
    var result = [0,0];
    var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
    result = DFT(signal,sampleRate,freq);

    return mag(result[0],result[1])*scalar;
}

function fft_windowedKern(signal, sampleRate, freqStart, freqEnd, scalar) {
    var result = [0,0];
    var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
    result = FFT(signal,sampleRate,freq);

    return mag(result[0],result[1])*scalar;
}

function idft_windowedKern(amplitudes, sampleRate, freqStart, freqEnd, scalar) {
    var result = [0,0];
    var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
    result = iDFT(amplitudes,sampleRate,freq);

    return mag(result[0],result[1])*scalar;
}

function ifft_windowedKern(amplitudes, sampleRate, freqStart, freqEnd, scalar) {
    var result = [0,0];
    var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
    result = iFFT(amplitudes,sampleRate,freq);

    return mag(result[0],result[1])*scalar;
}

function listdft1D_windowedKern(signals, sampleRate, freqStart, freqEnd, scalar) { //Will make a higher resolution DFT for a smaller frequency window.
    var result = [0, 0];
    if (this.thread.x < sampleRate) {
      var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
      result = DFT(signals,sampleRate,freq);
    } else {
      var n = Math.floor(this.thread.x/sampleRate);
      var freq = ( ( ( this.thread.x - n * sampleRate) / sampleRate ) * ( freqEnd - freqStart ) ) + freqStart;
      result = DFTlist(signals,sampleRate,freq-n*sampleRate,n);
    }
    //var mags = mag(result[0],result[1]);

    return mag(result[0]*2,result[1]*2)*scalar; //Multiply result by 2 since we are only getting the positive results and want to estimate the actual amplitudes (positive = half power, reflected in the negative axis)
}

function listidft1D_windowedKern(ffts, sampleRate, freqStart, freqEnd, scalar) { //Will make a higher resolution DFT for a smaller frequency window.
    var result = [0, 0];
    if (this.thread.x < sampleRate) {
      var freq = ( (this.thread.x/sampleRate) * ( freqEnd - freqStart ) ) + freqStart;
      result = iDFT(ffts,sampleRate,freq);
    } else {
      var n = Math.floor(this.thread.x/sampleRate);
      var freq = ( ( ( this.thread.x - n * sampleRate) / sampleRate ) * ( freqEnd - freqStart ) ) + freqStart;
      result = iDFTlist(ffts,sampleRate,freq-n*sampleRate,n);
    }
    //var mags = mag(result[0],result[1]);

    return mag(result[0]*2,result[1]*2)*scalar; //Multiply result by 2 since we are only getting the positive results and want to estimate the actual amplitudes (positive = half power, reflected in the negative axis)
}

//e.g. arrays = [[arr1],[arr2],[arr3],[arr4],[arr5],[arr6]], len = 10, n = 2, scalar=1... return results of [arr1*arr2], [arr3*arr4], [arr5*arr6] as one long array that needs to be split
function bulkArrayMulKern(arrays, len, n, scalar) {
    var i = n*Math.floor(this.thread.x/len); //Jump forward in array buffer
    var product = arrays[i][this.thread.x];
    for (var j = 0; j < n; j++) {
      product *= arrays[j][this.thread.x];
    }
    return product*scalar;
}

function multiImgConv2DKern(img, width, height, kernels, kernelLengths, nKernels, graphical) {
    for(var i = 0; i < nKernels; i++){
        var kernelLength = kernelLengths[i];            
        var kernelRadius = (Math.sqrt(kernelLength) - 1) / 2;
        conv2D(img, width, height, kernels[i], kernelRadius);
    }
    if(graphical === 0){ return [this.color.r,this.color.g,this.color.b]; }
}

function transpose2DKern(mat2) { //Transpose a 2D matrix, meant to be combined
    return mat2[this.thread.y][this.thread.x];
}


//function deferredPass(vPos, vNorm, vAlbedo, vDepth, vSpec) {  } //project geometry, light geometry

/*
Scene drawing:
(With depth testing enabled)
1. Project object local spaces to world space based on geometry and world coordinates
1.5 do some occlusion culling for which texture data to send to the gpu, requires last camera matrix
2. Now send to lighting pass, with coloring properties defined by different texture maps. 
3. Project result to camera space based on camera position and aperture.
4. Draw result
*/


//Note on pixel operations in gpujs: create kernel with setGraphical(true), render() to offscreencanvas, get render.getPixels() on each frame for pixel values which can be stored math operations


//Exports

export const createGpuKernels = {
    correlogramsKern, correlogramsPCKern, dftKern, idftKern, fftKern, ifftKern,
    dft_windowedKern, idft_windowedKern, fft_windowedKern, ifft_windowedKern, 
    listdft2DKern, listdft1DKern, listdft1D_windowedKern, listidft1D_windowedKern, 
    bulkArrayMulKern, fftKern, ifftKern, multiImgConv2DKern
}

export const addGpuFunctions = [
    add, sub, mul, div, cadd, csub,
    cmul, cexp, mag, conj, lof, mean, est,
    mse, rms, xcor, softmax, DFT, DFTlist,
    iDFT, iDFTlist, FFT, iFFT, conv2D
];