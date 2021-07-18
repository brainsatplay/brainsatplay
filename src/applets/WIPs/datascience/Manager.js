import {eegmath} from '../../../libraries/js/src/utils/eegmath'

class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            state: null
        }

        // Port Definition
        this.ports = {
            // default: {
            //     output: {type: null}
            // },
            data: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (userData) => {
                    userData.forEach(u => {
                        let data = u.data
                        console.log(data)
                        data.eeg.forEach(o => {
                            console.log(o)
                        })
                    })
                }
            }, 
            // color: {
            //     output: {type: null}
            // }
        }
    }

    init = () => {
        let data = [[0,0,0], [1,1,1], [2,2,2]]
        console.log(data)
        // let components = eegmath.pca(data)
        // console.log(components)
    }

    deinit = () => {}
}

export {Manager}