(() => {
  // Opcional: id de una sección que dispara/pausa la animación.
  // Vacío = se activa cuando el propio canvas entra en pantalla.
  const SECTION_ID = '';

  const cv = document.getElementById('pie-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, S = 100;

  // ---------- Colores (variables CSS con fallback) ----------
  const DEF = { a: '#19a76e', b: '#2f5fd6', c: '#242424', text: '#ffffff' };
  const col = {}, rgb = {};
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    for (const k in DEF) {
      const v = s.getPropertyValue('--pie-' + k).trim();
      col[k] = /^#[0-9a-f]{6}$/i.test(v) ? v : DEF[k];
      const n = parseInt(col[k].slice(1), 16);
      rgb[k] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  };
  readColors();

  // ---------- Datos (ilustrativos) ----------
  const SLICES = [{ v: 45, k: 'a' }, { v: 30, k: 'b' }, { v: 25, k: 'c' }];
  let acc = -0.9; // ángulo inicial
  SLICES.forEach(s => { s.a0 = acc; acc += (s.v / 100) * Math.PI * 2; s.a1 = acc; });

  // ---------- Parámetros de la vista ----------
  const R = 1, TH = 0.3, SEG = 26;  // radio, grosor, segmentos del arco
  const F = 4.5;                    // distancia de cámara (fuerza de la perspectiva)
  const EXP = 0.3;                  // cuánto se separa cada porción
  const TILT = 0.95;                // inclinación fija de la vista (rad): más alto = más "desde arriba"
  const YAW = 0;                    // sin giro: la vista es siempre frontal
  const L = (() => { const v = [-0.4, 0.6, 0.7], m = Math.hypot(...v); return v.map(x => x / m); })();

  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const outCubic = t => 1 - Math.pow(1 - t, 3);
  const outBack = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

  // Cámara fija: inclinación + perspectiva
  function camera(yaw, tilt, scale, cx, cy) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    const rot = (x, y, z) => {
      const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
      return [x1, y * ct - z1 * st, y * st + z1 * ct];
    };
    const proj = (x, y, z) => {
      const r = rot(x, y, z), p = F / (F - r[2]);
      return [cx + r[0] * S * scale * p, cy - r[1] * S * scale * p, r[2]];
    };
    return { rot, proj };
  }

  const shade = (k, s) => {
    const c = rgb[k], add = s > 1 ? (s - 1) * 140 : 0;
    const f = v => Math.round(Math.max(0, Math.min(255, v * s + add + 6)));
    return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
  };

  // ---------- Dibujo (t = ms desde la activación; <0 = nada todavía) ----------
  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (t < 0) return;

    const u = clamp(t / 1000), eIn = outCubic(u);
    const scale = lerp(0.55, 1, eIn);
    const tilt = lerp(1.45, TILT, eIn);   // solo se "acomoda" al entrar, luego queda fijo
    const cx = W / 2, cy = H / 2 + S * 0.1;
    const { rot, proj } = camera(YAW, tilt, scale, cx, cy);

    ctx.globalAlpha = clamp(u * 2.2);
    const faces = [];

    SLICES.forEach((sl, k) => {
      const te = clamp((t - 1200 - k * 130) / 900), d = EXP * outBack(te);
      const am = (sl.a0 + sl.a1) / 2, ox = Math.cos(am) * d, oz = Math.sin(am) * d;
      const P = (r, a, y) => proj(ox + Math.cos(a) * r, y, oz + Math.sin(a) * r);

      // Sombra en el piso (3 capas para suavizarla)
      for (const m of [1.16, 1.09, 1.02]) {
        ctx.beginPath();
        let p = proj(ox + 0.1, -0.02, oz + 0.14); ctx.moveTo(p[0], p[1]);
        for (let i = 0; i <= SEG; i++) {
          const a = sl.a0 + (sl.a1 - sl.a0) * i / SEG;
          p = proj(ox + 0.1 + Math.cos(a) * R * m, -0.02, oz + 0.14 + Math.sin(a) * R * m);
          ctx.lineTo(p[0], p[1]);
        }
        ctx.closePath(); ctx.fillStyle = 'rgba(36,36,36,0.07)'; ctx.fill();
      }

      // Caras visibles (backface culling con la normal rotada)
      const add = (pts, n, kind) => {
        const rn = rot(n[0], n[1], n[2]);
        if (rn[2] < 0.02) return;
        const lam = Math.max(0, rn[0] * L[0] + rn[1] * L[1] + rn[2] * L[2]);
        let z = 0; pts.forEach(p => { z += p[2]; });
        faces.push({ pts, z: z / pts.length, color: shade(sl.k, 0.6 + 0.5 * lam), kind });
      };

      // Tapa
      const top = [P(0, sl.a0, TH)];
      for (let i = 0; i <= SEG; i++) top.push(P(R, sl.a0 + (sl.a1 - sl.a0) * i / SEG, TH));
      add(top, [0, 1, 0], 'top');

      // Pared curva
      for (let i = 0; i < SEG; i++) {
        const aA = sl.a0 + (sl.a1 - sl.a0) * i / SEG, aB = sl.a0 + (sl.a1 - sl.a0) * (i + 1) / SEG, m = (aA + aB) / 2;
        add([P(R, aA, TH), P(R, aB, TH), P(R, aB, 0), P(R, aA, 0)], [Math.cos(m), 0, Math.sin(m)], 'wall');
      }
      // Paredes de corte (radiales)
      add([P(0, sl.a0, TH), P(R, sl.a0, TH), P(R, sl.a0, 0), P(0, sl.a0, 0)], [Math.sin(sl.a0), 0, -Math.cos(sl.a0)], 'wall');
      add([P(0, sl.a1, TH), P(R, sl.a1, TH), P(R, sl.a1, 0), P(0, sl.a1, 0)], [-Math.sin(sl.a1), 0, Math.cos(sl.a1)], 'wall');
    });

    // Algoritmo del pintor: de lejos a cerca
    faces.sort((a, b) => a.z - b.z);
    ctx.lineJoin = 'round';
    for (const f of faces) {
      ctx.beginPath();
      f.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      ctx.fillStyle = f.color; ctx.fill();
      if (f.kind === 'top') { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6; }
      else { ctx.strokeStyle = f.color; ctx.lineWidth = 1; }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  // ---------- Tamaño ----------
  const END = 3000; // ms: la animación termina y el gráfico queda estático
  let curT = reduce ? 4000 : -1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    S = Math.min(W / 3.4, H / 3.4);
    draw(curT);
  }
  addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cv);
  resize();

  // ---------- Animación: corre solo mientras es visible y hasta terminar ----------
  let clock = 0, last = 0, raf = 0, running = false;
  function loop(now) {
    if (!running) return;
    clock += Math.min(now - last, 50); last = now;
    curT = Math.min(clock, END); draw(curT);
    if (clock >= END) { running = false; return; } // queda dibujado, sin gastar CPU
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running || reduce || clock >= END) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(loop);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  const target = (SECTION_ID && document.getElementById(SECTION_ID)) || cv;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? play() : pause());
    }, { threshold: 0.2 }).observe(target);
  } else {
    play();
  }

  // Click para repetir la animación
  cv.addEventListener('click', () => {
    if (reduce) return;
    pause(); clock = 0; play();
  });
})();