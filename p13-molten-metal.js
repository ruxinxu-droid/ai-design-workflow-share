(() => {
  const section = document.querySelector('#p13');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'p13-molten-metal';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance'
  });
  if (!gl) {
    section.classList.add('molten-metal-fallback');
    return;
  }

  const vertex = `#version 300 es
    in vec2 position;
    void main(){gl_Position=vec4(position,0.,1.);}`;
  const fragment = `#version 300 es
    precision highp float;
    uniform vec2 iResolution,uMouse;
    uniform float iTime;
    out vec4 fragColor;
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
      float time=iTime*.24;
      vec2 p=3.7*((gl_FragCoord.xy-.5*iResolution.xy)/iResolution.y)-.5;
      p+=(uMouse-.5)*.22;
      vec2 i=p;
      float c=0.;
      float r=length(p+vec2(sin(time),sin(time*.3+5.))*.5);
      float d=length(p);
      float rot=d+time+p.x*.95;
      float cr=cos(rot);
      mat2 warp=mat2(cos(rot-sin(time/5.)),sin(rot),-sin(cr-time),cr)*-.255;
      for(float n=0.;n<3.;n++){
        p*=warp;
        float t=r-time/(n+3.);
        i-=p+vec2(cos(t-i.x-r)+sin(t+i.y),sin(t-i.y)+cos(t+i.x)+r);
        c+=(1.45*.085)/length(vec2(sin(i.x+t),cos(i.y+t)));
      }
      c/=6.;
      float g=clamp(max(c-.045,0.)*1.08,0.,1.);
      vec3 shadow=vec3(.025,.025,.024);
      vec3 mid=vec3(.63,.145,.035);
      vec3 hot=vec3(1.,.55,.25);
      vec3 col=mix(shadow,mid,smoothstep(0.,.38,g));
      col=mix(col,hot,smoothstep(.38,1.,g));
      float grain=(hash(gl_FragCoord.xy+iTime)-.5)*.035;
      float a=clamp(g+grain,0.,1.)*.58;
      fragColor=vec4(col*a,a);
    }`;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Page 13 molten-metal shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'iResolution');
  const timeUniform = gl.getUniformLocation(program, 'iTime');
  const mouseUniform = gl.getUniformLocation(program, 'uMouse');
  gl.clearColor(0,0,0,0);

  const target = [0.5,0.5];
  const mouse = [0.5,0.5];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let raf = 0;
  let start = performance.now();

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(section.clientWidth*dpr));
    const height = Math.max(1, Math.round(section.clientHeight*dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0,0,width,height);
    }
    gl.uniform2f(resolution,width,height);
  };
  const draw = now => {
    raf = 0;
    resize();
    mouse[0] += (target[0]-mouse[0])*.045;
    mouse[1] += (target[1]-mouse[1])*.045;
    gl.uniform1f(timeUniform,(now-start)*.001);
    gl.uniform2f(mouseUniform,mouse[0],mouse[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,3);
    if (visible && !document.hidden && !reduced) raf=requestAnimationFrame(draw);
  };
  const startLoop = () => {
    if (!raf && visible && !document.hidden) raf=requestAnimationFrame(draw);
  };
  section.addEventListener('pointermove', event => {
    const rect=section.getBoundingClientRect();
    target[0]=(event.clientX-rect.left)/rect.width;
    target[1]=1-(event.clientY-rect.top)/rect.height;
  }, {passive:true});
  section.addEventListener('pointerleave',()=>{target[0]=.5;target[1]=.5});
  new ResizeObserver(()=>{resize();if(reduced)draw(performance.now());}).observe(section);
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible) startLoop();
    else if(raf){cancelAnimationFrame(raf);raf=0;}
  },{threshold:.02}).observe(section);
  document.addEventListener('visibilitychange',startLoop);
  resize();
  draw(performance.now());
})();
