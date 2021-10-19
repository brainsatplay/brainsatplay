import {Plugin} from '../../graph/Plugin'

export class DataManager extends Plugin{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        super(info, graph)
        
        
        

        this.ports = {
            log:{
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {
                    this.session.atlas.makeNote(`${user.meta.name} ${user.data}`) // NOTE: Fix by grabbing source label
                }
            },
            get:{
                input: {type: 'boolean'},
                output: {type: Object},
                onUpdate: (user) => {
                    return new Promise((resolve) => {
                        let trigger = user.data
                        if (trigger) {
                            this.session.dataManager.readFromDB(undefined, undefined,undefined, (data) => {
                                resolve(data)
                            })
                        }
                    })
                }
            },
            csv:{
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate:(user) => {
                    let trigger = user.data
                    if (trigger) {
                        this.session.dataManager.save()
                    }
                }
            },
            latest:{
                input: {type: 'boolean'},
                output: {type: Object},
                onUpdate: () => {
                    return new Promise((resolve) => {
            
                    let loaded
                    this.session.dataManager.getFilenames(files => {
                        let filename = files[files.length -1]
                        this.session.dataManager.getFileSize(filename,(size) => {
                        this.session.dataManager.readFromDB(filename, 0,size, (data,file) => {
                            this.session.dataManager.getCSVHeader(filename, (header)=> { 
                            loaded = this.session.dataManager.parseDBData(data,header.split(','),file,true);
                            resolve({data: loaded, meta:{label: `${this.name}_loaded`}})
                        });
                        })
                        })
                    })
                })
                }
            },
        }

        this.props = {}
    }

    init = () => {
        if (this.ports.latest.output.active){
            this.update('latest',{data: true})
        }
    }

    deinit = () => {}
}