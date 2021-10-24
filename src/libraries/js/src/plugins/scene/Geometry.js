import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class Geometry {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            geometry: null,
            state: new StateManager(),
            lastRendered: Date.now()
        }

        this.props.geometry = new THREE.SphereGeometry()

        this.ports = {
            default: {
                edit: false,
                data: this.props.geometry,
                input: {type: null},
                output: {type: Object, name: 'Geometry'},
                onUpdate: () => {

                    switch(this.ports.type.data){
                        case 'SphereGeometry':
                            this.props.geometry = new THREE.SphereGeometry( this.ports.radius.data, this.ports.segments.data, this.ports.segments.data );
                            break
                        case 'PlaneGeometry':
                            this.props.geometry = new THREE.PlaneGeometry(this.ports.radius.data,this.ports.radius.data,this.ports.segments.data,this.ports.segments.data);
                            break
                        // case 'TetrahedronGeometry':
                        //     this.props.geometry = new THREE.TetrahedronGeometry(this.ports.radius,this.ports.segments);
                        //     break
                        case 'TorusGeometry':
                            this.props.geometry = new THREE.TorusGeometry(this.ports.radius.data);
                            break
                        case 'BoxGeometry':
                            this.props.geometry = new THREE.BoxGeometry(this.ports.radius.data,this.ports.radius.data,this.ports.radius.data);
                            break
                        case 'BufferGeometry':
                            if (!(this.props.geometry instanceof THREE.BufferGeometry)){
                                console.error('BUFFER GEOMETRIES MUST BE MADE OUTSIDE')
                            }
                            break
                    }
            
                    return {data: this.props.geometry}
                }
            },

            type: {data: 'SphereGeometry', options: [
                'SphereGeometry',
                'PlaneGeometry', 
                // 'TetrahedronGeometry', 
                'TorusGeometry', 
                'BoxGeometry',
                'BufferGeometry'
            ]},
            radius: {data: 1},
            segments: {data: 32, min: 0, max:100, step: 1},
            count: {data: 100, min: 0, max: 10000, step:1.0},

            // Set Vertices Directly
            attributes: {
                input: {type: undefined},
                output: {type: Object},
                onUpdate: (user) => {
                    this._regenerate(user)
                    return user
                }
            }, 

            // Downsample Vertices
            resolution: {
                data: 1,
                min: 0,
                max: 1,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    let buffer = []
                    let model = this.props.originalModel || this.ports.model.data
                    let n = (model.length / 3)
                    let desiredCount = user.data * n
                    let used = [];

                    // Downsample
                    for (let i = 0; i < n - 1; i+=Math.floor((model.length/3)/desiredCount)) {
                        buffer.push(...model.slice(i*3,(i*3)+3))
                        used.push(i)
                    }

                    // Account for Remainder
                    let remainder = desiredCount - (buffer.length/3)
                    for (let i =0; i < Math.abs(remainder); i++) {
                        if (remainder > 0) buffer.push(...model.slice((used[i]+1)*3, ((used[i]+1)*3)+3)) // Add skipped
                        else if (remainder < 0) for (let i = 0; i < 3; i++) buffer.pop() // Remove extra
                    }

                    let attributes = this.ports.attributes.value
                    if (attributes) {
                        attributes['position'].buffer = buffer
                       this.update('attributes', attributes)
                    }
                }
            }, 

        }
    }

    init = () => {
        // Subscribe to Changes in Parameters
        this.update('default',{forceUpdate: true})

        this.props.state.addToState('params', this.ports, () => {
            this.props.lastRendered = Date.now()
            this.update('default',{forceUpdate: true})
        })
    }

    deinit = () => {
        if (this.props.geometry){
            this.props.geometry.dispose()
        }
    }
    
    _regenerate = (user) => {
        this.props.geometry = new THREE.BufferGeometry()
        for (let attribute in user.value){
            let info = user.value[attribute]
            this.props.geometry.setAttribute(attribute, new THREE.Float32BufferAttribute( info.buffer, info.size ) );
            if (attribute === 'position') this.props.originalModel = [...info.buffer]
        }
    }

}