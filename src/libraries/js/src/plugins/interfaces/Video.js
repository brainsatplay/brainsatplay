export class Video {

    static id = String(Math.floor(Math.random() * 1000000))

    constructor(label, session, params = {}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            ramchurn: { default: false }
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            focusVideo: 0,
            videos: [],
            ramchurn: {
                cutCount: 0,
                totalVideoFrames: 0,
                slowThreshold: 105, // frames
                durations: [],
                filePool: [],
                lastCut: null,
                triggerChange: false
            }
        };

        // Create Video Player
        this.container = document.createElement('div');
        this.container.id = this.props.id
        this.container.style = `
        position: relative;
        width: 100%;
        height: 100%;
        `

        this.container.onload = () => {
            this.setup()
            this.responsive()
        }

        let defaultVideoURLs = ['https://vjs.zencdn.net/v/oceans.mp4']

        this.ports = {
            url: {
                default: defaultVideoURLs[0],
                input: { type: 'string' },
                output: { type: null },
                onUpdate: (userData) => {
                    this.params.url = userData[0].data
                    this.session.graph.runSafe(this, 'files', { data: [this.params.url] })
                }
            },
            files: {
                input: { type: 'file', accept: "video/*", multiple: true },
                output: { type: null },
                default: defaultVideoURLs,
                onUpdate: (userData) => {
                    this.props.focusVideo = 0
                    this.params.files = this.shuffle(Array.from(userData[0].data))

                    // Create Videos
                    this.props.videos.forEach(el => el.remove())
                    this.props.videos = []
                    this.props.filePool = []
                    this.props.ramchurn.durations = []
                    this.props.ramchurn.cutCount = 0

                    this.params.files.forEach((file, i) => {
                        this.props.filePool.push(file)
                    })

                    let maxVideos = (this.params.ramchurn) ? Math.min(2, this.props.filePool.length) : this.props.filePool.length

                    for (let i = 0; i < maxVideos; i++) {
                        let video = document.createElement('video')
                        video.type = 'video/mp4'
                        video.width = '100%'
                        video.height = '100%'
                        video.style = `
                            position: absolute;
                            top: 0;
                            left: 0;
                        `
                        video.muted = true
                        video.loop = !true //this.params.ramchurn // Do not loop for Ramchurn films
                        video.autoplay = true
                        video.style.transition = 'opacity 0.1s'
                        video.addEventListener('timeupdate', () => {
                            if (video.currentTime > video.duration - 0.5) {
                                this.props.ramchurn.triggerChange = true
                            }
                        })
                        this.props.videos.push(video)
                        this.props.ramchurn.durations.push(0)
                        this.container.insertAdjacentElement('beforeend', video)
                        this.startVideoFile(video, this.props.filePool[i])
                        if (i != this.props.focusVideo) video.style.opacity = 0
                    }

                    this.props.ramchurn.lastCut = Date.now()
                    this.responsive()
                }
            },
            element: {
                input: { type: null },
                output: { type: Element },
                default: this.container,
                onUpdate: () => {
                    this.params.element = this.container
                    return this.container
                }
            },
            change: {
                input: { type: 'boolean' },
                output: { type: null },
                onUpdate: (userData) => {
                    if (userData[0].data) {

                        // Log Display Duration
                        this.logDisplayDuration()

                        // Increment Counters
                        this.props.focusVideo++
                        this.props.focusVideo = this.props.focusVideo % this.props.videos.length
                        this.props.ramchurn.cutCount++

                        // Switch Displayed Video
                        this.changeFocus()
                    }
                }
            }
        }

        let portInfo = [
            // Update Fade Parameters and Button
            {
                name: 'fade', onUpdate: () => {
                    if (this.params.fade == false) {
                        this.alpha = 0;
                        document.getElementById(this.props.id + "useAlpha").style.opacity = "0.3";
                    }
                    else { document.getElementById(this.props.id + "useAlpha").style.opacity = "1.0"; }
                }
            },

            // Update Speed Parameters and Button
            {
                name: 'speed', onUpdate: () => {
                    if (this.params.speed == false) {
                        this.playRate = 1;
                        document.getElementById(this.props.id + "useRate").style.opacity = "0.3";
                    }
                    else {
                        this.params.time = false;
                        this.playRate = 1;
                        document.getElementById(this.props.id + "useRate").style.opacity = "1.0";
                        document.getElementById(this.props.id + "useTime").style.opacity = "0.3";
                    }
                    this.props.videos.forEach(el => el.playbackRate = this.playRate)
                }
            },

            // Update Volume Parameters and Button
            {
                name: 'volume', onUpdate: () => {
                    if (this.params.volume == false) {
                        this.params.volume = false;
                        this.volume = 0;
                        document.getElementById(this.props.id + "useVol").style.opacity = "0.3";
                    }
                    else {
                        this.params.volume = true;
                        this.volume = 0.5;
                        document.getElementById(this.props.id + "useVol").style.opacity = "1.0";
                    }

                    this.props.videos.forEach(el => el.muted = !this.params.volume)
                    this.props.videos.forEach(el => el.volume = this.volume)

                }
            },

            // Update Time Parameters and Button
            {
                name: 'time', onUpdate: () => {
                    if (this.params.time == false) {
                        this.playRate = 1;
                        document.getElementById(this.props.id + "useTime").style.opacity = "0.3";
                    }
                    else {
                        this.params.speed = false;
                        this.playRate = 0;
                        document.getElementById(this.props.id + "useRate").style.opacity = "0.3";
                        document.getElementById(this.props.id + "useTime").style.opacity = "1.0";
                    }
                    this.props.videos.forEach(el => el.playbackRate = this.playRate)
                }
            }]
        portInfo.forEach(o => {
            this.ports[o.name] = {
                edit: true, // false
                default: true,
                input: { type: 'boolean' },
                output: { type: null },
                onUpdate: (userData) => {
                    this.params[o.name] = userData[0].data
                    o.onUpdate()
                }
            }
        })

        this.looping = false;

        this.playRate = 1;
        this.alpha = 0;
        this.volume = 0.5;

        this.ampScore = 0;
        this.ampThreshold = 0;
        this.diff = 0;

        this.enableControls = false;
        this.animationId = null;
        this.c;
        this.gl;

        this.sliderfocus = false;
        this.hidden = false;

        this.cohScore = undefined; //for getting coherence
    }

    init = () => {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        this.container.insertAdjacentHTML('beforeend', `
                <div id="`+ this.props.id + `menu" style='position:absolute; z-index:4; top: 0; left: 0'>
                    <button id="`+ this.props.id + `showhide" style='' >Hide UI</button>
                    <input id="`+ this.props.id + `fs" type="file" accept="video/*" multiple/>
                    <div id="${this.props.id}message"></div>
                    <div id="`+ this.props.id + `timeDiv"><input id="` + this.props.id + `timeSlider" type="range" min="0" max="1000" value="0"><br><br> 
                    <div id="`+ this.props.id + `vidbar"><button id="` + this.props.id + `minus1min">--</button><button id="` + this.props.id + `minus10sec">-</button><button id="` + this.props.id + `play">||</button><button id="` + this.props.id + `plus10sec">+</button><button id="` + this.props.id + `plus1min">++</button></div></div> 
                    <div id="`+ this.props.id + `vidbuttons">
                        <table> 
                          <tr><td>Feedback:</td></tr> 
                          <tr><td><button id="`+ this.props.id + `useAlpha">Fade</button></td></tr> 
                          <tr><td><button id="`+ this.props.id + `useRate">Speed</button></td></tr> 
                          <tr><td><button id="`+ this.props.id + `useVol">Volume</button></td></tr> 
                          <tr><td><button id="`+ this.props.id + `useTime">Time</button></td></tr> 
                        </table>
                    </div>
                </div> 
                <canvas id="`+ this.props.id + `canvas" height=100% width=100% style='position:absolute; z-index:2; top: 0; left: 0'></canvas>
            </div> 
          `
        )

        window.addEventListener('resize', this.responsive)
    }

    deinit = () => {
        this.looping = false;
        window.removeEventListener('resize', this.responsive)
        this.stopVideo();
        cancelAnimationFrame(this.animationId);
    }

    setup = () => {
        this.c = document.getElementById(this.props.id + 'canvas');
        this.gl = this.c.getContext("webgl");
        this.timeSlider = document.getElementById(this.props.id + "timeSlider");

        this.localFileVideoPlayer();

        document.getElementById(this.props.id + "play").onclick = () => {
            if (this.playRate == 0) {
                if (this.params.speed != true) this.playRate = 1;
                document.getElementById(this.props.id + "play").innerHTML = "||";
            }
            else {
                document.getElementById(this.props.id + "play").innerHTML = ">";
            }
            this.props.videos.forEach(el => el.playbackRate = this.playRate)

        }

        document.getElementById(this.props.id + "useAlpha").onclick = () => {
            this.session.graph.runSafe(this, 'fade', [{ data: !this.params.fade }])
        }

        document.getElementById(this.props.id + "useRate").onclick = () => {
            this.session.graph.runSafe(this, 'speed', [{ data: !this.params.speed }])
        }

        document.getElementById(this.props.id + "useVol").onclick = () => {
            this.session.graph.runSafe(this, 'volume', [{ data: !this.params.volume }])
        }

        document.getElementById(this.props.id + "useTime").onclick = () => {
            this.session.graph.runSafe(this, 'time', [{ data: !this.params.time }])
        }
        document.getElementById(this.props.id + "useTime").click() // Auto-off

        this.timeSlider.addEventListener("change", () => {
            let duration
            this.props.videos.forEach(el => {
                if (duration) duration = Math.min(duration, el.duration)
                else duration = el.duration
            })

            // Calculate the new time
            let time = duration * (this.timeSlider.value / 1000);

            // Update video times
            this.props.videos.forEach(el => el.currentTime = time)
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

        document.getElementById(this.props.id + "minus1min").onclick = () => {
            this.props.videos.forEach(el => el.currentTime -= 60)
        }
        document.getElementById(this.props.id + "plus1min").onclick = () => {
            this.props.videos.forEach(el => el.currentTime += 60)
        }
        document.getElementById(this.props.id + "minus10sec").onclick = () => {
            this.props.videos.forEach(el => el.currentTime -= 10)
        }
        document.getElementById(this.props.id + "plus10sec").onclick = () => {
            this.props.videos.forEach(el => el.currentTime += 10)
        }

        document.getElementById(this.props.id + "showhide").onclick = () => {
            if (this.hidden == false) {
                this.hidden = true;
                document.getElementById(this.props.id + "showhide").innerHTML = "Show UI";
                document.getElementById(this.props.id + "vidbuttons").style.display = "none";
                document.getElementById(this.props.id + "timeDiv").style.display = "none";
                document.getElementById(this.props.id + "fs").style.display = "none";
            }
            else {
                this.hidden = false;
                document.getElementById(this.props.id + "showhide").innerHTML = "Hide UI";
                document.getElementById(this.props.id + "vidbuttons").style.display = "";
                document.getElementById(this.props.id + "timeDiv").style.display = "";
                document.getElementById(this.props.id + "fs").style.display = "";
            }
        }

        this.looping = true;
        this.session.graph.runSafe(this, 'files', [{ data: this.params.files }]) // Initialize default files
        this.initVideos();
    }

    responsive = () => {
        this.props.videos.forEach(el => {
            el.width = el.parentNode.clientWidth;
            el.height = el.parentNode.clientHeight;
        })
        // this.c.width = this.app.AppletHTML.node.clientWidth;
        // this.c.height = this.app.AppletHTML.node.clientHeight;
    }




    startVideo = () => {
        this.props.videos.forEach(el => {
            if (this.playRate < 0.1) { el.playbackRate = 0; }
            else { el.playbackRate = this.playRate; }
        })
    }

    stopVideo = () => {
        this.props.videos.forEach(el => el.playbackRate = 0)
    }

    startVideoFile = (element, file) => {
        'use strict'
        var URL = window.URL || window.webkitURL;
        if (file) {
            var fileURL
            if (typeof file === 'string') fileURL = file
            else {
                var type = file.type;
                var canPlay = element.canPlayType(type);
                if (canPlay === '') { canPlay = 'no'; }
                var message = 'Can play type "' + type + '": ' + canPlay;
                var isError = canPlay === 'no';
                if (isError) {
                    return;
                }

                fileURL = URL.createObjectURL(file);
            }

            this.props.videos.find((el, i) => {
                if (el === element) {
                    this.props.ramchurn.durations[i] = 0 // Reset duration
                    return true
                }
            })

            element.src = fileURL;
            element.setAttribute('data-file', this.stringifyFile(file))
        }
    }

    stringifyFile = (file) => {
        let newObject = {
            'lastModified': file.lastModified,
            'lastModifiedDate': file.lastModifiedDate,
            'name': file.name,
            'size': file.size,
            'type': file.type
        };
        return JSON.stringify(newObject)
    }


    localFileVideoPlayer = () => {
        var playSelectedFiles = (event) => {
            this.session.graph.runSafe(this, 'files', [{ data: event.target.files }])
            inputNode.blur()
        }
        var inputNode = document.getElementById(this.props.id + 'fs');
        inputNode.addEventListener('change', playSelectedFiles, false);
    }

    onData(score) {
        if (this.params.fade == true) {
            if (((this.alpha < 0.8) || (score > 0)) && ((this.alpha > 0) || (score < 0))) {
                if (this.alpha - score < 0) {
                    this.alpha = 0;
                }
                else if (this.alpha - score > 0.8) {
                    this.alpha = 0.8;
                }
                else {
                    this.alpha -= score;
                }
            }
        }

        this.props.videos.forEach(el => {
            if (this.params.speed == true) {
                if (((el.playbackRate < 3) || (score < 0)) && ((el.playbackRate > 0) || (score > 0))) {
                    this.playRate = el.playbackRate + score * 0.5;
                    if ((this.playRate < 0.05) && (this.playRate > 0)) {
                        el.playbackRate = 0;
                    }
                    else if (this.playRate < 0) {
                        el.currentTime += score;
                    }
                    else if ((this.playRate > 0.05) && (this.playRate < 0.1)) {
                        el.playbackRate = 0.1;
                    }
                    else {
                        el.playbackRate = this.playRate;
                    }
                }
            }
            if (this.params.volume == true) {
                if (((el.volume < 1) || (score < 0)) && ((el.volume > 0) || (score > 0))) {
                    this.volume = el.volume + score * 0.5;
                    if (this.volume < 0) {
                        el.volume = 0;
                    }
                    else if (this.volume > 1) {
                        el.volume = 1;
                    }
                    else {
                        el.volume = this.volume;
                    }
                }
            }
            if (this.params.time == true) {
                el.currentTime += score * 10;
            }
        })
    }

    animate = () => {
        if (this.looping === true) {

            if (this.params.ramchurn && this.props.ramchurn.triggerChange) {
                this.getNewCombination()
            }

            if ((this.sliderfocus == false)) {

                // Get Min of All Videos
                let currentTime, duration
                this.props.videos.forEach(el => {
                    if (currentTime) currentTime = Math.min(currentTime, el.currentTime)
                    else currentTime = el.currentTime

                    if (duration) duration = Math.min(duration, el.duration)
                    else duration = el.duration
                })
                // Move Slider
                this.timeSlider.value = Math.floor(1000 * currentTime / duration);
            }

            if (this.session.atlas.settings.heg) {
                let ct = this.session.atlas.data.heg[0].count;
                if (ct > 1) {
                    let avg = 40; if (ct < avg) { avg = ct; }
                    let slice = this.session.atlas.data.heg[0].ratio.slice(ct - avg);
                    let score = this.session.atlas.data.heg[0].ratio[ct - 1] - this.session.atlas.mean(slice);
                    this.onData(score);
                }
            }
            else if (this.session.atlas.settings.analysis.eegcoherence) {
                this.cohScore = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(), 'alpha1')
                this.onData(this.cohScore);
            }

            this.gl.clearColor(0, 0, 0.01, this.alpha);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            setTimeout(() => { this.animationId = requestAnimationFrame(this.animate); }, 15);
        }
    }


    initVideos() {
        this.props.videos.forEach((el, i) => {

            if (this.params.volume == true) {
                el.muted = false;
                el.volume = 0.5;
                this.volume = 0.5;
            }

            // this.c.width = el.width;
            // this.c.height = el.height;
            // var rect = el.getBoundingClientRect();
            // this.gl.clearColor(0,0,0.1,0);
            // this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.startVideoFile(el, this.params.files[i])
        })
        this.animate();
    }



    // Ramchurn Utilities

    logDisplayDuration = () => {
        let currentTime = Date.now()
        this.props.ramchurn.durations[this.props.focusVideo] += currentTime - this.props.ramchurn.lastCut
        this.props.ramchurn.lastCut = currentTime
    }

    changeFocus = (focus = this.props.focusVideo) => {
        this.props.focusVideo = focus
        let frameArr = []
        this.props.videos.forEach((el, i) => {
            if (i === this.props.focusVideo) el.style.opacity = 1
            else el.style.opacity = 0

            frameArr.push(el.getVideoPlaybackQuality().totalVideoFrames)
        })
        this.props.ramchurn.totalVideoFrames = this.session.atlas.mean(frameArr)
    }

    getNewCombination = () => {

        this.props.ramchurn.triggerChange = false // Reset
        this.logDisplayDuration()
        let cutSlow = this.props.ramchurn.totalVideoFrames / this.props.ramchurn.cutCount > this.props.ramchurn.slowThreshold // 1 for slow; 0 for fast
        let ratio = this.props.ramchurn.durations[0] / this.props.ramchurn.durations[1]

        // Only Choose New Sources
        let stringSources = this.props.videos.map(el => el.getAttribute('data-file'))
        let choices = new Set()
        let currentSources = new Set()
        this.props.filePool.forEach(src => {
            if (stringSources.includes(this.stringifyFile(src))) currentSources.add(src)
            else choices.add(src)
        })
        choices = Array.from(choices)
        currentSources = Array.from(currentSources)
        let randomChoice = Math.floor(Math.random() * choices.length)

        if (choices.length == 0) {
            console.log('No Choices')
            this.startVideoFile(this.props.videos[0], currentSources[0])
            this.startVideoFile(this.props.videos[1], currentSources[1])
        } else {

            // Secondary Dominant
            if (ratio < .75) {
                if (cutSlow) {
                    console.log('Swap Primary and Secondary')
                    this.startVideoFile(this.props.videos[0], currentSources[1])
                    this.startVideoFile(this.props.videos[1], currentSources[0])
                }
                else {
                    console.log('New Secondary, previous Secondary to Primary')
                    this.startVideoFile(this.props.videos[0], currentSources[1])
                    this.startVideoFile(this.props.videos[1], choices[randomChoice])
                }
            }

            // Primary Dominant
            else if (ratio > 1.5) {
                if (cutSlow) {
                    console.log('New Secondary')
                    this.startVideoFile(this.props.videos[0], currentSources[0])
                    this.startVideoFile(this.props.videos[1], choices[randomChoice])
                } else {
                    console.log('Same')
                    this.startVideoFile(this.props.videos[0], currentSources[0])
                    this.startVideoFile(this.props.videos[1], currentSources[1])
                }
            }

            // Equal
            else {
                if (cutSlow) { // New Primary
                    console.log('New Primary')
                    this.startVideoFile(this.props.videos[0], choices[randomChoice])
                    this.startVideoFile(this.props.videos[1], currentSources[1])
                }
                else {
                    console.log('New Primary, previous Primary to Secondary')
                    this.startVideoFile(this.props.videos[1], currentSources[0])
                    this.startVideoFile(this.props.videos[0], choices[randomChoice])
                }
            }
        }

        this.changeFocus(0)
    }

    shuffle(array) {
        var currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}