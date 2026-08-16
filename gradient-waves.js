(() => {
  const container = document.getElementById('gradientWaves');
  if (!container) return;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) {
    container.classList.add('waves-fallback');
    return;
  }

  const vertex = `#version 300 es
  layout(location=0) in vec2 position;
  void main(){gl_Position=vec4(position,0.0,1.0);}`;

  const fragment = `#version 300 es
  precision highp float;
  uniform vec2 iResolution; uniform float iTime;
  uniform float uSpeed,uAmplitude,uWaveScale,uWaveRatio,uSwell,uTurbulence,uTilt,uZoom,uHeight,uFogDepth,uSteps,uBrightness,uOpacity,uGrain,uGrainIntensity,uParallax;
  uniform vec2 uMouse; uniform bool uEnableMouse;
  uniform vec3 uHorizonColor,uWaveColor,uCrestColor;
  out vec4 fragColor; const float MAX_DIST=20000.0;
  float hash21(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
  float plasma(vec3 r,vec2 freq,vec4 tc){float mx=r.x+tc.x;mx+=uSwell*sin((r.y+mx)/20.0+tc.y);float my=r.y-tc.z;my+=uTurbulence*cos(r.x/23.0+tc.w);return r.z-(sin(mx*freq.x)*uAmplitude+sin(my*freq.y)*uAmplitude+uHeight);}
  float raymarch(vec3 pos,vec3 dir,vec2 freq,vec4 tc){float dist=0.0;for(int i=0;i<128;i++){if(float(i)>=uSteps)break;float dscene=plasma(pos+dist*dir,freq,tc);if(abs(dscene)<0.1)break;dist+=0.9*dscene;if(!(abs(dist)<MAX_DIST))return MAX_DIST;}return dist;}
  void main(){
    float T=iTime*uSpeed;vec2 freq=vec2(uWaveScale/7.0,(uWaveScale*uWaveRatio)/3.0);vec4 tc=vec4(T/0.130,T/0.810,T/0.200,T/0.710);float c,s;
    float vfov=(3.14159/2.3)/max(uZoom,0.05);vec3 cam=vec3(0.0,0.0,30.0);vec2 uv=(gl_FragCoord.xy/iResolution.xy)-0.5;uv.x*=iResolution.x/iResolution.y;uv.y*=-1.0;
    vec3 dir=vec3(0.0,0.0,-1.0);float ulen=length(uv);float xrot=vfov*ulen;c=cos(xrot);s=sin(xrot);dir=mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c)*dir;
    vec2 nuv=ulen>1e-5?uv/ulen:vec2(1.0,0.0);c=nuv.x;s=nuv.y;dir=mat3(c,-s,0.0,s,c,0.0,0.0,0.0,1.0)*dir;c=cos(uTilt);s=sin(uTilt);dir=mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c)*dir;
    if(uEnableMouse){float yaw=(uMouse.x-0.5)*uParallax*0.4;float pitch=(uMouse.y-0.5)*uParallax*0.4;c=cos(yaw);s=sin(yaw);dir=mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c)*dir;c=cos(pitch);s=sin(pitch);dir=mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c)*dir;}
    float dist=raymarch(cam,dir,freq,tc);vec3 pos=cam+dist*dir;float t=clamp(uFogDepth/max(dist,0.001),0.0,1.0);vec3 body=mix(uWaveColor,uCrestColor,clamp(pos.z*0.08+0.5,0.0,1.0));vec3 col=mix(uHorizonColor,body,t);col=clamp(col*uBrightness,0.0,1.0);
    float alpha=clamp(t,0.0,1.0)*uOpacity;if(uGrain>0.5){float g=hash21(gl_FragCoord.xy+mod(iTime,64.0)*11.0);alpha+=(g-0.5)*uGrainIntensity;}alpha=clamp(alpha,0.0,1.0);fragColor=vec4(col*alpha,alpha);
  }`;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  try {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);

    const positions = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0,0,0,0);

    const loc = name => gl.getUniformLocation(program, name);
    const u = {resolution:loc('iResolution'),time:loc('iTime'),mouse:loc('uMouse')};
    const set1 = (name,value) => gl.uniform1f(loc(name),value);
    const set3 = (name,hex) => {const value=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255);gl.uniform3fv(loc(name),value);};
    set1('uSpeed',.24);set1('uAmplitude',2.4);set1('uWaveScale',.56);set1('uWaveRatio',.9);set1('uSwell',34);set1('uTurbulence',18);set1('uTilt',1.11);set1('uZoom',1);set1('uHeight',5.5);set1('uFogDepth',28);set1('uSteps',70);set1('uBrightness',1.08);set1('uOpacity',1);set1('uGrain',1);set1('uGrainIntensity',.035);set1('uParallax',.38);
    gl.uniform1i(loc('uEnableMouse'),1);set3('uHorizonColor','#050505');set3('uWaveColor','#181818');set3('uCrestColor','#ff4d00');
    container.appendChild(canvas);

    const pointer=[.5,.5], target=[.5,.5];
    const onMove=e=>{const r=container.getBoundingClientRect();target[0]=(e.clientX-r.left)/r.width;target[1]=1-(e.clientY-r.top)/r.height;};
    const onLeave=()=>{target[0]=target[1]=.5;};
    window.addEventListener('pointermove',onMove,{passive:true}); container.addEventListener('pointerleave',onLeave);

    let width=0,height=0,raf=0,visible=true,pageVisible=!document.hidden;
    const resize=()=>{const r=container.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);const w=Math.max(1,Math.floor(r.width*dpr)),h=Math.max(1,Math.floor(r.height*dpr));if(w!==width||h!==height){width=canvas.width=w;height=canvas.height=h;canvas.style.width=`${r.width}px`;canvas.style.height=`${r.height}px`;gl.viewport(0,0,w,h);gl.uniform2f(u.resolution,w,h);}};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||window.__PRESENTATION_MOTION_PAUSED__===true,start=performance.now();
    const render=t=>{resize();pointer[0]+=.045*(target[0]-pointer[0]);pointer[1]+=.045*(target[1]-pointer[1]);gl.uniform1f(u.time,(t-start)*.001);gl.uniform2f(u.mouse,pointer[0],pointer[1]);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);raf=requestAnimationFrame(render);};
    const play=()=>{if(!reduced&&visible&&pageVisible&&!raf)raf=requestAnimationFrame(render);};
    const pause=()=>{if(raf){cancelAnimationFrame(raf);raf=0;}};
    new ResizeObserver(()=>{resize();if(reduced){gl.uniform1f(u.time,0);gl.uniform2f(u.mouse,.5,.5);gl.drawArrays(gl.TRIANGLES,0,3);}}).observe(container);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?play():pause();}).observe(container);
    document.addEventListener('visibilitychange',()=>{pageVisible=!document.hidden;pageVisible?play():pause();});
    const hero = document.getElementById('p1');
    const heroState = new IntersectionObserver(([entry]) => document.documentElement.classList.toggle('hero-active', entry.isIntersecting && entry.intersectionRatio > .2), { threshold: [.2, .35] });
    if (hero) heroState.observe(hero);
    resize(); if(reduced){gl.uniform1f(u.time,0);gl.uniform2f(u.mouse,.5,.5);gl.drawArrays(gl.TRIANGLES,0,3);}else play();
  } catch (error) {
    console.warn('GradientWaves fallback:', error);
    container.classList.add('waves-fallback');
    canvas.remove();
  }
})();
