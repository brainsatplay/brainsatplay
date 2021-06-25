import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class VertexShader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {}

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            vertex: `
varying vec2 vUv;

void main()
{

    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}`,
}

        this.ports = {
            default: {
                defaults: {
                    output: [{data: this.props.vertex, meta: {label: this.label}}]
                },
                types: {
                    in: null,
                    out: 'glsl',
                }
            }
        }

    }

    init = () => {


        // Subscribe to Changes in Parameters
        // this.props.state.addToState('params', this.params, () => {
        //         this.props.lastRendered = Date.now()
        //         this.session.graph.runSafe(this,'default',[{data:true}])
        // })
        
        this.session.graph.runSafe(this,'default',[{data:true}])

    }

    deinit = () => {}

    default = () => {
        return [{data: this.props.vertex, meta: {label: this.label, params: this.params}}]
    }
}