
attribute float mass;

uniform float iTime;
uniform float uSpeedModifier;
varying float vMass;
uniform sampler2D uImage;

varying vec2 vCircleSpace;
varying float vDepth;
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}

void main() {
    float speed = clamp(0.03 + uSpeedModifier, 0.0, 2.0);

    // position.x += iTime;
    vMass = mass;
    vec3 modifiedPosition = position;
    modifiedPosition.x = (modifiedPosition.x - iTime * mass * speed) - (floor(modifiedPosition.x - iTime * mass * speed));
        // modifiedPosition.x = (modifiedPosition.x - iTime * mass * speed);
    // modifiedPosition.x += iTime;
    vec4 modelPosition = modelMatrix * vec4(modifiedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_PointSize = 15.0 * (1.0 - mass);
    gl_Position = projectedPosition;
    //used for sun version
    vCircleSpace = position.xy;
    // vCircleSpace = modifiedPosition.xy;
    vDepth = position.z;
}