// The MIT License
// Copyright © 2020 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// A simple way to prevent aliasing of cosine functions (the color
// palette in this case is made of 8 layers) by attenuating them
// when their oscillations become smaller than a pixel. Left is
// direct use of cos(x), right is band-limited cos(x).
//
// Box-filtering of cos(x):
//
// (1/w)∫cos(t)dt with t ∈ (x-½w, x+½w)
// = [sin(x+½w) - sin(x-½w)]/w
// = cos(x)·sin(½w)/(½w)
//
// Can approximate smoothstep(2π,0,w) ≈ sin(w/2)/(w/2),
// which you can also see as attenuating cos(x) when it 
// oscilates more than once per pixel. More info:
//
// https://iquilezles.org/www/articles/bandlimiting/bandlimiting.htm
//
// Related Shader:
//   https://www.shadertoy.com/view/WtScDt
//   https://www.shadertoy.com/view/wtXfRH
//   https://www.shadertoy.com/view/3tScWd

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


// box-filted cos(x)
vec3 fcos( in vec3 x )
{
    vec3 w = fwidth(x);
	#if 1
    return cos(x) * sin(0.5*w)/(0.5*w);       // exact
	#else
    return cos(x) * smoothstep(6.2832,0.0,w); // approx
	#endif    
}

// pick raw cosine, or band-limited cosine
bool  mode = false;
vec3  mcos( vec3 x){return mode?cos(x):fcos(x);}

// color palette, made of 8 cos functions
// (see https://iquilezles.org/www/articles/palettes/palettes.htm)
vec3 getColor( in float t )
{
    vec3 col = vec3(0.6,0.5,0.4);
    col += 0.14*mcos(6.2832*t*  1.0+vec3(0.0,0.5,0.6));
    col += 0.13*mcos(6.2832*t*  3.1+vec3(0.5,0.6,1.0));
    col += 0.12*mcos(6.2832*t*  5.1+vec3(0.1,0.7,1.1));
    col += 0.11*mcos(6.2832*t*  9.1+vec3(0.1,0.5,1.2));
    col += 0.10*mcos(6.2832*t* 17.1+vec3(0.0,0.3,0.9));
    col += 0.09*mcos(6.2832*t* 31.1+vec3(0.1,0.5,1.3));
    col += 0.08*mcos(6.2832*t* 65.1+vec3(0.1,0.5,1.3));
    col += 0.07*mcos(6.2832*t*131.1+vec3(0.3,0.2,0.8));
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord )
{
    // coordiantes
	vec2 q = (2.0*fragCoord-iResolution.xy)/iResolution.y;

    // separation
    float th = -2.;
    mode = (q.x<th);
    
    // deformation
    vec2 p = 2.0*q/dot(q,q);

    // animation
    p.xy += 0.05*iTime;

    // texture
    vec3 col = min(getColor(p.x),getColor(p.y));

    // vignetting
    col *= 1.5 - 0.2*length(q);
    
    // separation
    col *= smoothstep(0.005,0.010,abs(q.x-th));

    fragColor = vec4( col, 1.0 );
}

void main() {
	mainImage(gl_FragColor, vUv*iResolution);
}