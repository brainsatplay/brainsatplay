import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class FragmentShader{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {}

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            fragment: `
#define HISTORY 5
#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
varying vec2 vTextureCoord;
varying vec2 resolution;
uniform vec2 iResolution;
uniform float iTime;
uniform float iHEG;
uniform float iHRV;
uniform float iHR;
uniform float iHB;
uniform float iFrontalAlpha1Coherence;
uniform float iFFT[FFTLENGTH];
uniform float iAudio[FFTLENGTH];

//Inspired by JoshP's Simplicity shader: https://www.shadertoy.com/view/lslGWr
// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
float field(in vec3 p) {
    float strength = 7. + .03 * log(1.e-6 + fract(sin(iTime) * 4373.11));
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 32; ++i) {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.5+(iAudio[100]*0.00001)+iHB*0.5+iHEG*0.1+iFrontalAlpha1Coherence, -.4+(iAudio[200]*0.00001)+iHB*0.5+iHEG*0.1, -1.5);
        float w = exp(-float(i) / (7.+iHRV*0.1+iFrontalAlpha1Coherence));
        if (iHEG < 0.0){
            accum += w - exp(-strength * pow(abs(mag - prev), 2.3));
        } else{
            accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
        }
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .7);
}

void main() {
    float aspect = iResolution.x/iResolution.y;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = 2.*vUv*responsiveScaling;
    vec3 p = vec3(uv / 4., 0) + vec3(1., -1.3, 0.);
    p += .2 * vec3(sin(iTime / 16.), sin(iTime / 12.),  sin(iTime / 128.));
    float t = field(p);
    float v = (1. - exp((abs(vUv.x) - 1.) * 7.)) * (1. - exp((abs(vUv.y) - 4.) * 6.));
    gl_FragColor = mix(.4, 1., 1.) * vec4((1.8+iHEG*0.1+iHR*0.01) * t * t * t , (1.4+iAudio[40]*0.005) * t * t, t+iAudio[150]*0.001, 1.0);
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
        return [{data: this.props.fragment, meta: {label: this.label, params: this.params}}]
    }
}