(() => {
  const cv = document.getElementById('c');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, R = 0, dpr = 1;

  // ---------- Colores (variables CSS con fallback) ----------
  let col = { node: '#242424', edge: '#242424', pulse: '#19a76e' };
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    const get = (k, f) => s.getPropertyValue(k).trim() || f;
    col = { node: get('--node', '#242424'), edge: get('--edge', '#242424'), pulse: get('--pulse', '#19a76e') };
  };
  readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.36;
  }
  addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cv);
  resize();

  // ---------- Utilidades ----------
  const N = 150, golden = Math.PI * (3 - Math.sqrt(5));
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  // RNG con semilla: el circuito se ve igual en cada carga
  const rand = (seed => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  })(7);

  // Conexiones: cada nodo con sus k vecinos más cercanos
  const knn = (pts, k) => {
    const edges = [], seen = new Set();
    pts.forEach((a, i) => {
      pts.map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
        .filter(o => o.j !== i).sort((p, q) => p.d - q.d).slice(0, k)
        .forEach(o => {
          const key = i < o.j ? i + '-' + o.j : o.j + '-' + i;
          if (!seen.has(key)) { seen.add(key); edges.push([i, o.j]); }
        });
    });
    return edges;
  };
  const adjOf = edges => {
    const adj = Array.from({ length: N }, () => []);
    edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    return adj;
  };

  // ---------- Formas ----------

  // 1) Esfera: espiral de Fibonacci
  function sphere() {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
      pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r });
    }
    return { pts, edges: knn(pts, 3) };
  }

  // 2) Circuito: placa con pistas horizontales, verticales y diagonales a 45°
  function circuit() {
    const cols = 10, rows = 15, pts = [], edges = [], seen = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pts.push({ x: (c - (cols - 1) / 2) * 0.2, y: (r - (rows - 1) / 2) * 0.2, z: (rand() - 0.5) * 0.16 });
      }
    }
    const add = (a, b) => {
      const key = a < b ? a + '-' + b : b + '-' + a;
      if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1 && rand() < 0.6) add(i, i + 1);
        if (r < rows - 1 && rand() < 0.5) add(i, i + cols);
        if (r < rows - 1 && c < cols - 1 && rand() < 0.12) add(i, i + cols + 1);
        if (r < rows - 1 && c > 0 && rand() < 0.08) add(i, i + cols - 1);
      }
    }
    // ningún nodo queda aislado
    const deg = new Array(N).fill(0);
    edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (deg[i] === 0) {
          const j = c < cols - 1 ? i + 1 : i - 1;
          add(i, j); deg[i]++; deg[j]++;
        }
      }
    }
    return { pts, edges };
  }

  // 3) Cerebro: dos hemisferios con circunvoluciones + cerebelo + tronco
  function brain() {
    const pts = [], hemi = 62;
    for (const h of [1, -1]) {
      for (let i = 0; i < hemi; i++) {
        const sz = (i + 0.5) / hemi, r = Math.sqrt(1 - sz * sz), t = golden * i + (h > 0 ? 0 : 1.7);
        const sx = Math.cos(t) * r, sy = Math.sin(t) * r;
        const bump = 1 + 0.08 * Math.sin(9 * sx + 4 * sy) * Math.cos(7 * sy - 5 * sz);
        let y = sy * 0.62 * bump;
        if (y < 0) y *= 0.65; // base más plana
        pts.push({ x: sx * bump, y, z: h * (0.06 + 0.74 * sz * bump) });
      }
    }
    // cerebelo
    for (let i = 0; i < 18; i++) {
      const y = 1 - (i / 17) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
      pts.push({ x: -0.6 + Math.cos(t) * r * 0.32, y: -0.38 + y * 0.2, z: Math.sin(t) * r * 0.34 });
    }
    // tronco encefálico
    for (let i = 0; i < 8; i++) {
      pts.push({ x: -0.12 - 0.02 * i, y: -0.35 - i * 0.08, z: i % 2 ? 0.03 : -0.03 });
    }
    // en canvas +Y apunta hacia abajo: se invierte para que el cerebro quede derecho
    pts.forEach(p => { p.y = -(p.y + 0.12); });
    return { pts, edges: knn(pts, 3) };
  }

  // Cada forma define su vista: spin = rotación continua, sway = vaivén, ax = inclinación
  const SHAPES = {
    sphere:  { ...sphere(),  spin: 0.003, sway: 0,   ax: 0.35 },
    circuit: { ...circuit(), spin: 0,     sway: 0.5, ax: 0.2 },
    brain:   { ...brain(),   spin: 0,     sway: 0.9, ax: 0.15 }
  };
  for (const key in SHAPES) {
    SHAPES[key].adj = adjOf(SHAPES[key].edges);
    SHAPES[key].w = key === 'sphere' ? 1 : 0; // opacidad de sus aristas
  }

  // ---------- Nodos (se mueven hacia la forma objetivo) ----------
  const nodes = SHAPES.sphere.pts.map(p => ({
    x: p.x, y: p.y, z: p.z, tx: p.x, ty: p.y, tz: p.z,
    k: 0.03 + Math.random() * 0.04, // velocidad de morph propia: transición orgánica
    glow: 0, sx: 0, sy: 0, d: 0, p: 1
  }));

  let current = 'sphere';
  const pulses = [];
  const send = (a, b, speed) => {
    if (b === undefined) return;
    if (pulses.length < 45) pulses.push({ a, b, t: 0, v: speed || 0.012 + Math.random() * 0.01 });
  };

  function setShape(name) {
    if (!SHAPES[name] || name === current) return;
    current = name;
    const s = SHAPES[name];
    nodes.forEach((n, i) => { n.tx = s.pts[i].x; n.ty = s.pts[i].y; n.tz = s.pts[i].z; });
    pulses.length = 0;
    // al pasar a una forma con vaivén, ay toma el camino más corto al objetivo
    ay = wrap(ay);
  }

  // Cambio de forma según la sección que cruza la mitad de la pantalla
  const sections = document.querySelectorAll('[data-shape]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setShape(e.target.dataset.shape); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // ---------- Rotación e interacción ----------
  let ay = 0, ax = 0.35, vy = 0.003, vx = 0, drag = false, lx = 0, ly = 0;
  cv.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    vy = (e.clientX - lx) * 0.0006; vx = (e.clientY - ly) * 0.0006;
    ay += (e.clientX - lx) * 0.006; ax += (e.clientY - ly) * 0.006;
    lx = e.clientX; ly = e.clientY;
  });
  const up = () => { drag = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now(), spawn = 0;

  function project() {
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    for (const n of nodes) {
      const x1 = n.x * cy + n.z * sy, z1 = -n.x * sy + n.z * cy;
      const y2 = n.y * cx - z1 * sx, z2 = n.y * sx + z1 * cx;
      const p = 2.8 / (2.8 - z2);
      n.sx = W / 2 + x1 * R * p; n.sy = H / 2 + y2 * R * p;
      n.d = Math.max(0, Math.min(1, (z2 + 1) / 2)); n.p = p;
    }
  }

  function frame(now) {
    const dt = Math.min(now - last, 50), f = dt / 16; last = now;
    ctx.clearRect(0, 0, W, H);
    const sh = SHAPES[current];

    // Morph de posiciones
    for (const n of nodes) {
      const k = reduce ? 1 : 1 - Math.pow(1 - n.k, f);
      n.x += (n.tx - n.x) * k; n.y += (n.ty - n.y) * k; n.z += (n.tz - n.z) * k;
    }
    // Fundido de aristas entre formas
    for (const key in SHAPES) {
      const s = SHAPES[key];
      s.w += ((key === current ? 1 : 0) - s.w) * (reduce ? 1 : Math.min(1, 0.06 * f));
    }

    // Movimiento de cámara
    if (!drag) {
      vx *= 0.95;
      if (sh.sway) {
        vy *= 0.9;
        if (!reduce) ay += wrap(sh.sway * Math.sin(now / 2600) - ay) * 0.04 * f;
      } else {
        vy += (sh.spin - vy) * 0.03;
      }
      ax += (sh.ax - ax) * 0.03 * f;
    }
    if (!reduce) { ay += vy * f; ax += vx * f; }
    ax = Math.max(-1.2, Math.min(1.2, ax));
    project();

    // Aristas de cada forma, con su peso de fundido
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = col.edge;
    for (const key in SHAPES) {
      const s = SHAPES[key];
      if (s.w < 0.01) continue;
      for (const [i, j] of s.edges) {
        const a = nodes[i], b = nodes[j];
        ctx.globalAlpha = (0.04 + 0.26 * ((a.d + b.d) / 2)) * s.w;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
    }

    // Nuevos impulsos
    spawn -= dt;
    if (spawn <= 0 && !reduce) {
      const s = (Math.random() * N) | 0;
      send(s, sh.adj[s][(Math.random() * sh.adj[s].length) | 0]);
      spawn = 260 + Math.random() * 300;
    }

    // Pulsos
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += p.v * f;
      const a = nodes[p.a], b = nodes[p.b];
      const t = Math.min(p.t, 1), t0 = Math.max(t - 0.25, 0);
      const x0 = a.sx + (b.sx - a.sx) * t0, y0 = a.sy + (b.sy - a.sy) * t0;
      const x1 = a.sx + (b.sx - a.sx) * t, y1 = a.sy + (b.sy - a.sy) * t;
      const dep = a.d + (b.d - a.d) * t;
      ctx.globalAlpha = 0.35 + 0.65 * dep;
      ctx.strokeStyle = col.pulse; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.fillStyle = col.pulse;
      ctx.beginPath(); ctx.arc(x1, y1, 1.8 * (0.6 + dep), 0, 6.283); ctx.fill();
      if (p.t >= 1) {
        b.glow = 1;
        pulses.splice(k, 1);
        const nxt = sh.adj[p.b].filter(n => n !== p.a);
        if (nxt.length) {
          if (Math.random() < 0.75) send(p.b, nxt[(Math.random() * nxt.length) | 0]);
          if (Math.random() < 0.25) send(p.b, nxt[(Math.random() * nxt.length) | 0]);
        }
      }
    }

    // Nodos (ordenados por profundidad)
    const order = nodes.slice().sort((a, b) => a.d - b.d);
    for (const n of order) {
      const size = (1.6 + 1.6 * n.d) * n.p;
      ctx.globalAlpha = 0.3 + 0.7 * n.d;
      ctx.fillStyle = col.node;
      ctx.beginPath(); ctx.arc(n.sx, n.sy, size, 0, 6.283); ctx.fill();
      if (n.glow > 0.01) {
        ctx.globalAlpha = n.glow * (0.4 + 0.6 * n.d);
        ctx.fillStyle = col.pulse;
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size * (1.2 + n.glow * 1.4), 0, 6.283); ctx.fill();
        n.glow *= 0.94;
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();