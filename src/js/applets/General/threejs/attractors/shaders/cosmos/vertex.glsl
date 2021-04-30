uniform float uTime;
uniform float uSize;

attribute vec3 aRandomness;
attribute float aScale;

varying vec3 vColor;

// Lorenz Attractor parameters
float a = 10.0;
float b = 28.0;
float c = 2.6666666667;

void main()
{
    /**
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
    // // Rotate
    // float angle = atan(modelPosition.x, modelPosition.z);
    // float distanceToCenter = length(modelPosition.xz);
    // float angleOffset = (1.0 / distanceToCenter) * uTime;
    // angle += angleOffset;
    // modelPosition.x = cos(angle) * distanceToCenter;
    // modelPosition.z = sin(angle) * distanceToCenter;

    // // Randomness
    // modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;


    
    gl_Position = projectedPosition;

    /**
     * Size
     */
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    /**
     * Color
     */
    vColor = color;
}