// http://www.pouet.net/prod.php?which=57245
// If you intend to reuse this shader, please add credits to 'Danilo Guanabara'
#define HISTORY 5

precision mediump float;
varying vec2 vUv;
uniform float times[HISTORY];

void main(){
    float t = times[HISTORY-1];
	vec3 c;
	float l,z=t;
	for(int i=0;i<3;i++) {
		vec2 uv,p=vUv.xy;
		uv=p;
		p-=.5;
		p.x*=1.0;
		z+=.07;
		l=length(p);
		uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
		c[i]=.01/length(abs(mod(uv,1.)-.5));
	}
	gl_FragColor=vec4(c/l,t);
}