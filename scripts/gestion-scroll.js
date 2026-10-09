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

let start = null;      // null = animación no iniciada
let finished = false;

function update(now = performance.now()) {
  const s = section.getBoundingClientRect();

  boxes.forEach((box, i) => {
    
    const radius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0;

rects[i].setAttribute('rx', radius);
rects[i].setAttribute('ry', radius);

    const b = box.getBoundingClientRect();
    const x = b.left - s.left;
    const y = b.top - s.top;

    let p = 0;
    if (start !== null) {
      p = Math.min(Math.max((now - start - i * STAGGER) / DURATION, 0), 1);
      p = easeOut(p);
    }

    // El borde inferior queda fijo y el superior sube: revelado de abajo hacia arriba
    rects[i].setAttribute('x', x);
    rects[i].setAttribute('width', b.width);
    rects[i].setAttribute('y', y + b.height * (1 - p));
    rects[i].setAttribute('height', b.height * p);
    box.style.setProperty('--p', p);
  });

  if (start !== null && now - start >= DURATION + (boxes.length - 1) * STAGGER) {
    finished = true;
  }
}

function loop(now) {
  update(now);
  if (!finished) requestAnimationFrame(loop);
}

// Inicia cuando la sección entra en pantalla
new IntersectionObserver(([entry], obs) => {
  if (entry.isIntersecting) {
    start = performance.now();
    requestAnimationFrame(loop);
    obs.disconnect();
  }
}, { threshold: 0.4 }).observe(section);

// Mantener la máscara alineada si cambia el tamaño
new ResizeObserver(() => update()).observe(section);
update();