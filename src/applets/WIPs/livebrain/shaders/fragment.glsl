
uniform float iTime;
uniform float uData[100]; // Maximum 100
uniform vec3 uCoords[100]; // Maximum 100
uniform float electrodeRadius;

varying vec3 vPosition;

void main(){

    vec3 color = vec3(1.0);

    for (int i = 0; i < 100; i++){
        if (uData[i] != 0.0 && abs(distance(uCoords[i], vPosition)) <= electrodeRadius){
            color.r -= 0.1*abs(min(uData[i], 0.0));
            color.y = 0.0;
            color.z -= 0.1*max(uData[i], 0.0); 
        }
    }

    gl_FragColor = vec4(color, 0.60);//vec4(color, clamp(1.0* vMass *  2.1 * vDepth,.05,.9) );
}