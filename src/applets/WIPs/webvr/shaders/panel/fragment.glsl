uniform float uTime;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
varying vec2 vUv;
varying vec3 vVariance;
// uniform vec3 color1;


vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}


void main() {
    vec3 color = palette(uTime+vVariance.x*10.0,color1,color2,color3,color4);
    // color = color1;
    gl_FragColor = vec4(color,1.0 - vVariance.x / 2.0);
}