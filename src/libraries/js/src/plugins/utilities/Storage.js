import {Plugin} from '../Plugin'

export class Storage extends Plugin{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        super(label, session)
        this.label = label
        this.session = session


        this.props = {
            data: {}
        }
        

        this.ports = {
            default: {
                edit: false,
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    // if (!(this.app.info.name in this.props.data)) {
                        this.session.storage.set(`app_${this.app.info.name}`, this.ports.label.data, user.data)
                        this.props.data[this.app.info.name] = user.data
                    // } else {
                    //     this.props.data[this.app.info.name] = user.data
                    // }

                    console.log('userData', user.data, this.props.data[this.app.info.name])
                    return user
                }
            },
            // get: {
            //     // edit: false,
            //     input: {type: 'boolean'},
            //     output: {type: undefined},
            //     onUpdate: async (user) => {
            //         if (user.data) {
            //             let data = await this.session.storage.get(`app_${this.app.info.name}`, this.ports.label.data)
            //             return {data}
            //         }
            //     }
            // },
            label: {
                data: 'data',
                input: {type: 'string'},
                output: {type: null},
            }
        }
    }

    init = () => {
        
        let func = async () => {
            console.log('get')
            console.log(`app_${this.app.info.name}`, this.ports.label.data)
            let data = await this.session.storage.get(`app_${this.app.info.name}`, this.ports.label.data)
            if (!(this.app.info.name in this.props.data)) {
                console.log('stored', data)
                this.session.graph.runSafe(this, 'default', {data})
            }
        }
        func()
    }

    deinit = () => {
        // this.session.storage.set(`app_${this.app.info.name}`, this.ports.label.data, this.props.data[this.app.info.name]) // push latest data to database
    }
}