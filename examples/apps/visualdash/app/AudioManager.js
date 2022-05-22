import transformations from "./transformations"


export default class AudioManager {

    get in () {
        return this.nodes[0]
    }

    constructor(info) {
        this.context = null;
        this.info = info;
        this.nodes = []
        this.analyser = null
        this.out = null
        this.canListen = false

        this.fftData = {}
        this.analyses = {}
        this.integrations = {}
        
    }

    analyse = () => {

        // First Analyses
        for (let k in this.analyses) {this.analyses[k].output = this.analyses[k].function()}

        // Then Integrations
        for (let k in this.integrations) {this.integrations[k].output =  this.integrations[k].function()}
    }

    initializeContext = () => {
        if (!this.context) {

          setInterval(this.analyse, 50); // Get Data Every 50ms

          this.context = new (window.AudioContext || window.webkitAudioContext)();
          // top of tree
          if (this.info.minFreq) {
            const highPassNode = this.context.createBiquadFilter();
            this.nodes.push(highPassNode)
            highPassNode.type = 'highpass';
            highPassNode.frequency.value = this.info.minFreq;
          }
    
          // next node
          if (this.info.maxFreq) {
            const lowPassNode = this.context.createBiquadFilter();
            this.nodes.push(lowPassNode)
            lowPassNode.type = 'lowpass';
            lowPassNode.frequency.value = this.info.maxFreq;
            this.nodes[this.nodes.length - 1].connect(lowPassNode);
          }
    
          // microphone.connect(gainNode);
          // next node
          this.analyser = this.createAnalyser()
          this.nodes[this.nodes.length - 1].connect(this.analyser);
    
          // next node
          this.out = this.context.createGain(); // Create a gain node to change audio volume.
          this.out.gain.value = 1.0;
          this.out.connect(this.context.destination);
        }
      }

    createAnalyser = (ctx=this.context) => {
        const analyser = ctx.createAnalyser();
        analyser.smoothingTimeConstant = this.info.smoothingTimeConstant
        analyser.fftSize = this.info.fftSize
        analyser.minDecibels = this.info.minDecibels
        analyser.maxDecibels = this.info.maxDecibels
        return analyser
      }

    cloneAudioBuffer = (fromAudioBuffer) => {
        const audioBuffer = new AudioBuffer({
            length:fromAudioBuffer.length, 
            numberOfChannels:fromAudioBuffer.numberOfChannels, 
            sampleRate:fromAudioBuffer.sampleRate
        });
        for(let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
            const samples = fromAudioBuffer.getChannelData(channelI);
            audioBuffer.copyToChannel(samples, channelI);
        }
        return audioBuffer;
    }

    fft = function(buff, callback, onend) {

        // by Zibri (2019)
        // var frequencies = [1000,1200,1400,1600]; //for example
        // var frequencyBinValue = (f)=>{
        //     const hzPerBin = (ctx.sampleRate) / (2 * analyser.frequencyBinCount);
        //     const index = parseInt((f + hzPerBin / 2) / hzPerBin);
        //     return data[index]+1;
        // }
        const ctx = new OfflineAudioContext(1,buff.length, this.context.sampleRate);

        // Split the Channels
        const splitInfo = this.split(buff.numberOfChannels, () => {}, {
          context: ctx,
          nodes: [(i, nodes) => {
            const processor = ctx.createScriptProcessor(1024, 1, 1);

            this.fftData[i] = []
            processor.onaudioprocess = (e) => {
                const data = new Uint8Array(nodes.analyser.frequencyBinCount);
                nodes.analyser.getByteFrequencyData(data);
                // state = frequencies.map(frequencyBinValue.bind(this))
                if ("function" == typeof callback) callback(data);
                this.fftData[i].push(data)
            }
            return processor

          }]
        })
          
    
        const source = ctx.createBufferSource();
        source.connect(splitInfo.input); // In
        splitInfo.output.connect(ctx.destination); // Out

        source.buffer = buff //this.cloneAudioBuffer(buff);
    
        source.onended = (e) => {
            if ("function" == typeof onend) onend(this.fftData);
        }
        
        source.start();
        ctx.startRendering()
            // .then(renderedBuffer => console.log('renderedBuffer', renderedBuffer))
            .catch((err) => console.log('Rendering failed: ' + err));
    }


    split = (channels, onChannel, options={}) => {
      const context = options.context ?? this.context
      var splitter = context.createChannelSplitter(channels);
      var merger = context.createChannelMerger(channels);

      for (let i = 0; i < channels; i++){

        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(1.0, context.currentTime);
        const analyser = this.createAnalyser(context)
        splitter.connect(analyser, i) // Connect Analyser to Channel i

        const nodes = {
          analyser,
          gainNode
        }

        let upstream = analyser
        if (options.nodes) options.nodes.forEach((f, j) => {
          const node = f(i, nodes)
          upstream.connect(node);
          upstream = node // swap to keep the chain going
          nodes[`custom${j}`] = node
        })

        upstream.connect(gainNode); // Finally contect the gain node
        gainNode.connect(merger, 0, i) // Merge split inputs

        if (onChannel instanceof Function) onChannel(i, nodes) // run function for each channel
      }

      return {
        output: merger,
        input: splitter
      }
    }


    addSource = (src, addDisplay=() => {}) => {
  
        src.connect(this.in); // Connect to top of Web Audio API Context
  
        // TODO: Split tracks from video
        const channels = src.channelCount ?? src.buffer?.numberOfChannels
        if (channels > 1) {
          const splitInfo = this.split(channels, (i, nodes) => {
            const o = addDisplay()
            o.container.insertAdjacentHTML('afterbegin',`<h3>${i == 0 ? 'Left' : 'Right'} Channel </h3>`)
            this.addAnalysis(nodes.analyser, 'fft', o.spectrogram, this.info.onData) // Start analysis
          })

          this.analyser.connect(splitInfo.input); // Connect end of main graph to the Splitter graph
  
          // Additive (first two)
          const o2 = addDisplay() // Create Display
          o2.container.insertAdjacentHTML('afterbegin',`<h3>Additive</h3>`)
  
          this.integrate('additive', [0, 1], (arr) => transformations.add(arr[0].frequencies, arr[1].frequencies), o2.spectrogram, 'data')
  
          // Remove common (first two)
          const o3 = addDisplay() // Create Display
          o3.container.insertAdjacentHTML('afterbegin',`<h3>Difference</h3>`)
  
          this.integrate('difference', [0, 1], (arr) => transformations.difference(arr[0].frequencies, arr[1].frequencies), o3.spectrogram, 'data')
  
          const thisGain = this.context.createGain()
          splitInfo.output.connect(thisGain); 
          thisGain.connect(this.out); // Output to the speakers
          if (this.canListen) thisGain.gain.value = 1
          else thisGain.gain.value = 0 // Force Off Volume
  
        } 
        else {
          const o = addDisplay() // Create Display
        //   o.analyser = analyser
  
          const thisGain = this.context.createGain()
          this.analyser.connect(thisGain); 
          thisGain.connect(this.out) // Output to the speakers
          if (this.canListen) thisGain.gain.value = 1
          else thisGain.gain.value = 0 // Force Off Volume
            this.addAnalysis(this.analyser, 'fft', o.spectrogram) // Start analysis
        }
  
        if (video){
          video.onended = () => {
            src.disconnect();
          }
        }
  
        if (src.start instanceof Function) src.start()
    }

    addAnalysis = (analyser, type, outputObj, ondata=()=>{}) => {

        const analysisIndex = Object.keys(this.analyses).length
        // Analyze the Data
        // let volumeCallback = null;
        // let volumeInterval = null;
        let getData = () => {}
        switch (type) {
            case 'fft':
                const frequencies = new Uint8Array(analyser.frequencyBinCount);
                // const upperBound = Math.min(audioManager.context.sampleRate, minFreq)
                // const centerFreqs = Array.from({length: frequencies.length}, (e,i) => (i + 0.5)  * upperBound/(frequencies.length))
                // console.log(centerFreqs)
  
                getData = () => {
                    analyser.getByteFrequencyData(frequencies);
                    const freqArr = Array.from(frequencies)

                    outputObj.updateData(freqArr)
                    // outputObj.data = freqArr
                    const data = {frequencies: freqArr}
                    ondata(data, analysisIndex)

                    return data
                  };
                break;

            case 'raw':
                let raw = new Uint8Array(1) // Only get the latest
                getData = () => {
                    analyser.getByteTimeDomainData(raw)
                  const arr = Array.from(raw)
                  outputObj.updateData([arr])
                  // outputObj.data = [arr]
                  const data = {timeseries: arr}
                  ondata(data, analysisIndex)
                  return data
                };
                break;
        }
  
        this.analyses[analysisIndex] = {
          function: getData,
          output: null
        }
    }

    integrate = (key, iArr, integrator = (arr) => {}, outputObj, outKey) => {

        this.integrations[key] = {
          function: () => {
            const o2 = integrator(iArr.map(i => this.analyses[i].output))
            outputObj[outKey] = o2
          },
          output: null
        }
    }
  

    listen = (val = !this.canListen) => {
        this.canListen = val
    }
}