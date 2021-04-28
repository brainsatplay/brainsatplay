import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'


//Example Applet for integrating with the UI Manager
// Just need an iframe, a search window, and link posting
export class YoutubeApplet {


    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        
        this.player = undefined;
        this.looping = false;
        this.loop = undefined;
        this.feedback = true;
        this.c;
        this.gl;
        this.alpha = 0;

        this.videoId = '';
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='${props.id}menu' style='position:absolute; top:60px; opacity:0; style='z-index:3;''> 
                    Psst... Use Adblockers: <a href="https://www.ghostery.com/">Ghostery</a> + <a href="https://adblockplus.org/">Adblock+</a>
                    <br><input type='text' id='${props.id}videoid' placeholder='Paste id or url' style='width:110px;'>
                    <button id='${props.id}load'>Load</button>
                    <br> Feedback: <input type='checkbox' id='${props.id}feedback' checked>
                </div>
                <canvas id="`+props.id+`canvas" height=100% width=100% style='position:absolute; z-index:2; pointer-events:none;'></canvas>
                <iframe id="${props.id}player" type="text/html" src="https://www.youtube.com/embed/JOEtiCwoHB4?enablejsapi=1" frameborder="0" style='z-index:1;'></iframe>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.c = document.getElementById(this.props.id+'canvas');
            this.gl = this.c.getContext("webgl");
            
            this.gl.clearColor(0,0,0.01,0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            document.getElementById(props.id+'load').onclick = () => {
                let id = document.getElementById(props.id+'videoid').value;
                this.videoId = id;
                if(id.indexOf('youtu') < 0) this.player.loadVideoById(id);
                else {
                    console.log(id)
                    if(id.indexOf('watch?v=') > -1 ) {
                        id=id.replace('watch?v=','v/');
                        console.log(id)
                    }
                    this.player.loadVideoByUrl({mediaContentUrl:id,
                    startSeconds:0});
                }
            }

            document.getElementById(props.id).onmouseover = () => {
                document.getElementById(props.id+'menu').style.opacity = 1;
            }
            document.getElementById(props.id).onmouseleave = () => {
                document.getElementById(props.id+'menu').style.opacity = 0;
            }

            document.getElementById(props.id+'feedback').onchange = () => {
                this.feedback = document.getElementById(props.id+'feedback').checked;
                this.alpha = 0;
                if(this.player)
                    this.player.setVolume(50);
            }
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.


        if(!document.getElementById('ytiframeapi')) {
            var tag = document.createElement('script');
            tag.id = 'ytiframeapi';
            tag.src = 'https://www.youtube.com/iframe_api';
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player(this.props.id+'player', {
                width: this.AppletHTML.node.clientWidth,
                height: this.AppletHTML.node.clientWidth,
                videoId: 'JOEtiCwoHB4',
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
        const onPlayerReady = (event) => {
            let div = document.getElementById(this.props.id+'player');
            div.width = this.AppletHTML.node.clientWidth;
            div.height = this.AppletHTML.node.clientHeight;
            this.c.width = this.AppletHTML.node.clientWidth;
            this.c.height = this.AppletHTML.node.clientHeight;
            
            var embedCode = event.target.getVideoEmbedCode();
            event.target.playVideo();
            if (document.getElementById(this.props.id+'player')) {
                document.getElementById(this.props.id+'player').innerHTML = embedCode;
            }
        }

        const changeBorderColor = (playerStatus) => {
            var color;
            if (playerStatus == -1) {
              color = "#37474F"; // unstarted = gray
            } else if (playerStatus == 0) {
              color = "#FFFF00"; // ended = yellow
              this.bci.atlas.makeNote('Youtube: '+this.videoId + " ended");
            } else if (playerStatus == 1) {
              color = "#33691E"; // playing = green
              this.bci.atlas.makeNote('Youtube: '+this.videoId + " playing");
            } else if (playerStatus == 2) {
              color = "#DD2C00"; // paused = red
              this.bci.atlas.makeNote('Youtube: '+this.videoId + " paused");
            } else if (playerStatus == 3) {
              color = "#AA00FF"; // buffering = purple
            } else if (playerStatus == 5) {
              color = "#FF6DOO"; // video cued = orange
            }
            if (color) {
              document.getElementById(this.props.id+'player').style.borderColor = color;
            }
          }

          const onPlayerStateChange = (event) => {
            changeBorderColor(event.data);
          }

          this.looping = true;
          this.updateLoop();
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.player.destroy();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let div = document.getElementById(this.props.id+'player');
        div.width = this.AppletHTML.node.clientWidth;
        div.height = this.AppletHTML.node.clientHeight;
        this.c.width = this.AppletHTML.node.clientWidth;
        this.c.height = this.AppletHTML.node.clientHeight;

    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    mean(arr){
        var sum = arr.reduce((prev,curr)=> curr += prev);
        return sum / arr.length;
    }

    onData = (score) => {
        if(this.player)
            this.player.setVolume(this.player.getVolume()+score);

        if(this.alpha >= 0 && this.alpha < 1) {
            this.alpha-=score;
            if(this.alpha < 0) this.alpha = 0;
            if(this.alpha > 1) this.alpha = 1;
        }
    }

    updateLoop = () => {

        if(this.looping) {

            if(this.feedback) {
                if(this.bci.atlas.settings.heg) {
                    let ct = this.bci.atlas.data.heg[0].count;
                    if(ct > 1) {
                    let avg = 40; if(ct < avg) { avg = ct; }
                    let slice = this.bci.atlas.data.heg[0].ratio.slice(ct-avg);
                    let score = this.bci.atlas.data.heg[0].ratio[ct-1] - this.mean(slice);
                    this.onData(score);
                    }
                }
                else if (this.bci.atlas.settings.coherence && this.coh_ref_ch !== undefined) {
                    let ct = this.coh_ref_ch.fftCount;
                    if(ct > 1) {
                    let avg = 20; if(ct < avg) { avg = ct; }
                    let slice = this.coh_ref_ch.means.alpha1.slice(ct-avg);
                    let score = this.coh_ref_ch.means.alpha1[ct-1] - this.mean(slice);
                    this.onData(score);
                    }
                }
                
                this.gl.clearColor(0,0,0.01,this.alpha);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            }

            

            setTimeout(()=>{this.loop = requestAnimationFrame(this.updateLoop)},16);

        }
    }

   
} 