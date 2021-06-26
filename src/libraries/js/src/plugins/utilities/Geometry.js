import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Geometry{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            type: {default: 'SphereGeometry', options: [
                'SphereGeometry',
                'PlaneGeometry', 
                // 'TetrahedronGeometry', 
                'TorusGeometry', 
                'BoxGeometry',
                'BufferGeometry'
            ]},
            radius: {default: 1},
            segments: {default: 32, min: 0, max:100, step: 1},
            count: {default: 100, min: 0, max: 10000, step:1.0},
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            geometry: null,
            state: new StateManager(),
            lastRendered: Date.now()
        }

        this.props.geometry = new THREE.SphereGeometry()

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this.props.geometry, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'Geometry',
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
        if (this.props.geometry){
            this.props.geometry.dispose()
        }
    }

    default = () => {
        // this.props.scene = scene
        switch(this.params.type){
            case 'SphereGeometry':
                this.props.geometry = new THREE.SphereGeometry( this.params.radius, this.params.segments, this.params.segments );
                break
            case 'PlaneGeometry':
                this.props.geometry = new THREE.PlaneGeometry(this.params.radius,this.params.radius,this.params.segments,this.params.segments);
                break
            // case 'TetrahedronGeometry':
            //     this.props.geometry = new THREE.TetrahedronGeometry(this.params.radius,this.params.segments);
            //     break
            case 'TorusGeometry':
                this.props.geometry = new THREE.TorusGeometry(this.params.radius);
                break
            case 'BoxGeometry':
                this.props.geometry = new THREE.BoxGeometry(this.params.radius,this.params.radius,this.params.radius);
                break
            case 'BufferGeometry':
                this.props.geometry = new THREE.BufferGeometry();
                const position = new Float32Array(this.params.count*3)
                position.forEach((e,i) => {position[i] = Math.random()})
                const mass = new Float32Array(this.params.count)
                mass.forEach((e,i) => {mass[i] = Math.random()})
                this.props.geometry.setAttribute('position', new THREE.BufferAttribute(position ,3))
                this.props.geometry.setAttribute('mass', new THREE.BufferAttribute(mass ,1))
                break
        }

        return [{data: this.props.geometry, meta: {label: this.label, params: this.params}}]
    }
}