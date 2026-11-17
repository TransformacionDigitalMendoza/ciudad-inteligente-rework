/* Objetivos: en mobile / tablet (<= 992px) las tarjetas arrancan cerradas
   y al tocar una se despliega su texto. En desktop no hace nada. */
(function () {
  var mq = window.matchMedia('(max-width: 992px)');
  var cards = document.querySelectorAll('.objetivo-card');
  if (!cards.length) return;

  function toggle(card) {
    var open = card.classList.toggle('is-open');
    card.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function onClick(e) { toggle(e.currentTarget); }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(e.currentTarget);
    }
  }

  function enable() {
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', onKey);
    });
  }

  function disable() {
    cards.forEach(function (card) {
      card.removeAttribute('role');
      card.removeAttribute('tabindex');
      card.removeAttribute('aria-expanded');
      card.classList.remove('is-open');
      card.removeEventListener('click', onClick);
      card.removeEventListener('keydown', onKey);
    });
  }

  function sync() { mq.matches ? enable() : disable(); }

  sync();
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else mq.addListener(sync);
})();