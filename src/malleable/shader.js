// Fragment shader for the liquid glass shape: a raymarched ring that can melt into a sitting cat or a star.
// Ported from the liquid-hero prototype.
export const vertexShader = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

export const fragmentShader = (FOC, CAMZ) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uState;
uniform float uHue, uWobble, uThick, uPull, uDrop, uEnergy, uShift, uMat, uDisp, uCat, uStar, uFish; uniform vec2 uTilt;
const float FOC = ${FOC.toFixed(2)}; const float CAMZ = ${CAMZ.toFixed(2)};
vec3 M; vec3 OFF; float SC;

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float smin(float a, float b, float k){ float h=max(k-abs(a-b),0.)/k; return min(a,b)-h*h*k*.25; }

vec3 toLocal(vec3 p){
  vec3 q = (p-OFF)/SC;
  q.yz = rot(uTilt.y)*q.yz;
  q.xz = rot(uTilt.x)*q.xz;
  return q;
}

// ---- 2D outlines the tube can follow. Each is a signed distance; the tube is built around its zero line,
// so blending two of them morphs one outline smoothly into the other. ----
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
// C2 blends for the fish: the plain smin keeps normals continuous but not curvature, and on a big
// glossy body the sharp studio reflections show that curvature step as a straight line
float smin2(float a, float b, float k){ k *= 1.5; float h = max(k-abs(a-b),0.)/k; return min(a,b) - h*h*h*k*(1./6.); }
float smax2(float a, float b, float k){ return -smin2(-a, -b, k); }
// exact round cone (iq). The quick tapered capsule below bends its normals at the plane where its end cap
// starts, and once blended into the fish body that shows as a straight line across it
float sdRCone(vec3 p, vec3 a, vec3 b, float r1, float r2){
  vec3 ba = b - a; float l2 = dot(ba, ba), rr = r1 - r2, a2 = l2 - rr*rr, il2 = 1./l2;
  vec3 pa = p - a; float y = dot(pa, ba), z = y - l2;
  vec3 w = pa*l2 - ba*y; float x2 = dot(w, w), y2 = y*y*l2, z2 = z*z*l2;
  float k = sign(rr)*rr*rr*x2;
  if (sign(z)*a2*z2 > k) return sqrt(x2 + z2)*il2 - r2;
  if (sign(y)*a2*y2 < k) return sqrt(x2 + y2)*il2 - r1;
  return (sqrt(x2*a2*il2) + y*rr)*il2 - r1;
}
float sdEll(vec3 p, vec3 r){ float k0 = length(p/r), k1 = length(p/(r*r)); return k0*(k0-1.)/k1; }
float sdCap(vec3 p, vec3 a, vec3 b, float ra, float rb){   // capsule that tapers from ra to rb
  vec3 pa = p-a, ba = b-a; float h = clamp(dot(pa,ba)/dot(ba,ba), 0., 1.);
  return length(pa - ba*h) - mix(ra, rb, h);
}
// A solid glass cat sitting upright, built from soft ellipsoids and capsules. Origin ≈ its middle, ~2 units tall.
float catSD(vec3 p){
  float bd = sdEll(p, vec3(.95, 1.22, .92));          // cheap shell around the whole cat: skip the detail while the ray is far away
  if (bd > .18) return bd;
  float t = uTime;
  p.xz = rot(-.3 + .32*sin(t*.33))*p.xz;              // turns slowly so you can see it's round
  p += uWobble*.012*sin(p.yzx*5. + vec3(t*.8, t*.6, t));   // a little liquid life on the surface
  p.y -= .1;
  vec3 q = p; q.x = abs(q.x);
  float d = sdEll(p - vec3(0., -.7, -.1), vec3(.6, .4, .5));              // haunches
  d = smin(d, sdEll(p - vec3(0., -.3, -.02), vec3(.43, .5, .39)), .22);     // torso
  d = smin(d, sdEll(p - vec3(0., -.02, .1), vec3(.34, .36, .3)), .16);     // chest, rising into the head
  // head
  vec3 hp = p - vec3(0., .45, .08);
  hp.xy = rot(.1*sin(t*.5))*hp.xy;                    // the odd curious head tilt
  vec3 hq = hp; hq.x = abs(hq.x);
  float head = sdEll(hp, vec3(.41, .33, .35));
  head = smin(head, sdEll(hq - vec3(.16, -.1, .2), vec3(.16, .12, .13)), .08);   // cheeks
  head = smin(head, sdEll(hp - vec3(0., -.1, .3), vec3(.11, .08, .08)), .06);  // muzzle
  vec3 ep = hq - vec3(.21, .2, -.03); ep.z *= 1.6;  // ears: flattened cones with soft, rounded tips
  head = smin(head, sdCap(ep, vec3(0.), vec3(.1, .26, 0.), .15, .05)/1.6, .1);
  head = smax(head, -(length(hq - vec3(.15, .04, .335)) - .042), .025);        // shallow eye sockets
  d = smin(d, head, .13);
  // front legs and paws
  d = smin(d, sdCap(q, vec3(.16, -.28, .24), vec3(.17, -.98, .3), .095, .075), .1);
  d = smin(d, sdEll(q - vec3(.17, -1.02, .36), vec3(.095, .06, .12)), .05);
  d = smin(d, sdEll(q - vec3(.42, -1.03, .16), vec3(.12, .06, .16)), .07);     // back paws
  // tail, wrapped round the front
  float tl = sdCap(p, vec3(-.5, -.9, -.24), vec3(-.62, -1.0, .1), .078, .07);
  tl = min(tl, sdCap(p, vec3(-.62, -1.0, .1), vec3(-.42, -1.03, .42), .07, .062));
  tl = min(tl, sdCap(p, vec3(-.42, -1.03, .42), vec3(-.08, -1.04, .5), .062, .05));
  return smin(d, tl, .06);
}
// A solid glass fish swimming head-down, seen from the side. Origin ≈ its middle, ~2.4 units long.
float fishSD(vec3 p){
  float bd = sdEll(p - vec3(0., .15, 0.), vec3(1.05, 1.8, 1.05));   // cheap shell: skip the detail while the ray is far away (roomy: a tight one clips the tail)
  if (bd > .3) return bd;
  float t = uTime;
  p.xy = rot(.08*sin(t*.45))*p.xy;                    // drifts a little off vertical
  p.y += .05*sin(t*.9);                               // and bobs
  p.xz = rot(.42 + .3*sin(t*.37))*p.xz;               // turned three-quarters so the swim shows
  float sw = smoothstep(-.7, 1.3, p.y);               // the swim wave grows from head to tail
  p.z += .2*sw*sw*sin(p.y*2.6 - t*3.2);
  p.x += .03*sin(p.y*2.6 - t*3.2 + 1.2);
  p += uWobble*.01*sin(p.yzx*5. + vec3(t*.8, t*.6, t));    // a little liquid life on the surface
  vec3 q = p; q.z = abs(q.z);
  float d = sdEll(p - vec3(0., -.32, 0.), vec3(.4, .8, .33));                    // body, nose down
  d = smin2(d, sdRCone(p, vec3(0., .25, 0.), vec3(0., .86, 0.), .19, .07), .16);   // tail stalk
  // tail fin: two lobes fanning out from the stalk
  vec3 tp = p - vec3(0., .9, 0.); vec3 tq = tp; tq.x = abs(tq.x);
  tq.xy = rot(-.55)*tq.xy;
  d = smin2(d, sdEll(tq - vec3(0., .26, 0.), vec3(.11, .3, .045)), .1);
  // dorsal fin along the back, and a small one underneath
  vec3 dp = p - vec3(.34, -.2, 0.); dp.xy = rot(-.35)*dp.xy;
  d = smin2(d, sdEll(dp, vec3(.17, .36, .045)), .12);
  vec3 vp = p - vec3(-.34, .12, 0.); vp.xy = rot(.4)*vp.xy;
  d = smin2(d, sdEll(vp, vec3(.12, .2, .04)), .1);
  // pectoral fins just behind the head, one each side
  vec3 pp = q - vec3(-.06, -.62, .24); pp.yz = rot(.5)*pp.yz;
  d = smin2(d, sdEll(pp, vec3(.13, .18, .035)), .08);
  // eyes: small domes near the nose, and a soft mouth
  d = smin2(d, length(q - vec3(.14, -.82, .17)) - .065, .04);
  d = smax2(d, -(length(p - vec3(-.05, -1.13, 0.)) - .07), .04);
  return d*.8;                                        // the swim bend stretches space; step a bit shorter
}
float starD(vec2 p){                                  // iq's 5-point star, slowly turning
  p = rot(uTime*.12)*p;
  const vec2 k1 = vec2(.809016994, -.587785252), k2 = vec2(-.809016994, -.587785252);
  p.x = abs(p.x);
  p -= 2.*max(dot(k1, p), 0.)*k1;
  p -= 2.*max(dot(k2, p), 0.)*k2;
  p.x = abs(p.x);
  p.y -= .92;
  vec2 ba = .46*vec2(-k1.y, k1.x) - vec2(0., 1.);
  float h = clamp(dot(p, ba)/dot(ba, ba), 0., .92);
  return length(p - ba*h)*sign(p.y*ba.x - p.x*ba.y) + .03;
}

float ringSD(vec3 p){
  float t = uTime;
  float shp = max(max(uCat, uStar), uFish);
  float w = uWobble*(1.+uEnergy*1.4)*(1. - .92*shp);   // calmer while it's a recognisable shape
  p += w*.055*sin(p.yzx*2.7 + vec3(t*.9, t*.7, t*1.1));
  float a = atan(p.y, p.x);
  float Rm = w*(.06*sin(3.*a+t*.8) + .045*sin(5.*a-t*1.1+1.3) + .025*sin(8.*a+t*1.7));
  float R = .78 + Rm;
  // reach toward the cursor
  float ml = length(M.xy);
  float ma = atan(M.y, M.x);
  float da = abs(mod(a-ma+3.14159, 6.28318)-3.14159);
  float pullT = uPull*clamp(ml-R, -.32, .42)*exp(-da*da*5.)*.55*smoothstep(1.7,1.,ml)*smoothstep(.08,.3,ml);
  float d2 = length(p.xy) - R - pullT;
  if (uStar > .001) d2 = mix(d2, starD(p.xy) - Rm - pullT*.5, uStar);
  vec2 q = vec2(d2, p.z);
  float tw = .9*sin(2.*a-t*.5) + .5*sin(5.*a+t*.7) + t*.15;
  q = rot(tw)*q;
  float th = uThick*(.8 + .3*sin(4.*a-t*.9) + .15*sin(9.*a+t*1.3))*(1. - .38*shp);  // slimmer so shapes stay crisp
  vec2 ab = vec2(th, th*mix(.34, .7, uMat));   // flat ribbon (pearl) -> fat tube (prism)
  float k0 = length(q/ab), k1 = length(q/(ab*ab));
  return k0*(k0-1.)/k1;
}

float mapL(vec3 p){
  float d;
  float solid = uCat + uFish;                       // the cat and the fish are never on screen together
  if (solid < .001) d = ringSD(p);
  else {
    float c = uCat >= uFish ? catSD(p) : fishSD(p);
    if (solid > .999) d = c;
    else {                                          // one liquid body: the ring draws in and sinks into the shape as it swells out of it
      float g = 1. - .72*solid;
      float rg = ringSD(p/g)*g + smoothstep(.55, 1., solid)*.12;
      d = smin(rg, c + (1. - solid)*.8, .22);
    }
  }
  float r = uDrop*.085*smoothstep(1.55,1.1,length(M.xy));
  if (r > .004) d = smin(d, length(p-M)-r, .24);
  return d;
}
float mapW(vec3 p){ return mapL(toLocal(p))*SC; }

vec3 nrm(vec3 p){
  const vec2 k = vec2(1.,-1.); float e = .0015*SC;
  return normalize(k.xyy*mapW(p+k.xyy*e) + k.yyx*mapW(p+k.yyx*e) + k.yxy*mapW(p+k.yxy*e) + k.xxx*mapW(p+k.xxx*e));
}

// pearl -> copper -> umber -> teal -> blue -> pearl, pearl held longest like the video
vec3 pal(float x){
  x = fract(x);
  vec3 pearl=vec3(.95,.93,.89), copper=vec3(.82,.46,.2), umber=vec3(.34,.16,.08), teal=vec3(.07,.52,.56), blue=vec3(.2,.36,.78);
  vec3 c = pearl;
  c = mix(c, copper, smoothstep(.30,.42,x));
  c = mix(c, umber,  smoothstep(.44,.53,x));
  c = mix(c, teal,   smoothstep(.55,.65,x));
  c = mix(c, blue,   smoothstep(.67,.75,x));
  c = mix(c, pearl,  smoothstep(.78,.92,x));
  return c;
}
vec3 hue(vec3 c, float a){ const vec3 k=vec3(.57735); float ca=cos(a); return c*ca + cross(k,c)*sin(a) + k*dot(k,c)*(1.-ca); }

vec3 pearl(vec3 p, vec3 rd, vec3 n){
  vec3 v = -rd; float ndv = max(dot(n,v), 0.);
  vec3 q = toLocal(p); float t = uTime;
  float fn = .5*sin(q.x*8.+t*.6+1.5*sin(q.y*5.-t*.4)) + .3*sin(q.y*11.-t*.5+q.z*7.) + .2*sin(q.z*15.+q.x*6.+t*.8);
  float film = .16 + .42*fn + .34*(1.-ndv) + uShift;           // view-angle dependent: the thin-film shimmer
  vec3 base = clamp(hue(pal(film), uHue), 0., 1.);
  vec3 L = normalize(vec3(-.4,.6,.7));
  float dif = max(dot(n,L), 0.);
  vec3 r = reflect(rd, n);
  float s1 = pow(max(dot(r,L),0.), 42.);
  float s2 = pow(max(dot(r,normalize(vec3(.6,-.3,.75))),0.), 14.);
  float fres = pow(1.-ndv, 3.);
  vec3 col = base*(.30 + .74*dif);
  // soft studio environment: a wide top softbox and a thin side strip
  float box = smoothstep(.35,.9,r.y)*smoothstep(-.2,.5,r.z);
  float strip = smoothstep(.93,.99,dot(r, normalize(vec3(-.9,.1,.4))));
  col += vec3(.95,.97,1.)*(box*.35 + strip*.6)*(.35+.65*fres);
  // iridescent rim: the film colour shifts again at grazing angles
  col += clamp(hue(pal(film+.45), uHue+.6), 0., 1.)*pow(1.-ndv, 2.2)*.42;
  col = mix(col, vec3(.96,.95,.93), fres*.32);
  col += vec3(1.)*s1*1.6 + vec3(.88,.94,1.)*s2*.4;
  return col;
}

// ---- prism: clear glass tube, sharp studio light bars, spectral dispersion at their edges ----
// Monochrome studio: long horizontal light bars (they read as streaks running along the tube),
// a big overhead softbox and a thin key strip, on black.
float studio(vec3 r){
  float ph = uTime*.22;
  float y = r.y*1.6 + .28*sin(r.x*2.2 + ph) + .14*sin(r.z*3.4 - ph*1.3) + uShift*2.;
  // the fish's broad flat side mirrors a hard bar edge as one straight line that reads like a cut, so soften the bars for it
  float bars = smoothstep(.4 - .3*uFish, .5 + .3*uFish, abs(sin(y*2.6))) + .4*(1. - .7*uFish)*smoothstep(.9 - .2*uFish, .94, abs(sin(y*7.3 + 1.3)));
  float soft = smoothstep(.3, .95, r.y)*.22;
  float key  = smoothstep(.9, .975, dot(r, normalize(vec3(-.85, .25, .45))))*1.4;
  return bars*(.35 + .65*smoothstep(-.9, .3, r.y)) + soft + key;
}
vec3 spectrum(float x){ return clamp(abs(mod(x*6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.); }  // red -> violet
vec3 prism(vec3 p, vec3 rd, vec3 n){
  vec3 v = -rd; float ndv = max(dot(n,v), 0.);
  float fr = pow(1.-ndv, 3.);
  float F = mix(.18, 1., fr);                       // glass fresnel, pushed up so it reads chrome-bright
  vec3 acc = vec3(0.), ws = vec3(0.);
  for (int i = 0; i < 7; i++) {
    float x = float(i)/6.;
    vec3 w = spectrum(x*.82);
    float k = (x - .5)*uDisp;                        // each wavelength bends a little differently
    vec3 rr = reflect(rd, n); rr.y += k*.42*(.35 + fr); rr = normalize(rr);
    vec3 rt = refract(rd, n, 1./(1.38 + k*.3));
    float e = mix(studio(rt)*.38, studio(rr)*1.6, F);
    acc += w*e; ws += w;
  }
  vec3 col = acc/ws;
  // thin-film sheen at grazing angles: saturated, not pastel
  vec3 q = toLocal(p);
  float fn = .5*sin(q.x*6. + uTime*.5 + 1.2*sin(q.y*4. - uTime*.3)) + .3*sin(q.y*9. + q.z*6. - uTime*.4);
  col += spectrum(fract(fn*.5 + (1.-ndv)*1.3 + uShift))*pow(1.-ndv, 2.2)*.35*(.2 + col)*(1.2 - .5*min(col, 1.));
  float l = dot(col, vec3(.299, .587, .114));
  col = max(mix(vec3(l), col, mix(1.75, 1., smoothstep(.75, 1.3, l))), 0.);   // pop the fringes, keep bright bar cores white
  col = pow(col, vec3(1.3))*1.25;                  // deeper blacks, brighter peaks
  return hue(col, uHue);
}

vec3 shade(vec3 p, vec3 rd){
  vec3 n = nrm(p);
  vec3 col = uMat < .01 ? pearl(p, rd, n) : uMat > .99 ? prism(p, rd, n) : mix(pearl(p, rd, n), prism(p, rd, n), uMat);
  return col/(1.+col*.18)*1.12;   // gentle shoulder so highlights don't clip flat
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  SC = uState.x; OFF = vec3(uState.yz, 0.);
  M = toLocal(vec3(uMouse, 0.));
  vec3 ro = vec3(0.,0.,CAMZ), rd = normalize(vec3(uv, -FOC));
  vec3 col = vec3(0.);
  vec3 oc = ro-OFF; float br = (1.3 + .4*uFish)*SC + .05;   // the fish is longer than the ring and the cat
  float b = dot(oc,rd), c = dot(oc,oc)-br*br, h = b*b-c;
  if (h > 0.) {
    h = sqrt(h); float t = max(-b-h, 0.), tmax = -b+h;
    float dmin = 1e3, tmin = t; bool hit = false;
    for (int i=0; i<90; i++) {
      vec3 p = ro + rd*t;
      float d = mapW(p);
      if (d < dmin) { dmin = d; tmin = t; }
      if (d < .0011*t) { hit = true; break; }
      t += d*.68;
      if (t > tmax) break;
    }
    float px = tmin/(FOC*uRes.y);                 // one pixel, in world units, at the closest approach
    float cover = hit ? 1. : 1.-smoothstep(0., px*1.6, dmin);
    if (cover > 0.) col = shade(ro + rd*(hit ? t : tmin), rd)*cover;   // anti-aliased silhouette
    // faint coloured haze hugging the ring, so it sits in space instead of on flat black
    vec3 haze = mix(clamp(hue(pal(.4), uHue), 0., 1.), vec3(.55,.6,.75), uMat)*.16*exp(-dmin*7./SC)*smoothstep(.34*SC, .1*SC, dmin);
    col += haze*(1.-cover)*(1.+uEnergy);
  }
  col += (hash(gl_FragCoord.xy + fract(uTime*7.)*91.) - .5)*.03;  // film grain
  gl_FragColor = vec4(max(col, 0.), 1.);
}`;
