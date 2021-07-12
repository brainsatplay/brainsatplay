export class Video{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            // default: {
            //     input: {type: undefined},
            //     output: {type: null},
            //     onUpdate: (userData) => {
            //         userData.forEach((u,i) => {
            //             console.log(u.username,u.data,u.meta,u)
            //         })
            //     }
            // },
            url: {
                default: 'https://vjs.zencdn.net/v/oceans.mp4',
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.vidQuery.src = this.params.url = userData[0].data
                }
            },
            file: {
                input: {type: 'file'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.file = userData[0].data
                    this.startFile(this.params.file)
                }
            },
        }

        let portInfo = [
        // Update Fade Parameters and Button
        {name: 'fade', onUpdate: () => {
            if(this.params.fade == false){
                this.alpha = 0;
                document.getElementById(this.props.id+"useAlpha").style.opacity = "0.3";
            }
            else{document.getElementById(this.props.id+"useAlpha").style.opacity = "1.0";}
        }}, 
        
        // Update Speed Parameters and Button
        {name: 'speed', onUpdate: () => {
            if(this.params.speed == false){
                this.playRate = 1;
                this.vidQuery.playbackRate = 1;
                document.getElementById(this.props.id+"useRate").style.opacity = "0.3";
              }
              else{ 
                this.params.time = false; 
                this.playRate = 1; 
                this.vidQuery.playbackRate = 1;
                document.getElementById(this.props.id+"useRate").style.opacity = "1.0";
                document.getElementById(this.props.id+"useTime").style.opacity = "0.3";
              }
        }}, 

        // Update Volume Parameters and Button
        {name: 'volume', onUpdate: () => {
            if(this.params.volume == false){
                this.vidQuery.muted = true;
                this.params.volume = false;
                this.volume = 0;
                this.vidQuery.volume = 0;
                document.getElementById(this.props.id+"useVol").style.opacity = "0.3";
              }
              else{ 
                this.params.volume = true; 
                this.vidQuery.muted = false; 
                this.volume = 0.5; 
                this.vidQuery.volume = 0.5;
                document.getElementById(this.props.id+"useVol").style.opacity = "1.0";
              }
        }}, 
        
        // Update Time Parameters and Button
        {name: 'time', onUpdate: () => {
            if(this.params.time == false){
                this.playRate = 1;
                this.vidQuery.playbackRate = 1;
                document.getElementById(this.props.id+"useTime").style.opacity = "0.3";
            }
            else {
                this.params.speed = false;
                this.playRate = 0;
                this.vidQuery.playbackRate = 0;
                document.getElementById(this.props.id+"useRate").style.opacity = "0.3";
                document.getElementById(this.props.id+"useTime").style.opacity = "1.0";
            }
        }}]
        portInfo.forEach(o => {
            this.ports[o.name] = {
                edit: true, // false
                default: true,                 
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (userData) => {
                    console.log(o.name, this.params[o.name])
                    this.params[o.name] = userData[0].data
                    o.onUpdate()
                }
            }
        })

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.looping = false;

        this.playRate = 1;
        this.alpha = 0;
        this.volume = 0.5;

        this.ampScore = 0;
        this.ampThreshold = 0;
        this.diff = 0;

        this.enableControls = false;
        this.animationId = null;

        this.vidQuery;
        this.c;
        this.gl;

        this.sliderfocus = false;
        this.hidden = false;

        this.cohScore = undefined; //for getting coherence
    }

    init = () => {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = () => { 
            return `
            <div id="`+this.props.id+`">
                <div id="`+this.props.id+`menu" style='position:absolute; z-index:4;'>
                    <button id="`+this.props.id+`showhide" style='' >Hide UI</button>
                    <input id="`+this.props.id+`fs" type="file" accept="video/*"/>
                    <div id="${this.props.id}message"></div>
                    <div id="`+this.props.id+`timeDiv"><input id="`+this.props.id+`timeSlider" type="range" min="0" max="1000" value="0"><br><br> 
                    <div id="`+this.props.id+`vidbar"><button id="`+this.props.id+`minus1min">--</button><button id="`+this.props.id+`minus10sec">-</button><button id="`+this.props.id+`play">||</button><button id="`+this.props.id+`plus10sec">+</button><button id="`+this.props.id+`plus1min">++</button></div></div> 
                    <div id="`+this.props.id+`vidbuttons">
                        <table> 
                          <tr><td>Feedback:</td></tr> 
                          <tr><td><button id="`+this.props.id+`useAlpha">Fade</button></td></tr> 
                          <tr><td><button id="`+this.props.id+`useRate">Speed</button></td></tr> 
                          <tr><td><button id="`+this.props.id+`useVol">Volume</button></td></tr> 
                          <tr><td><button id="`+this.props.id+`useTime">Time</button></td></tr> 
                        </table>
                    </div>
                </div> 
                <canvas id="`+this.props.id+`canvas" height=100% width=100% style='position:absolute; z-index:2;'></canvas>
                <video id="`+this.props.id+`video" src="${this.params.url}" style="z-index:1;" type="video/mp4" height=100% width=100% autoplay loop muted></video> 
            </div> 
          `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = () => {
            this.vidQuery = document.getElementById(this.props.id+'video');
            this.c = document.getElementById(this.props.id+'canvas');
            this.gl = this.c.getContext("webgl");
            this.timeSlider = document.getElementById(this.props.id+"timeSlider");
                
            //document.getElementById(this.props.id+"startbutton").addEventListener('click', this.startVideo, false);
            
            //document.getElementById(this.props.id+"stopbutton").addEventListener('click', this.stopVideo, false);
            
            this.localFileVideoPlayer();

            document.getElementById(this.props.id+"play").onclick = () => {
                if(this.vidQuery.playbackRate == 0){
                    if(this.params.speed == true){
                      this.vidQuery.playbackRate = this.playRate;
                    }
                    else {
                      this.playRate = 1;
                      this.vidQuery.playbackRate = 1;
                    }
                    document.getElementById(this.props.id+"play").innerHTML = "||";
                }
                else{
                    this.vidQuery.playbackRate = 0;
                    document.getElementById(this.props.id+"play").innerHTML = ">";
                }
            }
            
            document.getElementById(this.props.id+"useAlpha").onclick = () => {
                this.session.graph.runSafe(this,'fade',[{data: !this.params.fade}])
            }

            document.getElementById(this.props.id+"useRate").onclick = () => {
                this.session.graph.runSafe(this,'speed',[{data: !this.params.speed}])
            }

            document.getElementById(this.props.id+"useVol").onclick = () => {
                this.session.graph.runSafe(this,'volume',[{data: !this.params.volume}])
            }

            document.getElementById(this.props.id+"useTime").onclick = () => {
                this.session.graph.runSafe(this,'time',[{data: !this.params.time}])
            }
            document.getElementById(this.props.id+"useTime").click() // Auto-off

            this.timeSlider.addEventListener("change", () => {
            // Calculate the new time
                var time = this.vidQuery.duration * (this.timeSlider.value / 1000);
            
            // Update the video time
                this.vidQuery.currentTime = time;
            });

            this.timeSlider.onmousedown = () => {
                this.sliderfocus = true;
            }

            this.timeSlider.ontouchstart = () => {
                this.sliderfocus = true;
            }

            this.timeSlider.onchange = () => {
                this.sliderfocus = false;
            }

            document.getElementById(this.props.id+"minus1min").onclick = () => {
                this.vidQuery.currentTime -= 60;
            }
            document.getElementById(this.props.id+"plus1min").onclick = () => {
                this.vidQuery.currentTime += 60;
            }
            document.getElementById(this.props.id+"minus10sec").onclick = () => {
                this.vidQuery.currentTime -= 10;
            }
            document.getElementById(this.props.id+"plus10sec").onclick = () => {
                this.vidQuery.currentTime += 10;
            }

            document.getElementById(this.props.id+"showhide").onclick = () => {
                if(this.hidden == false) {
                    this.hidden = true;
                    document.getElementById(this.props.id+"showhide").innerHTML = "Show UI";
                    document.getElementById(this.props.id+"vidbuttons").style.display = "none";
                    document.getElementById(this.props.id+"timeDiv").style.display = "none";
                    document.getElementById(this.props.id+"fs").style.display = "none";
                }
                else{
                    this.hidden = false;
                    document.getElementById(this.props.id+"showhide").innerHTML = "Hide UI";
                    document.getElementById(this.props.id+"vidbuttons").style.display = "";
                    document.getElementById(this.props.id+"timeDiv").style.display = "";
                    document.getElementById(this.props.id+"fs").style.display = "";
                }
            }

            this.looping = true;
            this.initVideo();
        }

        return {HTMLtemplate, setupHTML}
    }

    deinit = () => {
        this.looping = false;
        this.stopVideo();
        //document.getElementById(this.props.id+"startbutton").removeEventListener('click', this.startVideo);
        //document.getElementById(this.props.id+"stopbutton").removeEventListener('click', this.stopVideo);
        cancelAnimationFrame(this.animationId);
    }

    responsive = () => {
        this.vidQuery.width = this.app.AppletHTML.node.clientWidth;
        this.vidQuery.height = this.app.AppletHTML.node.clientHeight;
        this.c.width = this.app.AppletHTML.node.clientWidth;
        this.c.height = this.app.AppletHTML.node.clientHeight;
    }

    startVideo = () => {
        if(this.playRate < 0.1){ this.vidQuery.playbackRate = 0; }
        else{ this.vidQuery.playbackRate = this.playRate; }
    }

    stopVideo = () => {
        this.vidQuery.playbackRate = 0;
    }

    startFile = (file) => {
        'use strict'
        var URL = window.URL || window.webkitURL;
        if (file){
            var type = file.type;
            var videoNode = document.getElementById(this.props.id+'video');
            var canPlay = videoNode.canPlayType(type);
            if (canPlay === ''){ canPlay = 'no';}
            var message = 'Can play type "' + type + '": ' + canPlay;
            var isError = canPlay === 'no';
            if (isError) {
            return;
            }
        }
        var fileURL = URL.createObjectURL(file);
        videoNode.src = fileURL;
    }
   
    
    localFileVideoPlayer = () => {
        var playSelectedFile = (event) => {
          var file = event.target.files[0];
          this.startFile(file)
        }
        var inputNode = document.getElementById(this.props.id+'fs');
        inputNode.addEventListener('change', playSelectedFile, false);
      }
  
      onData(score){
        if(this.params.fade == true) {
          if(((this.alpha < 0.8) || (score > 0)) && ((this.alpha > 0)||(score < 0))){
            if(this.alpha - score < 0){
              this.alpha = 0;
            }
            else if(this.alpha - score > 0.8){
              this.alpha = 0.8;
            }
            else{
              this.alpha -= score;
            }
          }
        }
        if(this.params.speed == true){
          if(((this.vidQuery.playbackRate < 3) || (score < 0)) && ((this.vidQuery.playbackRate > 0) || (score > 0)))
          { 
            this.playRate = this.vidQuery.playbackRate + score*0.5;
            if((this.playRate < 0.05) && (this.playRate > 0)){
              this.vidQuery.playbackRate = 0;
            }
            else if(this.playRate < 0) {
              this.vidQuery.currentTime += score;
            }
            else if((this.playRate > 0.05) && (this.playRate < 0.1)){
              this.vidQuery.playbackRate = 0.1;
            }
            else{
              this.vidQuery.playbackRate = this.playRate;
            }
          }
        }
        if(this.params.volume == true){
          if(((this.vidQuery.volume < 1) || (score < 0)) && ((this.vidQuery.volume > 0) || (score > 0)))
          {
            this.volume = this.vidQuery.volume + score*0.5;
            if(this.volume < 0){
              this.vidQuery.volume = 0;
            }
            else if(this.volume > 1){
              this.vidQuery.volume = 1;
            }
            else {
              this.vidQuery.volume = this.volume;
            }
          }
        }
        if(this.params.time == true){
          this.vidQuery.currentTime += score*10;
        }
      }
      
      animateRect = () => {
        if(this.looping === true) {
          if((this.sliderfocus == false)) {
            this.timeSlider.value = Math.floor(1000 * this.vidQuery.currentTime / this.vidQuery.duration);
          }

          if(this.session.atlas.settings.heg) {
            let ct = this.session.atlas.data.heg[0].count;
            if(ct > 1) {
              let avg = 40; if(ct < avg) { avg = ct; }
              let slice = this.session.atlas.data.heg[0].ratio.slice(ct-avg);
              let score = this.session.atlas.data.heg[0].ratio[ct-1] - this.session.atlas.mean(slice);
              this.onData(score);
            }
          }
          else if (this.session.atlas.settings.analysis.eegcoherence) {
              this.cohScore = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')
              this.onData(this.cohScore);
          }

          this.gl.clearColor(0,0,0.01,this.alpha);
          this.gl.clear(this.gl.COLOR_BUFFER_BIT);
          setTimeout(()=>{this.animationId = requestAnimationFrame(this.animateRect);},15); 
        }
      }

  
      initVideo() {
            if(this.params.volume == true){
              this.vidQuery.muted = false;
              this.vidQuery.volume = 0.5;
              this.volume = 0.5;
            } 

            this.c.width = this.vidQuery.width;
            this.c.height = this.vidQuery.height;
            var rect = this.vidQuery.getBoundingClientRect();
            this.gl.clearColor(0,0,0.1,0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
            this.animateRect();
       }

}