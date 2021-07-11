
#define FFTLENGTH 256
precision mediump float;
varying vec2 vUv;
varying vec2 vTextureCoord;
uniform vec2 iResolution;
uniform float iTime;
uniform vec4 iDate;
uniform float iHEG;
uniform float iHRV;
uniform float iHR;
uniform float iHB;
uniform float iFrontalAlpha1Coherence;
uniform float iFFT[FFTLENGTH];
uniform float iAudio[FFTLENGTH];


vec4 jDate; const float M_PI = 3.14159265358979323846264338327950288;

// day of week fuction
float day() {
    float jDatex=jDate.x;
    float y366 = floor((jDatex-0.0)/400.0)+floor((jDatex-0.0)/4.0)-floor((jDatex-0.0)/100.0);
    float y365 = jDatex-y366;
    y366*=366.0; y365*=365.0;
    float d=y366+y365;
    if (jDate.y >= 0.0) d+=0.0;
    if (jDate.y >= 1.0) d+=31.0;
    if (jDate.y >= 2.0 && (int(mod(jDatex, 4.0))==0&&(int(mod(jDatex, 100.0))!=0||int(mod(jDatex, 400.0))==0))) d+=29.0;
    if (jDate.y >= 2.0 && (int(mod(jDatex, 4.0))!=0||int(mod(jDatex, 100.0))==0&&int(mod(jDatex, 400.0))!=0)) d+=28.0;
    if (jDate.y >= 3.0) d+=31.0;
    if (jDate.y >= 4.0) d+=30.0;
    if (jDate.y >= 5.0) d+=31.0;
    if (jDate.y >= 6.0) d+=30.0;
    if (jDate.y >= 7.0) d+=31.0;
    if (jDate.y >= 8.0) d+=31.0;
    if (jDate.y >= 9.0) d+=30.0;
    if (jDate.y >= 10.0) d+=31.0;
    if (jDate.y >= 11.0) d+=30.0;
    return mod(d+jDate.z-2.0, 7.0)+1.0;
}

//scene function
vec4 bg(vec2 fragCoord) {
    vec2 coord = (fragCoord)*4.0;
   	float t = (iTime);
    float x = float(coord.x+iHEG+iHB)+64.0*sin((coord.x+coord.y)/60.0);
    float y = float(coord.y+iHRV*0.1)+64.0*cos((coord.x-coord.y)/60.0);
    float r = float(x*x*t + y*y*t);
    vec4 fragColor = vec4(
        cos(sqrt(r)/x),
        cos(sqrt(r)/sqrt(t)),
        cos(sqrt(r)/y),
        sin(y/x)
    );
    fragColor.x+=(tan((degrees(atan(x, y))*1.0-t*2.0-iHEG*10.)))/4.0;
    fragColor.y+=(tan((degrees(atan(x, y))*1.0-t*2.0-iFrontalAlpha1Coherence*100.+iAudio[200]*0.003)))/4.0;
    fragColor.z+=(tan((degrees(atan(x, y))*1.0-t*2.0)))/4.0;
    return fragColor;
}

//clock function
vec4 f(float x, float y, float t) {float N=iResolution.y/360.0;//clock zoom 
    //float jDatem = floor((13800000000.0-2021.0+jDate.x)/230000000.0);
    jDate.x = mod(jDate.x, 1000000.0);//do a barrel roll after 1 million years of work 
    float jDatex = mod(jDate.x,10000.0);//4 last digits of year
    float jDate1 = 0.0; float jDate2 = 0.0;// 4 digits year
    if (jDate.x>99999.0) {//if year is 6 digits
        jDate2 = floor(jDate.x/100000.0);
        jDate1 = mod(jDate.x,100000.0)/10000.0;
    }
    else if (jDate.x>9999.0) {//if year is 5 digits
        jDate2 = floor(jDate.x/100000.0);
        jDate1 = floor(jDate.x/10000.0);
    }
    //jDate.x=123456.0;// 12422311
    float angle=atan(-x, -y);
    
    
    
    /*
    //galactic years controller
    vec4 galacticTime = vec4(0.9, 0.2, 0.2, 1.0);
    float a12=mod(jDatem, 5.0);float b12=floor(jDatem/5.0);
    float a11=mod(b12, 5.0);float b11=floor(b12/5.0);
    float a10=mod(b11, 5.0);float b10=floor(b11/5.0);
    float a9=mod(b10, 5.0);float b9=floor(b10/5.0);
    float a8=mod(b9, 5.0);float b8=floor(b9/5.0);
    float a7=mod(b8, 5.0);float b7=floor(b8/5.0);
    float a6=mod(b7, 5.0);float b6=floor(b7/5.0);
    float a5=mod(b6, 5.0);float b5=floor(b6/5.0);
    float a4=mod(b5, 5.0);float b4=floor(b5/5.0);
    float a3=mod(b4, 5.0);float b3=floor(b4/5.0);
    float a2=mod(b3, 5.0);float b2=floor(b3/5.0);
    float a1=mod(b2, 5.0);float b1=floor(b2/5.0);
    //if (int(a1)==0) return galacticTime;
    
    //12 red arcs to 12 digits of fivefold galactic years (max value 244140624 yaers)
    if ((x*x+y*y)<=146.0*146.0*N&&(x*x+y*y)>143.0*143.0*N) {//140-146 radius
      //if (degrees(angle)>-180.0&&degrees(angle)<=-180.0+6.0*(floor(jDate2)))
       //   return galacticTime;
       if (degrees(angle)>-180.0&&degrees(angle)<=-180.0+6.0*(a1))
          return galacticTime;
       if (degrees(angle)>-150.0&&degrees(angle)<=-150.0+6.0*(a2))
          return galacticTime;
       if (degrees(angle)>-120.0&&degrees(angle)<=-120.0+6.0*(a3))
          return galacticTime;
       if (degrees(angle)>-90.0&&degrees(angle)<=-90.0+6.0*(a4))
          return galacticTime;
      if (degrees(angle)>-60.0&&degrees(angle)<=-60.0+6.0*(a5))
          return galacticTime;
      if (degrees(angle)>-30.0&&degrees(angle)<=-30.0+6.0*(a6))
          return galacticTime;
      if (degrees(angle)>0.0&&degrees(angle)<=6.0*(a7))
          return galacticTime;
      if (degrees(angle)>30.0&&degrees(angle)<=30.0+6.0*(a8))
          return galacticTime;
      if (degrees(angle)>60.0&&degrees(angle)<=60.0+6.0*(a9))
          return galacticTime;
      if (degrees(angle)>90.0&&degrees(angle)<=90.0+6.0*(a10))
         return galacticTime;
      if (degrees(angle)>120.0&&degrees(angle)<=(120.0+6.0*(a11)))
          return galacticTime;
      if (degrees(angle)>150.0&&degrees(angle)<=(150.0+6.0*(a12)))
          return galacticTime;
    } */   
    //float dangle = degrees()
    
    /* Operator "||" to set cureent date and day of week when angle arrive +/-180deg. bug fixed by 18.05.2021 */
    
    
    vec4 res = vec4(1.0, 1.0, 1.0, 1.0);//clock color

                
    vec4 years = vec4(0.2, 0.2, 0.2, 1.0);//years controller
    if ((x*x+y*y)<=146.0*146.0*N&&(x*x+y*y)>140.0*140.0*N) {//140-146 radius
      if (degrees(angle)>-180.0&&degrees(angle)<=-180.0+6.0*(floor(jDate2)))
          return years;//100000
      if (degrees(angle)>-120.0&&degrees(angle)<=-120.0+6.0*(floor(jDate1)))
          return years;//10000
      if (degrees(angle)>-60.0&&degrees(angle)<=-60.0+6.0*(floor(jDatex/1000.0)))
          return years;//millenium of year
      if (degrees(angle)>0.0&&(degrees((angle)))<=6.0*(floor(mod(jDatex, 1000.0)/100.0)))
          return years;//century of year
      if (degrees(angle)>60.0&&degrees(angle)<=60.0+6.0*(floor(mod(jDatex,100.0)/10.0)))
         return years;//dacade of year
      if (degrees(angle)>120.0&&degrees(angle)<=(120.0+6.0*(floor(mod(jDatex,10.0)))))
          return years;//last num of year
    }
    
    if ((x*x+y*y)<146.0*146.0*N&&(x*x+y*y)>=135.0*135.0*N)//135-146 radius
    /*fix*/ if (180.0+degrees(angle)<30.0*(jDate.y+1.0)&&180.0+degrees(angle)>30.0*(jDate.y+1.0)-6.0*day()||30.0*(jDate.y+1.0)-6.0*day()<-180.0+degrees(angle))
                return vec4(1.0,0.7,0.1,1.0);//day of week yellow color (month, day)
    if ((x*x+y*y)<146.0*146.0*N&&(x*x+y*y)>=135.0*135.0*N)//135-146 radius
    /*fix*/ if (180.0+degrees(angle)>30.0*(jDate.y+1.0)&&180.0+degrees(angle)<30.0*(jDate.y+1.0)+6.0*jDate.z||30.0*(jDate.y+1.0)+6.0*jDate.z>360.0+180.0+degrees(angle))
                return vec4(0.25,0.75,0.25,1.0);//date green color (month, day)
            
    
    float jDatem = floor((13800000000.0-2021.0+jDate.x)/1000000.0);
    jDate.x = mod(jDatem, 1000000.0);//do a barrel roll after 1 million years of work 
    jDatex = mod(jDate.x,10000.0);//4 last digits of year
    jDate1 = 0.0; jDate2 = 0.0;// 4 digits year
    if (jDate.x>99999.0) {//if year is 6 digits
        jDate2 = floor(jDate.x/100000.0);
        jDate1 = mod(jDate.x,100000.0)/10000.0;
    }
    else if (jDate.x>9999.0) {//if year is 5 digits
        jDate2 = floor(jDate.x/100000.0);
        jDate1 = floor(jDate.x/10000.0);
    }
    vec4 galacticTime = vec4(0.9, 0.2, 0.2, 1.0);
    if ((x*x+y*y)>=147.0*147.0*N&&(x*x+y*y)<=149.0*149.0*N) {//140-146 radius
      if (degrees(angle)>-180.0&&degrees(angle)<=-180.0+6.0*(floor(jDate2)))
          return galacticTime;//100000
      if (degrees(angle)>-120.0&&degrees(angle)<=-120.0+6.0*(floor(jDate1)))
          return galacticTime;//10000
      if (degrees(angle)>-60.0&&degrees(angle)<=-60.0+6.0*(floor(jDatex/1000.0)))
          return galacticTime;//millenium of year
      if (degrees(angle)>0.0&&(degrees((angle)))<=6.0*(floor(mod(jDatex, 1000.0)/100.0)))
          return galacticTime;//century of year
      if (degrees(angle)>60.0&&degrees(angle)<=60.0+6.0*(floor(mod(jDatex,100.0)/10.0)))
         return galacticTime;//dacade of year
      if (degrees(angle)>120.0&&degrees(angle)<=(120.0+6.0*(floor(mod(jDatex,10.0)))))
          return galacticTime;//last num of year
    }
    if ((x*x+y*y)<=150.0*150.0*N&&(x*x+y*y)>=146.0*146.0*N)//light shadow
        return vec4(0.92,0.92,0.92,1.0);//shadow
    
    if (x*x+y*y<=20.0*20.0*N)//10 radius
        return vec4(1.0,1.0,1.0, 1.0);
    if ((x*x+y*y)<=90.0*90.0*N)//90 radius
      if (int(ceil(60.0*angle/2.0/M_PI))==-int(floor(30.0-mod(((t+0.001)/60.0/12.0),60.0))))
        return vec4(0.0,0.0,0.0,1.0); //hours arrow color
    if ((x*x+y*y)<=110.0*110.0*N)//115 radius
      if (int(ceil(60.0*angle/2.0/M_PI))==-int(floor(30.0-mod(((t+0.001)/60.0), 60.0))))
        return vec4(0.0,0.8,0.8,1.0);//minutes arrow color
    if ((x*x+y*y)<=130.0*130.0*N)//140 radius
      if (int((ceil(60.0*angle/2.0/M_PI)))==-int(floor(30.0-mod(((t+0.001)),60.0))))
        return vec4(1.0,0.0,0.6,1.0);//seconds arrow color
    if ((x*x+y*y)<=150.0*150.0*N)//150 radius
        return res;//clock color
    if ((x*x+y*y)<=170.0*170.0*N) {//170 radius
        float dt = 0.0; float jDatew = t;
        if(mod(floor(jDatew/3600.0), 24.0)>=12.0) dt=1.0;// dt sets PM/AM
        res.x=float(int(mod(floor(60.0*radians((degrees(angle))-mod(floor(jDatew/3600.0)+dt, 24.0)*30.0)/2.0/M_PI),2.0)));
        res.y=float(int(mod(floor(60.0*radians((degrees(angle))-mod(floor(jDatew/3600.0)+dt, 24.0)*30.0)/2.0/M_PI/5.0),2.0)));
        res.z=(res.x+res.y)/abs(2.0-mod(t, 4.0));//clock segmentation animate by t(time)
        return abs(res);//color for clock segmentation
    }
    else {
        res = (vec4(0.0,0.2,0.2,1.0)*sin((y-535.0)/340.0)*sin((x-1070.0)/680.0));//old background
        if(abs(y)<10000.0)res = bg(vec2(x,y))/1.0;//new scene
        return res;
    }
}


// START
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float N=iResolution.y/360.0;
    
    jDate = iDate; // 4D TIME POINT 
    // You can fix it to display any date and any time of 1 million years.
    
    vec2 coord = fragCoord - (iResolution.xy / vec2(2.0));//simmetric
    fragColor= f(coord.x*15.,coord.y*15.,float(jDate.w)); //go
    if (coord.x*coord.x+coord.y*coord.y>170.0*170.0*N){//shadow
        if (coord.x*coord.x+coord.y*coord.y<180.0*180.0*N)//shadow
            fragColor/=8.0;//shadow
     }
    if (coord.x*coord.x+coord.y*coord.y<=146.0*146.0*N&&fragColor.w!=0.5)//arrows texture animate
        fragColor+=abs(tan(abs(jDate.w*2.0)))/16.0;
}

void main() {
	mainImage(gl_FragColor, vUv*iResolution);
}
