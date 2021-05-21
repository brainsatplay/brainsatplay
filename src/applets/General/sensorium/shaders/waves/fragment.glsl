
#define HISTORY 5

// uniform sampler2D uTexture;
uniform float iTime;
// varying vec2 vUv;

precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iAlpha1Coherence;
uniform float iHEG;
uniform float iHRV;

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
    float aspect = iResolution.x/iResolution.y;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = (vUv-0.5)*2.0 *responsiveScaling ;
    
    vec3 outColor = vec3(0.);

    float amplitude = 1.0-iAlpha1Coherence+iHEG+iHRV*0.03;
    if(amplitude < 0.0) amplitude = 0.0;
    
    //Simple wavefunctions inversed and with small offsets.
    outColor += 5./length(uv.y*200. - 50.0*sin( uv.x*0.25+ iTime*0.25)*amplitude);
    outColor += 4./length(uv.y*300. - 100.0*sin(uv.x*0.5+iTime*0.5)*amplitude*1.2);
    outColor += 3./length(uv.y*400. - 150.0*sin(uv.x*0.75+iTime*0.75)*amplitude*1.4);
    outColor += 2./length(uv.y*500. - 200.0*sin(uv.x+iTime)*amplitude*1.6);

    outColor.rgb *= 0.3*HUEtoRGB(0.5 + 0.5*sin(1.0*iTime/3.0));
    // outColor.rgb *= 0.3*HUEtoRGB(0.5 + 0.5*uv.x);

    gl_FragColor = vec4(outColor,1.0);
}