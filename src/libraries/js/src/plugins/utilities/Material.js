import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Material{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'MeshPhongMaterial', options: [
                'MeshPhongMaterial',
                'ShaderMaterial'
            ]},
            color: {default: '#ffffff'},
            transparent: {default: false}
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            material: null,
            state: new StateManager(),
            lastRendered: Date.now()
        }

        this.props.material = new THREE.MeshPhongMaterial()

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
                this.session.graph.runSafe(this,'default',[{data:true}])
        })
        
        this.session.graph.runSafe(this,'default',[{data:true}])

    }

    deinit = () => {
        if (this.props.material){
            this.props.material.dispose()
        }
    }

    default = () => {
        // this.props.scene = scene
        switch(this.params.type){
            case 'MeshPhongMaterial':
                this.props.material = new THREE.MeshPhongMaterial( {color: this.params.color} );
                break
            case 'ShaderMaterial':
                this.props.material = new THREE.ShaderMaterial({
                    vertexShader: this.props.vertexShader,
                    fragmentShader: this.props.fragmentShader,
                    uniforms: {iTime: {value: 0}, iResolution: {value: new THREE.Vector2(1,1)}}
                });
                this.props.material.uniformsNeedUpdate = true
                break
        }

        this.props.material.side = THREE.DoubleSide
        this.props.material.transparent = this.params.transparent
        

        return [{data: this.props.material, meta: {label: this.label, params: this.params}}]
    }

    fragment = (userData) => {
        this.params.type = 'ShaderMaterial'
        this.props.fragmentShader = userData[0].data
    }

    vertex = (userData) => {
        this.props.vertexShader = userData[0].data

    }

    _toggleShaderMaterial = () => {
        if (this.props.vertexShader && this.props.fragmentShader) this.params.type = 'ShaderMaterial'
        else this.params.type = 'MeshPhongMaterial'
    }

    _hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : [0,0,0];
    }
}