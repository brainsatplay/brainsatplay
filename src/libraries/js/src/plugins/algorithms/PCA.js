import {eegmath} from '../../utils/eegmath'

export class PCA{

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            data: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    user.forEach((u,i) => {
                        console.log(u.username,u.data,u.meta,u, eegmath)
                        let components = eegmath.pca(u.data) // Get Principal Components
                        u.data = components[this.params.numComponenents]
                    })
                    return user
                }
            },
            numComponenents: {
                default: 5,
                input: {type: 'number'},
                output: {type: undefined},
                onUpdate: (user) => {
                    this.params.numComponents = user.data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}