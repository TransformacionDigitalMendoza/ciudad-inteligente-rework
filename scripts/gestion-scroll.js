const section = document.getElementById('gestion');
const clip = document.getElementById('gestionClip');
const NS = 'http://www.w3.org/2000/svg';

// Orden de aparición: 3, 4, 5, 7
const boxes = ['.g-box3', '.g-box4', '.g-box5', '.g-box7']
  .map(sel => section.querySelector(sel));

const rects = boxes.map(() => {
  const r = document.createElementNS(NS, 'rect');
  clip.appendChild(r);
  return r;
});

const DURATION = 900;  // ms por bloque
const STAGGER  = 250;  // ms entre bloques
const easeOut = t => 1 - Math.pow(1 - t, 3);

// Mismo corte que el CSS responsive (grid de 2 columnas, todo apilado)
const mobileQuery = window.matchMedia('(max-width: 768px)');

// Escritorio: un solo disparo para toda la sección, los bloques salen escalonados
let start = null;                       // null = animación no iniciada
// Móvil: la sección es altísima (grid + slider + tarjetas apiladas), así que
// nunca llega a mostrar el 40 % en pantalla. Cada bloque se revela cuando él mismo entra.
const boxStart = boxes.map(() => null);

function startTimeOf(i) {
  if (mobileQuery.matches) return boxStart[i];
  return start === null ? null : start + i * STAGGER;
}

// Devuelve true mientras quede alguna animación en curso
function update(now = performance.now()) {
  const s = section.getBoundingClientRect();
  let animating = false;

  boxes.forEach((box, i) => {
    const radius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0;
    rects[i].setAttribute('rx', radius);
    rects[i].setAttribute('ry', radius);

    const b = box.getBoundingClientRect();
    const x = b.left - s.left;
    const y = b.top - s.top;

    let p = 0;
    const t0 = startTimeOf(i);
    if (t0 !== null) {
      const raw = Math.min(Math.max((now - t0) / DURATION, 0), 1);
      p = easeOut(raw);
      if (raw < 1) animating = true;
    }

    // El borde inferior queda fijo y el superior sube: revelado de abajo hacia arriba
    rects[i].setAttribute('x', x);
    rects[i].setAttribute('width', b.width);
    rects[i].setAttribute('y', y + b.height * (1 - p));
    rects[i].setAttribute('height', b.height * p);
    box.style.setProperty('--p', p);
  });

  return animating;
}

// El loop solo corre mientras hay algo animándose
let running = false;

function loop(now) {
  if (update(now)) {
    requestAnimationFrame(loop);
  } else {
    running = false;
  }
}

function kick() {
  if (running) return;
  running = true;
  requestAnimationFrame(loop);
}

/* ---------- Escritorio: inicia cuando la sección entra en pantalla ---------- */
new IntersectionObserver(([entry], obs) => {
  if (entry.isIntersecting && !mobileQuery.matches) {
    start = performance.now();
    kick();
    obs.disconnect();
  }
}, { threshold: 0.4 }).observe(section);

/* ---------- Móvil: cada bloque se revela al entrar en pantalla ---------- */
const boxObserver = new IntersectionObserver((entries) => {
  let k = 0;
  entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => boxes.indexOf(a.target) - boxes.indexOf(b.target))
    .forEach(e => {
      const i = boxes.indexOf(e.target);
      // Si varios entran a la vez, salen escalonados en el orden 3, 4, 5, 7
      boxStart[i] = performance.now() + k++ * STAGGER;
      boxObserver.unobserve(e.target);
    });
  if (k) kick();
}, { threshold: 0.25 });

boxes.forEach(box => boxObserver.observe(box));

/* ---------- Cambios de modo (rotar el teléfono, redimensionar) ---------- */
mobileQuery.addEventListener('change', () => {
  // Pasar a escritorio sin haber disparado nunca: se muestra todo
  if (!mobileQuery.matches && start === null) start = performance.now();
  update();
  kick();
});

// Mantener la máscara alineada si cambia el tamaño
new ResizeObserver(() => update()).observe(section);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => update());
update();