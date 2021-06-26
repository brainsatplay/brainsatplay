uniform float uTime;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform float uW;
uniform float uD;
uniform float uH;
uniform float uDepthQuantity;
uniform float uHeightQuantity;
varying vec2 vUv;
varying vec3 vVariance;
void main() {
    vec3 modifiedPos = vec3(position);
    // float scalar = 1.0;
    // scalar *= smoothstep(uDepthQuantity/2.0,0.0,abs(uDepthQuantity/2.0 -uD));
    // scalar *= smoothstep(uHeightQuantity/2.0,0.0,abs(uHeightQuantity/2.0 -uH));
    // scalar *= sin(uTime + uW/4.0);
    modifiedPos *= smoothstep(uDepthQuantity/2.0,0.0,abs(uDepthQuantity/2.0 -uD));
    modifiedPos *= smoothstep(uHeightQuantity/2.0,0.0,abs(uHeightQuantity/2.0 -uH));
    modifiedPos *= sin(uTime + uW/4.0);
    // modifiedPos *= scalar;
    // modifiedPos *= sin( uD);
    vec4 modelPosition = modelMatrix * vec4(modifiedPos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    vUv = uv;
    vVariance = modifiedPos;
    // vVariance = vec3(scalar);
    gl_Position = projectedPosition;
    // gl_Position = vec4(position,1.0);
}