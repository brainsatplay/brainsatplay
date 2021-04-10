import{GPU as D}from"../../../../_snowpack/pkg/gpujs.js";import{addGpuFunctions as _,createGpuKernels as d}from"./gpuUtils-functs.js";function f(m,t,a={setDynamicOutput:!0,setDynamicArguments:!0,setPipeline:!0,setImmutable:!0}){const e=m.createKernel(t);return a.setDynamicOutput&&e.setDynamicOutput(!0),a.setDynamicArguments&&e.setDynamicArguments(!0),a.setPipeline&&e.setPipeline(!0),a.setImmutable&&e.setImmutable(!0),e}export class gpuUtils{constructor(t=new D){this.gpu=t,this.kernel,this.PI=3.141592653589793,this.SQRT1_2=.7071067811865476,this.addFunctions(),this.imgkernels={edgeDetection:[-1,-1,-1,-1,8,-1,-1,-1,-1],boxBlur:[1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9],sobelLeft:[1,0,-1,2,0,-2,1,0,-1],sobelRight:[-1,0,1,-2,0,2,-1,0,1],sobelTop:[1,2,1,0,0,0,-1,-2,-1],sobelBottom:[-1,2,1,0,0,0,1,2,1],identity:[0,0,0,0,1,0,0,0,0],gaussian3x3:[1,2,1,2,4,2,1,2,1],guassian7x7:[0,0,0,5,0,0,0,0,5,18,32,18,5,0,0,18,64,100,64,18,0,5,32,100,100,100,32,5,0,18,64,100,64,18,0,0,5,18,32,18,5,0,0,0,0,5,0,0,0],emboss:[-2,-1,0,-1,1,1,0,1,2],sharpen:[0,-1,0,-1,5,-1,0,-1,0]}}addFunctions(){_.forEach(e=>this.gpu.addFunction(e)),this.correlograms=f(this.gpu,d.correlogramsKern),this.correlogramsPC=f(this.gpu,d.correlogramsKern),this.dft=f(this.gpu,d.dftKern),this.idft=f(this.gpu,d.idftKern),this.dft_windowed=f(this.gpu,d.dft_windowedKern),this.idft_windoed=f(this.gpu,d.idft_windowedKern),this.fft=f(this.gpu,d.fftKern),this.ifft=f(this.gpu,d.ifftKern),this.fft_windowed=f(this.gpu,d.fft_windowedKern),this.ifft_windowed=f(this.gpu,d.ifft_windowedKern),this.listdft2D=f(this.gpu,d.listdft2DKern),this.listdft1D=f(this.gpu,d.listdft1DKern),this.listdft1D_windowed=f(this.gpu,d.listdft1D_windowedKern),this.listidft1D_windowed=f(this.gpu,d.listidft1D_windowedKern),this.bulkArrayMul=f(this.gpu,d.bulkArrayMulKern),this.multiConv2D=f(this.gpu,d.multiImgConv2DKern);const t=(e,n,r,s,i)=>{var u=this.fft_windowed(e,n,r,s,i,0),l=this.ifft_windowed(u,n,r,s,i);return l},a=(e,n,r,s,i)=>{var u=this.listdft1D_windowed(e,n,r,s,i,new Array(Math.ceil(e/n)).fill(0)),l=this.listidft1D_windowed(u,n,r,s,i);return l};this.gpuCoherence=(e,n,r,s,i)=>{var u=this.listdft1D_windowed(e,n,r,s,i,new Array(Math.ceil(e/n)).fill(0)),l=this.bulkArrayMul(u,n,5,1);return l}}gpuXCors(t,a=!1,e=!1){var n;if(a===!0){var r=[],s=[];t.forEach((x,w)=>{r.push(x.reduce((p,v)=>v+=p)/x.length),s.push(Math.sqrt(r[w].reduce((p,v)=>p+=Math.pow(v-mean1,2))))});for(var i=[],u=[],l=[],o=0;o<t.length;o++)for(var h=o;h<t.length;h++)l.push(...t[o],...t[h]),i.push(r[o],r[h]),u.push(s[o],s[h]);this.correlogramsPC.setOutput([l.length]),this.correlogramsPC.setLoopMaxIterations(t[0].length*2),n=this.correlogramsPC(l,t[0].length,i,u)}else{for(var l=[],o=0;o<t.length;o++)for(var h=o;h<t.length;h++)l.push(...t[o],...t[h]);this.correlograms.setOutput([l.length]),this.correlograms.setLoopMaxIterations(t[0].length*2),n=this.correlograms(l,t[0].length)}if(e===!0)return n;var g=n.toArray();n.delete();for(var c=[],o=0;o<t.length;o++)c.push(g.splice(0,t[0].length));return c}gpuDFT(t,a,e=1,n=!1){var r=t.length,s=r/a;this.dft.setOutput([t.length]),this.dft.setLoopMaxIterations(r);var i=this.dft(t,r,e,DCoffset),u=null;if(n===!1){var l=this.makeFrequencyDistribution(r,s),o=i.toArray();return i.delete(),[l,this.orderMagnitudes(o)]}else{var h=i;return i.delete(),h}}MultiChannelDFT(t,a,e=1,n=!1){var r=[];t.forEach(c=>{r.push(...c)});var s=t[0].length,i=s/a;this.listdft1D.setOutput([r.length]),this.listdft1D.setLoopMaxIterations(s);var u=this.listdft1D(r,s,e);if(n===!1){var l=[],o=this.makeFrequencyDistribution(s,i);r=u.toArray();for(var h=0;h<r.length;h+=s)l.push(this.orderMagnitudes([...r.slice(h,h+s)]));return u.delete(),[o,l]}else{var g=u;return u.delete(),g}}MultiChannelDFT_Bandpass(t=[],a,e,n,r=1,s=!1){var i=[];t.forEach(c=>{i.push(...c)});var u=n*2,l=t[0].length,o=l/a;this.listdft1D_windowed.setOutput([i.length]),this.listdft1D_windowed.setLoopMaxIterations(l);var h=this.listdft1D_windowed(i,o,e,u,r);if(s===!0)return h;i=h.toArray(),h.delete();var g=this.bandPassWindow(e,n,o);return[g,this.orderBPMagnitudes(i,a,o,l)]}orderMagnitudes(t){return[...t.slice(Math.ceil(t.length*.5),t.length),...t.slice(0,Math.ceil(t.length*.5))]}makeFrequencyDistribution(t,a){for(var e=t,n=a/e,r=[],s=-e/2;s<e/2;s++){var i=s*n;r.push(i)}return r}orderBPMagnitudes(t,a,e,n){for(var r=[],s=0;s<t.length;s+=n)r.push([...t.slice(s,Math.ceil(n*.5+s))]);var i=[],u=1/e;return a>1?(r.forEach((l,o)=>{i.push([]);for(var h=1/Math.max(...l),g=0;g<l.length;g++)if(g==0)i[o]=l.slice(g,Math.floor(e)),g=Math.floor(e);else{var c=g-Math.floor(Math.floor(g*u)*e)-1;i[o][c]=i[o][c]*l[g-1]*h}i[o]=[...i[o].slice(0,Math.ceil(i[o].length*.5))]}),i):r}bandPassWindow(t,a,e,n=!0){var r=a*2;let s=(r-t)/e;var i=[];if(n===!0)for(var u=0;u<Math.ceil(.5*e);u+=s)i.push(t+(r-t)*u/e);else for(var u=-Math.ceil(.5*e);u<Math.ceil(.5*e);u+=s)i.push(t+(r-t)*u/e);return i}}var z=`
uniform sampler1D tex;
uniform vec2 center;
uniform float scale;
uniform int iter;

void main() {
    vec2 z, c;

    c.x = 1.3333 * (gl_TexCoord[0].x - 0.5) * scale - center.x;
    c.y = (gl_TexCoord[0].y - 0.5) * scale - center.y;

    int i;
    z = c;
    for(i=0; i<iter; i++) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
    }

    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);
}
`,K=`
uniform sampler1D tex;
uniform vec2 c;
uniform int iter;

void main() {
    vec2 z;
    z.x = 3.0 * (gl_TexCoord[0].x - 0.5);
    z.y = 2.0 * (gl_TexCoord[0].y - 0.5);

    int i;
    for(i=0; i<iter; i++) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
    }

    gl_FragColor = texture1D(tex, (i == iter ? 0.0 : float(i)) / 100.0);
}
`;
