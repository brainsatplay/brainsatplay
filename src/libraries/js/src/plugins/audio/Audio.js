import {SoundJS} from '../../utils/Sound'

export class Audio{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            sourceNode: null,
            status: 0,
            maxVol: 0.5
        }

        if(!window.audio) window.audio = new SoundJS();

        this.ports = {
            files: {
                input: {type: 'file', accept:'audio/*'},
                output: {type: null},
                default: [],
                onUpdate: (userData) => {
                    this.params.files = Array.from(this.params.files)
                    this.params.files.forEach(this.endAudio)
                    this.params.files = Array.from(userData[0].data)
                    this.params.files.forEach(this.decodeAudio)

                    this.params.files.forEach((f,i) => {
                        this.session.graph.addPort(this,`track${i}`, {
                            input: {type: 'number'},
                            output: {type: null},
                            default: this.props.maxVol,
                            min: 0,
                            max: this.props.maxVol,
                            step: 0.01,
                            onUpdate: (userData) => {
                                let volume = userData[0].data*this.props.maxVol
                                window.audio.gainNode.gain.setValueAtTime(volume, window.audio.ctx.currentTime);
                            }
                        })
                    })
                }
            }, 
            fft: {
                input: {type: null},
                output: {type: Array},
                onUpdate: () => {
                    var array = new Uint8Array(window.audio.analyserNode.frequencyBinCount);
                    window.audio.analyserNode.getByteFrequencyData(array);
                }
            }
        }
    }

    init = () => {

        
    }

    deinit = () => {
        this.stopAudio();
    }

    // preload = () => {

    // }

    decodeAudio = (file) => {
        //read and decode the file into audio array buffer 
        var fr = new FileReader();

        console.log(this)        
        fr.onload = (e) => {
            var fileResult = e.target.result;
            if (window.audio.ctx === null) {
                return;
            };
            window.audio.ctx.decodeAudioData(fileResult, (buffer) => {
                console.log(this)
                console.log('Decode successful, starting the audio')
                window.audio.finishedLoading([buffer]);
                this.props.sourceNode = window.audio.sourceList[window.audio.sourceList.length-1];
                this.props.sourceNode.start(0);

                console.log(this.props.maxVol, window.audio.ctx.currentTime)
                window.audio.gainNode.gain.setValueAtTime(this.props.maxVol, window.audio.ctx.currentTime);
                this.props.status = 1;
                this.props.sourceNode.onended = () => {
                    this.endAudio();
                };
            }, (e) => {
                console.error('Failed to decode the file!', e);
            });
        };
        fr.onerror = (e) => {
            console.error('Failed to read the file!', e);
        };
        //assign the file to the reader
        console.log('Starting to read the file')
        fr.readAsArrayBuffer(file);
    }
        
    endAudio = () => {
        this.stopAudio();
        this.status = 0;
        if(window.audio.sourceList.length > 0) {try {this.sourceNode.stop(0);} catch(er){}}
    }

    stopAudio = () => {
        if(window.audio != undefined){
            if (window.audio?.sourceList?.length > 0 && this.props.sourceNode) {
                this.props.sourceNode.stop(0);
            }
        }
    }
}