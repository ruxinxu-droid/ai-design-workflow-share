(() => {
  const section = document.querySelector('#p14');
  const canvas = document.querySelector('#finaleAmbient');
  if (!section || !canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let raf = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const resize = () => {
    const rect = section.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
  };

  const draw = time => {
    raf = 0;
    context.clearRect(0,0,width,height);
    const t = reduced.matches ? 0 : time * .000055;
    const cx = width * .77;
    const cy = height * .5;
    const radius = Math.min(width,height) * .43;

    context.lineWidth = 1;
    [1,.72,.46].forEach((scale,index) => {
      context.beginPath();
      context.ellipse(cx,cy,radius*scale,radius*scale*.78,t*(index%2?-.32:.22),0,Math.PI*2);
      context.strokeStyle = `rgba(255,78,0,${[.15,.1,.07][index]})`;
      context.stroke();
    });

    const angle = t * 4.4;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius * .78;
    const glow = context.createRadialGradient(px,py,0,px,py,28);
    glow.addColorStop(0,'rgba(255,126,61,.9)');
    glow.addColorStop(.16,'rgba(255,78,0,.48)');
    glow.addColorStop(1,'rgba(255,78,0,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(px,py,28,0,Math.PI*2);
    context.fill();

    if (visible && !document.hidden && !reduced.matches) raf = requestAnimationFrame(draw);
  };

  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw); };
  new ResizeObserver(() => { resize(); draw(performance.now()); }).observe(section);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  },{threshold:.03}).observe(section);
  document.addEventListener('visibilitychange',start);
  reduced.addEventListener('change',() => draw(performance.now()));
  resize();
  draw(performance.now());
})();
