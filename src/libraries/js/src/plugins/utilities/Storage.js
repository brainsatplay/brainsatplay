export class Storage{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        

        this.ports = {
            set: {
                edit: false,
                input: {type: undefined},
                output: {type: null},
                onUpdate: async (user) => {
                    return await this.session.storage.set(`app_${this.app.info.name}`, this.ports.label.data, user.data)
                }
            },
            get: {
                // edit: false,
                input: {type: 'boolean'},
                output: {type: undefined},
                onUpdate: async (user) => {
                    if (user.data) {
                        let data = await this.session.storage.get(`app_${this.app.info.name}`, this.ports.label.data)
                        return {data}
                    }
                }
            },
            label: {
                data: 'data',
                input: {type: 'string'},
                output: {type: null},
            }
        }
    }

    init = () => {
        
    }

    deinit = () => {}
}