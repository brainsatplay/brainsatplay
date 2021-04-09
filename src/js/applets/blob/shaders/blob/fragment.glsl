uniform sampler2D uTexture;
uniform float uTime;
uniform float uNoiseScaling;
uniform float uNoiseIntensity;

uniform vec4 uColor;
varying vec2 vUv;
varying float offset;

void main()
{
    float normalizedOffset = uNoiseIntensity*(1.0 + 0.5*(offset));
    // vec4 textureColor = texture2D(uTexture, vUv);
    // gl_FragColor = textureColor;
    gl_FragColor = vec4(uColor.r*normalizedOffset + 1.0/(1.0-uNoiseIntensity),0.25 + uColor.g*normalizedOffset*(0.9*(1.0-uNoiseIntensity)),0.25 + uColor.b*(0.9*(1.0-uNoiseIntensity)),uColor.a);
}