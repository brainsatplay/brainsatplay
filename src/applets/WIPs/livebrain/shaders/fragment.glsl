
uniform float iTime;
uniform float uData[100]; // Maximum 100
uniform vec3 uCoords[100]; // Maximum 100
uniform float electrodeRadius;

varying vec3 vPosition;

void main(){

    vec3 color = vec3(1.0);

    for (int i = 0; i < 100; i++){
        if (uData[i] != 0.0 && abs(distance(uCoords[i], vPosition)) <= electrodeRadius){
            float factor = (uData[i])*(1.0-pow(abs(distance(uCoords[i],vPosition)/75.0),2.0));
            if (uData[i] > 0.0){
                color.y -= 0.5*factor;
                color.z -= 0.2*factor;
            } else if (uData[i] < 0.0){
                color.x += 0.5*factor;
                color.y += 0.2*factor;
            }
        }
    }

    gl_FragColor = vec4(color, 0.60);//vec4(color, clamp(1.0* vMass *  2.1 * vDepth,.05,.9) );
}