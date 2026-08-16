(() => {
  const root = document.querySelector('#workflowStepper');
  if (!root) return;
  const controls = [...root.querySelectorAll('[data-workflow-step]')];
  const panels = [...root.querySelectorAll('[data-workflow-panel]')];
  const connectors = [...root.querySelectorAll('.workflow-stepper__rail i')];
  const back = root.querySelector('[data-workflow-back]');
  const next = root.querySelector('[data-workflow-next]');
  const counter = root.querySelector('[data-workflow-current]');
  const problems = document.querySelector('#p4 .p4-problems');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 1;
  let transitionTimer;
  let problemTimer;

  const update = target => {
    target = Math.max(1, Math.min(panels.length, target));
    if (target === current) return;
    clearTimeout(transitionTimer);
    const direction = target > current ? 1 : -1;
    const outgoing = panels[current - 1];
    const incoming = panels[target - 1];
    panels.forEach(panel => {
      if (panel === outgoing || panel === incoming) return;
      panel.hidden = true;
      panel.classList.remove('is-active', 'is-entering-left', 'is-leaving-left', 'is-leaving-right');
    });
    outgoing.classList.remove('is-active', 'is-entering-left');
    outgoing.classList.add(direction > 0 ? 'is-leaving-left' : 'is-leaving-right');
    incoming.hidden = false;
    incoming.classList.remove('is-leaving-left', 'is-leaving-right');
    if (direction < 0) incoming.classList.add('is-entering-left');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      incoming.classList.remove('is-entering-left');
      incoming.classList.add('is-active');
    }));
    const previous = current;
    current = target;
    clearTimeout(problemTimer);
    if (current === panels.length) {
      problemTimer = setTimeout(() => problems?.classList.add('is-revealed'), reduced ? 0 : 460);
    } else {
      problems?.classList.remove('is-revealed');
    }
    root.dataset.current = String(current);
    controls.forEach((control, index) => {
      const step = index + 1;
      control.classList.toggle('is-active', step === current);
      control.classList.toggle('is-complete', step < current);
      if (step === current) control.setAttribute('aria-current', 'step');
      else control.removeAttribute('aria-current');
    });
    connectors.forEach((connector, index) => connector.classList.toggle('is-complete', index < current - 1));
    counter.textContent = String(current).padStart(2, '0');
    back.disabled = current === 1;
    next.textContent = current === panels.length ? '重新查看 ↺' : '下一步 →';
    transitionTimer = setTimeout(() => {
      outgoing.hidden = true;
      outgoing.classList.remove('is-leaving-left', 'is-leaving-right');
      incoming.classList.remove('is-entering-left');
    }, reduced ? 0 : 430);
    root.dispatchEvent(new CustomEvent('workflowstepchange', { detail: { previous, current } }));
  };

  controls.forEach((control, index) => control.addEventListener('click', () => update(index + 1)));
  back.addEventListener('click', () => update(current - 1));
  next.addEventListener('click', () => update(current === panels.length ? 1 : current + 1));
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); update(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); update(current - 1); }
  });
})();
