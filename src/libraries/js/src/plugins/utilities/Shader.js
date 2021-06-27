export class Shader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
        }

        this.ports = {
            default: {
                default: this.params.glsl ?? '', 
                meta: {label: this.label, uniforms: this.params.uniforms},
                input: {type: null},
                output: {type: 'glsl'},
                onUpdate: () => {
                    return [{data: this.params.glsl, meta: {label: this.label, uniforms: this.params.uniforms}}]
                }
            },
            set: {
                input: {type: 'glsl'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    this.params.glsl = u.data
                    this._setDynamicPorts(this.params.glsl)
                    this.session.graph.runSafe(this,'default',[{data:true}])
                }
            }
        }
    }

    init = () => {
        this.session.graph.runSafe(this,'set',[{data:this.params.glsl}])
    }

    deinit = () => {}

    _setDynamicPorts = (glsl) => {

        // Get Uniforms
        var re = /uniform\s+([^\s]+)\s+([^;]+);/g;
        let result = [...glsl.matchAll(re)]
        this.props.uniforms = []

        result.forEach(a => {
            let name = a[2]
            let type = a[1]

            // Set Port
            this.ports[name] = {
                input: {type},
                default: this.params.uniforms[name]?.value,
                output: {type},
                onUpdate: (userData) => {
                    this.params.uniforms[name].value = userData[0].data
                    return [{data: this.ports[name].output.value, meta: {label: `${this.label}_${name}`}}]
                }
            }

            // Set Param
            this.params[name] = this.params.uniforms[name]?.value
        })
    }
}