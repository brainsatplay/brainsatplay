#define POINTSMAX 25
// struct Points {
// 	vec2 position;
// };

uniform int count;
// uniform Points points[POINTSMAX];
uniform vec2 points[POINTSMAX];
// uniform vec2 point;
uniform sampler2D displacementMap;
uniform float displacementHeight;
uniform float colorThresholds[POINTSMAX];
uniform float aspectRatio;

varying vec2 vUv;
varying float colorOffset;

void main()
{
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 textureElevation = texture2D(displacementMap, vUv);
    colorOffset = 0.0;
    modelPosition.z = textureElevation.r*displacementHeight/2.0;
      for (int p = 0; p < POINTSMAX; p++) {
          if (points[p].x != 0.0 && points[p].y != 0.0){
            float dist = abs(distance(points[p],modelPosition.xy))/aspectRatio;
            if (dist <= colorThresholds[p]){
                colorOffset = dist;
                modelPosition.z += max(textureElevation.r*displacementHeight,displacementHeight);
                modelPosition.z = min(modelPosition.z, 0.3);
            }
          }
    }

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}