import {Math2} from '../../utils/mathUtils/Math2'
import {Plugin} from '../Plugin'

export class PCA extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(label, session, params={}) {
        super(label, session)
        this.label = label
        this.session = session
        

        this.ports = {
            data: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    user.forEach((u,i) => {
                        console.log(u.username,u.data,u.meta,u, Math2)
                        let components = Math2.pca(u.data) // Get Principal Components
                        u.data = components[this.ports.numComponenents.data]
                    })
                    return user
                }
            },
            numComponenents: {
                data: 5,
                input: {type: 'number'},
                output: {type: undefined},
                onUpdate: (user) => {
                    this.ports.numComponents.data = user.data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}