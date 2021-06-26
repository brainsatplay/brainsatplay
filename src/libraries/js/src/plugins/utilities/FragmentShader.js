import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class FragmentShader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            glsl: {default:''}
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
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
        return [{data: this.params.glsl, meta: {label: this.label, params: this.params}}]
    }
}