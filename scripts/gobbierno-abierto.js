(() => {
  const grid  = document.getElementById('gobierno-abierto');
  const bg    = document.getElementById('ga-fondo');
  const cards = [...grid.querySelectorAll('[data-mask]')];
  const video = bg.querySelector('video');
  const RADIUS = 24;
  const DURATION = 1100;   // ms por card
  const STAGGER = 220;     // ms entre cards
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  let progress = cards.map(() => 0); // 0..1 por card, animación hacia la derecha
 
  // si el video no carga, queda visible el fondo alternativo
  video.addEventListener('error', () => video.remove());
 
  const ease = t => 1 - Math.pow(1 - t, 4);
 
  // Genera la máscara (SVG) con un rect redondeado por card; el ancho crece de izquierda a derecha
  function drawMask() {
    const g = grid.getBoundingClientRect();
    const rects = cards.map((c, i) => {
      const r = c.getBoundingClientRect();
      const w = r.width * progress[i];
      if (w < 1) return '';
      return `<rect x="${r.left - g.left}" y="${r.top - g.top}" width="${w}" height="${r.height}" rx="${Math.min(RADIUS, w / 2)}" fill="#000"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${g.width}" height="${g.height}" viewBox="0 0 ${g.width} ${g.height}">${rects}</svg>`;
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    bg.style.webkitMaskImage = url;
    bg.style.maskImage = url;
  }
 
  function run() {
    grid.classList.add('is-visible');
    if (reduce) { progress = progress.map(() => 1); drawMask(); return; }
    const start = performance.now();
    (function frame(now) {
      const t = now - start;
      let done = true;
      progress = cards.map((_, i) => {
        const p = Math.min(Math.max((t - i * STAGGER) / DURATION, 0), 1);
        if (p < 1) done = false;
        return ease(p);
      });
      drawMask();
      if (!done) requestAnimationFrame(frame);
    })(start);
  }
 
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { run(); obs.disconnect(); }
  }, { threshold: 0.35 }).observe(grid);
 
  addEventListener('resize', () => { if (grid.classList.contains('is-visible')) drawMask(); });
})();