#define HISTORY 5
#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;

float time;

//Inspired by JoshP's Simplicity shader: https://www.shadertoy.com/view/lslGWr
// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
float field(in vec3 p) {
    float strength = 7. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 32; ++i) {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.5+(0.0*0.00001)+0.0*0.5+0.0*0.1+0.0, -.4+(0.0*0.00001)+0.0*0.5+0.0*0.1, -1.5);
        float w = exp(-float(i) / (7.+0.0*0.1+0.0));
        // accum += w - exp(-strength * pow(abs(mag - prev), 2.3));
        accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .7);
}

void main() {
    float aspect = iResolution.x/iResolution.y;
    time = iTime/100.0;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = 2.*vUv*responsiveScaling;
    vec3 p = vec3(uv / 4., 0) + vec3(1., -1.3, 0.);
    p += .2 * vec3(sin(time / 16.), sin(time / 12.),  sin(time / 128.));
    float t = field(p);
    float v = (1. - exp((abs(vUv.x) - 1.) * 7.)) * (1. - exp((abs(vUv.y) - 4.) * 6.));
    gl_FragColor = mix(.4, 1., 1.) * vec4((1.8+0.0*0.1+0.0*0.01) * t * t * t , (1.4+0.0*0.005) * t * t, t+0.0*0.001, 1.0);
}