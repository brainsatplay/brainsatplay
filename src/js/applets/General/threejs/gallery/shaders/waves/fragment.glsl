
#define HISTORY 5

// uniform sampler2D uTexture;
uniform float[HISTORY] times;
// varying vec2 vUv;

precision mediump float;
varying vec2 vUv;

// taken from: http://www.chilliant.com/rgb2hsv.html
vec3 HUEtoRGB(in float H)
{
    float R = abs(H * 6.0 - 3.0) - 1.0;
    float G = 2.0 - abs(H * 6.0 - 2.0);
    float B = 2.0 - abs(H * 6.0 - 4.0);
    return vec3(R, G, B);
}

void main()
{
    //Offset uv so that center is 0,0 and edges are -1,1
    vec2 uv = (vUv-vec2(0.5))*2.0;
    
    vec3 outColor = vec3(0.);

    float amplitude = 1.0;
    
    //Simple wavefunctions inversed and with small offsets.
    outColor += 5./length(uv.y*200. - 50.0*sin( uv.x*0.25+ times[HISTORY-1]*0.25)*amplitude);
    outColor += 4./length(uv.y*300. - 100.0*sin(uv.x*0.5+times[HISTORY-1]*0.5)*amplitude*1.2);
    outColor += 3./length(uv.y*400. - 150.0*sin(uv.x*0.75+times[HISTORY-1]*0.75)*amplitude*1.4);
    outColor += 2./length(uv.y*500. - 200.0*sin(uv.x+times[HISTORY-1])*amplitude*1.6);

    outColor.rgb *= 0.3*HUEtoRGB(0.5 + 0.5*sin(1.0*times[HISTORY-1]/3.0));
    // outColor.rgb *= 0.3*HUEtoRGB(0.5 + 0.5*uv.x);

    gl_FragColor = vec4(outColor,1.0);
}