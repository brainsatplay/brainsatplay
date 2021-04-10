export default`#define GLSLIFY 1
uniform float uTime;uniform float uNoiseScaling;uniform float uNoiseIntensity;uniform vec4 uColor;void main(){gl_FragColor=vec4(1.0*(uNoiseIntensity),0.8*(1.0-(0.8*uNoiseIntensity)),1.0*(1.0-uNoiseIntensity),uColor.a);}`;
