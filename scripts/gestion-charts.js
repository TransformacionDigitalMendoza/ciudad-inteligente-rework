
(() => {
  const cv = document.getElementById('g-chart');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, col = {};
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    ['page', 'bar', 'axis', 'accent', 'lens', 'ok'].forEach(k => col[k] = s.getPropertyValue('--' + k).trim());
  };
  readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  const values = [0.35, 0.5, 0.42, 0.6, 0.38, 0.92, 0.48, 0.55, 0.4];
  const n = values.length, target = 5;
  const waypoints = [1, 4, 2, 7, target];
  const SEG = 0.8, SCAN_START = 1.2;
  const SCAN_END = SCAN_START + SEG * (waypoints.length - 1); // 4.4
  const CYCLE = 8.8, FADE_START = 7.6;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const outCubic = t => 1 - Math.pow(1 - t, 3);
  const outBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function layout() {
    const cw = Math.min(W * 0.82, 760);
    const unit = cw / (n + (n - 1) * 0.6);
    return {
      bw: unit, gap: unit * 0.6, x0: (W - cw) / 2,
      base: H * 0.76, maxH: Math.min(H * 0.46, 380)
    };
  }
  const barCx = (L, i) => L.x0 + i * (L.bw + L.gap) + L.bw / 2;

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, [r, r, 0, 0]);
    else ctx.rect(x, y, w, h);
  }

  function drawBars(L, t, hi) {
    ctx.strokeStyle = col.axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(L.x0 - 12, L.base + 0.5); ctx.lineTo(L.x0 + n * L.bw + (n - 1) * L.gap + 12, L.base + 0.5); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const g = outCubic(clamp((t - i * 0.07) / 0.7));
      const h = values[i] * L.maxH * g;
      const x = barCx(L, i) - L.bw / 2;
      ctx.fillStyle = col.bar;
      rrect(x, L.base - h, L.bw, h, Math.min(5, L.bw / 3)); ctx.fill();
      if (i === target && hi > 0) {
        const a = ctx.globalAlpha;
        ctx.globalAlpha = a * hi; ctx.fillStyle = col.accent;
        rrect(x, L.base - h, L.bw, h, Math.min(5, L.bw / 3)); ctx.fill();
        ctx.globalAlpha = a;
      }
    }
  }

  function drawLens(L, lx, ly, r, a, t, hi) {
    ctx.save();
    ctx.globalAlpha *= a;
    // interior ampliado
    ctx.save();
    ctx.beginPath(); ctx.arc(lx, ly, r, 0, 6.283); ctx.clip();
    ctx.fillStyle = col.page; ctx.globalAlpha *= 0.9; ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
    ctx.globalAlpha /= 0.9;
    ctx.translate(lx, ly); ctx.scale(1.55, 1.55); ctx.translate(-lx, -ly);
    drawBars(L, 99, hi);
    ctx.restore();
    // aro y mango
    ctx.strokeStyle = col.lens; ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(4, r * 0.12);
    ctx.beginPath(); ctx.arc(lx, ly, r, 0, 6.283); ctx.stroke();
    ctx.lineWidth = Math.max(7, r * 0.2);
    const k = Math.SQRT1_2;
    ctx.beginPath(); ctx.moveTo(lx + r * k * 1.04, ly + r * k * 1.04); ctx.lineTo(lx + r * k * 1.04 + r * 0.8, ly + r * k * 1.04 + r * 0.8); ctx.stroke();
    ctx.restore();
  }

  function drawCheck(cx, cy, p, ripple) {
    if (p <= 0) return;
    const s = outBack(clamp(p)), R = 24 * s;
    if (ripple > 0 && ripple < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - ripple;
      ctx.strokeStyle = col.ok; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 24 + ripple * 26, 0, 6.283); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = col.ok;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(R, 0), 0, 6.283); ctx.fill();
    // tilde dibujado progresivamente
    const pts = [[-9, 1], [-3, 7.5], [10, -7]];
    const prog = clamp((p - 0.35) / 0.65);
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    let d = prog * (l1 + l2);
    ctx.strokeStyle = col.page; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx + pts[0][0], cy + pts[0][1]);
    if (d <= l1) {
      const u = d / l1;
      ctx.lineTo(cx + pts[0][0] + (pts[1][0] - pts[0][0]) * u, cy + pts[0][1] + (pts[1][1] - pts[0][1]) * u);
    } else {
      const u = (d - l1) / l2;
      ctx.lineTo(cx + pts[1][0], cy + pts[1][1]);
      ctx.lineTo(cx + pts[1][0] + (pts[2][0] - pts[1][0]) * u, cy + pts[1][1] + (pts[2][1] - pts[1][1]) * u);
    }
    ctx.stroke();
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();

  function frame(now) {
    const t = reduce ? 6.2 : ((now - t0) / 1000) % CYCLE;
    const L = layout();
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1 - ease(clamp((t - FADE_START) / (CYCLE - FADE_START - 0.4)));

    const hi = ease(clamp((t - SCAN_END) / 0.5));
    drawBars(L, t, hi);

    // posición de la lupa
    const r = clamp(Math.min(W, H) * 0.1, 42, 76);
    let lx, ly;
    const scanY = L.base - L.maxH * 0.42;
    const targetTop = L.base - values[target] * L.maxH;
    const targetY = targetTop + L.maxH * 0.22;
    if (t < SCAN_START) {
      lx = barCx(L, waypoints[0]); ly = scanY;
    } else if (t < SCAN_END) {
      const lt = t - SCAN_START, seg = Math.min(Math.floor(lt / SEG), waypoints.length - 2);
      const u = clamp(((lt - seg * SEG) / SEG) / 0.7);
      const e = ease(u);
      lx = barCx(L, waypoints[seg]) + (barCx(L, waypoints[seg + 1]) - barCx(L, waypoints[seg])) * e;
      ly = scanY + Math.sin(lt * 3.2) * 8;
      if (seg === waypoints.length - 2) ly += (targetY - ly) * e * 0.9;
    } else {
      lx = barCx(L, target); ly = targetY;
    }
    const pulse = 1 + 0.1 * Math.sin(Math.PI * clamp((t - SCAN_END) / 0.6));
    const lensA = ease(clamp((t - 0.6) / 0.6));
    drawLens(L, lx, ly, r * pulse, lensA, t, hi);

    // tilde verde sobre la barra encontrada
    const cp = (t - (SCAN_END + 0.6)) / 0.8;
    drawCheck(barCx(L, target), targetTop - r * 1.35 - 10, cp, clamp((t - (SCAN_END + 0.75)) / 0.9));

    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
