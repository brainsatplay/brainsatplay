#define HISTORY 5
#define NODES 5
#define THICKNESS 0.005

precision mediump float;
varying vec2 vUvs;
varying vec2 vTextureCoord;
varying vec2 resolution;

uniform float amplitude;
uniform float aspect;
uniform vec2 mouse;
uniform vec3 colors[HISTORY];
uniform float times[HISTORY];
uniform float noiseIntensity[HISTORY];

float circle(vec2 _center, vec2 _uv, float _Diameter){
    vec2 dist = _uv-_center;
	return 1.-smoothstep(_Diameter-(_Diameter*0.01),
                         _Diameter+(_Diameter*0.01),
                         dot(dist,dist)*4.0);
}

float drawLine(vec2 _uv, vec2 p1, vec2 p2) {
  float a = abs(distance(p1, _uv));
  float b = abs(distance(p2, _uv));
  float c = abs(distance(p1, p2));

  if ( a >= c || b >=  c ) return 0.0;

  float p = (a + b + c) * 0.5;

  // median to (p1, p2) vector
  float h = 2.0 / c * sqrt( p * ( p - a) * ( p - b) * ( p - c));

  return mix(1.0, 0.0, smoothstep(0.5 * THICKNESS, 1.5 * THICKNESS, h));
}


//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


float minDiameter= 0.0;
float maxDiameter = 0.7;
float historyInterval = 0.1;
float time = times[HISTORY-1]/5.0;

void main()
{
    //Offset uv so that drawn objects are always the same size despite canvas size
    vec2 responsiveScaling = vec2(1.0/((1.0/aspect) * min(1.0,aspect)), 1.0/(1.0 * min(1.0,aspect)));
    vec2 uv = vUvs*responsiveScaling;
    vec4 outColor = vec4(0.);
    float innerDiameter = 0.001;
    float outerDiameter = innerDiameter + 0.001;

    for (int i = 0; i < NODES; i++){
        vec2 noise = vec2(cnoise(vec3((10*i)+25,(30*i)+25,time)),cnoise(vec3((40*i)+500,(20*i)+500,time)));
        vec2 circlePos = mouse + noise;

        // Draw Edges
        for (int j = 0; j < NODES; j++){
            if (j > i){
                vec2 otherCirclePos = mouse + vec2(cnoise(vec3((10*j)+25,(30*j)+25,time)),cnoise(vec3((40*j)+500,(20*j)+500,time)));
                float interactionStrength = (1.0-distance(circlePos,otherCirclePos));
                vec3 c = vec3(drawLine(uv,circlePos,otherCirclePos));
                c.gb *= (1.0-interactionStrength*(0.5 + 0.5*sin(time*20.0))); // Pulse
                outColor += vec4(c,1.0);
            }
        }

        // Draw Circle
        outColor += vec4(vec3(circle(circlePos,uv,outerDiameter)),1.0);
        // outColor -= vec4(vec3(circle(mouse + noise,uv,innerDiameter)),1.0);
    }

    gl_FragColor = vec4(outColor);

}