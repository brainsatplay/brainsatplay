uniform float uTime;
uniform float uBreathPosition;
varying vec2 vUv;

float circle(in vec2 _st, in float _radius){
    vec2 dist = _st-vec2(0.5);
	return 1.-smoothstep(_radius-(_radius*0.01),
                         _radius+(_radius*0.01),
                         dot(dist,dist)*4.0);
}




// book of shaders random from fbm chapter
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}


// Quilez's 2D simplex noise https://www.shadertoy.com/view/Msf3WH
// originally had issue with tiling, but Mike Bostock's sketch and the book of shaders chapter on noise helped me figure it out
// https://observablehq.com/@mbostock/domain-warping
vec2 hash( vec2 p ) // replace this by something better
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

    vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x);
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
    vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}
    #define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}
void main() {
    // vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 st = vUv.xy/5.0;
    // st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.0);
    // determines size
    vec2 p = st*3.;

    float circleRadius = 0.40;
    float circleWidth = 0.01;
    float rbDiff = 0.40;
    float circleBrightnessBump = 0.05;


    // // river flow strength
    p.x += uTime * 0.01;
    p.x -= uTime * 0.5 * (0.9  * circle(vUv,circleRadius-circleWidth));
    // // quilez does fbm( p + fbm(p)), which he notates as fbm(q + r), using q and r to modulate color
    // // fully expanded, I'm doing fbm(p + fbm(p + fbm(p))), so additional nesting r = fbm(p + s)
    // // I add terms to set the d/dt of q,r,s
    // // The undercurrent is s, it has the greatest effect on the whole simulation at the core
    // // its d/dt, t3, is set to be opposite t1, which affects the pollution.
    // // these are nested functions so the order magnitude needs to be different
    // // t2 modulates the rivers velocity, here it's slightly against the river flow strength, almost 0
    // // originally t values had an additional trig term, but alas performance

    // undercurrent relative velocity
    float t1 = uTime * -0.05;
    // river relative velocity
    float t2 = uTime * 0.01;
    // pollution relative velocity
    float t3 = uTime * 0.1;
    vec2 q = p + t1;
    float s = fbm(p + t3);
    float r = fbm(p + t2 + s);
    // so this is where is ressembles the canonical quilez technique
    color += fbm(q + r);
    // bump up brightness a smidgen
    color += 0.25;
    color.r +=  s + 0.08;
    // note that r here isn't red, it's river as modulated by undercurrent
    color.b += r + 0.3;
    // pollution as opposite of undercurrent color (couldnt use q without more operations)
    color.g += s/2.5;
    

    color.rb -= rbDiff;
    color += circle(vUv,circleRadius) - circle(vUv,circleRadius-circleWidth);
    color += (rbDiff+circleBrightnessBump) * circle(vUv,circleRadius);
    color -= rbDiff * circle(vUv,circleRadius-circleWidth);
    color.rb += rbDiff * circle(vUv,circleRadius-circleWidth);
    gl_FragColor = vec4(color,1.0);

}