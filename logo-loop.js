(() => {
  const root = document.querySelector('.logoloop');
  if (!root) return;
  const track = root.querySelector('.logoloop__track');
  const sequence = root.querySelector('.logoloop__list');
  if (!track || !sequence) return;

  const SMOOTH_TAU = .25;
  const speed = Number(root.dataset.speed || 120);
  const hoverSpeed = Number(root.dataset.hoverSpeed || 0);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.__PRESENTATION_MOTION_PAUSED__ === true;
  let sequenceWidth = 0;
  let offset = 0;
  let velocity = 0;
  let hovered = false;
  let visible = true;
  let pageVisible = !document.hidden;
  let lastTime = null;
  let raf = 0;
  let resizeRaf = 0;

  const rebuild = () => {
    track.querySelectorAll('.logoloop__list[aria-hidden="true"]').forEach(copy => copy.remove());
    sequenceWidth = Math.ceil(sequence.getBoundingClientRect().width);
    if (!sequenceWidth) return;
    const copies = Math.max(2, Math.ceil(root.clientWidth / sequenceWidth) + 2);
    for (let index = 1; index < copies; index += 1) {
      const copy = sequence.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach(image => image.alt = '');
      track.appendChild(copy);
    }
    offset = ((offset % sequenceWidth) + sequenceWidth) % sequenceWidth;
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  };

  const scheduleRebuild = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(rebuild);
  };

  const tick = time => {
    if (lastTime === null) lastTime = time;
    const delta = Math.min(.064, Math.max(0, time - lastTime) / 1000);
    lastTime = time;
    const target = hovered ? hoverSpeed : speed;
    velocity += (target - velocity) * (1 - Math.exp(-delta / SMOOTH_TAU));
    if (sequenceWidth > 0) {
      offset = ((offset + velocity * delta) % sequenceWidth + sequenceWidth) % sequenceWidth;
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    }
    raf = requestAnimationFrame(tick);
  };

  const play = () => {
    if (!reduced && visible && pageVisible && !raf) {
      lastTime = null;
      raf = requestAnimationFrame(tick);
    }
  };
  const pause = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = null;
  };

  root.addEventListener('pointerenter', () => hovered = true);
  root.addEventListener('pointerleave', () => hovered = false);
  new ResizeObserver(scheduleRebuild).observe(root);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? play() : pause();
  }).observe(root);
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    pageVisible ? play() : pause();
  });

  const images = [...sequence.querySelectorAll('img')];
  Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  }))).then(() => {
    rebuild();
    play();
  });
})();
