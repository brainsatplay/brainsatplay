
// import AND from './films/themoment/AND.mp4'
// import AND1 from './films/themoment/AND1.mp3'
// import AND2 from './films/themoment/AND2.mp3'
// import voxAND from './films/themoment/VOXand.mp3'

// import AST from './films/themoment/AST.mp4'
// import AST1 from './films/themoment/AST1.mp3'
// import AST2 from './films/themoment/AST2.mp3'
// import voxAST from './films/themoment/VOXast.mp3'

// import TEL from './films/themoment/TEL.mp4'
// import TEL1 from './films/themoment/TEL1.mp3'
// import TEL2 from './films/themoment/TEL2.mp3'
// import voxTEL from './films/themoment/VOXtel.mp3'

export class Ramchurn{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            currentScene: 0,
            videos: [],
            audio: {
                primary: [],
                secondary: [],
                vox: []
            },
            
            // The Moment (http://braincontrolledmovie.co.uk/)
            scenes: [
                {duration: 87.32 * 1000},
                {duration: 32.20 * 1000},
                {duration: 115.96 * 1000},
                {duration: 40.80 * 1000},
                {duration: 24.04 * 1000},
                {duration: 94.60 * 1000},
                {duration: 41.88 * 1000},
                {duration: 55.64 * 1000},
                {duration: 141.72 * 1000},
                {duration: 56.84 * 1000},
                {duration: 224.68 * 1000},
                {duration: 39.60 * 1000},
                {duration: 59.16 * 1000},
                {duration: 25.28 * 1000},
                {duration: 204.28 * 1000},
                {duration: 90.44 * 1000},
                {duration: 26.80 * 1000},
                {duration: 90.64 * 1000},
            ],

            slowThreshold: 105, // frames
        }

        this.ports = {

            // Start Film
            start: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (userData) => {
                    if (userData[0].data){
                        this.props.looping = true
                        this.animate()
                    }
                }
            },

            // Load Files
            load: {
                input: {type: 'file', multiple: true, accept: "video/mp4, audio/mpeg"},
                output: {type: null},
                onUpdate: (userData) => {
                    let files = Array.from(userData[0].data)
                    files.forEach(f => {
                        if (f.type === 'audio/mpeg'){
                            if (f.name.toLowerCase().includes('vox')){
                                this.props.audio.vox.push(f)
                            } else if (f.name.includes('1')){
                                this.props.audio.primary.push(f)
                            } else if (f.name.includes('2')){
                                this.props.audio.secondary.push(f)
                            }
                        } else if (f.type === 'video/mp4') {
                            this.props.videos.push(f)
                        }
                    })

                    this.props.videos = this.shuffle(this.props.videos) // Shuffle videos
                    this.setScene(this.props.currentScene)
                    this.session.graph.runSafe(this,'start', [{data: true}])
                }
            },

            // Send Audio and Video Out
            video: {
                input: {type: null},
                output: {type: 'file'},
                onUpdate: (userData) => {
                    // Get Combination
                    let combination = userData[0].data
                    return [{data: [combination.primary.video, combination.secondary.video]}]
                }
            },
            audio: {
                input: {type: null},
                output: {type: 'file'},
                onUpdate: (userData) => {
                    let combination = userData[0].data
                    return [{data: [combination.primary.audio, combination.primary.audio]}]
                }
            },

            cut: {
                input: {type: 'boolean'},
                output: {type: 'boolean'},
                onUpdate: (userData) => {
                    console.log('LOG CUT')
                    return userData
                }
            }
        }
    }

    init = () => {}

    deinit = () => {
        this.props.looping = false
    }

    animate = () => {
        if (this.props.looping){

            let currentScene = this.props.scenes[this.props.currentScene]
            let timeElapsed = Date.now() - currentScene.date.getTime()
            if (timeElapsed >= currentScene.duration){
                this.props.currentScene++
                this.setScene(this.props.currentScene)
            }
            setTimeout(this.animate, 1000/60)
        }
    }

    setScene = (i) => {
        this.props.scenes.push({})

        // Write to CSV
        this.props.scenes[i].data = []
        this.props.scenes[i].sceneNumber = null
        this.props.scenes[i].combination = this.getNewCombination(this.props.scenes[i-1])
        this.props.scenes[i].cuts = [] // (Yes = 1 No = 0)
        this.props.scenes[i].averageDuration = 0 
        this.props.scenes[i].durationOnPrimary = 0
        this.props.scenes[i].durationOnSecondary = 0
        this.props.scenes[i].ratio = 0
        this.props.scenes[i].totalCuts = 0
        this.props.scenes[i].screeningNumber = 0
        this.props.scenes[i].date = new Date()

        // Internal Tracking
        this.props.scenes[i].cutCount = 0
        this.props.scenes[i].totalVideoFrames = 0
        this.props.scenes[i].slowThreshold = 105 // frames
        this.props.scenes[i].durations = []
        this.props.scenes[i].lastCut = null

        this.session.graph.runSafe(this, 'video', [{data: this.props.scenes[i].combination}])
        this.session.graph.runSafe(this, 'audio', [{data: this.props.scenes[i].combination}])
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

    createFilePackage(videoFile, mode){
        let name = videoFile.name.replace('.mp4','').toLowerCase()

        let o = {}
        o.video = videoFile
        o.audio = this.props.audio[mode].find(f => f.name.toLowerCase().includes(name))
        o.vox = this.props.audio.vox.find(f => f.name.toLowerCase().includes(name))
        return o
    }

    getNewCombination = (prevScene) => {

        let combination = {
            primary: {},
            secondary: {}
        }

        // this.logDisplayDuration()
        let cutSlow = true // this.props.ramchurn.totalVideoFrames / this.props.ramchurn.cutCount > this.props.ramchurn.slowThreshold // 1 for slow; 0 for fast
        let ratio = 0 // this.props.ramchurn.durations[0] / this.props.ramchurn.durations[1]

        // Only Choose New Sources
        let choices = this.props.videos
        if (prevScene) {
            let currentSources = [prevScene.combination.primary.video, prevScene.combination.secondary.video]
            choices = choices.filter(f => !currentSources.includes(f))
            let randomChoice = Math.floor(Math.random() * choices.length)
            if (choices.length == 0) {
                console.log('No Choices')
                combimation = prevScene.combination
            } else {

                // Secondary Dominant
                if (ratio < .75) {
                    if (cutSlow) {
                        console.log('Swap Primary and Secondary')
                        combination.primary = prevScene.combination.secondary
                        combination.secondary = prevScene.combination.primary
                    }
                    else {
                        console.log('New Secondary, previous Secondary to Primary')
                        combination.primary = this.createFilePackage(prevScene.combination.secondary.video, 'primary')
                        combination.secondary = this.createFilePackage(choices[randomChoice], 'secondary')
                    }
                }

                // Primary Dominant
                else if (ratio > 1.5) {
                    if (cutSlow) {
                        console.log('New Secondary')
                        combination.primary = prevScene.combination.primary 
                        combination.secondary = this.createFilePackage(choices[randomChoice], 'secondary')
                    } else {
                        console.log('Same')
                        combimation = prevScene.combination
                    }
                }

                // Equal
                else {
                    if (cutSlow) { // New Primary
                        console.log('New Primary')
                        combination.primary = this.createFilePackage(choices[randomChoice], 'primary')
                        combination.secondary = prevScene.combination.secondary
                    }
                    else {
                        console.log('New Primary, previous Primary to Secondary')
                        combination.primary = this.createFilePackage(choices[randomChoice], 'primary')
                        combination.secondary = this.createFilePackage(prevScene.combination.primary.video, 'secondary')
                    }
                }
            }
        } else {
            console.log('First Combination')
            combination.primary = this.createFilePackage(choices[0], 'primary')
            combination.secondary = this.createFilePackage(choices[1], 'secondary')
        }

        console.log(combination)
        return combination
        // this.changeFocus(0)
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