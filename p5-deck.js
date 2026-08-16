(() => {
  const deck = document.querySelector('#p5 .blockout-proof-grid');
  if (!deck) return;

  deck.setAttribute('role', 'button');
  deck.setAttribute('tabindex', '0');
  deck.setAttribute('aria-label', '展开三张白模构图步骤');
  deck.setAttribute('aria-expanded', 'false');

  const expandAndLock = () => {
    if (deck.classList.contains('is-locked')) return;
    deck.classList.add('is-expanded', 'is-locked');
    deck.setAttribute('aria-expanded', 'true');
  };

  deck.addEventListener('pointerenter', expandAndLock, {once:true});
  deck.addEventListener('click', expandAndLock);
  deck.addEventListener('focus', expandAndLock, {once:true});
  deck.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      expandAndLock();
    }
  });
})();
