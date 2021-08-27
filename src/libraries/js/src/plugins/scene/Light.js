import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Light{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            x: {default: -1, min: -10, max:10, step: 0.01},
            y: {default: 1.5, min: -10, max:10, step: 0.01},
            z: {default: -1.5, min: -10, max:10, step: 0.01},
            color: {default: '#ffffff'},
            intensity: {default: 1, min: 0, max:10, step: 0.01},
            distance: {default: 100, min: 0, max:1000, step: 0.01},
            decay: {default: 1, min: 0, max:10, step: 0.01},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            mesh: null,
            state: new StateManager(),
            lastRendered: Date.now()
        }

        this.props.mesh = new THREE.AmbientLight( 0xFFFFFF ); //new THREE.DirectionalLight();

        this.ports = {
            add: {
                edit: false,
                default: this.props.mesh,
                input: {type: null},
                output: {type: Object, name: 'Mesh'},
                onUpdate: () => {
                    if (this.props.mesh == null){
                        this.props.mesh = new THREE.AmbientLight( this.params.color );
                        this.props.mesh.target.position.set( 0, 0, - 2 );
                    }
                    this.props.mesh.position.set( this.params.x, this.params.y, this.params.z );
                    return {data: this.props.mesh, meta: {params: this.params}}
                }
            },
            radius: {
                input: {type: 'number'},
                output: {type: null},
            },
            dx: {
                input: {type: 'number'},
                output: {type: null},
            },
            dy: {
                input: {type: 'number'},
                output: {type: null},
            },
            color: {
                input: {type: 'color'},
                output: {type: null},
            },
        }

    }

    init = () => {

        // Subscribe to Changes in Parameters
        this.props.state.addToState('params', this.params, () => {
            if (Date.now() - this.props.lastRendered > 500){
                this.props.lastRendered = Date.now()
            }
        })

    }

    deinit = () => {
        if (this.props.mesh){
            // if (this.props.mesh.type === 'Mesh') {
            //     this.props.mesh.geometry.dispose();
            //     this.props.mesh.material.dispose();
            // }
            // this.props.scene.remove(this.mesh);
        }
    }
    
    radius = (user) => {
        this.params.radius = Math.abs(Number.parseFloat(user.data))
    }

    dx = (user) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(user.data)
        if (desiredX > 0){
            this.params.x = desiredX
        }
    }

    dy = (user) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(user.data)
        if (desiredY > 0){
            this.params.y = desiredY
        }
    }

    color = (user) => {
        this.params.color = user.data
    }
}