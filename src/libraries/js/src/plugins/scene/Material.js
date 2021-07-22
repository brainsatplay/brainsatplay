import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'
import vertexShader from './shader/vertex.glsl'
import blankFragment from './shader/blankFragment.glsl'

export class Material{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            material: null,
            state: new StateManager(),
            lastRendered: Date.now(),
            uniforms: {},
            defaultColor: '#ffffff'
        }
        
        this.props.material = new THREE.MeshStandardMaterial({color: this.props.defaultColor});

        this.ports = {
            default: {
                edit: false,
                default: this.props.material,
                input: {type: null},
                output: {type: Object, name: 'Material'},
                onUpdate: () => {
                    switch(this.params.type){
                        case 'MeshStandardMaterial':
                            this.props.material = new THREE.MeshStandardMaterial( {color: this.params.color} );
                            break
                        case 'ShaderMaterial':

                            this._replaceUniformsWithThreeObjects(this.props.uniforms) // Conduct on original object

                            this.props.material = new THREE.ShaderMaterial({
                                vertexShader: this.params.vertexShader,
                                fragmentShader: this.params.fragmentShader,
                                uniforms: this.props.uniforms
                            });
                            break
                    }
            
                    this.props.material.side = THREE.DoubleSide
                    this.props.material.transparent = this.params.transparent
                    this.props.material.wireframe = this.params.wireframe
                    this.props.material.depthWrite = this.params.depthWrite
                    this.props.material.alphaTest = this.params.alphaTest
            
                    return [{data: this.props.material}]
                }
            },
            type: {
                default: 'MeshStandardMaterial', 
                options: [
                    'MeshStandardMaterial',
                    'ShaderMaterial'
                ],
                input: {type: 'string'}, 
                output: {type: null}
            },
            fragmentShader: {
                default: blankFragment,
                input: {type: 'GLSL'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.fragmentShader = userData[0].data
                    this._updateUniforms(userData[0].meta.uniforms)
                    this._passShaderMaterial()
                }
            },
            vertexShader: {
                default: vertexShader,
                input: {type: 'GLSL'},
                output: {type: null},
                onUpdate: (userData) => {
                        this.params.vertexShader = userData[0].data
                        this._updateUniforms(userData[0].meta.uniforms)
                        this._passShaderMaterial()
                }
            },
            color: {default: this.props.defaultColor, input: {type: 'color'}, output: {type: null}},
            transparent: {default: false, input: {type: 'boolean'}, output: {type: null}},
            wireframe: {default: false, input: {type: 'boolean'}, output: {type: null}},
            depthWrite: {default: false, input: {type: 'boolean'}, output: {type: null}},
            alphaTest: {default: 0, min: 0, max: 1, step: 0.01, input: {type: 'number'}, output: {type: null}},
        }
    }

    init = () => {

        // Subscribe to Changes in Parameters
        this.props.state.addToState('params', this.params, () => {
                this.props.lastRendered = Date.now()
                this.session.graph.runSafe(this,'default',[{forceRun: true, forceUpdate: true}])
        })
        
        this._passShaderMaterial()
    }

    deinit = () => {
        if (this.props.material){
            this.props.material.dispose()
        }
    }


    _updateUniforms = (uniforms) => {
        if (typeof uniforms === 'object'){
            this._filterMisformattedUniforms(uniforms) // Conduct on original object
            this.props.uniforms = Object.assign(this.props.uniforms, uniforms) // Deep copy to keep params and props separate
            this._replaceUniformsWithThreeObjects(this.props.uniforms)
        }
    }

    _filterMisformattedUniforms = (uniforms) => {
        for (let key in uniforms){
            // console.log(uniforms[key])
            // Remove Misformatted Uniforms
            if (typeof uniforms[key] !== 'object' || !('value' in uniforms[key])) delete uniforms[key]
        }
    }

    _replaceUniformsWithThreeObjects = (uniforms) => {
        for (let key in uniforms){
            let value = uniforms[key].value

            // Remove Misformatted Uniforms
            if (typeof uniforms[key] === 'object' && !('value' in uniforms[key])) delete uniforms[key]
           
            // Try Making Colors from Strings
            else if (typeof value === 'string') uniforms[key].value = new THREE.Color(value)
            
            // Make Vectors from Properly Formatted Objects
            else if (typeof value === 'object' && 'x' in value && 'y' in value) uniforms[key].value = new THREE.Vector2(value.x, value.y)
        }

    }

    _passShaderMaterial = () => {
        if (this.params.vertexShader && this.params.fragmentShader) {
            this.params.type = 'ShaderMaterial'
            this.session.graph.runSafe(this,'default',[{forceRun: true, forceUpdate: true}])
        }
        else this.params.type = 'MeshStandardMaterial'
    }

    _hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : [0,0,0];
    }
}