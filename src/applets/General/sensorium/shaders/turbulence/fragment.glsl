// Source: https://www.shadertoy.com/view/WsjBRW

#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
varying vec2 vTextureCoord;
uniform vec2 iResolution;
uniform float iTime;
uniform float iHEG;
uniform float iHRV;
uniform float iHR;
uniform float iHB;
uniform float iFrontalAlpha1Coherence;
uniform float iFFT[FFTLENGTH];
uniform float iAudio[FFTLENGTH];

void main()
{
    float aspect = iResolution.x/iResolution.y;
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = (vUv-0.5)*2.0 *responsiveScaling ;

    for(float i = 1.0; i < 8.0; i++){
    uv.y += i * 0.1 / i * 
      sin(uv.x * i * i + iTime * 0.5) * sin(uv.y * i * i + iTime * 0.5);
  }
    
   vec3 col;
   col.r  = uv.y - 0.1;
   col.g = uv.y + 0.3;
   col.b = uv.y + 0.95;
    gl_FragColor = vec4(col,1.0);
}