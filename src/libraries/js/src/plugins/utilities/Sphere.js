import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Sphere{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            radius: {default: 1},
            x: {default: 0},
            y: {default: 1},
            z: {default: -2},
            segments: {default: 32, min: 0, max:100, step: 1},
            color: {default: '#ffffff'},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            geometry: null,
            material: null,
            mesh: null,
            state: new StateManager(),
            lastRendered: Date.now()
        }

        this.ports = {
            draw: {
                defaults: {
                    output: [{data: this._sphereFunction, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'function',
                }
            },
            radius: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dx: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dy: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            color: {
                types: {
                    in: 'color',
                    out: null,
                }
            },
        }

    }

    init = () => {

        
        // Subscribe to Changes in Parameters
        this.props.state.addToState('params', this.params, () => {
            if (Date.now() - this.props.lastRendered > 500){
                this.session.graph.runSafe(this,'draw',[{data:true}])
                this.props.lastRendered = Date.now()
            }
        })

    }

    deinit = () => {
        if (this.props.mesh){
            if (this.props.mesh.type === 'Mesh') {
                this.props.mesh.geometry.dispose();
                this.props.mesh.material.dispose();
            }
            this.props.scene.remove(this.props.mesh);
        }
    }

    draw = () => {
        return [{data: this._sphereFunction, meta: {label: this.label, params: this.params}}]
    }
    
    radius = (userData) => {
        this.params.radius = Math.abs(Number.parseFloat(userData[0].data))
        // this.session.graph.runSafe(this,'default',[{data:true}])
    }

    dx = (userData) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        if (desiredX > 0){
            this.params.x = desiredX
            // this.session.graph.runSafe(this,'default',[{data:true}])
        }
    }

    dy = (userData) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        if (desiredY > 0){
            this.params.y = desiredY
            // this.session.graph.runSafe(this,'default',[{data:true}])
        }
    }

    color = (userData) => {
        this.params.color = userData[0].data
        // this.session.graph.runSafe(this,'default',[{data:true}])
    }

    _sphereFunction = (scene) => {
        this.deinit()
        this.props.scene = scene
        this.props.geometry = new THREE.SphereGeometry( this.params.radius, this.params.segments, this.params.segments );
        this.props.material = new THREE.MeshPhongMaterial({color:this.params.color});
        this.props.mesh = new THREE.Mesh( this.props.geometry, this.props.material );
        this.props.mesh.name = `${this.props.id}sphere`
        this.props.mesh.position.set(this.params.x,this.params.y,this.params.z);
        this.props.scene.add( this.props.mesh );
        // } else {
        //     console.log('updating')
        //     this.mesh.geometry.radius.value = this.params.radius
        //     this.mesh.geometry.widthSegments.value = this.params.segments
        //     this.mesh.geometry.heightSegments.value = this.params.segments
        //     this.mesh.material.color.value = this.params.color
        // }
    }
}