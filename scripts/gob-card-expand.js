/* Gobierno Abierto — tarjetas expandibles (Finanzas Públicas / Seguridad Ciudadana).
   Al abrir, calcula cuánto espacio hay arriba y abajo de la tarjeta dentro del
   slider (.gob-viewport) y expone --exp-up / --exp-down para que el CSS
   haga crecer el panel hacia ambos lados. */
(function () {
  'use strict';

  var MARGIN = 16; // aire entre el panel expandido y el borde del slider
  var cards = document.querySelectorAll('.gob-card--expandable');
  if (!cards.length) return;

  // Altura natural del panel: padding + título + gap + botones (sin depender del alto de la tarjeta)
  function naturalHeight(panel) {
    var cs = getComputedStyle(panel);
    var title = panel.querySelector('h4');
    var list = panel.querySelector('.gob-panel-list');
    var items = list ? list.children : [];
    var gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    var listH = 0;
    for (var i = 0; i < items.length; i++) listH += items[i].offsetHeight;
    listH += gap * Math.max(0, items.length - 1);
    var panelGap = parseFloat(cs.rowGap) || 0;
    return parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) +
      (title ? title.offsetHeight : 0) + panelGap + listH;
  }

  function measure(card) {
    var viewport = card.closest('.gob-viewport');
    var panel = card.querySelector('.gob-card-panel');
    if (!viewport || !panel) return;
    var v = viewport.getBoundingClientRect();
    var c = card.getBoundingClientRect();
    var availUp = Math.max(0, c.top - v.top - MARGIN);
    var availDown = Math.max(0, v.bottom - c.bottom - MARGIN);
    // Alto objetivo = contenido, nunca menor que la tarjeta ni mayor que el slider
    var target = Math.max(c.height, Math.min(naturalHeight(panel), c.height + availUp + availDown));
    var extra = target - c.height;
    // Crece parejo hacia arriba y abajo; si un lado no alcanza, el resto va al otro
    var up = Math.min(availUp, extra / 2);
    var down = Math.min(availDown, extra - up);
    up = Math.min(availUp, extra - down);
    card.style.setProperty('--exp-up', up + 'px');
    card.style.setProperty('--exp-down', down + 'px');
  }

  function open(card) {
    cards.forEach(function (other) { if (other !== card) close(other); });
    measure(card);
    card.classList.add('is-expanded');
    var btn = card.querySelector('[data-expand-open]');
    var panel = card.querySelector('.gob-card-panel');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (panel) panel.setAttribute('aria-hidden', 'false');
    var closeBtn = card.querySelector('.gob-card-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close(card, restoreFocus) {
    if (!card.classList.contains('is-expanded')) return;
    card.classList.remove('is-expanded');
    var btn = card.querySelector('[data-expand-open]');
    var panel = card.querySelector('.gob-card-panel');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      if (restoreFocus) btn.focus({ preventScroll: true });
    }
    if (panel) panel.setAttribute('aria-hidden', 'true');
  }

  cards.forEach(function (card) {
    var openBtn = card.querySelector('[data-expand-open]');
    var closeBtn = card.querySelector('.gob-card-close');
    if (openBtn) openBtn.addEventListener('click', function () { open(card); });
    if (closeBtn) closeBtn.addEventListener('click', function () { close(card, true); });
  });

  // Escape cierra la tarjeta abierta
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    cards.forEach(function (card) { close(card, true); });
  });

  // Al cambiar de slide con los iconos, se cierran para no quedar abiertas fuera de vista
  document.querySelectorAll('.gob-icon').forEach(function (icon) {
    icon.addEventListener('click', function () { cards.forEach(function (c) { close(c); }); });
  });

  // Recalcula si cambia el tamaño de la ventana mientras está abierta
  window.addEventListener('resize', function () {
    cards.forEach(function (card) {
      if (card.classList.contains('is-expanded')) measure(card);
    });
  });
})();