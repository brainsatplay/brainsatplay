import fragmentShader from './fragment.glsl'

export class Shader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            uniforms: {}
        }

        this.ports = {
            default: {
                data: fragmentShader, 
                meta: {label: this.label, uniforms: this.props.uniforms},
                input: {type: 'GLSL'},
                output: {type: 'GLSL'},
                onUpdate: (user) => {
                    if (typeof user.data === 'string'){
                        this.ports.default.data = user.data
                        this._setDynamicPorts(this.ports.default.data)
                        return {data: this.ports.default.data, meta: {label: this.label, uniforms: this.props.uniforms}}
                    }
                }
            },
            uniforms: {}
        }
    }

    init = () => {
        if (this.ports.uniforms.data && typeof this.ports.uniforms.data === 'object') Object.assign(this.props.uniforms, this.ports.uniforms.data)
        this.session.graph.runSafe(this,'default',{data:this.ports.default.data, forceUpdate: true})
    }

    deinit = () => {}

    _setDynamicPorts = (glsl) => {
        // Get Uniforms
        var re = /uniform\s+([^\s]+)\s+([^;]+);/g;
        let result = [...glsl.matchAll(re)]

        result.forEach((match) => {
            // remove square brackets for arrays
            this._setPort(match)
        })
    }

    _setPort = (match) => {
        let nameArr = match[2].split('[')
        let typeArr = match[1].split('[')
        let name = match[2].split('[')[0]
        let type = (typeArr.length + nameArr.length > 2) ? Array : typeArr[0]

        // Set Uniform
        if (this.props.uniforms[name] == null) this.props.uniforms[name] = {value: 0}

        // Set Port
        this.session.graph.addPort(this,name, {
            input: {type},
            data: this.props.uniforms[name].value,
            output: {type: null},
            onUpdate: (user) => {
                if (!isNaN(user.data) || Array.isArray(user.data)) {
                    if (Array.isArray(user.data)) this.props.uniforms[name].value = user.data.flat(2)
                    else this.props.uniforms[name].value = user.data // Passed by reference at the beginning
                }
            }
        })
    }
}