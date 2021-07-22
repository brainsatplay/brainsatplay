// Source: https://www.shadertoy.com/view/WtdXR8

#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;
uniform float uRedShift;
uniform float uTimeShift;
uniform float uCurl;
uniform float uGreenShift;

void main()
{
    float aspect = iResolution.x/iResolution.y;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = (vUv-0.05)*2.0 *responsiveScaling ;
    
    // vec2 uv =  (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    for(float i = 1.0; i < 10.0; i++){
        uv.x+=(0.5*(1.0+uCurl*0.5+uRedShift*0.1))/i*cos(i*2.5*uv.y+iTime*0.1);
        uv.y+=(0.5*(1.0+uCurl*0.5+uRedShift*0.1))/i*cos(i*1.5*uv.x+iTime*0.01);
    }  
    vec4 color = vec4(vec3(0.1)/abs(sin(iTime*0.5+uTimeShift-uv.y-uv.x)),1.0);
    color.x = .3-color.x+uRedShift*0.5;
    color.y += uGreenShift*0.001;
    gl_FragColor= color;
}