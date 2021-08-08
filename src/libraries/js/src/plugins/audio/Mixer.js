import {Audio} from './Audio'

export class Mixer{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {audio: []}

        this.ports = {
            files: {
                input: {type: 'file', accept:'audio/*'},
                output: {type: 'boolean'},
                default: [],
                onUpdate: async (userData) => {

                    return new Promise(resolve => {
                        if (userData[0].data.length > 0){

                        this.deinit()
                        this.params.files = Array.from(userData[0].data)


                        let audioPromises = []
                        let resolved = 0
                        this.params.files.forEach(async (f, i) => {
                            let audio = this.session.graph.instantiateNode({id: `audio${i}`, class: Audio})
                            audio.instance.init()
                            let promise = audio.instance.ports.file.onUpdate([{data: f}])
                            audioPromises.push(promise)
                            Promise.all([promise]).then(() => {
                                resolved++
                                console.log(`${resolved}/${this.params.files.length} files loaded`)
                            })

                            this.props.audio.push(audio)
                        })

                        Promise.all(audioPromises).then(() => {
                            console.log('ALL LOADED')
                            resolve([{data: true}])
                        })
                    }

                    // this.params.files.forEach((f,i) => {
                    //     this.session.graph.addPort(this,`track${i}`, {
                    //         input: {type: 'number'},
                    //         output: {type: null},
                    //         default: this.props.maxVol,
                    //         min: 0,
                    //         max: this.props.maxVol,
                    //         step: 0.01,
                    //         onUpdate: (userData) => {
                    //             let volume = userData[0].data*this.props.maxVol
                    //             window.audio.gainNode.gain.setValueAtTime(volume, window.audio.ctx.currentTime);
                    //         }
                    //     })
                    // })
                })
                }
            },
            control: {
                input: {type: Array},
                output: {type: null},
                default: [],
                onUpdate: (userData) => {
                    console.log('RECEIVED',userData)
                    let selections = userData[0].data
                    console.log(this.props.audio,selections)
                    selections.forEach(f => {
                        console.log(f)
                        let node = this.props.audio.find(n => n.params.name === f.name)
                        console.log('FOUND', node)
                    })
                }
            }
        }
    }

    init = () => {

        
    }

    deinit = () => {
        console.log(this.props.audio)
        this.props.audio.forEach((n) => {n.deinit()})
    }
}