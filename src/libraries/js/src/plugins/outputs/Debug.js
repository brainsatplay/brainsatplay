export class Debug{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                types: {
                    in: undefined,
                    out: null
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {
        userData.forEach((u,i) => {
            console.log(u.username,u.data,u.meta,u)
            
        })
    }
}