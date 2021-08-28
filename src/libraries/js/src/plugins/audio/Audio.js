import {SoundJS} from '../../utils/Sound'

export class Audio{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            sourceGain: null,
            sourceNode: null,
            status: 0,
            maxVol: 0.5,
        }

        if(!window.audio) window.audio = new SoundJS();

        this.ports = {
            file: {
                input: {type: 'file', accept:'audio/*'}, // Single file only
                output: {type: 'boolean'},
                default: [],
                onUpdate: async (user) => {
                    return new Promise(resolve => {
                        if (user.data){
                            this.deinit()
                            let file = user.data
                            if (file instanceof FileList || Array.isArray(file)) file = file[0]
                            this.params.file = file
                            this.decodeAudio(this.params.file, () => {
                                resolve({data: true}) 
                            })
                        }
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
            },
            volume: {
                input: {type: 'number'},
                output: {type: null},
                default: this.props.maxVol,
                min: 0,
                max: this.props.maxVol,
                step: 0.01,
                onUpdate: (user) => {
                    let volume = user.data*this.props.maxVol
                    this.props.sourceGain.gain.setValueAtTime(volume, window.audio.ctx.currentTime);
                }
            },
            toggle: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {

                    if (user.data === true){
                        if (this.props.status === 1){
                            this.deinit()
                            this.props.status = 0
                        }
                        else {
                            this.props.sourceNode.start(0);
                            this.props.status = 1
                        }
                    }
                }
            }
        }
    }

    init = () => {}

    deinit = () => {
        this.stopAudio();
    }

    // preload = () => {

    // }

    decodeAudio = (file, callback) => {
        //read and decode the file into audio array buffer 
        var fr = new FileReader();

        fr.onload = (e) => {
            var fileResult = e.target.result;
            if (window.audio.ctx === null) {
                return;
            };
            window.audio.ctx.decodeAudioData(fileResult, (buffer) => {
                window.audio.finishedLoading([buffer]);
                this.props.sourceNode = window.audio.sourceList[window.audio.sourceList.length-1];
                this.props.sourceGain = window.audio.sourceGains[window.audio.sourceList.length-1];

                this.props.sourceGain.gain.setValueAtTime(this.props.maxVol, window.audio.ctx.currentTime);
                this.props.sourceNode.onended = () => {
                    this.endAudio();
                };

                callback()
            }, (e) => {
                console.error('Failed to decode the file!', e);
            });
        };
        fr.onerror = (e) => {
            console.error('Failed to read the file!', e);
        };
        //assign the file to the reader
        fr.readAsArrayBuffer(file);
    }
        
    endAudio = () => {
        this.stopAudio();
        this.props.status = 0;
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