// Source: https://www.shadertoy.com/view/WtdXR8

precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;

void main()
{
    vec2 st = vUv.xy / iResolution;

    float pointer = 0.5 + 0.5 * sin(iTime);
    float r = (st.x * pointer) + (st.y * (1.0-pointer));
    float g = (st.y * pointer) + (st.x * (1.0-pointer));
    float b = 1.0;
    gl_FragColor= vec4(r,g,b,1.0);
}