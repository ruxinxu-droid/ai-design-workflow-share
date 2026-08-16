(() => {
  const root = document.querySelector('#p8DriftWall');
  const section = document.querySelector('#p8');
  if (!root || !section) return;

  const config = {
    columns: 3,
    gap: 8,
    speed: 81.6,
    variance: .22
  };

  /* All 16 supplied 3:4 assets, copied into the local project asset library. */
  const images = [
    'drift-wall/promo-01.jpg','drift-wall/promo-02.jpg','drift-wall/promo-03.jpg','drift-wall/promo-04.jpg',
    'drift-wall/promo-05.jpg','drift-wall/promo-06.jpg','drift-wall/promo-07.jpg','drift-wall/promo-08.jpg',
    'drift-wall/promo-09.jpg','drift-wall/promo-10.jpg','drift-wall/promo-11.jpg','drift-wall/promo-12.jpg',
    'drift-wall/promo-13.jpg','drift-wall/promo-14.jpg','drift-wall/promo-15.jpg','drift-wall/promo-16.jpg'
  ];

  /* Deliberately stagger the source order so adjacent columns do not show
     repeated compositions in the same frame, including after a loop wrap. */
  const sourceOrders = [
    [0,3,6,9,12,15,2,5,8,11,14,1,4,7,10,13],
    [5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2],
    [10,13,0,3,6,9,12,15,2,5,8,11,14,1,4,7]
  ];
  const columns = sourceOrders.map(order => order.map(index => images[index]));
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches;
  let visible = false;
  let hoverPaused = false;
  let activeTile = null;
  let raf = 0;
  let lastTs = 0;
  let tracks = [];
  let groupHeights = [];
  let anchors = [];
  let offsets = [0,0,0];
  let velocities = [0,0,0];
  let buildQueued = false;

  root.style.setProperty('--dw-gap', `${config.gap}px`);

  const tileMarkup = (image, columnIndex, copyIndex, imageIndex) =>
    `<div class="drift-wall__tile" data-col="${columnIndex}" data-tile-id="${columnIndex}-${copyIndex}-${imageIndex}" tabindex="0">` +
      `<span class="drift-wall__inner"><img src="./assets/${image}" alt="" loading="eager" decoding="async" draggable="false"></span>` +
    `</div>`;

  const build = () => {
    buildQueued = false;
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (width < 30 || height < 30) return;

    const columnWidth = (width - config.gap * (config.columns - 1)) / config.columns;
    const unit = columnWidth * 4 / 3 + config.gap;
    groupHeights = columns.map(column => column.length * unit);
    const copies = groupHeights.map(groupHeight => Math.max(3, Math.ceil(height / groupHeight) + 3));

    root.innerHTML = `<div class="drift-wall__plane">${columns.map((column, columnIndex) =>
      `<div class="drift-wall__col"><div class="drift-wall__track">${Array.from({length:copies[columnIndex]},(_,copyIndex) =>
        column.map((image,imageIndex) => tileMarkup(image,columnIndex,copyIndex,imageIndex)).join('')
      ).join('')}</div></div>`
    ).join('')}</div>`;

    tracks = [...root.querySelectorAll('.drift-wall__track')];
    anchors = groupHeights.map(groupHeight => groupHeight);

    /* Whole-card phase offsets guarantee all three columns are populated on
       the first frame while keeping their visible image sets different. */
    offsets = [0, unit * 2, unit * 4].map((value,index) => value % groupHeights[index]);
    velocities = [0,0,0];
    tracks.forEach((track,index) => {
      track.style.transform = `translate3d(0,${-(anchors[index] + offsets[index])}px,0)`;
    });
    lastTs = 0;
  };

  const scheduleBuild = () => {
    if (buildQueued) return;
    buildQueued = true;
    requestAnimationFrame(build);
  };

  const baseVelocity = index => {
    const factor = [1, .88, 1.12][index] ?? 1;
    const direction = index === 1 ? -1 : 1;
    return config.speed * factor * direction;
  };

  const animate = timestamp => {
    const dt = lastTs ? Math.min(.05, (timestamp - lastTs) / 1000) : 0;
    lastTs = timestamp;
    if (visible && tracks.length === 3) {
      tracks.forEach((track,index) => {
        const target = reduced || hoverPaused ? 0 : baseVelocity(index);
        const damping = 1 - Math.exp(-dt / (target === 0 ? .12 : .24));
        velocities[index] += (target - velocities[index]) * damping;
        let next = offsets[index] + velocities[index] * dt;
        next = ((next % groupHeights[index]) + groupHeights[index]) % groupHeights[index];
        offsets[index] = next;
        track.style.transform = `translate3d(0,${-(anchors[index] + next)}px,0)`;
      });
    }
    raf = requestAnimationFrame(animate);
  };

  const setActive = tile => {
    if (tile === activeTile) return;
    activeTile?.classList.remove('is-active');
    activeTile = tile;
    activeTile?.classList.add('is-active');
    hoverPaused = Boolean(activeTile);
  };

  root.addEventListener('pointermove', event => setActive(event.target.closest?.('.drift-wall__tile') || null), {passive:true});
  root.addEventListener('pointerleave', () => setActive(null), {passive:true});
  root.addEventListener('focusin', event => setActive(event.target.closest?.('.drift-wall__tile') || null));
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) setActive(null);
  });

  new ResizeObserver(scheduleBuild).observe(root);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastTs = 0;
  }, {threshold:.03}).observe(section);
  reducedQuery.addEventListener('change', event => { reduced = event.matches; });

  build();
  raf = requestAnimationFrame(animate);
})();
