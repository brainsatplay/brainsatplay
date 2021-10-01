
uniform float iTime;
uniform float uData[100]; // Maximum 100
uniform vec3 uCoords[100]; // Maximum 100
varying vec3 vPosition;

void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.60);//vec4(color, clamp(1.0* vMass *  2.1 * vDepth,.05,.9) );
}