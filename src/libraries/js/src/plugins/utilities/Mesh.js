import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Mesh{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            scale: {default: 1},
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
            lastRendered: Date.now(),
            tStart: Date.now(),
            looping: false
        }

        this.props.geometry = new THREE.SphereGeometry()
        this.props.material = new THREE.MeshPhongMaterial(),
        this.props.mesh = new THREE.Mesh( this.props.geometry, this.props.material ),

        this.ports = {
            add: {
                defaults: {
                    output: [{data: this.props.mesh, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'Mesh',
                }
            },
            material: {
                types: {
                    in: 'Material',
                    out: null,
                }
            },
            geometry: {
                types: {
                    in: 'Geometry',
                    out: null,
                }
            },
            scale: {
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
        }

    }

    init = () => {

        this.props.looping = true
        // Subscribe to Changes in Parameters
        this.props.state.addToState('params', this.params, () => {
            if (Date.now() - this.props.lastRendered > 500){
                this.session.graph.runSafe(this,'add',[{data:true}])
                this.props.lastRendered = Date.now()
            }
        })
        this.session.graph.runSafe(this,'add',[{data:true}])

        let animate = () => {
            if (this.props.looping){
                let tElapsed = (Date.now() - this.props.tStart)/1000; 

                // Set Defaults
                if (this.props.mesh.material.uniforms){
                    if (this.props.mesh.material.uniforms.iTime == null) this.props.mesh.material.uniforms.iTime = {value: tElapsed}
                    if (this.props.mesh.material.uniforms.iResolution == null) this.props.mesh.material.uniforms.iResolution = {value: new THREE.Vector2(1, 1)}

                    // Update Defaults
                    this.props.mesh.material.uniforms.iTime.value = tElapsed
                }
                setTimeout(() => {animate()},1000/60)
            }
        }
        animate()

    }

    deinit = () => {
        if (this.props.mesh){
            if (this.props.mesh.type === 'Mesh') {
                this.props.mesh.geometry.dispose();
                this.props.mesh.material.dispose();
            }
            // this.props.scene.remove(this.props.mesh);
        }
        this.props.looping = false
    }

    material = (userData) => {
        let u = userData[0]
        this.props.material = u.data
        if (this.props.mesh){
            this.props.mesh.material.dispose()
            this.props.mesh.material = this.props.material
            // this.session.graph.runSafe(this,'add',[{data:true}])
        }
    }

    geometry = (userData) => {
        let u = userData[0]
        this.props.geometry = u.data
        if (this.props.mesh){
            this.props.mesh.geometry.dispose()
            this.props.mesh.geometry = this.props.geometry
            // this.session.graph.runSafe(this,'add',[{data:true}])
        }
    }

    add = () => {
        // this.props.scene = scene
        if (this.props.mesh == null) this.props.mesh = new THREE.Mesh( this.props.geometry, this.props.material );
        this.props.mesh.scale.set(this.params.scale, this.params.scale,this.params.scale)
        this.props.mesh.position.set(this.params.x, this.params.y, this.params.z)
        if (this.props.mesh.material?.uniforms?.iResolution != null) this.props.mesh.material.uniforms.iResolution.value = new THREE.Vector2(1, 1);

        return [{data: this.props.mesh, meta: {label: this.label, params: this.params}}]
    }

    scale = (userData) => {
        this.params.scale = Math.abs(Number.parseFloat(userData[0].data))
        this.session.graph.runSafe(this,'add',[{data:true}])
    }

    dx = (userData) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        if (desiredX > 0){
            this.params.x = desiredX
            this.session.graph.runSafe(this,'add',[{data:true}])
        }
    }

    dy = (userData) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        if (desiredY > 0){
            this.params.y = desiredY
            this.session.graph.runSafe(this,'add',[{data:true}])
        }
    }
}