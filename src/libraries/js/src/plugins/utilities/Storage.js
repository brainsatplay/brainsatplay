import {Plugin} from '../../graph/Plugin'

export class Storage extends Plugin{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        super(info, graph)
        
        


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
                        this.session.storage.set(`app_${this.app.info.name}`, this.ports.name.data, user.data)
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
            //             let data = await this.session.storage.get(`app_${this.app.info.name}`, this.ports.name.data)
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
            console.log(`app_${this.app.info.name}`, this.ports.name.data)
            let data = await this.session.storage.get(`app_${this.app.info.name}`, this.ports.name.data)
            if (!(this.app.info.name in this.props.data)) {
                console.log('stored', data)
                this.update( 'default', {data})
            }
        }
        func()
    }

    deinit = () => {
        // this.session.storage.set(`app_${this.app.info.name}`, this.ports.name.data, this.props.data[this.app.info.name]) // push latest data to database
    }
}