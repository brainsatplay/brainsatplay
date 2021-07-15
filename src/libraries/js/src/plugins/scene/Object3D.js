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
                default: this.props.mesh,
                input: {type: null},
                output: {type: Object, name: 'Mesh'},
                onUpdate: () => {
                    this._setObject()
                    this._updateProps()
                    return [{data: this.props.mesh}]
                }
            },
            material: {
                input: {type: Object, name: 'Material'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    this.props.material = u.data
                    if (this.props.mesh){
                        this.props.mesh.material.dispose()
                        this.props.mesh.material = this.props.material
                    }
                }
            },
            geometry: {
                input: {type: Object, name: 'Geometry'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    this.props.geometry = u.data
                    if (this.props.mesh){
                        this.props.mesh.geometry.dispose()
                        this.props.mesh.geometry = this.props.geometry
                    }
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
            this._updateProps()

            // Replace Mesh if Necessary
            if (this.props.prevType != this.params.type) {
                this.session.graph.runSafe(this,'add',[{forceRun: true, forceUpdate: true}])
                this.props.prevType = this.params.type
            }
        })

        this.session.graph.runSafe(this,'add',[{forceRun: true, forceUpdate: true}])
        this.props.prevType = this.params.type

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
        }
        this.props.looping = false
    }

    _updateProps = () => {
        this.props.mesh.scale.set(this.params.scalex, this.params.scaley,this.params.scalez)
        this.props.mesh.position.set(this.params.x, this.params.y, this.params.z)
        if (this.props.mesh.material?.uniforms?.iResolution != null) this.props.mesh.material.uniforms.iResolution.value = new THREE.Vector2(1, 1);
        this.props.mesh.rotateX(this.params.rotatex)
        this.props.mesh.rotateY(this.params.rotatey)
        this.props.mesh.rotateZ(this.params.rotatez)
        this.props.mesh.name = `${this.label}`
    }

    scale = (userData) => {
        this.params.scalex = this.params.scaley = this.params.scalez = Math.abs(Number.parseFloat(userData[0].data))
    }

    dx = (userData) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        if (desiredX > 0){
            this.params.x = desiredX
        }
    }

    dy = (userData) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        if (desiredY > 0){
            this.params.y = desiredY
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
        this.props.mesh = new THREE.Points( this.props.geometry, this.props.material )
    }
}