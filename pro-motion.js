(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__PRESENTATION_MOTION_PAUSED__ || reduced || !window.gsap || !window.ScrollTrigger) {
    root.classList.add('motion-complete');
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
  root.classList.add('motion-ready');
  root.classList.add('opening-waiting');

  const ease = 'power3.out';
  const softEase = 'power2.out';

  // The presentation starts only after a deliberate click or keyboard action.
  const startButton = document.querySelector('.opening-start');
  const playOpening = () => {
    if (root.classList.contains('opening-started')) return;
    root.classList.add('opening-started');
    startButton?.setAttribute('disabled', '');
    const opening = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        root.classList.add('motion-complete');
        root.classList.remove('opening-waiting');
        document.querySelector('.opening')?.setAttribute('aria-hidden', 'true');
        startButton?.blur();
      }
    });
    opening
      .set('.top', { y: -18, opacity: 0 })
      .set('.hero-line,.hero-team,.hero-tags span,.hero-logo-loop', { y: 24, opacity: 0 })
      .to('.opening-start', { scale: .96, opacity: 0, duration: .24, ease: 'power2.in' }, 0)
      .to('.opening-mark>span,.opening-mark>b', { y: -12, opacity: 0, stagger: .04, duration: .34, ease: 'power2.in' }, .08)
      .to('.opening-slab', { scaleY: 0, stagger: .06, duration: .68 }, .34)
      .to('.top', { y: 0, opacity: 1, duration: .52, ease }, .56)
      .to('.hero-line', { y: 0, opacity: 1, stagger: .08, duration: .64, ease }, .62)
      .to('.hero-team', { y: 0, opacity: 1, duration: .52, ease }, .76)
      .to('.hero-tags span', { y: 0, opacity: 1, stagger: .055, duration: .46, ease }, .84)
      .to('.hero-logo-loop', { y: 0, opacity: 1, duration: .48, ease }, .94);
  };
  startButton?.addEventListener('click', playOpening, { once: true });
  startButton?.focus({ preventScroll: true });

  const groupSelectors = [
    '.hover-steps>*', '.fail-grid>*',
    '.time-lines>*', '.test-slots>*',
    '.scan-notes>*', '.execution-tail>*'
  ];

  document.querySelectorAll('.panel:not(.hero)').forEach((panel) => {
    if (panel.id === 'p13' || panel.id === 'p14') return;
    const viewport = panel.querySelector('.panel-viewport') || panel;
    const header = viewport.querySelector(':scope > header');
    const eyebrow = header?.querySelector('.ref') || viewport.querySelector(':scope > .ref');
    const title = header?.querySelector('h2') || viewport.querySelector(':scope > h2');
    const copy = header?.querySelector('p:not(.ref)') || viewport.querySelector(':scope > p:not(.ref)');
    const intro = [eyebrow, title, copy].filter(Boolean);
    intro.forEach((el) => el.classList.add('motion-reveal-target'));

    const groups = groupSelectors
      .map((selector) => [...panel.querySelectorAll(selector)])
      .filter((items) => items.length);
    groups.flat().forEach((el) => el.classList.add('motion-reveal-target'));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 82%',
        end: 'bottom 18%',
        toggleActions: 'play reverse play reverse',
        invalidateOnRefresh: true
      }
    });
    if (eyebrow) tl.from(eyebrow, { y: 12, opacity: 0, duration: .42, ease });
    if (title) tl.from(title, { y: 30, opacity: 0, duration: .72, ease }, eyebrow ? '-=.22' : 0);
    if (copy) tl.from(copy, { y: 16, opacity: 0, duration: .5, ease: softEase }, '-=.38');
    groups.forEach((items) => {
      tl.from(items, { y: 24, opacity: 0, stagger: .075, duration: .56, ease }, '-=.28');
    });
  });

  // Page 13: title → loop drawing → four anchors. Animate inner surfaces only,
  // so the absolute anchor coordinates can never drift.
  const p13Title = document.querySelector('#p13 header h2');
  const p13Track = document.querySelector('#p13 .cycle-workflow__track');
  const p13Signal = document.querySelector('#p13 .cycle-workflow__signal');
  const p13Nodes = gsap.utils.toArray('#p13 .cycle-node__inner');
  [p13Title, p13Track, p13Signal, ...p13Nodes].filter(Boolean).forEach((el) => el.classList?.add('motion-reveal-target'));
  if (p13Title && p13Track) {
    const pathLength = p13Track.getTotalLength();
    gsap.timeline({
      scrollTrigger: {
        trigger: '#p13',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
        invalidateOnRefresh: true
      }
    })
      .from(p13Title, { y: 26, opacity: 0, duration: .72, ease })
      .fromTo(p13Track,
        { strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: .25 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.05, ease: 'power2.inOut' },
        '-=.36'
      )
      .from(p13Signal, { opacity: 0, duration: .48, ease: softEase }, '-=.34')
      .from(p13Nodes, { y: 14, opacity: 0, stagger: .085, duration: .5, ease }, '-=.3');
  }

  // Page 14: retain the designed horizontal offsets while revealing both lines.
  const p14Lines = gsap.utils.toArray('#p14 .finale-message h2 span');
  const p14Qr = document.querySelector('#p14 .finale-qr');
  [...p14Lines, p14Qr].filter(Boolean).forEach((el) => el.classList.add('motion-reveal-target'));
  if (p14Lines.length) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '#p14',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
        invalidateOnRefresh: true
      }
    })
      .from(p14Lines, { y: 30, opacity: 0, stagger: .12, duration: .76, ease })
      .from(p14Qr, { y: 16, scale: .97, opacity: 0, duration: .52, ease }, '-=.34');
  }

  // Soft media reveal; complex page-specific components keep their own motion.
  document.querySelectorAll('.image-card,.video-placeholder,.logic-grid article,.step-stage').forEach((frame) => {
    frame.classList.add('motion-media-soft');
    gsap.from(frame, {
      y: 20,
      opacity: 0,
      clipPath: 'inset(0 0 9% 0)',
      duration: .8,
      ease,
      scrollTrigger: {
        trigger: frame,
        start: 'top 88%',
        toggleActions: 'play reverse play reverse',
        invalidateOnRefresh: true
      }
    });
    const img = frame.querySelector(':scope > img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: 1.5 }, {
      yPercent: -1.5,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.4,
        invalidateOnRefresh: true
      }
    });
  });

  // Editing pauses global timelines, while CSS guarantees all copy remains visible.
  const syncEditing = () => {
    const editing = root.classList.contains('copy-editing');
    gsap.globalTimeline.paused(editing);
    ScrollTrigger.getAll().forEach((trigger) => editing ? trigger.disable(false) : trigger.enable(false, true));
    if (!editing) ScrollTrigger.refresh();
  };
  new MutationObserver(syncEditing).observe(root, { attributes: true, attributeFilter: ['class'] });

  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
