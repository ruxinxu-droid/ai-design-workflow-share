(() => {
  const button = document.createElement('button');
  button.className = 'presentation-mode';
  button.type = 'button';
  button.setAttribute('aria-label', '切换全屏演讲模式');
  button.innerHTML = '<span class="presentation-mode__icon" aria-hidden="true"></span><span class="presentation-mode__label">全屏演讲</span>';
  const update = () => {
    const active = Boolean(document.fullscreenElement);
    button.classList.toggle('is-active', active);
    button.querySelector('.presentation-mode__label').textContent = active ? '退出全屏' : '全屏演讲';
    button.setAttribute('aria-pressed', String(active));
  };
  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch (_) {}
  };
  button.addEventListener('click', toggle);
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() !== 'f' || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') toggle();
  });
  document.body.appendChild(button);
  update();
})();
