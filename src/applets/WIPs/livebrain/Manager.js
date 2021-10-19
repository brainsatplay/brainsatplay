import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph) {

        // Generic Plugin Attributes
        
        

        // UI Identifier
        this.props = {
            looping: false,
            container: document.createElement('div'),
            scene: null,
            camera: null,
            renderer: null,
            material: null,
            geometry: null,
            mesh: null,
            rotation: {
                x: -Math.PI/2,
                y: 0,
                z: Math.PI/2
            },

            brain: new THREE.Group(),

            markers: new Map()
        }

        // Port Definition
        this.ports = {
            // default: {
            //     output: {type: null}
            // },
            data: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {

                    let tags = []
                    let positions = []

                    // Add Markers
                    user.data.eeg.forEach(o => {
                        let marker = this.props.markers.get(o.tag)
                        if (marker == null) {
                            this._addMarker(o)
                        }
                        tags.push(o.tag)
                        console.log(o)
                        positions.push(...[o.position.x,o.position.y,o.position.z])
                    })

                    // Remove Unnecessary Markers
                    this.props.markers.forEach((o,k) => {
                        if (!tags.includes(k)){
                            this.props.brain.remove(this.props.markers.get(k))
                            this.props.markers.delete(k)
                        }
                    })

                    // this.ports.position.onUpdate({data: positions})
                    // this.ports.values.onUpdate({data: values})
                }
            }, 

            values: {
                data: [], // per channel
                input: {type: Array},
                output: {type: Array},
                onUpdate: (user) => {
                    console.log(user)
                    return user
                }
            }, 

            element: {
                data: this.props.container,
                input: {type: undefined},
                output: {type: Element},
            }, 

            resolution: {
                data: 1,
                min: 0,
                max: 1,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    let data = []
                    let model = this.props.originalModel || this.ports.model.data
                    let n = (model.length / 3)
                    let desiredCount = user.data * n
                    let used = [];

                    // Downsample
                    for (let i = 0; i < n - 1; i+=Math.floor((model.length/3)/desiredCount)) {
                        data.push(...model.slice(i*3,(i*3)+3))
                        used.push(i)
                    }

                    // Account for Remainder
                    let remainder = desiredCount - (data.length/3)
                    for (let i =0; i < Math.abs(remainder); i++) {
                        if (remainder > 0) data.push(...model.slice((used[i]+1)*3, ((used[i]+1)*3)+3)) // Add skipped
                        else if (remainder < 0) for (let i = 0; i < 3; i++) data.pop() // Remove extra
                    }

                    this._generateNewMesh({data})
                }
            }, 

            // Setup Model
            model: {
                data: [],
                input: {type: undefined},
                output: {type: Array},
                onUpdate: (user) => {
                    this.props.originalModel = [...user.data]
                    this._generateNewMesh(user)
                }
            }, 
        }
    }

    init = () => {

        // Setup Three.js Classes and Containers
        this.props.camera = new THREE.PerspectiveCamera()
        this.props.renderer = new THREE.WebGLRenderer( { antialias: true } )
        this.props.scene = new THREE.Scene()
        this.props.container.style = `width: 100%; height: 100%;`
        this.props.container.onresize = this.responsive
        
        // Setup Camera
        this.props.camera.fov = 75
        this.props.camera.aspect = this.props.container.offsetWidth / this.props.container.offsetHeight
        this.props.camera.near = 0.1
        this.props.camera.far = 1000
        this.props.camera.position.set( 0, 0, 200);

        // Setup Renderer
        this.props.renderer.autoClear = false;
        this.props.renderer.setPixelRatio( window.devicePixelRatio );
        this.props.renderer.setSize( this.props.container.offsetWidth, this.props.container.offsetHeight );
        this.props.container.appendChild( this.props.renderer.domElement );

        // Setup Model
        this.ports.model.onUpdate(this.ports.model)
        this.ports.resolution.onUpdate(this.ports.resolution)
        this.props.brain.rotation.set(this.props.rotation.x,this.props.rotation.y,this.props.rotation.z)
        this.props.scene.add(this.props.brain)

        // Setup Controls
        this.props.controls = new OrbitControls(this.props.camera, this.props.container);

        // Animate
        this.props.looping = true
        this._animate()
    }

    deinit = () => {
        this.props.looping = false
        this.props.scene.remove(this.props.brain)
        this.props.container.remove()
    }

    responsive = () => {
        this.props.camera.aspect = this.props.container.offsetWidth / this.props.container.offsetHeight;
        this.props.camera.updateProjectionMatrix();
        if (this.props.renderer) this.props.renderer.setSize( this.props.container.offsetWidth, this.props.container.offsetHeight );
    }

    // Create mesh
    _generateNewMesh = (user) => {
        this.props.scene.remove(this.props.mesh)
        this.props.geometry =  new THREE.BufferGeometry()
        this.props.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( user.data, 3 ) );
        this.props.material = new THREE.PointsMaterial({color: 'white', opacity: 0.3, transparent: true})
        this.props.mesh = new THREE.Points(this.props.geometry,this.props.material)
        this.props.brain.add(this.props.mesh)

    }

    // Add Marker
    _addMarker = (o) => {
        const geometry =  new THREE.SphereGeometry(2,32,32)
        const material = new THREE.MeshBasicMaterial({color: 'red'})
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(o.position.x, o.position.y, o.position.z)
        this.props.markers.set(o.tag, mesh)
        this.props.brain.add(mesh)
    }


    // Animation and Render Loop
    _animate = () => {
        this.props.renderer.setAnimationLoop( this._render );
    }

    _render = () => {
        if (this.props.looping){
            const time = performance.now()
            const delta = ( time - this.props.prevTime ) / 1000;

            this.props.controls.update() // update controls
            this.props.renderer.render( this.props.scene, this.props.camera ) // render scene

            this.props.prevTime = time;
        }
    }
}

export {Manager}