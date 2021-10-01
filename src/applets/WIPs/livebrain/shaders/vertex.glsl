
uniform float iTime;
varying vec3 vPosition;

void main() {
    vec3 modifiedPosition = position;
    vec4 modelPosition = modelMatrix * vec4(modifiedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_PointSize = 2.0; //* (1.0 - mass);
    gl_Position = projectedPosition;
    vPosition = position;
}