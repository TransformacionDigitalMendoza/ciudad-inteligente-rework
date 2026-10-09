/* ==========================================================
   GOBIERNO ABIERTO — máscara curva (bloques 2 + 3) y slider
   ========================================================== */
(function () {
  const grid = document.getElementById('gobGrid');
  if (!grid) return;

  const shape = grid.querySelector('.gob-shape');
  const box2 = grid.querySelector('.gob-box2');
  const box3 = grid.querySelector('.gob-box3');
  const viewport = grid.querySelector('.gob-viewport');
  const slides = Array.from(grid.querySelectorAll('.gob-slide'));
  const tabs = Array.from(grid.querySelectorAll('.gob-icon'));
  const label = grid.querySelector('.gob-nav-label');
  const names = tabs.map((t) => t.getAttribute('aria-label'));

  const R = 24; // radio de las esquinas convexas
  const F = 24; // radio de la curva cóncava (unión con el bloque 1)

  /* ---------- Máscara: una sola forma = bloque 2 + bloque 3 ---------- */
  function buildMask() {
    const g = grid.getBoundingClientRect();
    const a = box2.getBoundingClientRect();
    const b = box3.getBoundingClientRect();

    const n = (v) => Math.round(v * 100) / 100;
    const x0 = n(a.left - g.left);
    const y0 = n(a.top - g.top);
    const x1 = n(a.right - g.left);
    const y1 = n(a.bottom - g.top);
    const tx0 = n(b.left - g.left); // borde izquierdo del tab
    const ty0 = n(b.top - g.top); // borde superior del tab

    const d = [
      `M ${tx0} ${ty0 + R}`,
      `A ${R} ${R} 0 0 1 ${tx0 + R} ${ty0}`, // esquina sup. izq. del tab
      `L ${x1 - R} ${ty0}`,
      `A ${R} ${R} 0 0 1 ${x1} ${ty0 + R}`, // esquina sup. der.
      `L ${x1} ${y1 - R}`,
      `A ${R} ${R} 0 0 1 ${x1 - R} ${y1}`, // inf. der.
      `L ${x0 + R} ${y1}`,
      `A ${R} ${R} 0 0 1 ${x0} ${y1 - R}`, // inf. izq.
      `L ${x0} ${y0 + R}`,
      `A ${R} ${R} 0 0 1 ${x0 + R} ${y0}`, // sup. izq. del bloque 2
      `L ${tx0 - F} ${y0}`,
      `A ${F} ${F} 0 0 0 ${tx0} ${y0 - F}`, // curva cóncava hacia el bloque 1
      `L ${tx0} ${ty0 + R}`,
      'Z',
    ].join(' ');

    shape.style.clipPath = `path('${d}')`;
    grid.classList.add('is-ready');
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(buildMask).observe(grid);
  }
  window.addEventListener('resize', buildMask);
  window.addEventListener('load', buildMask);
  buildMask();

  /* ---------- Slider ---------- */
  let current = 0;

  function setActive(i) {
    current = (i + slides.length) % slides.length;
    grid.style.setProperty('--gob-index', current);
    grid.dataset.active = current;

    tabs.forEach((t, k) => {
      const on = k === current;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });

    slides.forEach((s, k) => {
      const on = k === current;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.inert = !on;
    });

    if (label) label.textContent = names[current];
    // La altura de la máscara puede cambiar en mobile
    requestAnimationFrame(buildMask);
  }

  tabs.forEach((t, k) => {
    t.addEventListener('click', () => setActive(k));
    t.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = current + 1;
      else if (e.key === 'ArrowLeft') next = current - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = slides.length - 1;
      if (next === null) return;
      e.preventDefault();
      setActive(next);
      tabs[current].focus();
    });
  });

  // El navegador puede desplazar el viewport al enfocar un elemento: lo mantenemos fijo
  viewport.addEventListener('scroll', () => {
    viewport.scrollLeft = 0;
  });

  /* ---------- Enlaces externos al slider (header: #gob-datos-abiertos, etc.) ---------- */
  function indexFromId(id) {
    return slides.findIndex((s) => s.id === id);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#gob-"]');
    if (!a) return;
    const i = indexFromId(a.getAttribute('href').slice(1));
    if (i < 0) return;
    e.preventDefault();
    setActive(i);
    const top = grid.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  setActive(Math.max(0, indexFromId(location.hash.slice(1))));
})();