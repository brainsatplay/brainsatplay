
varying vec2 vUv;
//http://web.engr.oregonstate.edu/~mjb/cs519/Handouts/hyperbolic.2pp.pdf
void main() {
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    vec4 pos2 = vec4(0.,0.,-5.,1.);
    pos2.xy = modelPosition.xy/((modelPosition*modelPosition).xy);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition * pos2;
}

//To do more non-euclidean mirror world stuff we need transform matrices to apply to multiply positions