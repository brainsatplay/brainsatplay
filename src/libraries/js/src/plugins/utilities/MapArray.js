export class MapArray{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        

        this.ports = {
            default: {
                edit: false,
                input: {type: Array},
                output: {type: Array},
                onUpdate: (user) => {
                    user.data = user.data.map(this.ports.function.data)
                    return user
                }
            },

            function: {
                data: (o)=>{return o},
                input: {type: Function},
                output: {type: null},
            }
        }
    }

    init = () => {}

    deinit = () => {}
}