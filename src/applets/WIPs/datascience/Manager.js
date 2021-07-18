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
        let data1 = Array.from({length: 100}, e => Math.random())
        let data2 = Array.from({length: 100}, e => Math.random())
        let components = eegmath.fastpca2d(data1,data2)
        // let components = eegmath.pca(data)
        console.log(components)
    }

    deinit = () => {}
}

export {Manager}