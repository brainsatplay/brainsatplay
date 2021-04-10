#define POINTSMAX 25
// struct Points {
// 	vec2 position;
// };

uniform int count;
// uniform Points points[POINTSMAX];
// uniform vec2 points[POINTSMAX];
uniform vec2 point;
uniform sampler2D displacementMap;
uniform float displacementHeight;
uniform float colorThreshold;
uniform float aspectRatio;

varying vec2 vUv;
varying float colorOffset;

void main()
{
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 textureElevation = texture2D(displacementMap, vUv);
    colorOffset = 0.0;
    //   for (int p = 0; p < 1; p++) {
        float dist = abs(distance(point,modelPosition.xy))/aspectRatio;
        if (dist <= colorThreshold){
            colorOffset = dist;
            modelPosition.z += max(textureElevation.r*displacementHeight,displacementHeight);
        } else {
            modelPosition.z += textureElevation.r*displacementHeight/2.0;
        }
    // }

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}