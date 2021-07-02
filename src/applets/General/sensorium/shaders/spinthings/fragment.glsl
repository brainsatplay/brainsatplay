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

vec2 spin(vec2 uv,float t){
	return vec2(uv.x*cos(t)-uv.y*sin(t),uv.y*cos(t)+uv.x*sin(t));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (2.*fragCoord-iResolution.xy)/iResolution.y; //-1 <> 1

	uv=spin(uv,iTime);
    
    vec3 color = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
	
	float s=0.1;
	for(int i=0;i<5;i++){
		uv=abs(uv)-s;
		uv=spin(uv,cos(iTime));
	}

    vec3 col = vec3(0.);

    col += vec3(0.03/abs(uv.x) + abs(uv.y));
    col *= color;
    
    fragColor = vec4(col,1.0);
}

void main() {
	mainImage(gl_FragColor, vUv*iResolution);
}