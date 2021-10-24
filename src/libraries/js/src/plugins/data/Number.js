

export class Number {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {

        this.ports = {
            default: {
                data: 5,
                input: {type: 'number'},
                output: {type: 'number'}
            }
        }
    }

    init = () => {
        // this.update( 'default',{data: this.ports.default.data, forceUpdate: true})
    }

    deinit = () => {}
}