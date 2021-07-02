#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;
uniform float iHEG;
uniform float iHRV;
uniform float iHR;
uniform float iHB;
uniform float iFrontalAlpha1Coherence;
uniform float iFFT[FFTLENGTH];
uniform float iAudio[FFTLENGTH];

vec2 f(vec2 x, vec2 c) {
    return mat2(x,-x.y,x.x)*x + c;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    uv -= 0.5;uv *= 1.3;uv += 0.5;
    vec4 col = vec4(1.0);
    float time = iTime;
    
    int u_maxIterations = 75;
    
    float r = 0.7885*(sin((time/3.) - 1.57)*0.2+0.85);
	vec2 c = vec2(r*cos((time/3.)), r*sin((time/3.)));
    
    vec2 z = vec2(0.);
    z.x = 3.0 * (uv.x - 0.5);
    z.y = 2.0 * (uv.y - 0.5);
    bool escaped = false;
    int iterations;
    for (int i = 0; i < 10000; i++) {
        if (i > u_maxIterations) break;
        iterations = i;
        z = f(z, c);
        if (dot(z,z) > 4.0) {
            escaped = true;
            break;
        }
    }
			
    vec3 iterationCol = vec3(palette(float(iterations)/ float(u_maxIterations),
                                     vec3(0.5),
                                     vec3(0.5),
                                     vec3(1.0, 1.0, 0.0),
                                     vec3(0.3 + 0.3 * sin(time),
                                          0.2 + 0.2 * sin(1. + time),
                                          0.2  + 0.2 * sin(1.5 + time))));
		
	vec3 coreCol = vec3(0.);
	
    float f_ite = float(iterations);
    float f_maxIte = float(u_maxIterations);
    fragColor = vec4(escaped ? iterationCol : coreCol, f_ite/f_maxIte );
}


void main() {
	mainImage(gl_FragColor, vUv*iResolution);
}


/** SHADERDATA
{
	"title": "Fractal.4",
	"description": "Old fractal exploration https://codepen.io/gThiesson/pen/PowYRqg",
	"model": "nothing"
}
*/