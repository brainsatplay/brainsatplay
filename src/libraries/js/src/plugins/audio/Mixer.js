import {Audio} from './Audio'



export class Mixer {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        
        
        
        

        this.props = {audio: []}

        this.ports = {
            files: {
                input: {type: 'file', accept:'audio/*'},
                output: {type: 'boolean'},
                data: [],
                onUpdate: async (user) => {

                    return new Promise(resolve => {
                        if (user.data.length > 0){

                        this.deinit()
                        this.ports.files.data = Array.from(user.data)


                        let audioPromises = []
                        let resolved = 0
                        this.ports.files.data.forEach(async (f, i) => {
                            let audio = this.addNode({name: `audio${i}`, class: Audio})
                            console.log(audio) // TODO: Fix
                            let promise = audio.ports.file.onUpdate({data: f})
                            audioPromises.push(promise)
                            Promise.all([promise]).then(() => {
                                resolved++
                                console.log(`${resolved}/${this.ports.files.data.length} files loaded`)
                            })

                            this.props.audio.push(audio)
                        })

                        Promise.all(audioPromises).then(() => {
                            setTimeout(() => {
                                this.props.audio.forEach(n => n.instance.props.sourceNode.start(0)) // Start all audio
                                resolve({data: true})
                            }, 5000)
                        })
                    }
                })
                }
            },
            control: {
                input: {type: Array},
                output: {type: null},
                data: [],
                onUpdate: (user) => {
                    let selections = user.data
                    let sNames = selections.map(f => f.name)
                    this.props.audio.forEach(n => {
                        if (sNames.includes(n.instance.ports.file.data.name)) n.instance.ports.volume.onUpdate({data: 1})
                        else n.instance.ports.volume.onUpdate({data: 0})
                    })
                }
            }
        }
    }

    init = () => {

        
    }

    deinit = () => {
        this.props.audio.forEach((n) => {n.deinit()})
    }
}