//Digital Phase-Locked Loop
//Joshua Brewster (MIT License). It doesn't work that well yet

//Based on https://liquidsdr.org/blog/pll-howto/ 

function DFTpll(signal=genSineWave(3.3,1,1,512)[1], fs=512, len=512, freq_est=3, dcoffset=0, alpha=0.05, beta=0.5){ //modifed DFT equation for extracting a single frequency mixed with a simulated frequency, trying to minimze error
    var real = 0;
    var imag = 0;
    var real_sim = 0;
    var imag_sim = 0;
    var _len = 1/len;
    var _fs = 1/fs;
    var freq = freq_est;

    var α = alpha;
    var ß = beta*α*α;
    const TWO_PI = 2*Math.PI;
    //var shared = TWO_PI*freq*_len;
    var phase_out = 0;
    var mixed_signal = new Array(len).fill(0);
    var freq_guesses = new Array(len).fill(0);
    var phase_guesses = new Array(len).fill(0);
    var phase_err_results = new Array(len).fill(0);

    for(var i = 0; i<len; i++){
      var sharedi =TWO_PI*freq*_fs*i; //complex exponent component
      real = real+(signal[i]-dcoffset)*Math.cos(sharedi); //complex exponent operations to convert the signal to an amplitude based on the input frequency
      imag = imag-(signal[i]-dcoffset)*Math.sin(sharedi);

      var simulated = Math.sin(sharedi + phase_out); //Generate sine amplitude with the modulating parameters
      real_sim = real_sim+(simulated)*Math.cos(sharedi + phase_out);
      imag_sim = imag_sim-(simulated)*Math.sin(sharedi + phase_out);

      //Complex multiplication (mixing the signals)
      let re = real*real_sim + imag*imag_sim; //conjugated imag_sim.
      let im = -real*imag_sim + imag*real_sim; //conjugated imag_sim.
      let phase_err = 0;
      if(re !== 0 ){
        phase_err = Math.atan(im/re);//complex argument
      }
      else if (im < 0) {
        phase_err = -Math.PI/2;
      }
      else if (im > 0) {
        phase_err = Math.PI/2;
      }
      else {
        phase_err = 0;
      }

      freq += phase_err * ß; //ß
      phase_out += phase_err * α; //α
      if(phase_out > TWO_PI)
      {
          phase_out -= TWO_PI;
      }
      else if (phase_out < 0) {
        phase_out += TWO_PI;
      }


      var mag = Math.sqrt(re*re+im*im);

      mixed_signal[i] = mag*_len;
      freq_guesses[i] = freq;
      phase_guesses[i] = phase_out;
      phase_err_results[i] = phase_err;
      
    }

    return {mixed:mixed_signal, freq_guesses:freq_guesses, phase_guesses:phase_guesses, phase_errs:phase_err_results}; //mag(real,imag)

    
}