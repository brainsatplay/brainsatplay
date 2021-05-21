// http://www.pouet.net/prod.php?which=57245
// If you intend to reuse this shader, please add credits to 'Danilo Guanabara'
#define HISTORY 5

precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;
uniform float iAlpha1Coherence;
uniform float iHEG;
uniform float iHRV;

void main(){
    float t = iTime;
	vec3 c;
	float l,z=t;
	float aspect = iResolution.x/iResolution.y;
	vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv;
    vec2 p = (vUv.xy - 0.5)*responsiveScaling;
	for(int i=0;i<3;i++) {
		z+=.07;
		l=length(p);
		uv=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.)+iAlpha1Coherence+iHEG+iHRV*0.03);
		c[i]=.01/length(abs(mod(uv,1.)-.5));
	}
	gl_FragColor=vec4(c/l,t);
}