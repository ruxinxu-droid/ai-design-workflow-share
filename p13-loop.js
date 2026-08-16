(() => {
  const root = document.querySelector('#cycleWorkflow');
  if (!root) return;
  const path = root.querySelector('#cycleSignalPath');
  const runner = root.querySelector('#cycleRunner');
  const halo = root.querySelector('#cycleRunnerHalo');
  const nodes = [...root.querySelectorAll('[data-cycle-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 10000;
  const phases = [0, .25, .5, .75];
  let progress = 0;
  let last = 0;
  let visible = false;
  let held = false;
  let active = -1;

  const setActive = index => {
    if (index === active) return;
    active = index;
    root.dataset.active = String(index);
    nodes.forEach((node, nodeIndex) => node.classList.toggle('is-active', nodeIndex === index));
  };
  const render = value => {
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * value);
    runner.setAttribute('cx', point.x);
    runner.setAttribute('cy', point.y);
    halo.setAttribute('cx', point.x);
    halo.setAttribute('cy', point.y);
    path.style.strokeDashoffset = String(-length * value * .08);
    setActive(Math.floor(((value + .125) % 1) * 4));
  };
  const frame = time => {
    if (!last) last = time;
    const delta = Math.min(50, time - last);
    last = time;
    if (visible && !held && !reduced) progress = (progress + delta / duration) % 1;
    render(progress);
    requestAnimationFrame(frame);
  };
  nodes.forEach((node, index) => {
    const hold = () => { held = true; progress = phases[index]; render(progress); };
    node.addEventListener('pointerenter', hold);
    node.addEventListener('focus', hold);
    node.addEventListener('click', hold);
    node.addEventListener('pointerleave', () => { held = false; last = 0; });
    node.addEventListener('blur', () => { held = false; last = 0; });
  });
  new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) last = 0;
  }, { threshold: .15 }).observe(root);
  render(0);
  requestAnimationFrame(frame);
})();
