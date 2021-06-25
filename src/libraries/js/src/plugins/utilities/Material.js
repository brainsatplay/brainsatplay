import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Material{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'MeshPhongMaterial', options: ['MeshPhongMaterial']},
            color: {default: '#ffffff'},
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
        if (this.params.type === 'MeshPhongMaterial'){
            this.props.material = new THREE.MeshPhongMaterial( {color: this.params.color, side: THREE.DoubleSide} );
        } else {
            this.props.material = new THREE.MeshPhongMaterial( {color: this.params.color, side: THREE.DoubleSide} );
        }

        return [{data: this.props.material, meta: {label: this.label, params: this.params}}]
    }

    _hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : [0,0,0];
    }
}