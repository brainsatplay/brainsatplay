// Source: https://www.shadertoy.com/view/WtdXR8

#define FFTCOUNT 128

precision mediump float;
varying vec2 vUv;

uniform float amplitude;
uniform float historyLength;
uniform vec2 iResolution;
uniform vec2 mouse;
uniform float iTime;
uniform float iFrontalAlpha1Coherence;
uniform float iHEG;
uniform float iHRV;
uniform float iFFT[FFTCOUNT];

void main()
{
    float aspect = iResolution.x/iResolution.y;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = (vUv-0.5)*2.0 *responsiveScaling ;
    
    // vec2 uv =  (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5* uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
    }
    
    gl_FragColor = vec4(vec3(0.1)/abs(sin(iTime-uv.y-uv.x)),1.0);
}