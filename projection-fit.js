(() => {
  const mq = window.matchMedia('(min-width: 901px)');
  const panels = [...document.querySelectorAll('.panel:not(.hero)')];
  const entries = panels.map(panel => {
    const viewport = document.createElement('div');
    viewport.className = 'panel-viewport';
    while (panel.firstChild) viewport.appendChild(panel.firstChild);
    panel.appendChild(viewport);
    return { panel, viewport, lastScale: 1 };
  });

  let raf = 0;
  const fit = () => {
    raf = 0;
    if (!mq.matches) {
      entries.forEach(({ viewport }) => viewport.style.removeProperty('--fit-scale'));
      return;
    }

    const available = Math.max(480, window.innerHeight - 112);
    entries.forEach(entry => {
      const { viewport } = entry;
      viewport.style.setProperty('--fit-scale', '1');
      const naturalHeight = Math.max(viewport.scrollHeight, viewport.getBoundingClientRect().height);
      const scale = Math.min(1, available / Math.max(1, naturalHeight));
      entry.lastScale = scale;
      viewport.style.setProperty('--fit-scale', scale.toFixed(4));
      entry.panel.dataset.fitScale = scale.toFixed(3);
    });
  };

  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  };

  const observer = new ResizeObserver(schedule);
  entries.forEach(({ viewport }) => observer.observe(viewport));
  mq.addEventListener('change', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  document.fonts?.ready.then(schedule);
  schedule();
})();
