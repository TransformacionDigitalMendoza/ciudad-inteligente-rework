(() => {
  /* ===== Ajustes ===== */
  const CONFIG = {
    maxHops: 6,             // saltos máximos que recorre un impulso
    propagate: 0.35,        // probabilidad de propagarse a cada vecino (0 a 1)
    diagonalChance: 0.5,    // cuerdas extra dentro del hexágono interior (0 = ninguna)
    spawnEvery: [2.2, 4.5], // segundos entre estímulos automáticos [mín, máx]
    interactive: true       // clic/toque para lanzar impulsos
  };
 
  const root = document.getElementById('rnh');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  const SQ3 = Math.sqrt(3);
 
  let W = 0, H = 0, DPR = 1, size = 40, cx = 0, cy = 0;
  let nodes = [], edges = [], pulses = [];
  let time = 0, spawnTimer = 0, last = performance.now();
  let mouse = { x: -999, y: -999 };
  let running = true, rafId = 0;
 
  const rand = (a, b) => a + Math.random() * (b - a);
 
  /* ---------- Construcción de la red (12 nodos) ---------- */
  // 6 nodos en el hexágono exterior + 6 en un hexágono interior girado 30°
  function build() {
    nodes = []; edges = [];
    const add = (angle, radius, ring) => {
      const n = {
        ring, bx: Math.cos(angle) * radius, by: Math.sin(angle) * radius,
        x: 0, y: 0, phase: rand(0, Math.PI * 2), speed: rand(0.4, 0.9),
        energy: 0, refractory: 0, adj: [], id: nodes.length
      };
      nodes.push(n); return n;
    };
    const outer = [], inner = [];
    for (let i = 0; i < 6; i++) outer.push(add(-Math.PI / 2 + i * Math.PI / 3, 1, 2));
    for (let i = 0; i < 6; i++) inner.push(add(-Math.PI / 3 + i * Math.PI / 3, 0.52, 1));
 
    const seen = new Set();
    const link = (a, b, weak) => {
      const k = a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id;
      if (a === b || seen.has(k)) return;
      seen.add(k);
      const e = { a, b, glow: 0, weak };
      edges.push(e);
      a.adj.push({ node: b, edge: e });
      b.adj.push({ node: a, edge: e });
    };
    for (let i = 0; i < 6; i++) {
      link(outer[i], outer[(i + 1) % 6], false);      // borde exterior
      link(inner[i], inner[(i + 1) % 6], false);      // borde interior
      link(inner[i], outer[i], false);                // cada nodo interior toca
      link(inner[i], outer[(i + 1) % 6], false);      // a los dos exteriores vecinos
      if (Math.random() < CONFIG.diagonalChance) link(inner[i], inner[(i + 2) % 6], true);
    }
  }
 
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth; H = root.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
    size = Math.min(W, H) * 0.36;
  }
 
  /* ---------- Impulsos ---------- */
  function fire(node, hops = 0, strength = 1, from = null) {
    if (node.refractory > 0) return;
    node.energy = 1;
    node.refractory = 1.2;
    if (hops >= CONFIG.maxHops) return;
    let sent = 0;
    for (const { node: nb, edge } of node.adj) {
      if (nb === from) continue;
      if (Math.random() < CONFIG.propagate * (edge.weak ? 0.8 : 1) * (1 - hops / (CONFIG.maxHops + 2)) + 0.05) {
        send(node, nb, edge, hops + 1, strength * 0.93);
        sent++;
      }
    }
    if (!sent && hops < 3) {
      const opts = node.adj.filter(o => o.node !== from);
      if (opts.length) {
        const o = opts[(Math.random() * opts.length) | 0];
        send(node, o.node, o.edge, hops + 1, strength * 0.93);
      }
    }
  }
  function send(a, b, edge, hops, strength) {
    pulses.push({ a, b, edge, t: 0, hops, strength, speed: rand(0.7, 1.0) });
    edge.glow = Math.min(1, edge.glow + 0.6);
  }
  function spontaneous() {
    const pool = Math.random() < 0.6 ? nodes.filter(n => n.ring === 2) : nodes;
    fire(pool[(Math.random() * pool.length) | 0]);
  }
 
  /* ---------- Bucle ---------- */
  function update(dt) {
    time += dt;
    const amp = reduceMotion ? 0 : size * 0.03;
    for (const n of nodes) {
      n.x = cx + (n.bx * size) + Math.sin(time * n.speed + n.phase) * amp;
      n.y = cy + (n.by * size) + Math.cos(time * n.speed * 0.8 + n.phase) * amp;
      n.energy = Math.max(0, n.energy - dt * 1.6);
      n.refractory = Math.max(0, n.refractory - dt);
    }
    for (const e of edges) e.glow = Math.max(0, e.glow - dt * 1.1);
 
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt * p.speed;
      p.edge.glow = Math.max(p.edge.glow, 0.85 * p.strength);
      if (p.t >= 1) {
        pulses.splice(i, 1);
        fire(p.b, p.hops, p.strength, p.a);
      }
    }
 
    spawnTimer -= dt;
    if (spawnTimer <= 0) { spontaneous(); spawnTimer = rand(CONFIG.spawnEvery[0], CONFIG.spawnEvery[1]); }
    if (pulses.length > 260) pulses.splice(0, pulses.length - 260);
  }
 
  function hexPath(radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 3;
      const x = cx + Math.cos(ang) * radius, y = cy + Math.sin(ang) * radius;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
 
  function draw() {
    ctx.clearRect(0, 0, W, H);
 
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(120,130,220,0.10)';
    hexPath(size * 1.14); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,130,220,0.05)';
    hexPath(size * 1.3); ctx.stroke();
 
    for (const e of edges) {
      const g = e.glow;
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y);
      ctx.lineWidth = 1 + g * 1.6;
      ctx.strokeStyle = g > 0.02
        ? `rgba(${110 + g * 145 | 0},${125 + g * 75 | 0},${230 - g * 60 | 0},${(e.weak ? 0.10 : 0.17) + g * 0.55})`
        : `rgba(110,125,230,${e.weak ? 0.09 : 0.16})`;
      ctx.stroke();
    }
 
    ctx.globalCompositeOperation = 'lighter';
 
    for (const p of pulses) {
      const ax = p.a.x, ay = p.a.y, bx = p.b.x, by = p.b.y;
      const x = ax + (bx - ax) * p.t, y = ay + (by - ay) * p.t;
      const t0 = Math.max(0, p.t - 0.28);
      const tx = ax + (bx - ax) * t0, ty = ay + (by - ay) * t0;
      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, 'rgba(255,170,90,0)');
      grad.addColorStop(1, `rgba(255,214,150,${0.9 * p.strength})`);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
 
      const r = size * 0.1 * (0.6 + p.strength * 0.4);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, `rgba(255,236,200,${0.95 * p.strength})`);
      glow.addColorStop(0.35, `rgba(255,170,90,${0.45 * p.strength})`);
      glow.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
 
    for (const n of nodes) {
      const hover = Math.hypot(n.x - mouse.x, n.y - mouse.y) < size * 0.2 ? 0.35 : 0;
      const en = Math.min(1, n.energy + hover);
      const base = size * (n.ring === 2 ? 0.04 : 0.033);
      const r = base + en * size * 0.03;
 
      if (en > 0.02) {
        const gr = r * 4.2;
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
        glow.addColorStop(0, `rgba(255,190,120,${0.55 * en})`);
        glow.addColorStop(1, 'rgba(255,140,80,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(n.x, n.y, gr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = en > 0.02
        ? `rgba(${170 + en * 85 | 0},${175 + en * 55 | 0},${255 - en * 95 | 0},1)`
        : 'rgba(150,160,245,0.85)';
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
 
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (W && H) { update(dt); draw(); }
    rafId = requestAnimationFrame(frame);
  }
 
  /* ---------- Interacción ---------- */
  if (CONFIG.interactive) {
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener('pointermove', e => { mouse = pos(e); });
    canvas.addEventListener('pointerleave', () => { mouse = { x: -999, y: -999 }; });
    canvas.addEventListener('pointerdown', e => {
      const p = pos(e);
      mouse = p;
      let best = null, bd = Infinity;
      for (const n of nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < bd) { bd = d; best = n; }
      }
      if (best) { best.refractory = 0; fire(best); }
    });
  }
 
  /* ---------- Arranque ---------- */
  new ResizeObserver(resize).observe(root);
 
  // Pausa la animación cuando el bloque no está visible (ahorra batería/CPU)
  new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; last = performance.now(); rafId = requestAnimationFrame(frame); }
    else if (!visible) { running = false; cancelAnimationFrame(rafId); }
  }).observe(root);
 
  resize();
  build();
  spontaneous();
  rafId = requestAnimationFrame(t => { last = t; frame(t); });
})();