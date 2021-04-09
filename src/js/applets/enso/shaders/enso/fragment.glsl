uniform float uTime;
uniform float uNoiseScaling;
uniform float uNoiseIntensity;

uniform vec4 uColor;
varying vec2 vUv;
varying float offset;

void main()
{
    float normalizedOffset = uNoiseIntensity*(1.0 + 0.5*(offset));
    gl_FragColor = vec4(1.0,1.0,1.0,uColor.a);
}