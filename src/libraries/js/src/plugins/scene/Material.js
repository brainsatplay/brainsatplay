import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Material{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'MeshStandardMaterial', options: [
                'MeshStandardMaterial',
                'ShaderMaterial'
            ]},
            color: {default: '#ffffff'},
            transparent: {default: false},
            wireframe: {default: false},
            depthWrite: {default: false},
            alphaTest: {default: 0, min: 0, max: 1, step: 0.01},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            material: null,
            state: new StateManager(),
            lastRendered: Date.now(),
            uniforms: {}
        }
        
        this.props.material = new THREE.MeshStandardMaterial({color: this.paramOptions.color.default});

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this.props.material, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'Material',
                }
            },
            fragment: {
                types: {
                    in: 'glsl',
                    out: null
                }
            },
            vertex: {
                types: {
                    in: 'glsl',
                    out: null
                }
            }
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

    default = () => {

        switch(this.params.type){
            case 'MeshStandardMaterial':
                this.props.material = new THREE.MeshStandardMaterial( {color: this.params.color} );
                break
            case 'ShaderMaterial':
                this.props.material = new THREE.ShaderMaterial({
                    vertexShader: this.props.vertexShader,
                    fragmentShader: this.props.fragmentShader,
                    uniforms: this.props.uniforms
                });
                break
        }

        this.props.material.side = THREE.DoubleSide
        this.props.material.transparent = this.params.transparent
        this.props.material.wireframe = this.params.wireframe
        this.props.material.depthWrite = this.params.depthWrite
        this.props.material.alphaTest = this.params.alphaTest

        return [{data: this.props.material, meta: {label: this.label, params: this.params}}]
    }

    fragment = (userData) => {
        this.props.fragmentShader = userData[0].data
        this._updateUniforms(userData[0].meta.uniforms)
        this._passShaderMaterial()
    }

    vertex = (userData) => {
        this.props.vertexShader = userData[0].data
        this._updateUniforms(userData[0].meta.uniforms)
        this._passShaderMaterial()
    }

    _updateUniforms = (uniforms) => {
        if (uniforms) this.props.uniforms = Object.assign(this.props.uniforms, uniforms)
    }

    _passShaderMaterial = () => {
        if (this.props.vertexShader && this.props.fragmentShader) {
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