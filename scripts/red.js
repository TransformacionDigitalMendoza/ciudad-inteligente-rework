(() => {
  const cv = document.getElementById('c');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, R = 0, dpr = 1;

  // ---------- Colores (variables CSS con fallback) ----------
  let col = { node: '#242424', edge: '#242424', pulse: '#2f5fd6' };
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    const get = (k, f) => s.getPropertyValue(k).trim() || f;
    col = { node: get('--node', '#242424'), edge: get('--edge', '#242424'), pulse: get('--pulse', '#2f5fd6') };
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

  // ---------- Nodos: distribuidos uniformemente sobre una esfera (espiral de Fibonacci) ----------
  const N = 150, golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
    nodes.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r, glow: 0, sx: 0, sy: 0, d: 0, p: 1 });
  }

  // ---------- Conexiones: cada nodo con sus 3 vecinos más cercanos ----------
  const adj = nodes.map(() => []), edgeSet = new Set(), edges = [];
  nodes.forEach((a, i) => {
    nodes.map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
      .filter(o => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 3)
      .forEach(o => {
        const k = i < o.j ? i + '-' + o.j : o.j + '-' + i;
        adj[i].push(o.j);
        if (!edgeSet.has(k)) { edgeSet.add(k); edges.push([i, o.j]); }
        if (!adj[o.j].includes(i)) adj[o.j].push(i);
      });
  });

  // ---------- Pulsos de señal que viajan por las conexiones ----------
  const pulses = [];
  const send = (a, b, speed) => {
    if (b === undefined) return;
    if (pulses.length < 45) pulses.push({ a, b, t: 0, v: speed || 0.012 + Math.random() * 0.01 });
  };

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
      n.d = (z2 + 1) / 2; n.p = p;
    }
  }

  function frame(now) {
    const dt = Math.min(now - last, 50); last = now;
    ctx.clearRect(0, 0, W, H);

    if (!drag) { vy += (0.003 - vy) * 0.03; vx *= 0.95; }
    if (!reduce) { ay += vy * (dt / 16); ax += vx * (dt / 16); }
    ax = Math.max(-1.2, Math.min(1.2, ax));
    project();

    // Aristas
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = col.edge;
    for (const [i, j] of edges) {
      const a = nodes[i], b = nodes[j];
      ctx.globalAlpha = 0.04 + 0.26 * ((a.d + b.d) / 2);
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    }

    // Nuevos impulsos
    spawn -= dt;
    if (spawn <= 0 && !reduce) {
      const s = (Math.random() * N) | 0;
      send(s, adj[s][(Math.random() * adj[s].length) | 0]);
      spawn = 260 + Math.random() * 300;
    }

    // Pulsos
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += p.v * (dt / 16);
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
        const nxt = adj[p.b].filter(n => n !== p.a);
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