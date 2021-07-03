
//By Joshua Brewster (MIT License). Buffer Loader was in an audio tutorial I found on HTML5 Rocks. 

//TODO:
/*
  - MIDI web context support
  - Seeking for audio buffer source nodes
     -- How: copy audio buffer, stop old node, start new one at time X.
*/
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
      this.sourceGains = [];
      
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
            this.osc[len].disconnect();
            this.osc.splice(len,1);
          }
        this.osc[len].type = type;
        this.osc[len].connect(this.gainNode);
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
  
    //Add a sound file from the app assets or a website url
    addSounds(urlList=[''], onReady=(sourceListIdx)=>{}, onBeginDecoding=()=>{}, canAddFile=false){
      if(typeof urlList === 'string') urlList = [urlList];
      var bufferLoader = new BufferLoader(this, urlList, this.finishedLoading, onReady, onBeginDecoding)
      bufferLoader.load(canAddFile);
    }

    //Make a copy of selected sound buffer
    copySound(soundbuffer) {
      let buf = this.ctx.createBuffer(soundbuffer.buffers.length,soundbuffer.duration/soundbuffer.samplerate,soundbuffer.samplerate);
      soundbuffer.buffers.forEach((b,j) => {
          if(typeof b === 'string') buf.copyToChannel(Float32Array.from(textdecoder.decode(b)),j+1,0); //parse string
          else buf.copyToChannel(b,j+1,0); //parse raw Float32Array
      });

      let newSourceIndices = this.finishedLoading([buf]);
      return newSourceIndices[0];
    }

    //Get a file off the user's computer and decode it into the sound system
    decodeLocalAudioFile(onReady=(sourceListIdx)=>{}, onBeginDecoding=()=>{}){

      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';

      input.onchange = (e) => {
        if(e.target.files.length !== 0){
          var file = e.target.files[0];
          var fr = new FileReader();
          fr.onload = (ev) => {
              var fileResult = ev.target.result;
              if (this.ctx === null) {
                  return;
              };
              onBeginDecoding();
              this.ctx.decodeAudioData(fileResult, (buffer) => {
                this.finishedLoading([buffer]);
                onReady(this.sourceList.length-1);
              }, (er) => {
                  console.error(er);
              });
          };
          fr.onerror = function(er) {
              console.error(er);
          };
          //assign the file to the reader
          fr.readAsArrayBuffer(file);
        }
      }
      input.click();
    }

    finishedLoading = (bufferList) => {
      let newBufferSourceIndices = [];
      bufferList.forEach((element) => {
        this.sourceList.push(this.ctx.createBufferSource()); 
        var idx = this.sourceList.length - 1;
        newBufferSourceIndices.push(idx);
        let sauce = this.sourceList[idx];
        this.sourceGains.push(this.ctx.createGain()); //Allows control of individual sound file volumes
        let gainz = this.sourceGains[idx];
        sauce.buffer = element;
        sauce.onended = () => {
          sauce.disconnect();
          gainz.disconnect();
          let l = 0, k=0;
          this.sourceList.find((o,j)=> {
            if(JSON.stringify(o) === JSON.stringify(sauce)) {
              l=j;
              this.sourceList.splice(l,1);
              return true;
            }
          });
          this.sourceGains.find((o,j)=> {
            if(JSON.stringify(o) === JSON.stringify(gainz)) {
              k=j;
              this.sourceGains.splice(k,1);
              return true;
            }
          });
        };
        sauce.connect(gainz); //Attach to volume node
        gainz.connect(this.gainNode);
      });
      return newBufferSourceIndices;
    }
  
    playSound(bufferIndex, seconds=0, repeat=false, startTime=this.ctx.currentTime){ //Plays sounds loaded in buffer by index. Sound buffers are single use items.
      if(repeat === true){
        this.sourceList[bufferIndex].loop = true;
      }
      
      this.sourceList[bufferIndex].start(startTime);
      if(seconds !== 0){
        this.sourceList[bufferIndex].stop(startTime+seconds);
      }
    }
  
    stopSound(bufferIndex){
      if(this.sourceList[bufferIndex])
        this.sourceList[bufferIndex].stop(0);
    }
  
    setPlaybackRate(bufferIndex, rate){
      if(this.sourceList[bufferIndex])
        this.sourceList[bufferIndex].playbackRate.value = rate;
    }
  
    record(name = new Date().toISOString(), args={audio:true, video:false}, type=null, streamElement=null, save=false,onbegin=()=>{}){ // video settings vary e.g. video:{width:{min:1024,ideal:1280,max:1920},height:{min:576,ideal:720,max:1080}}
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
          
          if(supported.indexOf('audio') !== -1) {
            let mic_src = this.ctx.createMediaStreamSource(recordingDevice);
            let mic_gain = this.ctx.createGain();

            this.sourceList.push(mic_src);
            this.sourceGains.push(mic_gain);

            mic_src.onended = () => {
              mic_src.disconnect();
              mic_gain.disconnect();
              let l = 0, k=0;
              this.sourceList.find((o,j)=> {
                if(JSON.stringify(o) === JSON.stringify(mic_src)) {
                  l=j;
                  this.sourceList.splice(l,1);
                  return true;
                }
              }); 
              this.sourceGains.find((o,j)=> {
                if(JSON.stringify(o) === JSON.stringify(mic_gain)) {
                  k=j;
                  this.sourceGains.splice(k,1);
                  return true;
                }
              }); 
            }

            mic_src.connect(mic_gain);
            mic_gain.connect(this.analyserNode);
            //mic_src.start();
          }

          onbegin();

          if(streamElement !== null){ // attach to audio or video element, or Audio(). For canvas, use an AudioContext analyzer.
            streamElement.src = window.URL.createObjectURL(recordingDevice);
          }  

          if(save === true) {
  
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
          }
  
        }, errfunc);
  
        return this.sourceList.length;
      }
      else {
        alert("Cannot record! Check function call settings, ensure browser is compatible.");
        return undefined;
      }
    }
  
    replayRecording(streamElement) { //Replay the currently buffered recording in an acceptable stream element, e.g. attach to audio or video element, or an Audio() class, or a video element. For canvas, use an AudioContext analyzer.
      if(this.recordedData.length > 1){
        this.buffer = new Blob(this.recordedData);
        streamElement.src = window.URL.createObjectURL(buffer);
      }
    }
  
  }


  
//Parse Audio file buffers
export class BufferLoader { //Modified from HTML5 Rocks tutorial
  constructor(SoundJSInstance, urlList, callback, onReady=(sourceListIdx)=>{}, onBeginDecoding=()=>{}){
    this.audio = SoundJSInstance;
   this.ctx = this.audio.ctx;
   this.urlList = urlList;
   this.onload = callback;
   this.bufferList = new Array();
   this.loadCount = 0;
   this.onBeginDecoding = onBeginDecoding;
   this.onReady = onReady;
  }

  onReady = (sourceListIdx) => {}

  onBeginDecoding = () => {}

  loadBuffer(url='',index, canAddFile=false){
   // Load buffer asynchronously
   var request = new XMLHttpRequest();
   request.responseType = "arraybuffer";
   var responseBuf = null;

   if(url.length > 1){
       request.open("GET", url, true);
       request.onreadystatechange = () => {
         if(request.readyState === 4){
           if(request.status === 200 || request.status === 0){
             responseBuf = request.response; //Local files work on a webserver with request
           }
         }
       }
     var loader = this;

     request.onload = () => {
       // Asynchronously decode the audio file data in request.response
       this.onBeginDecoding();
       loader.ctx.decodeAudioData(
         responseBuf,
         (buffer) => {
           if (!buffer) {
             alert('error decoding file data: ' + url);
             return;
           }
           loader.bufferList[index] = buffer;
           if (++loader.loadCount === loader.urlList.length)
             loader.onload(loader.bufferList);
             this.onReady(this.audio.sourceList.length-1);
         },
         (error) => {
           console.error('decodeAudioData error: '+ error + ", from url: "+ url);
         }
       );
     }
     request.onerror = function() {
       alert('BufferLoader: XHR error');
     }
   
     request.send();
   }
   else if(canAddFile){//Local Audio
     //read and decode the file into audio array buffer 
     var loader = this;
     var fr = new FileReader();
     fr.onload = (e) => {
         var fileResult = e.target.result;
         var audioContext = loader.ctx;
         if (audioContext === null) {
             return;
         }
         console.log("Decoding audio...");
         this.onBeginDecoding();
         audioContext.decodeAudioData(fileResult, (buffer) => {
           if (!buffer) {
             alert('Error decoding file data: ' + url);
             return;
           }
           else{
             console.log('File decoded successfully!')
           }
           loader.bufferList[index] = buffer;
           if (++loader.loadCount === loader.urlList.length)
             loader.onload(loader.bufferList);
             this.onReady(this.audio.sourceList.length-1);
           },
           (error) => {
             console.error('decodeAudioData error: ', error);
           }
         );
     }
     fr.onerror = (e) => {
         console.log(e);
     }
     
     var input = document.createElement('input');
     input.type = 'file';
     input.multiple = true;

     input.onchange = e => {
       fr.readAsArrayBuffer(e.target.files[0]);
       input.value = '';
       }
     input.click();
   }

 }

 load(canAddFile = true){
   for (var i = 0; i < this.urlList.length; ++i)
   this.loadBuffer(this.urlList[i], i, canAddFile);
 }
 
}