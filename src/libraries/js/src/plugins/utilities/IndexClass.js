export class Index{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                input: {type: 'array'},
                output: {type: 'number'},
                onUpdate: (userData) => {
                    let u = userData[0]
                    let idx;
                    if (this.params.method == 'last') idx = u.data.length - 1
                    return [{data: u.data[idx]}]
                }
            },
            method: {
                default: 'last',
                input: {type: 'string'},
                output: {type: null},
                options: ['last'],
                onUpdate: (userData) => {
                    let u = userData[0]
                    if (this.ports.method.options.includes(u.data)) this.params.method = u.data
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}