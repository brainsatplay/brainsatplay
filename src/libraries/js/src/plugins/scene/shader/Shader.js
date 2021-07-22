import fragmentShader from './fragment.glsl'

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
                default: fragmentShader, 
                meta: {label: this.label, uniforms: this.props.uniforms},
                input: {type: 'GLSL'},
                output: {type: 'GLSL'},
                onUpdate: (userData) => {
                    let u = userData[0]
                    if (typeof u.data === 'string'){
                        this.params.default = u.data
                        this._setDynamicPorts(this.params.default)
                        return [{data: this.params.default, meta: {label: this.label, uniforms: this.props.uniforms}}]
                    }
                }
            }
        }
    }

    init = () => {
        if (this.params.uniforms && typeof this.params.uniforms === 'object') {
            this.props.uniforms = this.params.uniforms // JSON.parse(JSON.stringify(this.params.uniforms))
        }
        this.session.graph.runSafe(this,'default',[{data:this.params.default, forceUpdate: true}])
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
        
        // Set Uniform
        if (this.props.uniforms[name] == null) this.props.uniforms[name] = {value: 0}
        // Set Param
        this.params[name] = this.props.uniforms[name].value

        // Set Port
        this.session.graph.addPort(this,name, {
            input: {type},
            default: this.props.uniforms[name].value,
            output: {type: null},
            onUpdate: (userData) => {
                let u = userData[0]
                if (!isNaN(u.data)) {
                    this.props.uniforms[name].value = u.data // Passed by reference at the beginning
                }
            }
        })
    }
}