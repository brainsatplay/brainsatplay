import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Object3D{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'Mesh', options: ['Mesh', 'Points']},
            scalex: {default: 1},
            scaley: {default: 1},
            scalez: {default: 1},
            x: {default: 0},
            y: {default: 1},
            z: {default: -2},
            rotatex: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            rotatey: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            rotatez: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            count: {default: 100, min: 0, max: 10000, step:1.0},
            interactable: {default: false},
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

        this._setObject()

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

                this.props.mesh.interactable = this.params.interactable

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
        this._setObject()
        this.props.mesh.scale.set(this.params.scalex, this.params.scaley,this.params.scalez)
        this.props.mesh.position.set(this.params.x, this.params.y, this.params.z)
        if (this.props.mesh.material?.uniforms?.iResolution != null) this.props.mesh.material.uniforms.iResolution.value = new THREE.Vector2(1, 1);
        this.props.mesh.rotateX(this.params.rotatex)
        this.props.mesh.rotateY(this.params.rotatey)
        this.props.mesh.rotateZ(this.params.rotatez)

        return [{data: this.props.mesh, meta: {label: this.label}}]
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


    // Macros
    _setObject = () => {
        if (this.params.type === 'Mesh'){
            this._createMesh()
        } else if (this.params.type === 'Points'){
            this._createPoints()
        }
    }


    _createMesh = () => {
        if (this.props.material == null) this.props.material = new THREE.MeshPhongMaterial()
        if (this.props.geometry == null) this.props.geometry = new THREE.SphereGeometry()
        this.props.mesh = new THREE.Mesh( this.props.geometry, this.props.material )
    }

    _createPoints = () => {
        if (this.props.material == null) this.props.material = new THREE.PointsMaterial()
        if (this.props.geometry == null) this.props.geometry = new THREE.BufferGeometry()
        const position = new Float32Array(this.params.count*3)
        position.forEach((e,i) => {position[i] = Math.random()})
        const mass = new Float32Array(this.params.count)
        mass.forEach((e,i) => {mass[i] = Math.random()})
        this.props.geometry.setAttribute('position', new THREE.BufferAttribute(position ,3))
        this.props.geometry.setAttribute('mass', new THREE.BufferAttribute(mass ,1))
        this.props.mesh = new THREE.Points( this.props.geometry, this.props.material )
    }
}