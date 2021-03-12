//Feed forward IIR filters (Joshua Brewster)

      //https://github.com/mariusrubo/Unity-IIR-Realtime-Filtering/blob/master/FilterData.cs
    export  class IIRNotchFilter {
        constructor(sps,frequency, bandwidth=0.5) {
          this.sps = sps; this.frequency = frequency; 
          let TWO_PI = 2*Math.PI
          let f0 = frequency/sps;
          let wc = TWO_PI*f0;

          let BW = bandwidth/sps;
          let R = 1-3*BW;

          let K = (1-2*R*Math.cos(wc) + R*R) / (2 - 2*Math.cos(wc))
        
          this.a0=K, this.a1 = -2*K*Math.cos(wc), this.a2 = K;
          this.b1 = 2*R*Math.cos(wc), this.b2 = -R*R;

          this.x1=this.x2=this.y1=this.y2=0;
        }
      }

      //Butterworth
    export  class IIRLowPassFilter { 
        constructor (sps, frequency) {
          this.sps = sps; this.frequency = frequency; 
          let TWO_PI = 2*Math.PI

          let wc = Math.tan(frequency*Math.PI/sps);
          let k1 = 1.414213562*wc;
          let k2 = wc*wc;

          this.a0 = k2/(1+k1+k2);
          this.a1 = 2*this.a0;
          this.a2 = this.a0;

          let k3 = this.a1/k2;

          this.b1 = -2 * this.a0 + k3;
          this.b2 = 1-(2*this.a0) - k3;

          this.x1=this.x2=this.y1=this.y2=0;

        }
      }

      //This one needs work
    export  class IIRHighPassFilter { // https://github.com/ruohoruotsi/Butterworth-Filter-Design/
        constructor (sps, frequency) {
          this.sps = sps; this.frequency = frequency; this.TWO_PI = 2*Math.PI; 
          let w0 = Math.PI*2*frequency/sps;
          let Q = 1/2;
          let α = Math.sin(w0)/(2*Q);

          let k0 = 1+α
          let k1 = -2*Math.cos(w0);
          let k2 = 1-α;
          let j0 = (1+Math.cos(w0))*.5;
          let j1 = -(1+Math.cos(w0))*.5;
          let j2 = (1+Math.cos(w0))*.5;

          this.b1 = (-k1)/k0;
          this.b2 = (-k2)/k0;
          this.a0 = j0/k0;
          this.a1 = j1/k0;
          this.a2 = j2/k0;
          console.log(this.a0, this.a1, this.b0, this.b1, this.b2)

          this.x1=this.x2=this.y1=this.y2=0;
        }
      }//More biquad filters https://github.com/ruohoruotsi/Butterworth-Filter-Design/blob/master/MATLAB/biquad_coeff_tests.m



      //Apply the filter for each time step as they are cumulative
    export  const applyFilter = (signal_step, filter) => {
        let y = filter.a0*signal_step +
          filter.a1*filter.x1 +
          filter.a2*filter.x2 +
          filter.b1*filter.y1 +
          filter.b2*filter.y2;

        filter.x2 = filter.x1;
        filter.x1 = signal_step;
        filter.y2 = filter.y1;
        filter.y1 = y;

        return y; //Output filtered time step
      }


      export class SMAFilter { //simple smoothing/low pass filtering
        constructor(window=4) {
          this.window=window;
          this.buffer = [];
        }

        step(newAmplitude) {
          if(this.buffer.length < this.window) {
            this.buffer.push(newAmplitude);
          }
          else if (this.buffer.length === this.window) {
            this.buffer.shift();
            this.buffer.push(newAmplitude);
          }

          let mean = this.buffer.reduce((previous,current) => current += previous ) / this.buffer.length;
          this.buffer[this.buffer.length-1]=mean;

          return mean;

        }
      }


      export class DCBlocker {
        constructor(r=0.995) {
          this.r = r;
          this.y1=this.y2=this.x1=this.x2=0;
        }
  
        step(newAmplitude) {
          this.x2=this.x1;
          this.x1 = newAmplitude
          let y = this.x1 - this.x2 + this.r*this.y1;
          
          this.y2 = this.y1;
          this.y1 = y;
          
          return y;
        }
      }
      

    export  class IIRFilter {
        constructor(sps=512) {
          this.filters = [];
          this.sps = sps;

          this.latestIn = 0;
          this.latestOut = 0;
          this.prevFiltered = [];
          this.currFiltered = [];
        }

        addNotch(freq=60,sps=this.sps,bandwidth=0.5) {
          this.filters.push(new IIRNotchFilter(sps,freq,bandwidth));
          this.prevFiltered.push(0);
          this.currFiltered.push(0);
        }

        addLowPass(freq=1,sps=this.sps) {
          this.filters.push(new IIRButtersworthLowPassFilter(sps, freq));
          this.prevFiltered.push(0);
          this.currFiltered.push(0);
        }

        addHighPass(freq=128, sps=this.sps) {
          //this.filters.push(new IIRHighPassFilter(sps, frequency));
          //this.prevFiltered.push(0);
          //this.currFiltered.push(0);
        }

        applyFilter = (latestSignalStep, iir, filterIdx) => {
          let y = iir.a0*latestSignalStep +
          iir.a1*iir.x1 +
          iir.a2*iir.x2 +
          iir.b1*iir.y1 +
          iir.b2*iir.y2;

          iir.x2 = iir.x1;
          iir.x1 = latestSignalStep;
          iir.y2 = iir.y1;
          iir.y1 = y;

          this.currFiltered[filterIdx] = y;
          this.prevFiltered[filterIdx] = iir.y2;
          return y; //Output filtered time step
        }

        filter = (signal_in) => {
          let signal_out = 0;
          if(typeof signal_in === "object") { //Array of samples
            signal_out = [];
            signal_in.forEach((step,i) => { //Roll through each sample
              let y = step;
              this.filters.forEach((iir,j) => { //Roll through each filter
                y = this.applyFilter(y, iir, j);
              });
              signal_out.push(y);
            });
            return signal_out;
          }
          else if (typeof signal_out === "number"){ //Single sample
            let y = step;
            this.filters.forEach((iir,j) => { //Roll through each filter
              y = this.applyFilter(y, iir, j);
            });
            signal_out = y;
            return signal_out;
          }
          else {
            return false;
          }
        }

      }



