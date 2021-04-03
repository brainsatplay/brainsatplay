export class SoundJS { //Only one Audio context at a time!
    constructor(){
      window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
      
      this.ctx = null;
      try {
        this.ctx = new AudioContext();
      } catch (e) {
        alert("Your browser does not support AudioContext!");
        console.log(e);
      } 
      
      this.sourceList = [];
      
      this.recordedData = [];
      this.recorder = null;
      this.buffer = [];
  
      this.osc = [];
      this.gainNode = this.ctx.createGain();
      this.analyserNode = this.ctx.createAnalyser();
      this.out = this.ctx.destination;
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.out);
      
    }
  
    playFreq(freq=[1000], seconds=0, type='sine', startTime=this.ctx.currentTime){ //Oscillators are single use items. Types: sine, square, sawtooth, triangle, or custom via setPeriodicWave()
      freq.forEach((element)=>{
        var len = this.osc.length;
          this.osc[len] = this.ctx.createOscillator();
          this.osc[len].start();
          this.osc[len].onended = () => {
            this.osc.splice(len,1);
          }
        this.osc[len].type = type;
        this.osc[len].connect(this.gain);
        this.osc[len].frequency.setValueAtTime(element, startTime);
        if(seconds!=0){
          //0 = unlimited 
          this.osc[len].stop(startTime+seconds);
        }
      });
    }
  
    stopFreq(firstIndex=0, number=1, delay=0){//Stops and removes the selected oscillator(s). Can specify delay.
      for(var i = firstIndex; i<number; i++){
        if(this.osc[oscIndex]){
          this.osc[oscIndex].stop(this.ctx.currentTime+delay);
        }
        else{
          console.log("No oscillator found.")
        }
      }
    }
  
    finishedLoading = (bufferList) => {
      bufferList.forEach((element) => {
        this.sourceList.push(this.ctx.createBufferSource()); 
        var idx = this.sourceList.length - 1;
        this.sourceList[idx].buffer = element;
        this.sourceList[idx].onended = () => {this.sourceList.splice(idx, 1)};
        this.sourceList[idx].connect(this.gain); //Attach to volume node
      });
    }
  
    addSounds(urlList=['']){
      var bufferLoader = new BufferLoader(this.ctx, urlList, this.finishedLoading)
      bufferLoader.load();
    }
  
    playSound(bufferIndex, seconds=0, repeat=false, startTime=this.ctx.currentTime){//Plays sounds loaded in buffer by index. Sound buffers are single use items.
      if(repeat === true){
        this.sourceList[bufferIndex].loop = true;
      }
      
      this.sourceList[bufferIndex].start(startTime);
      if(seconds !== 0){
        this.sourceList[bufferIndex].stop(startTime+seconds);
      }
    }
  
    stopSound(bufferIndex){
      this.sourceList[bufferIndex].stop(0);
    }
  
    setPlaybackRate(bufferIndex, rate){
      this.sourceList[bufferIndex].playbackRate.value = rate;
    }
  
    record(name = new Date().toISOString(), args={audio:true, video:false}, type=null, streamElement=null){ // video settings vary e.g. video:{width:{min:1024,ideal:1280,max:1920},height:{min:576,ideal:720,max:1080}}
      /*
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices = devices.filter((d) => d.kind === 'audioinput');
        devices.forEach(function(device) {
          let menu = elm("inputdevices");
          if (device.kind === "audioinput") {
            let item = document.createElement("option");
            item.innerHTML = device.label;
            item.value = device.deviceId;
            menu.appendChild(item);
            }
        });
      }); //Device selection
  
      navigator.permissions.query({name:'microphone'}).then(function(result) {
        if (result.state === 'granted') {
  
        } else if (result.state === 'prompt') {
  
        } else if (result.state === 'denied') {
  
        }
        result.onchange = function() {
  
        };
      });
      */
      var supported = null;
      var ext = null;
      var types = type;
      if (types === null) {
        if (args.video !== false) {
          types = [
            'video/webm',
            'video/webm;codecs=vp8',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8.0',
            'video/webm;codecs=vp9.0',
            'video/webm;codecs=h264',
            'video/webm;codecs=H264',
            'video/webm;codecs=avc1',
            'video/webm;codecs=vp8,opus',
            'video/WEBM;codecs=VP8,OPUS',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,vp9,opus',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=h264,vp9,opus',
            'video/x-matroska;codecs=avc1'
          ];
        } else if (args.audio === true) {
          types = [
            'audio/wav', // might be supported native, otherwise see:
            'audio/mp3', // probably not supported
            'audio/webm',
            'audio/webm;codecs=opus',
            'audio/webm;codecs=pcm',
            'audio/ogg',
            'audio/x-matroska' // probably not supported
          ];
        }
      }
  
      for (var i=0; i<types.length; i++) {
        if(MediaRecorder.isTypeSupported(types[i]) === true){
          supported = types[i];
          console.log("Supported type: ", supported);
          if(types[i].indexOf('webm') !== -1){
            ext = '.webm';
          }
          if(types[i].indexOf('ogg') !== -1){
            ext = '.ogg';
          }
          if(types[i].indexOf('mp3') !== -1){
            ext = '.mp3';
          }
          if(types[i].indexOf('wav') !== -1){
            ext = '.wav';
          }
          if(types[i].indexOf('x-matroska') !== -1){
            ext = '.mkv';
          }
          break;
        }
      }
  
      if (supported !== null) {
        function errfunc(e) {
          console.log(e);
        } 
  
        navigator.mediaDevices.getUserMedia(args).then((recordingDevice) => { //Get
          console.log("Media stream created.");
          
          if(streamElement !== null){ // attach to audio or video element, or Audio(). For canvas, use an AudioContext analyzer.
            streamElement.src = window.URL.createObjectURL(recordingDevice);
          }
  
          this.recorder = new MediaRecorder(recordingDevice);
  
          this.recorder.onstop = (e) => {
            console.log("Media recorded, saving...");
  
            var blob = new Blob(this.recordedData, {
              type: supported
            });
  
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = name + ext;
            a.click();
            window.URL.revokeObjectURL(url);
          }
          
          this.recorder.ondataavailable = (e) => {
            this.recordedData.push(e.data);
          }
  
          this.recorder.start(); //Begin recording
  
        }, errfunc);
  
      }
      else {
        alert("Cannot record! Check function call settings, ensure browser is compatible.");
      }
    }
  
    replayRecording(streamElement) { //Replay the currently buffered recording in an acceptable stream element, e.g. attach to audio or video element, or an Audio() class, or a video element. For canvas, use an AudioContext analyzer.
      if(this.recordedData.length > 1){
        this.buffer = new Blob(this.recordedData);
        streamElement.src = window.URL.createObjectURL(buffer);
      }
    }
  
  }