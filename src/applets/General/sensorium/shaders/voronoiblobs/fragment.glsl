// Adapted from Voronoi Blobs by Elise
// https://www.shadertoy.com/view/fs2XRW


#define HISTORY 5
precision mediump float;
varying vec2 vUv;
uniform float times[HISTORY];

vec2 random2( vec2 p )
 {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
float voronoi(vec2 i_stP, vec2 f_stP, vec2 stP, float scalarP)
{
    float m_distP = 1.;

    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = random2(i_stP + neighbor );
            point = 0.5 + 0.5*sin(times[HISTORY-1] + 6.2831*point);
            vec2 diff = neighbor + point - f_stP;
            float dist = length(diff);
            if(dist *m_distP < m_distP)
            {
                m_distP = dist*m_distP;
            }
        }
    }
    //MOUSE INTERACTION
    // vec2 mousePoint = iMouse.xy/iResolution.xy*scalarP;
    // vec2 diffMouse = mousePoint - stP;
    // float distMouse = length(diffMouse);
    // if(distMouse * m_distP < m_distP)
    // {
    //     m_distP = distMouse * m_distP;
    // }
    return m_distP;
}


void main(){
    vec2 uv = vUv.xy;
    vec3 color = vec3(.0);

    float scalar = 10.;
    uv *= scalar;

    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);

    float m_dist = voronoi(i_st, f_st, uv, scalar);

    color += m_dist/0.1;
    // Draw cell center
    //color -= 1.-step(.02, m_dist);
    // Draw grid
    //color.r += step(.98, f_st.x) + step(.98, f_st.y);

    gl_FragColor = vec4(color,1.0);
}