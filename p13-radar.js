(() => {
  const section = document.querySelector('#p13');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'p13-radar';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });
  if (!gl) {
    section.classList.add('radar-fallback');
    return;
  }

  const vertex = `#version 300 es
    in vec2 position;
    void main(){gl_Position=vec4(position,0.,1.);}`;

  /* Adapted from the supplied React Bits Radar fragment shader. */
  const fragment = `#version 300 es
    precision highp float;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uTime;
    out vec4 fragColor;
    #define TAU 6.28318530718
    void main(){
      vec2 st=gl_FragCoord.xy/uResolution.xy;
      st=st*2.-1.;
      st.x*=uResolution.x/uResolution.y;
      vec2 mouseShift=uMouse*2.-1.;
      mouseShift.x*=uResolution.x/uResolution.y;
      st-=mouseShift*.075;
      st*=.84;

      float dist=length(st);
      float theta=atan(st.y,st.x);
      float t=uTime*.34;

      float ringPhase=dist*4.-t*.12;
      float ringDist=abs(fract(ringPhase)-.5);
      float rings=1.-smoothstep(0.,.026,ringDist);

      float spokeAngle=abs(fract(theta*8./TAU+.5)-.5)*TAU/8.;
      float spokes=(1.-smoothstep(0.,.007,spokeAngle*dist))*smoothstep(.04,.14,dist);

      float sweepAngle=fract((theta+t)/TAU+.5);
      float sweep=pow(max(1.-sweepAngle,0.),8.5);
      float beam=1.-smoothstep(0.,.018,abs(sweepAngle));
      sweep=max(sweep*.72,beam);

      float edge=smoothstep(1.08,.78,dist)*pow(max(1.-dist,0.),1.35);
      float intensity=max((rings*.34+spokes*.2+sweep)*edge,0.);
      vec3 orange=vec3(1.,.255,.015);
      vec3 hot=vec3(1.,.52,.22);
      vec3 color=mix(orange,hot,smoothstep(.45,1.,intensity))*intensity;
      float alpha=clamp(intensity*.82,0.,.82);
      fragColor=vec4(color,alpha);
    }`;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Page 13 radar shader:', gl.getShaderInfoLog(shader));
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

  const resolution = gl.getUniformLocation(program, 'uResolution');
  const timeUniform = gl.getUniformLocation(program, 'uTime');
  const mouseUniform = gl.getUniformLocation(program, 'uMouse');
  gl.clearColor(0, 0, 0, 0);

  const target = [.5, .5];
  const mouse = [.5, .5];
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let raf = 0;
  const start = performance.now();

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(section.clientWidth * dpr));
    const height = Math.max(1, Math.round(section.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform2f(resolution, width, height);
  };

  const draw = now => {
    raf = 0;
    resize();
    mouse[0] += (target[0] - mouse[0]) * .045;
    mouse[1] += (target[1] - mouse[1]) * .045;
    gl.uniform1f(timeUniform, reducedQuery.matches ? 0 : (now - start) * .001);
    gl.uniform2f(mouseUniform, mouse[0], mouse[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden && !reducedQuery.matches) raf = requestAnimationFrame(draw);
  };

  const startLoop = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw);
  };

  section.addEventListener('pointermove', event => {
    const rect = section.getBoundingClientRect();
    target[0] = (event.clientX - rect.left) / rect.width;
    target[1] = 1 - (event.clientY - rect.top) / rect.height;
  }, { passive: true });
  section.addEventListener('pointerleave', () => {
    target[0] = .5;
    target[1] = .5;
  });

  new ResizeObserver(() => {
    resize();
    if (reducedQuery.matches) draw(performance.now());
  }).observe(section);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) startLoop();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: .02 }).observe(section);
  document.addEventListener('visibilitychange', startLoop);
  resize();
  draw(performance.now());
})();
