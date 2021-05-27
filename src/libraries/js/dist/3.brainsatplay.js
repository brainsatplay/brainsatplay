(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["brainsatplay"] = factory();
	else
		root["brainsatplay"] = factory();
})(this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7003:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


// EXTERNAL MODULE: ./node_modules/gpu.js/dist/gpu-browser.js
var gpu_browser = __webpack_require__(9985);
;// CONCATENATED MODULE: ./src/libraries/js/src/utils/gpuUtils-functs.js
var _createGpuKernels;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//By Joshua Brewster, Dovydas Stirpeika (MIT License)
//------------------------------------
//---------GPU Utility Funcs---------- (gpu.addFunction())
//------------------------------------
function add(a, b) {
  return a + b;
}

function sub(a, b) {
  return a - b;
}

function mul(a, b) {
  return a * b;
}

function div(a, b) {
  return a / b;
}

function cadd(a_real, a_imag, b_real, b_imag) {
  return [a_real + b_real, a_imag + b_imag];
}

function csub(a_real, a_imag, b_real, b_imag) {
  return [a_real - b_real, a_imag - b_imag];
}

function cmul(a_real, a_imag, b_real, b_imag) {
  return [a_real * b_real - a_imag * b_imag, a_real * b_imag + a_imag * b_real];
}

function cexp(a_real, a_imag) {
  var er = Math.exp(a_real);
  return [er * Math.cos(a_imag), er * Math.sin(a_imag)];
}

function mag(a, b) {
  // Returns magnitude
  return Math.sqrt(a * a + b * b);
}

function conj(imag) {
  //Complex conjugate of x + iy is x - iy
  return 0 - imag;
}

function lof(n) {
  //Lowest odd factor
  var sqrt_n = Math.sqrt(n);
  var factor = 3;

  while (factor <= sqrt_n) {
    if (n % factor === 0) return factor;
    factor += 2;
  }
}

function mean(arr, len) {
  var mean = 0;

  for (var i = 0; i < len; i++) {
    mean += arr[i];
  }

  return mean / len;
}

function est(arr, mean, len) {
  var est = 0;

  for (var i = 0; i < len; i++) {
    est += (arr[i] - mean) * (arr[i] - mean);
  }

  return Math.sqrt(est);
}

function mse(arr, mean, len) {
  //mean squared error
  var est = 0;
  var vari = 0;

  for (var i = 0; i < len; i++) {
    vari = arr[i] - mean;
    est += vari * vari;
  }

  return est / len;
}

function rms(arr, mean, len) {
  //root mean square error
  var est = 0;
  var vari = 0;

  for (var i = 0; i < len; i++) {
    vari = arr[i] - mean;
    est += vari * vari;
  }

  return Math.sqrt(est / len);
}

function xcor(arr1, arr1mean, arr1Est, arr2, arr2mean, arr2Est, len, delay) {
  //performs a single pass of a cross correlation equation, see correlogramsKern
  var correlation = 0;

  for (var i = 0; i < len; i++) {
    var j = i + delay;
    var k = 0;

    if (j < len) {
      k = arr2[j];
    }

    correlation += (arr1[i] - arr1mean) * (k - arr2mean);
  }

  return correlation / (arr1Est * arr2Est);
}

function softmax(array, len, i) {
  // Returns a single array value for a 1d softmax function.
  var esum = 0;

  for (var j = 0; j < len; j++) {
    esum += Math.exp(array[j]);
  }

  return Math.exp(array[i]) / esum;
}

function DFT(signal, len, freq) {
  //Extract a particular frequency
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;

  for (var i = 0; i < len; i++) {
    var sharedi = shared * i; //this.thread.x is the target frequency

    real = real + signal[i] * Math.cos(sharedi);
    imag = imag - signal[i] * Math.sin(sharedi);
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real * _len, imag * _len]; //mag(real,imag)
}

function DFTlist(signals, len, freq, n) {
  //Extract a particular frequency
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;

  for (var i = 0; i < len; i++) {
    var sharedi = shared * i; //this.thread.x is the target frequency

    real = real + signals[i + (len - 1) * n] * Math.cos(sharedi);
    imag = imag - signals[i + (len - 1) * n] * Math.sin(sharedi);
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real * _len, imag * _len]; //mag(real,imag)
} //FFT, simply implements a nyquist frequency based index skip for frequencies <= sampleRate*.25.
//Other optimization: could do 4 loops per thread and return a vec4, this is what you see in some other ultrafast libs


function FFT(signal, len, freq, sr) {
  //Extract a particular frequency
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;
  var skip = 1;
  var N = 0;
  var factor = sr * .25;

  if (freq <= factor) {
    while (freq <= factor) {
      factor = factor * .5;
      skip += 1;
    }
  }

  for (var i = 0; i < len; i += skip) {
    var j = i;

    if (j > len) {
      j = len;
    }

    var sharedi = shared * j; //this.thread.x is the target frequency

    real = real + signal[j] * Math.cos(sharedi);
    imag = imag - signal[j] * Math.sin(sharedi);
    N += 1;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real / N, imag / N]; //mag(real,imag)
}

function FFTlist(signals, len, freq, n, sr) {
  //Extract a particular frequency from a 1D list of equal sized signal arrays. Uses less samples for lower frequencies closer to nyquist threshold
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;
  var skip = 1;
  var N = 0;
  var factor = sr * .25;

  if (freq <= factor) {
    while (freq <= factor) {
      factor = factor * .5;
      skip += 1;
    }
  }

  for (var i = 0; i < len; i += skip) {
    var j = i;

    if (j > len) {
      j = len;
    }

    var sharedi = shared * j; //this.thread.x is the target frequency

    real = real + signals[j + (len - 1) * n] * Math.cos(sharedi);
    imag = imag - signals[j + (len - 1) * n] * Math.sin(sharedi);
    N += 1;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real / N, imag / N]; //mag(real,imag)
} //Conjugated real and imaginary parts for iDFT (need to test still)


function iDFT(fft, len, freq) {
  //inverse DFT to return time domain
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;

  for (var i = 0; i < len; i++) {
    var sharedi = shared * i; //this.thread.x is the target frequency

    real = real + fft[i] * Math.cos(sharedi);
    imag = fft[i] * Math.sin(sharedi) - imag;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real * _len, imag * _len]; //mag(real,imag)
}

function iDFTlist(fft, len, freq, n) {
  //inverse DFT to return time domain 
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;

  for (var i = 0; i < len; i++) {
    var sharedi = shared * i; //this.thread.x is the target frequency

    real = real + fft[i + (len - 1) * n] * Math.cos(sharedi);
    imag = fft[i + (len - 1) * n] * Math.sin(sharedi) - imag;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real * _len, imag * _len]; //mag(real,imag)
}

function iFFT(fft, len, freq, sr) {
  //inverse FFT to return time domain
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;
  var skip = 1;
  var N = 0;
  var factor = sr * .25;

  if (freq <= factor) {
    while (freq <= factor) {
      factor = factor * .5;
      skip += 1;
    }
  }

  for (var i = 0; i < len; i += skip) {
    var j = i;

    if (j > len) {
      j = len;
    }

    var sharedi = shared * j; //this.thread.x is the target frequency

    real = real + fft[j] * Math.cos(sharedi);
    imag = fft[j] * Math.sin(sharedi) - imag;
    N += 1;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real / N, imag / N]; //mag(real,imag)
}

function iFFTlist(signals, len, freq, n, sr) {
  //Extract a particular frequency from a 1D list of equal sized signal arrays. Uses less samples for lower frequencies closer to nyquist threshold
  var real = 0;
  var imag = 0;

  var _len = 1 / len;

  var shared = 6.28318530718 * freq * _len;
  var skip = 1;
  var N = 0;
  var factor = sr * .25;

  if (freq <= factor) {
    while (freq <= factor) {
      factor = factor * .5;
      skip += 1;
    }
  }

  for (var i = 0; i < len; i += skip) {
    var j = i;

    if (j > len) {
      j = len;
    }

    var sharedi = shared * j; //this.thread.x is the target frequency

    real = real + signals[j + (len - 1) * n] * Math.cos(sharedi);
    imag = signals[j + (len - 1) * n] * Math.sin(sharedi) - imag;
    N += 1;
  } //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);


  return [real / N, imag / N]; //mag(real,imag)
}

function conv2D(src, width, height, kernel, kernelRadius) {
  var kSize = 2 * kernelRadius + 1;
  var r = 0,
      g = 0,
      b = 0;
  var i = -kernelRadius;
  var imgOffset = 0,
      kernelOffset = 0;

  while (i <= kernelRadius) {
    if (this.thread.x + i < 0 || this.thread.x + i >= width) {
      i++;
      continue;
    }

    var j = -kernelRadius;

    while (j <= kernelRadius) {
      if (this.thread.y + j < 0 || this.thread.y + j >= height) {
        j++;
        continue;
      }

      kernelOffset = (j + kernelRadius) * kSize + i + kernelRadius;
      var weights = kernel[kernelOffset];
      var pixel = src[this.thread.y + i][this.thread.x + j];
      r += pixel.r * weights;
      g += pixel.g * weights;
      b += pixel.b * weights;
      j++;
    }

    i++;
  }

  this.color(r, g, b);
} //------------------------------------
//---------Kernel functions----------- (gpu.createKernel(func))
//------------------------------------


function correlogramsKern(arrays, len) {
  //Computes cross correlations of each pair of arrays given to the function. so xcor[0,1],xcor[2,3],etc
  var k = Math.floor(this.thread.x / len) * 2;
  var delay = this.thread.x - Math.floor(this.thread.x / len) * len;
  var arr1mean = mean(arrays[k], len);
  var arr2mean = mean(arrays[k + 1], len);
  var arr1Est = est(arrays[k], arr1mean, len);
  var arr2Est = est(arrays[k + 1], arr2mean, len);
  var y_x = xcor(arrays[k], arr1mean, arr1Est, arrays[k + 1], arr2mean, arr2Est, len, delay);
  return y_x;
} //Computes cross correlations of each pair of arrays given to the function. so xcor[0,1],xcor[2,3],etc
//Takes precomputed averages and estimators for each array for efficiency


function correlogramsPCKern(arrays, len, means, estimators) {
  var k = Math.floor(this.thread.x / len) * 2;
  var delay = this.thread.x - Math.floor(this.thread.x / len) * len;
  var arr1mean = means[k];
  var arr2mean = means[k + 1];
  var arr1Est = estimators[k];
  var arr2Est = estimators[k + 1];
  var y_x = xcor(arrays[k], arr1mean, arr1Est, arrays[k + 1], arr2mean, arr2Est, len, delay);
  return y_x;
} //Return frequency domain based on DFT


function dftKern(signal, len, scalar) {
  var result = DFT(signal, len, this.thread.x);
  return mag(result[0], result[1]) * scalar;
}

function idftKern(amplitudes, len, scalar) {
  var result = iDFT(amplitudes, len, this.thread.x);
  return mag(result[0], result[1]) * scalar;
}

function fftKern(signal, len, scalar, sampleRate) {
  var result = FFT(signal, len, this.thread.x, sampleRate);
  return mag(result[0], result[1]) * scalar;
}

function ifftKern(amplitudes, len, scalar, sampleRate) {
  var result = iFFT(amplitudes, len, this.thread.x, sampleRate);
  return mag(result[0], result[1]) * scalar;
} // Takes a 2D array input [signal1[],signal2[],signal3[]]; does not work atm


function listdft2DKern(signals, scalar) {
  var len = this.output.x;
  var result = DFT(signals[this.thread.y], len, this.thread.x); //var mag = Math.sqrt(real[k]*real[k]+imag[k]*imag[k]);

  return mag(result[0], result[1]) * scalar; //mag(real,imag)
} // [[signals1][signals2]]
// More like a vertex buffer list to chunk through lists of signals


function listdft1DKern(signals, len, scalar) {
  var result = [0, 0];

  if (this.thread.x <= len) {
    result = DFT(signals, len, this.thread.x);
  } else {
    var n = Math.floor(this.thread.x / len);
    result = DFTlist(signals, len, this.thread.x - n * len, n);
  }

  return mag(result[0], result[1]) * scalar;
} // [signals1,signasl2]
// More like a vertex buffer list to chunk through lists of signals


function listfft1DKern(signals, len, scalar, sps) {
  var result = [0, 0];

  if (this.thread.x <= len) {
    result = FFT(signals, len, this.thread.x, sps);
  } else {
    var n = Math.floor(this.thread.x / len);
    result = FFTlist(signals, len, this.thread.x - n * len, n, sps);
  }

  return mag(result[0], result[1]) * scalar;
} // [signals1,signasl2]


function dft_windowedKern(signal, sampleRate, freqStart, freqEnd, scalar) {
  var result = [0, 0];
  var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
  result = DFT(signal, sampleRate, freq);
  return mag(result[0], result[1]) * scalar;
} //windowed functions should use a 1 second window for these hacky DFTs/FFTs to work right.


function fft_windowedKern(signal, sampleRate, freqStart, freqEnd, scalar) {
  var result = [0, 0];
  var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
  result = FFT(signal, sampleRate, freq);
  return mag(result[0], result[1]) * scalar;
}

function idft_windowedKern(amplitudes, sampleRate, freqStart, freqEnd, scalar) {
  var result = [0, 0];
  var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
  result = iDFT(amplitudes, sampleRate, freq);
  return mag(result[0], result[1]) * scalar;
}

function ifft_windowedKern(amplitudes, sampleRate, freqStart, freqEnd, scalar) {
  var result = [0, 0];
  var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
  result = iFFT(amplitudes, sampleRate, freq);
  return mag(result[0], result[1]) * scalar;
}

function listdft1D_windowedKern(signals, sampleRate, freqStart, freqEnd, scalar) {
  //Will make a higher resolution DFT for a smaller frequency window.
  var result = [0, 0];

  if (this.thread.x < sampleRate) {
    var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
    result = DFT(signals, sampleRate, freq);
  } else {
    var n = Math.floor(this.thread.x / sampleRate);
    var freq = (this.thread.x - n * sampleRate) / sampleRate * (freqEnd - freqStart) + freqStart;
    result = DFTlist(signals, sampleRate, freq - n * sampleRate, n);
  } //var mags = mag(result[0],result[1]);


  return mag(result[0], result[1]) * scalar;
}

function listfft1D_windowedKern(signals, sampleRate, freqStart, freqEnd, scalar) {
  //Will make a higher resolution DFT for a smaller frequency window.
  var result = [0, 0];

  if (this.thread.x < sampleRate) {
    var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
    result = FFT(signals, sampleRate, freq, sampleRate);
  } else {
    var n = Math.floor(this.thread.x / sampleRate);
    var freq = (this.thread.x - n * sampleRate) / sampleRate * (freqEnd - freqStart) + freqStart;
    result = FFTlist(signals, sampleRate, freq - n * sampleRate, n, sampleRate);
  } //var mags = mag(result[0],result[1]);


  return mag(result[0], result[1]) * scalar;
}

function listidft1D_windowedKern(ffts, sampleRate, freqStart, freqEnd, scalar) {
  //Will make a higher resolution DFT for a smaller frequency window.
  var result = [0, 0];

  if (this.thread.x < sampleRate) {
    var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
    result = iDFT(ffts, sampleRate, freq);
  } else {
    var n = Math.floor(this.thread.x / sampleRate);
    var freq = (this.thread.x - n * sampleRate) / sampleRate * (freqEnd - freqStart) + freqStart;
    result = iDFTlist(ffts, sampleRate, freq - n * sampleRate, n);
  } //var mags = mag(result[0],result[1]);


  return mag(result[0] * 2, result[1] * 2) * scalar; //Multiply result by 2 since we are only getting the positive results and want to estimate the actual amplitudes (positive = half power, reflected in the negative axis)
}

function listifft1D_windowedKern(ffts, sampleRate, freqStart, freqEnd, scalar) {
  //Will make a higher resolution DFT for a smaller frequency window.
  var result = [0, 0];

  if (this.thread.x < sampleRate) {
    var freq = this.thread.x / sampleRate * (freqEnd - freqStart) + freqStart;
    result = iFFT(ffts, sampleRate, freq);
  } else {
    var n = Math.floor(this.thread.x / sampleRate);
    var freq = (this.thread.x - n * sampleRate) / sampleRate * (freqEnd - freqStart) + freqStart;
    result = iFFTlist(ffts, sampleRate, freq - n * sampleRate, n);
  } //var mags = mag(result[0],result[1]);


  return mag(result[0] * 2, result[1] * 2) * scalar; //Multiply result by 2 since we are only getting the positive results and want to estimate the actual amplitudes (positive = half power, reflected in the negative axis)
} //e.g. arrays = [[arr1],[arr2],[arr3],[arr4],[arr5],[arr6]], len = 10, n = 2, scalar=1... return results of [arr1*arr2], [arr3*arr4], [arr5*arr6] as one long array that needs to be split


function bulkArrayMulKern(arrays, len, n, scalar) {
  var i = n * Math.floor(this.thread.x / len); //Jump forward in array buffer

  var product = arrays[i][this.thread.x];

  for (var j = 0; j < n; j++) {
    product *= arrays[j][this.thread.x];
  }

  return product * scalar;
}

function multiImgConv2DKern(img, width, height, kernels, kernelLengths, nKernels, graphical) {
  for (var i = 0; i < nKernels; i++) {
    var kernelLength = kernelLengths[i];
    var kernelRadius = (Math.sqrt(kernelLength) - 1) / 2;
    conv2D(img, width, height, kernels[i], kernelRadius);
  }

  if (graphical === 0) {
    return [this.color.r, this.color.g, this.color.b];
  }
}

function transpose2DKern(mat2) {
  //Transpose a 2D matrix, meant to be combined
  return mat2[this.thread.y][this.thread.x];
} //function deferredPass(vPos, vNorm, vAlbedo, vDepth, vSpec) {  } //project geometry, light geometry

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


var createGpuKernels = (_createGpuKernels = {
  correlogramsKern: correlogramsKern,
  correlogramsPCKern: correlogramsPCKern,
  dftKern: dftKern,
  idftKern: idftKern,
  fftKern: fftKern,
  ifftKern: ifftKern,
  dft_windowedKern: dft_windowedKern,
  idft_windowedKern: idft_windowedKern,
  fft_windowedKern: fft_windowedKern,
  ifft_windowedKern: ifft_windowedKern,
  listdft2DKern: listdft2DKern,
  listdft1DKern: listdft1DKern,
  listfft1DKern: listfft1DKern,
  listfft1D_windowedKern: listfft1D_windowedKern,
  listdft1D_windowedKern: listdft1D_windowedKern,
  listidft1D_windowedKern: listidft1D_windowedKern,
  listifft1D_windowedKern: listifft1D_windowedKern,
  bulkArrayMulKern: bulkArrayMulKern
}, _defineProperty(_createGpuKernels, "fftKern", fftKern), _defineProperty(_createGpuKernels, "ifftKern", ifftKern), _defineProperty(_createGpuKernels, "multiImgConv2DKern", multiImgConv2DKern), _createGpuKernels);
var addGpuFunctions = [add, sub, mul, div, cadd, csub, cmul, cexp, mag, conj, lof, mean, est, mse, rms, xcor, softmax, DFT, DFTlist, iDFT, iDFTlist, FFT, iFFT, iFFTlist, conv2D];
;// CONCATENATED MODULE: ./src/libraries/js/src/utils/gpuUtils.js
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


 //By Joshua Brewster, Dovydas Stirpeika (MIT License)

function makeKrnl(gpu, f) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    setDynamicOutput: true,
    setDynamicArguments: true,
    setPipeline: true,
    setImmutable: true
  };
  var k = gpu.createKernel(f);
  if (opts.setDynamicOutput) k.setDynamicOutput(true);
  if (opts.setDynamicArguments) k.setDynamicArguments(true);
  if (opts.setPipeline) k.setPipeline(true);
  if (opts.setImmutable) k.setImmutable(true); //.setOutput([signal.length]) //Call before running the kernel
  //.setLoopMaxIterations(signal.length);

  return k;
}

var gpuUtils = /*#__PURE__*/function () {
  function gpuUtils() {
    var gpu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new gpu_browser.GPU();

    _classCallCheck(this, gpuUtils);

    this.gpu = gpu;
    this.kernel;
    this.PI = 3.141592653589793;
    this.SQRT1_2 = 0.7071067811865476;
    this.addFunctions();
    this.imgkernels = {
      edgeDetection: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      boxBlur: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
      sobelLeft: [1, 0, -1, 2, 0, -2, 1, 0, -1],
      sobelRight: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
      sobelTop: [1, 2, 1, 0, 0, 0, -1, -2, -1],
      sobelBottom: [-1, 2, 1, 0, 0, 0, 1, 2, 1],
      identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
      gaussian3x3: [1, 2, 1, 2, 4, 2, 1, 2, 1],
      guassian7x7: [0, 0, 0, 5, 0, 0, 0, 0, 5, 18, 32, 18, 5, 0, 0, 18, 64, 100, 64, 18, 0, 5, 32, 100, 100, 100, 32, 5, 0, 18, 64, 100, 64, 18, 0, 0, 5, 18, 32, 18, 5, 0, 0, 0, 0, 5, 0, 0, 0],
      emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
      sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0]
    };
  }

  _createClass(gpuUtils, [{
    key: "addFunctions",
    value: function addFunctions() {
      var _this = this;

      addGpuFunctions.forEach(function (f) {
        return _this.gpu.addFunction(f);
      });
      this.correlograms = makeKrnl(this.gpu, createGpuKernels.correlogramsKern);
      this.correlogramsPC = makeKrnl(this.gpu, createGpuKernels.correlogramsKern);
      this.dft = makeKrnl(this.gpu, createGpuKernels.dftKern);
      this.idft = makeKrnl(this.gpu, createGpuKernels.idftKern);
      this.dft_windowed = makeKrnl(this.gpu, createGpuKernels.dft_windowedKern);
      this.idft_windoed = makeKrnl(this.gpu, createGpuKernels.idft_windowedKern);
      this.fft = makeKrnl(this.gpu, createGpuKernels.fftKern);
      this.ifft = makeKrnl(this.gpu, createGpuKernels.ifftKern);
      this.fft_windowed = makeKrnl(this.gpu, createGpuKernels.fft_windowedKern);
      this.ifft_windowed = makeKrnl(this.gpu, createGpuKernels.ifft_windowedKern);
      this.listdft2D = makeKrnl(this.gpu, createGpuKernels.listdft2DKern);
      this.listdft1D = makeKrnl(this.gpu, createGpuKernels.listdft1DKern);
      this.listdft1D_windowed = makeKrnl(this.gpu, createGpuKernels.listdft1D_windowedKern);
      this.listfft1D = makeKrnl(this.gpu, createGpuKernels.listfft1DKern);
      this.listfft1D_windowed = makeKrnl(this.gpu, createGpuKernels.listfft1D_windowedKern);
      this.listidft1D_windowed = makeKrnl(this.gpu, createGpuKernels.listidft1D_windowedKern);
      this.listifft1D_windowed = makeKrnl(this.gpu, createGpuKernels.listifft1D_windowedKern);
      this.bulkArrayMul = makeKrnl(this.gpu, createGpuKernels.bulkArrayMulKern);
      this.multiConv2D = makeKrnl(this.gpu, createGpuKernels.multiImgConv2DKern); //----------------------------------- Easy gpu pipelining
      //------------Combine Kernels-------- gpu.combineKernels(f1,f2,function(a,b,c) { f1(f2(a,b),c); });
      //----------------------------------- TODO: Make this actually work (weird error)
      //Bandpass FFT+iFFT to return a cleaned up waveform

      var signalBandpass = function signalBandpass(signal, sampleRate, freqStart, freqEnd, scalar) {
        //Returns the signal wave with the bandpass filter applied
        var dft = _this.fft_windowed(signal, sampleRate, freqStart, freqEnd, scalar, 0);

        var filtered_signal = _this.ifft_windowed(dft, sampleRate, freqStart, freqEnd, scalar);

        return filtered_signal;
      }; //this.signalBandpass = this.gpu.combineKernels(this.dft_windowedKern,this.idft_windowedKern, signalBandpass);


      var signalBandpassMulti = function signalBandpassMulti(signals, sampleRate, freqStart, freqEnd, scalar) {
        var dfts = _this.listdft1D_windowed(signals, sampleRate, freqStart, freqEnd, scalar, new Array(Math.ceil(signals / sampleRate)).fill(0));

        var filtered_signals = _this.listifft1D_windowed(dfts, sampleRate, freqStart, freqEnd, scalar);

        return filtered_signals;
      }; //this.signalBandpassMulti = this.gpu.combineKernels(this.listdft1D_windowed,this.listidft1D_windowed, signalBandpassMulti);
      //TODO: automatic auto/cross correlation and ordering.
      //Input signals like this : [signal1,signal2,autocor1,autocor2,crosscor,...repeat for desired coherence calculations] or any order of that.


      this.gpuCoherence = function (signals, sampleRate, freqStart, freqEnd, scalar) {
        //Take FFTs of the signals, their autocorrelations, and cross correlation (5 FFTs per coherence), then multiply.
        var xcors = _this.correlograms(signals);

        var dfts = _this.listfft1D_windowed(xcors, sampleRate, freqStart, freqEnd, scalar, new Array(Math.ceil(signals / sampleRate)).fill(0));

        var products = _this.bulkArrayMul(dfts, sampleRate, 5, 1);

        return products;
      }; //this.gpuCoherence = this.gpu.combineKernels(this.listdft1D_windowedKern, this.bulkArrayMulKern, function gpuCoherence(signals,sampleRate,freqStart,freqEnd,scalar) {
      //  var dfts = this.listdft1D_windowed(signals, sampleRate, freqStart, freqEnd, scalar, new Array(Math.ceil(signals/sampleRate)).fill(0) );
      //  var products = this.bulkArrayMul(dfts, sampleRate, 5, 1);
      //  return products;
      //});

    }
  }, {
    key: "gpuXCors",
    value: function gpuXCors(arrays) {
      var precompute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var texOut = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      //gpu implementation for bulk cross/auto correlations, outputs [[0:0],[0:1],...,[1:1],...[n:n]]
      var outputTex;

      if (precompute === true) {
        //Precompute the means and estimators rather than in every single thread
        var means = [];
        var ests = [];
        arrays.forEach(function (arr, i) {
          means.push(arr.reduce(function (prev, curr) {
            return curr += prev;
          }) / arr.length);
          ests.push(Math.sqrt(means[i].reduce(function (sum, item) {
            return sum += Math.pow(item - mean1, 2);
          })));
        });
        var meansbuf = [];
        var estsbuf = [];
        var buffer = [];

        for (var i = 0; i < arrays.length; i++) {
          for (var j = i; j < arrays.length; j++) {
            var _buffer;

            (_buffer = buffer).push.apply(_buffer, _toConsumableArray(arrays[i]).concat(_toConsumableArray(arrays[j])));

            meansbuf.push(means[i], means[j]);
            estsbuf.push(ests[i], ests[j]);
          }
        }

        this.correlogramsPC.setOutput([buffer.length]);
        this.correlogramsPC.setLoopMaxIterations(arrays[0].length * 2);
        outputTex = this.correlogramsPC(buffer, arrays[0].length, meansbuf, estsbuf);
      } else {
        var buffer = [];

        for (var i = 0; i < arrays.length; i++) {
          for (var j = i; j < arrays.length; j++) {
            var _buffer2;

            (_buffer2 = buffer).push.apply(_buffer2, _toConsumableArray(arrays[i]).concat(_toConsumableArray(arrays[j])));
          }
        }

        this.correlograms.setOutput([buffer.length]);
        this.correlograms.setLoopMaxIterations(arrays[0].length * 2);
        outputTex = this.correlograms(buffer, arrays[0].length);
      }

      if (texOut === true) {
        return outputTex;
      }

      var outputbuf = outputTex.toArray();
      outputTex["delete"]();
      var outputarrs = [];

      for (var i = 0; i < arrays.length; i++) {
        outputarrs.push(outputbuf.splice(0, arrays[0].length));
      }

      return outputarrs;
    } //Input array buffer and the number of seconds of data

  }, {
    key: "gpuDFT",
    value: function gpuDFT(signalBuffer, nSeconds) {
      var scalar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var texOut = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var nSamples = signalBuffer.length;
      var sampleRate = nSamples / nSeconds;
      this.dft.setOutput([signalBuffer.length]);
      this.dft.setLoopMaxIterations(nSamples);
      var outputTex = this.dft(signalBuffer, nSamples, scalar, DCoffset);
      var output = null;

      if (texOut === false) {
        var freqDist = this.makeFrequencyDistribution(nSamples, sampleRate);
        var signalBufferProcessed = outputTex.toArray(); //console.log(signalBufferProcessed);

        outputTex["delete"]();
        return [freqDist, this.orderMagnitudes(signalBufferProcessed)]; //Returns x (frequencies) and y axis (magnitudes)
      } else {
        var tex = outputTex;
        outputTex["delete"]();
        return tex;
      }
    } //Input array of array buffers of the same length and the number of seconds recorded

  }, {
    key: "MultiChannelDFT",
    value: function MultiChannelDFT(signalBuffer, nSeconds) {
      var scalar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var texOut = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var signalBufferProcessed = [];
      signalBuffer.forEach(function (row) {
        var _signalBufferProcesse;

        (_signalBufferProcesse = signalBufferProcessed).push.apply(_signalBufferProcesse, _toConsumableArray(row));
      }); //console.log(signalBufferProcessed);

      var nSamplesPerChannel = signalBuffer[0].length;
      var sampleRate = nSamplesPerChannel / nSeconds;
      this.listdft1D.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals

      this.listdft1D.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)

      var outputTex = this.listdft1D(signalBufferProcessed, nSamplesPerChannel, scalar);

      if (texOut === false) {
        var orderedMagsList = [];
        var freqDist = this.makeFrequencyDistribution(nSamplesPerChannel, sampleRate);
        signalBufferProcessed = outputTex.toArray(); //console.log(signalBufferProcessed);

        for (var i = 0; i < signalBufferProcessed.length; i += nSamplesPerChannel) {
          orderedMagsList.push(this.orderMagnitudes(_toConsumableArray(signalBufferProcessed.slice(i, i + nSamplesPerChannel))));
        } //Now slice up the big buffer into individual arrays for each signal


        outputTex["delete"]();
        return [freqDist, orderedMagsList]; //Returns x (frequencies) and y axis (magnitudes)
      } else {
        var tex = outputTex;
        outputTex["delete"]();
        return tex;
      }
    } //Input buffer of signals [[channel 0],[channel 1],...,[channel n]] with the same number of samples for each signal. Returns arrays of the positive DFT results in the given window.

  }, {
    key: "MultiChannelDFT_Bandpass",
    value: function MultiChannelDFT_Bandpass() {
      var signalBuffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var nSeconds = arguments.length > 1 ? arguments[1] : undefined;
      var freqStart = arguments.length > 2 ? arguments[2] : undefined;
      var freqEnd = arguments.length > 3 ? arguments[3] : undefined;
      var scalar = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
      var texOut = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      var signalBufferProcessed = [];
      signalBuffer.forEach(function (row) {
        var _signalBufferProcesse2;

        (_signalBufferProcesse2 = signalBufferProcessed).push.apply(_signalBufferProcesse2, _toConsumableArray(row));
      }); //console.log(signalBufferProcessed);

      var freqEnd_nyquist = freqEnd * 2;
      var nSamplesPerChannel = signalBuffer[0].length;
      var sampleRate = nSamplesPerChannel / nSeconds;
      this.listdft1D_windowed.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals

      this.listdft1D_windowed.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)

      var outputTex = this.listdft1D_windowed(signalBufferProcessed, sampleRate, freqStart, freqEnd_nyquist, scalar);

      if (texOut === true) {
        return outputTex;
      }

      signalBufferProcessed = outputTex.toArray();
      outputTex["delete"](); //console.log(signalBufferProcessed)
      //TODO: Optimize for SPEEEEEEED.. or just pass it str8 to a shader

      var freqDist = this.bandPassWindow(freqStart, freqEnd, sampleRate);
      return [freqDist, this.orderBPMagnitudes(signalBufferProcessed, nSeconds, sampleRate, nSamplesPerChannel)]; //Returns x (frequencies) and y axis (magnitudes)
    } //Input array buffer and the number of seconds of data

  }, {
    key: "gpuFFT",
    value: function gpuFFT(signalBuffer, nSeconds) {
      var scalar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var texOut = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var nSamples = signalBuffer.length;
      var sampleRate = nSamples / nSeconds;
      this.fft.setOutput([signalBuffer.length]);
      this.fft.setLoopMaxIterations(nSamples);
      var outputTex = this.fft(signalBuffer, nSamples, scalar, DCoffset);
      var output = null;

      if (texOut === false) {
        var freqDist = this.makeFrequencyDistribution(nSamples, sampleRate);
        var signalBufferProcessed = outputTex.toArray(); //console.log(signalBufferProcessed);

        outputTex["delete"]();
        return [freqDist, this.orderMagnitudes(signalBufferProcessed)]; //Returns x (frequencies) and y axis (magnitudes)
      } else {
        var tex = outputTex;
        outputTex["delete"]();
        return tex;
      }
    } //Input array of array buffers of the same length and the number of seconds recorded

  }, {
    key: "MultiChannelFFT",
    value: function MultiChannelFFT(signalBuffer, nSeconds) {
      var scalar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var texOut = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var signalBufferProcessed = [];
      signalBuffer.forEach(function (row) {
        var _signalBufferProcesse3;

        (_signalBufferProcesse3 = signalBufferProcessed).push.apply(_signalBufferProcesse3, _toConsumableArray(row));
      }); //console.log(signalBufferProcessed);

      var nSamplesPerChannel = signalBuffer[0].length;
      var sampleRate = nSamplesPerChannel / nSeconds;
      this.listfft1D.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals

      this.listfft1D.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)

      var outputTex = this.listfft1D(signalBufferProcessed, nSamplesPerChannel, scalar);

      if (texOut === false) {
        var orderedMagsList = [];
        var freqDist = this.makeFrequencyDistribution(nSamplesPerChannel, sampleRate);
        signalBufferProcessed = outputTex.toArray(); //console.log(signalBufferProcessed);

        for (var i = 0; i < signalBufferProcessed.length; i += nSamplesPerChannel) {
          orderedMagsList.push(this.orderMagnitudes(_toConsumableArray(signalBufferProcessed.slice(i, i + nSamplesPerChannel))));
        } //Now slice up the big buffer into individual arrays for each signal


        outputTex["delete"]();
        return [freqDist, orderedMagsList]; //Returns x (frequencies) and y axis (magnitudes)
      } else {
        var tex = outputTex;
        outputTex["delete"]();
        return tex;
      }
    } //Input buffer of signals [[channel 0],[channel 1],...,[channel n]] with the same number of samples for each signal. Returns arrays of the positive DFT results in the given window.

  }, {
    key: "MultiChannelFFT_Bandpass",
    value: function MultiChannelFFT_Bandpass() {
      var signalBuffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var nSeconds = arguments.length > 1 ? arguments[1] : undefined;
      var freqStart = arguments.length > 2 ? arguments[2] : undefined;
      var freqEnd = arguments.length > 3 ? arguments[3] : undefined;
      var scalar = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
      var texOut = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      var signalBufferProcessed = [];
      signalBuffer.forEach(function (row) {
        var _signalBufferProcesse4;

        (_signalBufferProcesse4 = signalBufferProcessed).push.apply(_signalBufferProcesse4, _toConsumableArray(row));
      }); //console.log(signalBufferProcessed);

      var freqEnd_nyquist = freqEnd * 2;
      var nSamplesPerChannel = signalBuffer[0].length;
      var sampleRate = nSamplesPerChannel / nSeconds;
      this.listfft1D_windowed.setOutput([signalBufferProcessed.length]); //Set output to length of list of signals

      this.listfft1D_windowed.setLoopMaxIterations(nSamplesPerChannel); //Set loop size to the length of one signal (assuming all are uniform length)

      var outputTex = this.listfft1D_windowed(signalBufferProcessed, sampleRate, freqStart, freqEnd_nyquist, scalar);

      if (texOut === true) {
        return outputTex;
      }

      signalBufferProcessed = outputTex.toArray();
      outputTex["delete"](); //console.log(signalBufferProcessed)
      //TODO: Optimize for SPEEEEEEED.. or just pass it str8 to a shader

      var freqDist = this.bandPassWindow(freqStart, freqEnd, sampleRate);
      return [freqDist, this.orderBPMagnitudes(signalBufferProcessed, nSeconds, sampleRate, nSamplesPerChannel)]; //Returns x (frequencies) and y axis (magnitudes)
    }
  }, {
    key: "orderMagnitudes",
    value: function orderMagnitudes(unorderedMags) {
      return [].concat(_toConsumableArray(unorderedMags.slice(Math.ceil(unorderedMags.length * .5), unorderedMags.length)), _toConsumableArray(unorderedMags.slice(0, Math.ceil(unorderedMags.length * .5))));
    }
  }, {
    key: "makeFrequencyDistribution",
    value: function makeFrequencyDistribution(FFTlength, sampleRate) {
      var N = FFTlength; // FFT size

      var df = sampleRate / N; // frequency resolution

      var freqDist = [];

      for (var i = -N / 2; i < N / 2; i++) {
        var freq = i * df;
        freqDist.push(freq);
      }

      return freqDist;
    } //Order and sum positive magnitudes from bandpass DFT

  }, {
    key: "orderBPMagnitudes",
    value: function orderBPMagnitudes(signalBufferProcessed, nSeconds, sampleRate, nSamplesPerChannel) {
      var magList = [];

      for (var i = 0; i < signalBufferProcessed.length; i += nSamplesPerChannel) {
        magList.push(_toConsumableArray(signalBufferProcessed.slice(i, Math.ceil(nSamplesPerChannel * .5 + i))));
      }

      var summedMags = [];

      var _sampleRate = 1 / sampleRate;

      if (nSeconds > 1) {
        //Need to sum results when sample time > 1 sec
        magList.forEach(function (row, k) {
          summedMags.push([]);

          var _max = 1 / Math.max.apply(Math, _toConsumableArray(row)); //uhh


          for (var i = 0; i < row.length; i++) {
            if (i == 0) {
              summedMags[k] = row.slice(i, Math.floor(sampleRate));
              i = Math.floor(sampleRate);
            } else {
              var j = i - Math.floor(Math.floor(i * _sampleRate) * sampleRate) - 1; //console.log(j);

              summedMags[k][j] = summedMags[k][j] * row[i - 1] * _max;
            }
          }

          summedMags[k] = _toConsumableArray(summedMags[k].slice(0, Math.ceil(summedMags[k].length * 0.5)));
        }); //console.log(summedMags);

        return summedMags;
      } else {
        return magList;
      }
    } //Returns the x axis (frequencies) for the bandpass filter amplitudes. The window gets stretched or squeezed between the chosen frequencies based on the sample rate in my implementation.

  }, {
    key: "bandPassWindow",
    value: function bandPassWindow(freqStart, freqEnd, nSteps) {
      var posOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var freqEnd_nyquist = freqEnd * 2;
      var increment = (freqEnd_nyquist - freqStart) / nSteps;
      var fftwindow = [];

      if (posOnly === true) {
        for (var i = 0; i < Math.ceil(0.5 * nSteps); i += increment) {
          fftwindow.push(freqStart + (freqEnd_nyquist - freqStart) * i / nSteps);
        }
      } else {
        for (var i = -Math.ceil(0.5 * nSteps); i < Math.ceil(0.5 * nSteps); i += increment) {
          fftwindow.push(freqStart + (freqEnd_nyquist - freqStart) * i / nSteps);
        }
      }

      return fftwindow;
    }
  }]);

  return gpuUtils;
}();
var mandebrotFrag = "\nuniform sampler1D tex;\nuniform vec2 center;\nuniform float scale;\nuniform int iter;\n\nvoid main() {\n    vec2 z, c;\n\n    c.x = 1.3333 * (gl_TexCoord[0].x - 0.5) * scale - center.x;\n    c.y = (gl_TexCoord[0].y - 0.5) * scale - center.y;\n\n    int i;\n    z = c;\n    for(i=0; i<iter; i++) {\n        float x = (z.x * z.x - z.y * z.y) + c.x;\n        float y = (z.y * z.x + z.x * z.y) + c.y;\n\n        if((x * x + y * y) > 4.0) break;\n        z.x = x;\n        z.y = y;\n    }\n\n    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);\n}\n";
var juliaSetFrag = "\nuniform sampler1D tex;\nuniform vec2 c;\nuniform int iter;\n\nvoid main() {\n    vec2 z;\n    z.x = 3.0 * (gl_TexCoord[0].x - 0.5);\n    z.y = 2.0 * (gl_TexCoord[0].y - 0.5);\n\n    int i;\n    for(i=0; i<iter; i++) {\n        float x = (z.x * z.x - z.y * z.y) + c.x;\n        float y = (z.y * z.x + z.x * z.y) + c.y;\n\n        if((x * x + y * y) > 4.0) break;\n        z.x = x;\n        z.y = y;\n    }\n\n    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);\n}\n";
;// CONCATENATED MODULE: ./src/libraries/js/src/utils/eegmath.js
function eegmath_toConsumableArray(arr) { return eegmath_arrayWithoutHoles(arr) || eegmath_iterableToArray(arr) || eegmath_unsupportedIterableToArray(arr) || eegmath_nonIterableSpread(); }

function eegmath_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function eegmath_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return eegmath_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return eegmath_arrayLikeToArray(o, minLen); }

function eegmath_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function eegmath_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return eegmath_arrayLikeToArray(arr); }

function eegmath_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function eegmath_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function eegmath_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function eegmath_createClass(Constructor, protoProps, staticProps) { if (protoProps) eegmath_defineProperties(Constructor.prototype, protoProps); if (staticProps) eegmath_defineProperties(Constructor, staticProps); return Constructor; }

//By Joshua Brewster (GPL)
var eegmath = /*#__PURE__*/function () {
  function eegmath() {
    eegmath_classCallCheck(this, eegmath);
  } //----------------------------------------------------------------
  //-------------------- Static Functions --------------------------
  //----------------------------------------------------------------
  //Generate sinewave, you can add a noise frequency in too. Array length will be Math.ceil(fs*nSec)


  eegmath_createClass(eegmath, null, [{
    key: "genSineWave",
    value: function genSineWave() {
      var freq = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
      var peakAmp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var nSec = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var fs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 512;
      var freq2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var peakAmp2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
      var sineWave = [];
      var t = [];
      var increment = 1 / fs; //x-axis time increment based on sample rate

      for (var ti = 0; ti < nSec; ti += increment) {
        var amplitude = Math.sin(2 * Math.PI * freq * ti) * peakAmp;
        amplitude += Math.sin(2 * Math.PI * freq2 * ti) * peakAmp2; //Add interference

        sineWave.push(amplitude);
        t.push(ti);
      }

      return [t, sineWave]; // [[times],[amplitudes]]
    }
  }, {
    key: "mean",
    value: function mean(arr) {
      var sum = arr.reduce(function (prev, curr) {
        return curr += prev;
      });
      return sum / arr.length;
    }
  }, {
    key: "variance",
    value: function variance(arr1) {
      //1D input arrays of length n
      var mean1 = this.mean(arr1);
      var vari = [];

      for (var i = 0; i < arr1.length; i++) {
        vari.push((arr1[i] - mean1) / (arr1.length - 1));
      }

      return vari;
    }
  }, {
    key: "transpose",
    value: function transpose(mat) {
      return mat[0].map(function (_, colIndex) {
        return mat.map(function (row) {
          return row[colIndex];
        });
      });
    } //Matrix multiplication from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript

  }, {
    key: "matmul",
    value: function matmul(a, b) {
      var aNumRows = a.length,
          aNumCols = a[0].length,
          bNumRows = b.length,
          bNumCols = b[0].length,
          m = new Array(aNumRows); // initialize array of rows

      for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row

        for (var c = 0; c < bNumCols; ++c) {
          m[r][c] = 0; // initialize the current cell

          for (var i = 0; i < aNumCols; ++i) {
            m[r][c] += a[r][i] * b[i][c];
          }
        }
      }

      return m;
    } //2D matrix covariance (e.g. for lists of signals). Pretty fast!!!

  }, {
    key: "cov2d",
    value: function cov2d(mat) {
      var _this = this;

      //[[x,y,z,w],[x,y,z,w],...] input list of vectors of the same length
      //Get variance of rows and columns
      //console.time("cov2d");
      var mattransposed = this.transpose(mat); //console.log(mattransposed)

      var matproducts = [];
      var rowmeans = [];
      var colmeans = [];
      mat.forEach(function (row, idx) {
        rowmeans.push(_this.mean(row));
      });
      mattransposed.forEach(function (col, idx) {
        colmeans.push(_this.mean(col));
      });
      mat.forEach(function (row, idx) {
        matproducts.push([]);

        for (var col = 0; col < row.length; col++) {
          matproducts[idx].push((mat[idx][col] - rowmeans[idx]) * (mat[idx][col] - colmeans[col]) / (row.length - 1));
        }
      });
      /*
      	mat[y][x] = (x - rowAvg)*(x - colAvg) / (mat[y].length - 1);
      */

      console.log(matproducts); //Transpose matrix

      var matproductstransposed = this.transpose(matproducts); //Matrix multiplication, stolen from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript

      var aNumRows = matproducts.length,
          aNumCols = matproducts[0].length,
          bNumRows = matproductstransposed.length,
          bNumCols = matproductstransposed[0].length,
          m = new Array(aNumRows); // initialize array of rows

      for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row

        for (var c = 0; c < bNumCols; ++c) {
          m[r][c] = 0; // initialize the current cell

          for (var i = 0; i < aNumCols; ++i) {
            m[r][c] += matproducts[r][i] * matproductstransposed[i][c] / (mat[0].length - 1); //divide by row length - 1
          }
        }
      } //console.timeEnd("cov2d");


      return m; //Covariance matrix
    } //Covariance between two 1D arrays

  }, {
    key: "cov1d",
    value: function cov1d(arr1, arr2) {
      return this.cov2d([arr1, arr2]);
    } //Simple cross correlation.

  }, {
    key: "crosscorrelation",
    value: function crosscorrelation(arr1, arr2) {
      //console.time("crosscorrelation");
      var arr2buf = [].concat(eegmath_toConsumableArray(arr2), eegmath_toConsumableArray(Array(arr2.length).fill(0)));
      var mean1 = this.mean(arr1);
      var mean2 = this.mean(arr2); //Estimators

      var arr1Est = arr1.reduce(function (sum, item) {
        return sum += Math.pow(item - mean1, 2);
      });
      arr1Est = Math.sqrt(arr1Est);
      var arr2Est = arr2.reduce(function (sum, item) {
        return sum += Math.pow(item - mean1, 2);
      });
      arr2Est = Math.sqrt(arr2Est);

      var _arrEstsMul = 1 / (arr1Est * arr2Est);

      var correlations = new Array(arr1.length).fill(0);

      for (var delay = 0; delay < arr1.length; delay++) {
        var r = arr1.reduce(function (sum, item, i) {
          return sum += (item - mean1) * (arr2buf[delay + i] - mean2);
        });
        correlations[delay] = r * _arrEstsMul;
      } //console.timeEnd("crosscorrelation");


      return correlations;
    } //Simple autocorrelation. Better method for long series: FFT[x1] .* FFT[x2]

  }, {
    key: "autocorrelation",
    value: function autocorrelation(arr1) {
      var delaybuf = [].concat(eegmath_toConsumableArray(arr1), eegmath_toConsumableArray(Array(arr1.length).fill(0)));
      var mean1 = this.mean(arr1); //Estimators

      var arr1Est = arr1.reduce(function (sum, item) {
        return sum += Math.pow(item - mean1, 2);
      });
      arr1Est = Math.sqrt(arr1Est);

      var _arr1estsqrd = 1 / (arr1Est * arr1Est);

      var correlations = new Array(arr1.length).fill(0);

      for (var delay = 0; delay < arr1.length; delay++) {
        var r = arr1.reduce(function (sum, item, i) {
          return sum += (item - mean1) * (delaybuf[delay + i] - mean1);
        });
        correlations[delay] = r * _arr1estsqrd;
      }

      return correlations;
    } //Compute correlograms of the given array of arrays (of equal length). Input array of equal length arrays of latest raw data (use dat = eeg32instance.getTaggedRawData())

  }, {
    key: "correlograms",
    value: function correlograms(dat) {
      //Coherence network math for data pushed to the atlas
      var correlograms = []; //auto and cross correlations for each channel

      dat.forEach(function (row1, i) {
        dat.forEach(function (row2, j) {
          if (j >= i) {
            correlograms.push(eegmath.crosscorrelation(row1, row2));
          }
        });
      });
      return correlograms; //Output ordered like (tag1:tag1, tag1:tag2 ... tag2:tag2, tag2:tag3 ... tagn:tagn) where autocorrelograms are also included
    } //Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)

  }, {
    key: "sma",
    value: function sma(arr, window) {
      var smaArr = []; //console.log(arr);

      for (var i = 0; i < arr.length; i++) {
        if (i == 0) {
          smaArr.push(arr[0]);
        } else if (i < window) {
          //average partial window (prevents delays on screen)
          var arrslice = arr.slice(0, i + 1);
          smaArr.push(arrslice.reduce(function (previous, current) {
            return current += previous;
          }) / (i + 1));
        } else {
          //average windows
          var arrslice = arr.slice(i - window, i);
          smaArr.push(arrslice.reduce(function (previous, current) {
            return current += previous;
          }) / window);
        }
      } //console.log(temp);


      return smaArr;
    } //Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to

  }, {
    key: "interpolateArray",
    value: function interpolateArray(data, fitCount) {
      var norm = this.canvas.height / data.length;

      var linearInterpolate = function linearInterpolate(before, after, atPoint) {
        return (before + (after - before) * atPoint) * norm;
      };

      var newData = new Array();
      var springFactor = new Number((data.length - 1) / (fitCount - 1));
      newData[0] = data[0]; // for new allocation

      for (var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = new Number(Math.floor(tmp)).toFixed();
        var after = new Number(Math.ceil(tmp)).toFixed();
        var atPoint = tmp - before;
        newData[i] = linearInterpolate(data[before], data[after], atPoint);
      }

      newData[fitCount - 1] = data[data.length - 1]; // for new allocation

      return newData;
    }
  }, {
    key: "isExtrema",
    value: function isExtrema(arr) {
      var critical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'peak';

      //Checks if the middle of the array is a local extrema. options: 'peak','valley','tangent'
      var ref = eegmath_toConsumableArray(arr);

      if (arr.length > 1) {
        var pass = true;
        ref.forEach(function (val, i) {
          if (critical === 'peak') {
            //search first derivative
            if (i < Math.floor(ref.length * .5) && val >= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            } else if (i > Math.floor(ref.length * .5) && val >= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            }
          } else if (critical === 'valley') {
            //search first derivative
            if (i < Math.floor(ref.length * .5) && val <= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            } else if (i > Math.floor(ref.length * .5) && val <= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            }
          } else {
            //look for tangents (best with 2nd derivative usually)
            if (i < Math.floor(ref.length * .5) && val <= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            } else if (i > Math.floor(ref.length * .5) && val <= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            }
          } //|| (i < ref.length*.5 && val <= 0 ) || (i > ref.length*.5 && val > 0)

        });

        if (critical !== 'peak' && critical !== 'valley' && pass === false) {
          pass = true;
          ref.forEach(function (val, i) {
            if (i < Math.floor(ref.length * .5) && val >= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            } else if (i > Math.floor(ref.length * .5) && val >= ref[Math.floor(ref.length * .5)]) {
              pass = false;
            }
          });
        }

        return pass;
      }
    }
  }, {
    key: "isCriticalPoint",
    value: function isCriticalPoint(arr) {
      var critical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'peak';

      //Checks if the middle of the array is a critical point (used on derivatives). options: 'peak','valley','tangent'
      var ref = eegmath_toConsumableArray(arr);

      if (arr.length > 1) {
        var pass = true;
        ref.forEach(function (val, i) {
          if (critical === 'peak') {
            //search first derivative
            if (i < ref.length * .5 && val <= 0) {
              pass = false;
            } else if (i > ref.length * .5 && val > 0) {
              pass = false;
            }
          } else if (critical === 'valley') {
            //search first derivative
            if (i < ref.length * .5 && val >= 0) {
              pass = false;
            } else if (i > ref.length * .5 && val < 0) {
              pass = false;
            }
          } else {
            //look for tangents (best with 2nd derivative usually)
            if (i < ref.length * .5 && val >= 0) {
              pass = false;
            } else if (i > ref.length * .5 && val < 0) {
              pass = false;
            }
          }
        });

        if (critical !== 'peak' && critical !== 'valley' && pass === false) {
          pass = true;
          ref.forEach(function (val, i) {
            if (i < ref.length * .5 && val <= 0) {
              pass = false;
            } else if (i > ref.length * .5 && val > 0) {
              pass = false;
            }
          });
        }

        return pass;
      }
    }
  }]);

  return eegmath;
}();
;// CONCATENATED MODULE: ./src/libraries/js/src/utils/eeg.worker.js
function eeg_worker_toConsumableArray(arr) { return eeg_worker_arrayWithoutHoles(arr) || eeg_worker_iterableToArray(arr) || eeg_worker_unsupportedIterableToArray(arr) || eeg_worker_nonIterableSpread(); }

function eeg_worker_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function eeg_worker_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return eeg_worker_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return eeg_worker_arrayLikeToArray(o, minLen); }

function eeg_worker_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function eeg_worker_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return eeg_worker_arrayLikeToArray(arr); }

function eeg_worker_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



var gpu = new gpuUtils();
addEventListener('message', function (e) {
  // define gpu instance
  //console.log("worker executing...")
  console.time("worker");
  var output = "function not defined";

  switch (e.data.foo) {
    case "xcor":
      // Takes 2 1D arrays
      output = eegmath.crosscorrelation(e.data.input[0], e.data.input[1]);
      break;

    case "autocor":
      // Takes 1 1D array
      output = eegmath.autocorrelation(e.data.input);
      break;

    case "cov1d":
      // Takes 2 1D arrays
      output = eegmath.cov1d(e.data.input[0], e.data.input[1]);
      break;

    case "cov2d":
      // Takes 1 2D array with equal width rows
      output = eegmath.cov2d(e.data.input);
      break;

    case "sma":
      // Takes 1 1D array and an sma window size
      output = eegmath.sma(e.data.input[0], e.data.input[1]);
      break;

    case "dft":
      // Takes 1 1D array and the number of seconds, and an optional scalar value
      var scalar = 1;
      if (e.data.input[2] !== undefined) scalar = e.data.input[2];
      output = gpu.gpuDFT(e.data.input[0], e.data.input[1], scalar);
      break;

    case "multidft":
      //Takes 1 2D array with equal width rows, and the number of seconds of data being given
      var scalar = 1;
      if (e.data.input[2] !== undefined) scalar = e.data.input[2];
      output = gpu.MultiChannelDFT(e.data.input[0], e.data.input[1], scalar);
      break;

    case "multidftbandpass":
      //Accepts 1 2D array of equal width, number of seconds of data, beginning frequency, ending frequency
      var scalar = 1;
      if (e.data.input[4] !== undefined) scalar = e.data.input[4];
      output = gpu.MultiChannelDFT_Bandpass(e.data.input[0], e.data.input[1], e.data.input[2], e.data.input[3], scalar);
      break;

    case "fft":
      // Takes 1 1D array and the number of seconds, and an optional scalar value
      var scalar = 1;
      if (e.data.input[2] !== undefined) scalar = e.data.input[2];
      output = gpu.gpuFFT(e.data.input[0], e.data.input[1], scalar);
      break;

    case "multifft":
      //Takes 1 2D array with equal width rows, and the number of seconds of data being given
      var scalar = 1;
      if (e.data.input[2] !== undefined) scalar = e.data.input[2];
      output = gpu.MultiChannelFFT(e.data.input[0], e.data.input[1], scalar);
      break;

    case "multifftbandpass":
      //Accepts 1 2D array of equal width, number of seconds of data, beginning frequency, ending frequency
      var scalar = 1;
      if (e.data.input[4] !== undefined) scalar = e.data.input[4];
      output = gpu.MultiChannelFFT_Bandpass(e.data.input[0], e.data.input[1], e.data.input[2], e.data.input[3], scalar);
      break;

    case "gpucoh":
      var coher = gpu.gpuCoherence(e.data.input[0], e.data.input[1], e.data.input[2], e.data.input[3], e.data.input[4]);
      output = coher;
      break;

    case "coherence":
      // Input 2D array, number of seconds, beginning frequency, ending frequency. Outputs an array of products of each FFT with each associated correlogram to create a network map of all available channels, ordered by channel
      var correlograms = eegmath.correlograms(e.data.input[0]);
      var buffer = [].concat(eeg_worker_toConsumableArray(e.data.input[0]), eeg_worker_toConsumableArray(correlograms));
      var dfts;
      var scalar = 1; //console.log(mins)
      //console.log(buffer);

      dfts = gpu.MultiChannelDFT_Bandpass(buffer, e.data.input[1], e.data.input[2], e.data.input[3], scalar); //console.log(dfts)

      var cordfts = dfts[1].splice(e.data.input[0].length, buffer.length - e.data.input[0].length); //console.log(cordfts)

      var coherenceResults = [];
      var nChannels = e.data.input[0].length; //cross-correlation dfts arranged like e.g. for 4 channels: [0:0, 0:1, 0:2, 0:3, 1:1, 1:2, 1:3, 2:2, 2:3, 3:3] etc.

      var k = 0;
      var l = 0;
      cordfts.forEach(function (row, i) {
        //move autocorrelation results to front to save brain power
        if (l + k === nChannels) {
          var temp = cordfts.splice(i, 1);
          k++;
          cordfts.splice.apply(cordfts, [k, 0].concat(eeg_worker_toConsumableArray(temp)));
          l = 0; //console.log(i);
        }

        l++;
      }); //Now arranged like [0:0,1:1,2:2,3:3,0:1,0:2,0:3,1:2,1:3,2:3]
      //Outputs FFT coherence data in order of channel data inputted e.g. for 4 channels resulting DFTs = [0:1,0:2,0:3,1:2,1:3,2:3];

      var autoFFTproducts = [];
      k = 0;
      l = 1;
      cordfts.forEach(function (dft, i) {
        var newdft = new Array(dft.length).fill(0);

        if (i < nChannels) {
          //sort out autocorrelogram FFTs
          dft.forEach(function (amp, j) {
            newdft[j] = amp; //*dfts[1][i][j];
          });
          autoFFTproducts.push(newdft);
        } else {
          //now multiply cross correlogram ffts and divide by autocorrelogram ffts (magnitude squared coherence)
          dft.forEach(function (amp, j) {
            newdft[j] = amp * amp / (autoFFTproducts[k][j] * autoFFTproducts[k + l][j]); //Magnitude squared coherence;

            if (newdft[j] > 1) {
              newdft[j] = 1;
            } //caps the values at 1
            //newdft[j] = Math.pow(newdft[j],.125)

          });
          l++;

          if (l + k === nChannels) {
            k++;
            l = 1;
          }

          coherenceResults.push(newdft);
        }
      });
      output = [dfts[0], dfts[1], coherenceResults];
      break;
  } // output some results!


  console.timeEnd("worker");
  postMessage({
    output: output,
    foo: e.data.foo,
    origin: e.data.origin
  });
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, [985], () => (__webpack_require__(7003)))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					result = fn();
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".brainsatplay.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/src/libraries/js/dist/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			3: 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = this["webpackChunkbrainsatplay"] = this["webpackChunkbrainsatplay"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e(985).then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});