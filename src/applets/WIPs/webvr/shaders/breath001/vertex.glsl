uniform float uTime;
// uniform float uBigWavesSpeed;
// uniform float uBigWavesElevation;
// uniform vec2 uBigWavesFrequency;
// uniform float uSmallWavesElevation;
// uniform float uSmallWavesFrequency;
// uniform float uSmallWavesSpeed;
// uniform float uSmallIterations;

// varying float vElevation;
// varying float vFog;
varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    vUv = uv;
    gl_Position = projectedPosition;
    // gl_Position = vec4(position,1.0);

    //varying
    // vFog = distance(vec2(0.0,0.0),modelPosition.xz);
    // vFog = 1.0 - vFog;
    // vElevation = elevation / uBigWavesElevation;

}