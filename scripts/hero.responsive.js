/* ==========================================================
   hero.responsive.js
   Hero móvil (section#hero). Hasta que la persona toca
   "Conocé nuestro trabajo" la página queda bloqueada: no se
   puede hacer scroll y el resto del contenido (nav, secciones,
   footer) queda fuera del foco del teclado y de los lectores
   de pantalla. Cuando termina la animación de la tarjeta, se
   libera todo.

   - No depende del ancho: el modo móvil se detecta porque
     #hero se muestra (display distinto de none). En escritorio
     no bloquea nada y los scripts del hero de scroll siguen igual.
   - Necesita en responsive.css las clases de la tarjeta:
     .card (con transición en left/top/width/height) y .card.is-open.
   ========================================================== */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var card = document.getElementById('card');
  var openBtn = document.getElementById('openBtn');
  var closeBtn = document.getElementById('closeBtn');
  var title = document.getElementById('revealTitle');
  var video = document.getElementById('heroVideo');
  var word = document.getElementById('heroWord');   // "Ciudad": va fuera de la tarjeta
  if (!hero || !card || !openBtn) return;

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var locked = false;   // la página está bloqueada ahora
  var opened = false;   // la persona ya abrió la tarjeta: la página queda libre
  var busy = false;     // hay una animación en curso
  var wasMobile = null;
  var inerted = [];
  var saved = {};

  /* ---------- Detección del modo móvil ---------- */
  function isMobileHero() {
    return window.getComputedStyle(hero).display !== 'none';
  }

  /* ---------- Bloqueo / liberación de la página ---------- */
  function lock() {
    if (locked) return;
    locked = true;

    saved = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      rootOverscroll: root.style.overscrollBehavior
    };
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';
    root.classList.add('hero-locked');

    // Todo lo que viene después del hero queda fuera de foco y de lectores de pantalla
    inerted = [];
    Array.prototype.forEach.call(body.children, function (el) {
      if (el === hero || el.contains(hero) || el.tagName === 'SCRIPT') return;
      if (!el.inert) {
        el.inert = true;
        inerted.push(el);
      }
    });
  }

  function unlock() {
    if (!locked) return;
    locked = false;

    root.style.overflow = saved.rootOverflow || '';
    body.style.overflow = saved.bodyOverflow || '';
    root.style.overscrollBehavior = saved.rootOverscroll || '';
    root.classList.remove('hero-locked');

    inerted.forEach(function (el) { el.inert = false; });
    inerted = [];
  }

  // iOS antiguo ignora overflow:hidden en el body: se corta también el gesto
  document.addEventListener('touchmove', function (e) {
    if (locked) e.preventDefault();
  }, { passive: false });

  function toTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  }

  /* ---------- Animación de la tarjeta ---------- */
  function transitionMs() {
    var list = window.getComputedStyle(card).transitionDuration.split(',');
    var max = 0;
    list.forEach(function (t) { max = Math.max(max, parseFloat(t) || 0); });
    return max * 1000;
  }

  function whenDone(cb) {
    var finished = false;
    var timer;
    function finish() {
      if (finished) return;
      finished = true;
      card.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      cb();
    }
    function onEnd(e) {
      if (e.target === card && e.propertyName === 'height') finish();
    }
    card.addEventListener('transitionend', onEnd);
    timer = setTimeout(finish, transitionMs() + 250);
  }

  function measure() {
    return { l: card.offsetLeft, t: card.offsetTop, w: card.offsetWidth, h: card.offsetHeight };
  }

  // Con box fija la tarjeta en px (punto de partida/llegada de la transición); sin box limpia
  function setBox(box) {
    card.style.left = box ? box.l + 'px' : '';
    card.style.top = box ? box.t + 'px' : '';
    card.style.width = box ? box.w + 'px' : '';
    card.style.height = box ? box.h + 'px' : '';
    card.style.bottom = box ? 'auto' : '';
  }

  // Ubica "Ciudad" justo encima de la tarjeta cerrada, alineada con su texto.
  // Solo se recalcula en reposo: mientras la tarjeta se anima la palabra queda
  // quieta y la tarjeta la cubre al crecer.
  function placeWord() {
    if (!word || busy || card.classList.contains('is-open')) return;
    var intro = card.querySelector('.card__intro');
    var pad = intro ? parseFloat(window.getComputedStyle(intro).paddingLeft) || 0 : 0;
    // Misma tipografía que "Inteligente", sin depender de cómo esté definido el h1 en el CSS
    var h1 = card.querySelector('.card__title');
    if (h1) {
      var cs = window.getComputedStyle(h1);
      ['fontFamily', 'fontWeight', 'fontSize', 'fontStretch', 'letterSpacing', 'lineHeight', 'textTransform']
        .forEach(function (prop) { word.style[prop] = cs[prop]; });
    }
    hero.style.setProperty('--word-left', (card.offsetLeft + pad) + 'px');
    hero.style.setProperty('--card-top', card.offsetTop + 'px');
  }

  function open() {
    if (busy || card.classList.contains('is-open')) return;
    busy = true;

    setBox(measure());
    void card.offsetWidth;               // fija el punto de partida
    card.classList.add('is-open');
    setBox(null);
    openBtn.setAttribute('aria-expanded', 'true');

    // La página se libera recién cuando la tarjeta terminó de abrirse
    whenDone(function () {
      busy = false;
      opened = true;
      unlock();
      if (title) title.focus({ preventScroll: true });
    });
  }

  // Abre sin animar (link con #ancla, scroll restaurado al recargar)
  function openInstant() {
    card.style.transition = 'none';
    card.classList.add('is-open');
    void card.offsetWidth;
    card.style.transition = '';
    openBtn.setAttribute('aria-expanded', 'true');
    opened = true;
    unlock();
  }

  function close() {
    if (busy || !card.classList.contains('is-open')) return;
    busy = true;
    opened = false;

    toTop();
    lock();

    // Mide dónde queda la tarjeta cerrada, sin animar
    card.style.transition = 'none';
    card.classList.remove('is-open');
    var target = measure();
    card.classList.add('is-open');
    void card.offsetWidth;
    card.style.transition = '';
    void card.offsetWidth;

    card.classList.remove('is-open');
    setBox(target);
    openBtn.setAttribute('aria-expanded', 'false');

    whenDone(function () {
      setBox(null);
      busy = false;
      placeWord();
      openBtn.focus({ preventScroll: true });
    });
  }

  /* ---------- Cambios de modo (rotar el teléfono, redimensionar) ---------- */
  function sync() {
    var mobile = isMobileHero();
    if (mobile === wasMobile) return;
    wasMobile = mobile;

    if (!mobile) {
      unlock();                          // escritorio: no se bloquea nada
    } else if (opened) {
      if (!card.classList.contains('is-open')) openInstant();
    } else {
      lock();
    }
  }

  // ¿La persona llegó con un #ancla a otra sección?
  function hasAnchorOutsideHero() {
    if (!window.location.hash) return false;
    var target;
    try {
      target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch (err) {
      return false;
    }
    return !!target && !hero.contains(target);
  }

  // El navegador puede restaurar el scroll después de cargar: en ese caso ya vio el hero
  function restoredScroll() {
    if (isMobileHero() && !opened && window.scrollY > 8) openInstant();
  }

  /* ---------- Eventos ---------- */
  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);
  window.addEventListener('hashchange', function () {
    if (isMobileHero() && !opened && hasAnchorOutsideHero()) openInstant();
  });
  window.addEventListener('load', restoredScroll);
  window.addEventListener('pageshow', function (e) { if (e.persisted) restoredScroll(); });

  /* ---------- Inicio ---------- */
  if (video) {
    if (reduceMotion.matches) {
      video.pause();
    } else if (video.play) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  if (word) {
    if (window.ResizeObserver) new ResizeObserver(placeWord).observe(card);
    window.addEventListener('resize', placeWord);
    window.addEventListener('load', placeWord);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeWord);
    placeWord();
  }

  wasMobile = isMobileHero();
  if (wasMobile) {
    if (hasAnchorOutsideHero() || window.scrollY > 8) openInstant();
    else lock();
  }
})();