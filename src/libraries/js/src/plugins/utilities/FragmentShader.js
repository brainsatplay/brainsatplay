import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class FragmentShader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            glsl: {default:''},
            uniforms: {default:{}}
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            uniforms: [],
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this.params.glsl, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'glsl',
                }
            },
            glsl: {
                types: {
                    in: 'glsl',
                    out: null,
                }
            }
        }
    }

    init = () => {
        this.session.graph.runSafe(this,'glsl',[{data:this.params.glsl}])
    }

    deinit = () => {}

    default = () => {
        return [{data: this.params.glsl, meta: {label: this.label, uniforms: this.params.uniforms}}]
    }

    glsl = (userData) => {
        let u = userData[0]
        this._setShaderProperties(u.data)

        this.session.graph.runSafe(this,'default',[{data:true}])
    }

    _setShaderProperties = (glsl) => {
        this.params.glsl = glsl
        
        // Get Uniforms
        var re = /uniform\s+([^\s]+)\s+([^;]+);/g;
        let result = [...glsl.matchAll(re)]
        this.props.uniforms = []
        result.forEach(a => {this.props.uniforms.push(a[2])})
    }
}