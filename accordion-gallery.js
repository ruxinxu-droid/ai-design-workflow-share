(() => {
  const root = document.querySelector('#afterAccordion');
  if (!root || !window.gsap) return;
  const items = [
    { image: 'after-accordion-01.jpg', alt: 'AI 提效后方案 1' },
    { image: 'after-accordion-02.jpg', alt: 'AI 提效后方案 2' },
    { image: 'after-accordion-03.jpg', alt: 'AI 提效后方案 3' },
    { image: 'after-accordion-04.jpg', alt: 'AI 提效后方案 4' },
    { image: 'p2-after-accordion-05.jpg', alt: 'AI 提效后方案 5' }
  ];
  const config = { defaultIndex: 2, duration: .72, ease: 'power3.out', parallax: .45, tilt: 5, gap: 7, collapsedMin: 34 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = config.defaultIndex;
  let firstRun = true;
  let timeline;
  let mediaSize = 420;

  root.innerHTML = items.map((item, index) => `<div class="ag-panel${index === active ? ' ag-panel--active' : ''}" role="listitem" tabindex="0" aria-current="${index === active ? 'true' : 'false'}" aria-label="${item.alt}"><span class="ag-panel__frame"><span class="ag-panel__media"><img src="./assets/${item.image}" alt="${item.alt}" draggable="false"></span></span></div>`).join('');
  const panels = [...root.querySelectorAll('.ag-panel')];
  const media = [...root.querySelectorAll('.ag-panel__media')];

  const applyLayout = animate => {
    const count = panels.length;
    const usable = Math.max(root.clientWidth - config.gap * (count - 1), 120);
    const idealActiveWidth = root.clientHeight * .75;
    const activeWidth = Math.min(idealActiveWidth, Math.max(usable - config.collapsedMin * (count - 1), 120));
    const collapsedWidth = count > 1 ? Math.max((usable - activeWidth) / (count - 1), 1) : activeWidth;
    mediaSize = activeWidth;
    root.style.setProperty('--ag-media-size', `${mediaSize}px`);
    timeline?.kill();
    const duration = animate && !reduced ? config.duration : 0;
    timeline = gsap.timeline();
    panels.forEach((panel, index) => {
      const isActive = index === active;
      const rotation = isActive ? 0 : index < active ? config.tilt : -config.tilt;
      panel.classList.toggle('ag-panel--active', isActive);
      panel.setAttribute('aria-current', String(isActive));
      const panelWidth = isActive ? activeWidth : collapsedWidth;
      timeline.to(panel, { flexBasis: panelWidth, width: panelWidth, rotateY: rotation, duration, ease: config.ease }, 0);
      const drift = Math.max(-1.5, Math.min(1.5, active - index));
      const shift = drift * config.parallax * mediaSize * .06;
      timeline.to(media[index], { xPercent: -50, yPercent: -50, x: isActive ? 0 : shift, duration, ease: config.ease }, 0);
    });
    firstRun = false;
  };
  const measure = () => {
    applyLayout(!firstRun);
  };
  const setActive = index => { if (index === active) return; active = index; applyLayout(true); };
  panels.forEach((panel, index) => {
    panel.addEventListener('mouseenter', () => setActive(index));
    panel.addEventListener('click', () => setActive(index));
    panel.addEventListener('focus', () => setActive(index));
    panel.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setActive((index + 1) % panels.length); panels[(index + 1) % panels.length].focus(); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setActive((index - 1 + panels.length) % panels.length); panels[(index - 1 + panels.length) % panels.length].focus(); }
    });
  });
  new ResizeObserver(measure).observe(root);
  measure();
})();
