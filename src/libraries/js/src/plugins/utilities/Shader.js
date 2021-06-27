export class Shader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            uniforms: {}
        }

        this.ports = {
            default: {
                default: this.params.glsl ?? '', 
                meta: {label: this.label, uniforms: this.props.uniforms},
                input: {type: null},
                output: {type: 'glsl'},
                onUpdate: () => {
                    return [{data: this.params.glsl, meta: {label: this.label, uniforms: this.props.uniforms}}]
                }
            },
            set: {
                input: {type: 'glsl'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    if (typeof u.data === 'string'){
                        this.params.glsl = u.data
                        this._setDynamicPorts(this.params.glsl)
                        this.session.graph.runSafe(this,'default',[{data:true}])
                    }
                }
            }
        }
    }

    init = () => {
        if (this.params.uniforms) this.props.uniforms = this.params.uniforms
        delete this.params.uniforms
        this.session.graph.runSafe(this,'set',[{data:this.params.glsl}])
    }

    deinit = () => {}

    _setDynamicPorts = (glsl) => {
        // Get Uniforms
        var re = /uniform\s+([^\s]+)\s+([^;]+);/g;
        let result = [...glsl.matchAll(re)]

        result.forEach((match) => {
            this._setPort(match)
        })
    }

    _setPort = (match) => {
        let name = match[2]
        let type = match[1]

        // Set Port
        this.ports[name] = {
            input: {type},
            default: this.props.uniforms[name]?.value,
            output: {type},
            onUpdate: (userData) => {
                this.props.uniforms[name].value = userData[0].data
                return [{data: this.ports[name].output.value, meta: {label: `${this.label}_${name}`}}]
            }
        }

        // Set Param
        this.params[name] = this.props.uniforms[name]?.value
    }
}