uniform float uTime;
uniform float uNoiseScaling;
uniform float uNoiseIntensity;

uniform vec4 uColor;
varying float offset;
varying vec2 vUv;

void main()
{
    float normalizedOffset = uNoiseIntensity*(1.0 + 0.5*(offset));
    gl_FragColor = vec4(vUv,sin(uTime/1000.0),uColor.a);
}