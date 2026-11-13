(() => {
  const cv = document.getElementById('win-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Todo se dibuja en un espacio lógico de 800x500 y se escala al canvas
  const VW = 800, VH = 500, TB = 44, DESK_H = VH - TB;     // TB = alto de la barra de tareas
  const WX = 8, WY = 8, WW = 784, WH = 440, TITLE = 32;    // ventana maximizada
  const BW = WW, BH = WH - TITLE;                          // cuerpo de la ventana
  let W = 0, H = 0, dpr = 1, sc = 1, ox = 0, oy = 0;

  // ---------- Colores (variables CSS con fallback) ----------
  const DEF = { ink: '#242424', paper: '#ffffff', desk: '#d9e5f0', green: '#19a76e', amber: '#e29b01', blue: '#5b9bd5' };
  const col = {}, rgb = {};
  const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    for (const k in DEF) {
      const v = s.getPropertyValue('--win-' + k).trim();
      col[k] = /^#[0-9a-f]{6}$/i.test(v) ? v : DEF[k];
      rgb[k] = hexRgb(col[k]);
    }
  };
  const A = (k, a) => `rgba(${rgb[k][0]},${rgb[k][1]},${rgb[k][2]},${a})`;
  readColors();

  // ---------- Utilidades ----------
  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = t => t * t * (3 - 2 * t);
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  let blurK = 1; // shadowBlur no escala con la transformación

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Iconos simples (mapa, tabla, documento)
  function glyph(kind, cx, cy, color, lw) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw || 1.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    if (kind === 'map') {
      ctx.moveTo(cx - 9, cy - 6); ctx.lineTo(cx - 3, cy - 9); ctx.lineTo(cx + 3, cy - 6); ctx.lineTo(cx + 9, cy - 9);
      ctx.lineTo(cx + 9, cy + 6); ctx.lineTo(cx + 3, cy + 9); ctx.lineTo(cx - 3, cy + 6); ctx.lineTo(cx - 9, cy + 9);
      ctx.closePath();
      ctx.moveTo(cx - 3, cy - 9); ctx.lineTo(cx - 3, cy + 6);
      ctx.moveTo(cx + 3, cy - 6); ctx.lineTo(cx + 3, cy + 9);
    } else if (kind === 'table') {
      ctx.rect(cx - 9, cy - 7, 18, 14);
      ctx.moveTo(cx - 9, cy - 2.3); ctx.lineTo(cx + 9, cy - 2.3);
      ctx.moveTo(cx - 9, cy + 2.3); ctx.lineTo(cx + 9, cy + 2.3);
      ctx.moveTo(cx - 3, cy - 7); ctx.lineTo(cx - 3, cy + 7);
      ctx.moveTo(cx + 3, cy - 7); ctx.lineTo(cx + 3, cy + 7);
    } else {
      ctx.moveTo(cx - 6, cy - 9); ctx.lineTo(cx + 2, cy - 9); ctx.lineTo(cx + 7, cy - 4);
      ctx.lineTo(cx + 7, cy + 9); ctx.lineTo(cx - 6, cy + 9); ctx.closePath();
      ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx - 3, cy + 3.5); ctx.lineTo(cx + 4, cy + 3.5);
      ctx.moveTo(cx - 3, cy + 7); ctx.lineTo(cx + 1, cy + 7);
    }
    ctx.stroke();
    ctx.restore();
  }

  // =====================================================================
  //  VENTANA 1: MAPA (se desplaza, ruta animada, pin que rebota)
  // =====================================================================
  function pin(x, y, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x, y, 7, 3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 18, 10, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 8, y - 12); ctx.lineTo(x, y); ctx.lineTo(x + 8, y - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y - 18, 4, 0, 6.283); ctx.fill();
  }

  function drawMap(lt) {
    const t = lt / 1000;
    const px = 30 * t + 40, py = 60 + 40 * Math.sin(t * 0.6); // el mapa se desplaza
    const C = 104, st = 14;                                    // tamaño de manzana / calle
    ctx.fillStyle = '#f6f8fa'; ctx.fillRect(0, 0, BW, BH);

    const i0 = Math.floor(px / C) - 1, i1 = Math.floor((px + BW) / C) + 1;
    const j0 = Math.floor(py / C) - 1, j1 = Math.floor((py + BH) / C) + 1;
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        const x = i * C - px + st / 2, y = j * C - py + st / 2, w = C - st, h = C - st, k = hash(i, j);
        if (k < 0.15) { // parque
          rr(x, y, w, h, 6); ctx.fillStyle = '#cfe6d6'; ctx.fill();
          ctx.fillStyle = '#a9d3b8';
          for (let n = 0; n < 4; n++) {
            ctx.beginPath();
            ctx.arc(x + 14 + hash(i + n, j * 3) * (w - 28), y + 14 + hash(i * 3, j + n) * (h - 28), 6 + hash(n, i + j) * 4, 0, 6.283);
            ctx.fill();
          }
        } else { // manzana con edificios
          rr(x, y, w, h, 5); ctx.fillStyle = '#e4eaf0'; ctx.fill();
          for (let a = 0; a < 2; a++) {
            for (let b = 0; b < 2; b++) {
              const hh = hash(i * 7 + a, j * 5 + b);
              rr(x + 6 + a * (w / 2 - 3), y + 6 + b * (h / 2 - 3), w / 2 - 9, h / 2 - 9, 3);
              ctx.fillStyle = hh > 0.82 ? A('amber', 0.4) : (hh > 0.4 ? '#d5dee7' : '#cbd6e1');
              ctx.fill();
            }
          }
        }
      }
    }

    // Río
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = -20; x <= BW + 20; x += 10) {
      const y = 260 + 50 * Math.sin((x + px) / 190) + 16 * Math.sin((x + px) / 63) - py;
      if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#b9d6ea'; ctx.lineWidth = 46; ctx.stroke();
    ctx.strokeStyle = '#cfe4f3'; ctx.lineWidth = 30; ctx.stroke();

    // Ruta por las calles (en coordenadas del mapa, se mueve con él)
    const P = [[2, 4], [2, 2], [5, 2], [5, 1], [7, 1]].map(p => [p[0] * C - px, p[1] * C - py]);
    ctx.beginPath();
    P.forEach((p, n) => n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 11; ctx.stroke();
    ctx.strokeStyle = col.green; ctx.lineWidth = 5; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 55; ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;

    // Origen con pulso
    const s0 = P[0], ph = (t * 0.9) % 1;
    ctx.strokeStyle = A('blue', 1 - ph); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s0[0], s0[1], 8 + 14 * ph, 0, 6.283); ctx.stroke();
    ctx.fillStyle = col.blue; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s0[0], s0[1], 7, 0, 6.283); ctx.fill(); ctx.stroke();

    // Destino
    const e = P[P.length - 1];
    pin(e[0], e[1] - 5 * Math.abs(Math.sin(t * 3)), col.green);

    // Controles del mapa
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,40,0.18)'; ctx.shadowBlur = 10 * blurK; ctx.shadowOffsetY = 2 * blurK;
    ctx.fillStyle = '#fff';
    rr(16, 16, 250, 36, 18); ctx.fill();
    rr(BW - 52, 16, 36, 36, 8); ctx.fill();
    rr(BW - 52, 56, 36, 36, 8); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = col.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(37, 33, 6, 0, 6.283); ctx.moveTo(41.5, 37.5); ctx.lineTo(46, 42); ctx.stroke();
    ctx.fillStyle = '#cfd9e3'; rr(60, 30, 120, 6, 3); ctx.fill();
    ctx.fillStyle = '#e1e8ef'; rr(60, 40, 70, 4, 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(BW - 40, 34); ctx.lineTo(BW - 28, 34); ctx.moveTo(BW - 34, 28); ctx.lineTo(BW - 34, 40);
    ctx.moveTo(BW - 40, 74); ctx.lineTo(BW - 28, 74);
    ctx.stroke();
  }

  // =====================================================================
  //  VENTANA 2: BASE DE DATOS (un selector recorre las celdas)
  // =====================================================================
  const COLS = [90, 200, 150, 130, 170], NAMES = ['ID', 'SERVICIO', 'ÁREA', 'ESTADO', 'AVANCE'];
  const RN = 44, TH = 40, HH = 30, RH = 28, NR = 12;
  const COLX = []; COLS.reduce((a, w, i) => (COLX[i] = a, a + w), RN);
  const cellOf = n => ({ c: n % 5, r: Math.floor(n / 5) % NR });

  function drawTable(lt) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, BW, BH);

    // Posición del selector (salta de celda en celda con easing)
    const step = 230, i = Math.floor(lt / step), f = lt / step - i, e = inOutCubic(clamp(f * 2.2));
    const a = cellOf(i), b = cellOf(i + 1);
    const selX = lerp(COLX[a.c], COLX[b.c], e), selW = lerp(COLS[a.c], COLS[b.c], e);
    const selY = TH + HH + lerp(a.r, b.r, e) * RH;
    const cur = e < 0.5 ? a : b;

    // Barra de herramientas + fórmula
    ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, BW, TH);
    ctx.fillStyle = '#dde5ee';
    for (let k = 0; k < 4; k++) { rr(14 + k * 34, 10, 24, 20, 5); ctx.fill(); }
    rr(160, 9, BW - 176, 22, 5); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#d3dce6'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#b9c6d3'; rr(170, 16, 40 + hash(cur.c, cur.r) * 180, 8, 4); ctx.fill();

    // Encabezado
    ctx.fillStyle = '#e9eff5'; ctx.fillRect(0, TH, BW, HH);
    ctx.font = '700 10.5px Raleway, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = col.ink;
    NAMES.forEach((n, k) => ctx.fillText(n, COLX[k] + 12, TH + HH / 2 + 1));
    ctx.fillStyle = col.amber; ctx.fillRect(COLX[cur.c], TH + HH - 3, COLS[cur.c], 3);

    // Filas
    for (let r = 0; r < NR; r++) {
      const y = TH + HH + r * RH;
      ctx.fillStyle = r === cur.r ? A('green', 0.08) : (r % 2 ? '#f8fafc' : '#fff');
      ctx.fillRect(RN, y, BW - RN, RH);
      ctx.fillStyle = r === cur.r ? '#d6efe3' : '#eef3f8'; ctx.fillRect(0, y, RN, RH);
      ctx.fillStyle = col.ink; ctx.globalAlpha = r === cur.r ? 1 : 0.5;
      ctx.font = (r === cur.r ? '700 ' : '500 ') + '10.5px Raleway, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(r + 1), RN / 2, y + RH / 2 + 1);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';

      // contenido de cada celda (ilustrativo: barras, etiquetas de estado y progreso)
      const bar = (x, w) => { ctx.fillStyle = '#c3cfdb'; rr(x, y + 11, w, 6, 3); ctx.fill(); };
      bar(COLX[0] + 12, 30 + hash(r, 0) * 14);
      bar(COLX[1] + 12, 60 + hash(r, 1) * 100);
      bar(COLX[2] + 12, 40 + hash(r, 2) * 70);
      const k = hash(r, 3), sk = k < 0.45 ? 'green' : (k < 0.75 ? 'amber' : 'blue');
      rr(COLX[3] + 12, y + 6, 66, 16, 8); ctx.fillStyle = A(sk, 0.2); ctx.fill();
      ctx.fillStyle = col[sk]; ctx.beginPath(); ctx.arc(COLX[3] + 23, y + 14, 3.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = A(sk, 0.7); rr(COLX[3] + 32, y + 12, 34, 4, 2); ctx.fill();
      rr(COLX[4] + 12, y + 10, 110, 8, 4); ctx.fillStyle = '#e3eaf1'; ctx.fill();
      rr(COLX[4] + 12, y + 10, 110 * (0.2 + 0.8 * hash(r, 4)), 8, 4); ctx.fillStyle = hash(r, 5) > 0.5 ? col.blue : col.green; ctx.fill();
    }

    // Líneas de la cuadrícula
    ctx.strokeStyle = '#e3eaf1'; ctx.lineWidth = 1; ctx.beginPath();
    for (let r = 0; r <= NR; r++) { const y = TH + HH + r * RH + 0.5; ctx.moveTo(0, y); ctx.lineTo(BW, y); }
    ctx.moveTo(RN + 0.5, TH); ctx.lineTo(RN + 0.5, BH);
    COLX.forEach((x, k) => { if (k) { ctx.moveTo(x + 0.5, TH); ctx.lineTo(x + 0.5, BH); } });
    ctx.stroke();

    // Selector
    rr(selX + 1, selY + 1, selW - 2, RH - 2, 3);
    ctx.fillStyle = A('green', 0.16); ctx.fill();
    ctx.strokeStyle = col.green; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = col.green; ctx.fillRect(selX + selW - 6, selY + RH - 6, 7, 7);
  }

  // =====================================================================
  //  VENTANA 3: DOCUMENTO (la página hace scroll)
  // =====================================================================
  const DOC_W = 520, DOC_L = 36, DOC_TW = DOC_W - 72;
  const docItems = []; let docH = 0;
  (function buildDoc() {
    let y = 30, n = 0;
    const r = () => hash(++n, 13), add = o => docItems.push(o);
    const para = lines => {
      for (let i = 0; i < lines; i++) {
        const last = i === lines - 1, w = last ? DOC_TW * (0.3 + 0.4 * r()) : DOC_TW;
        add({ t: 'l', x: DOC_L, y, w, h: 6 });
        if (!last && r() < 0.14) {
          const hx = r() * w * 0.5;
          add({ t: 'hl', x: DOC_L + hx, y: y - 3, w: Math.min(60 + r() * 90, w - hx), h: 12 });
        }
        y += 14;
      }
      y += 14;
    };
    const h2 = () => { add({ t: 'h2', x: DOC_L, y, w: 180 + r() * 80, h: 11 }); y += 28; };
    const img = hh => { add({ t: 'img', x: DOC_L, y, w: DOC_TW, h: hh }); y += hh + 20; };
    const list = k => {
      for (let i = 0; i < k; i++) {
        add({ t: 'dot', x: DOC_L + 5, y: y + 3 });
        add({ t: 'l', x: DOC_L + 18, y, w: DOC_TW * (0.45 + 0.5 * r()) - 18, h: 6 });
        y += 20;
      }
      y += 10;
    };
    const quote = () => { add({ t: 'q', x: DOC_L, y, w: DOC_TW, h: 46 }); y += 66; };
    add({ t: 'h', x: DOC_L, y, w: 300, h: 16 }); y += 36;
    add({ t: 'm', x: DOC_L, y, w: 170, h: 6 }); y += 28;
    para(6); img(130); h2(); para(5); list(4); h2(); para(7); quote(); para(5); h2(); para(6); img(110); para(4);
    docH = y + 40;
  })();

  function drawDoc(lt) {
    const TBH = 36;
    ctx.fillStyle = '#e4ebf2'; ctx.fillRect(0, 0, BW, BH);

    // Página con scroll
    const viewH = BH - TBH - 28, maxS = docH - viewH;
    const s = maxS * smooth(clamp((lt - 300) / 3000));
    const px = (BW - DOC_W) / 2, py = TBH + 14 - s;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, TBH, BW, BH - TBH); ctx.clip();
    ctx.save();
    ctx.shadowColor = 'rgba(20,30,40,0.18)'; ctx.shadowBlur = 14 * blurK; ctx.shadowOffsetY = 3 * blurK;
    ctx.fillStyle = '#fff'; ctx.fillRect(px, py, DOC_W, docH);
    ctx.restore();

    for (const o of docItems) {
      const X = px + o.x, Y = py + o.y;
      if (Y > BH || Y + (o.h || 10) < TBH) continue;
      switch (o.t) {
        case 'h': ctx.fillStyle = col.ink; rr(X, Y, o.w, o.h, 4); ctx.fill(); break;
        case 'h2': ctx.fillStyle = '#5c6b7a'; rr(X, Y, o.w, o.h, 4); ctx.fill(); break;
        case 'm': ctx.fillStyle = '#b4c2d0'; rr(X, Y, o.w, o.h, 3); ctx.fill(); break;
        case 'l': ctx.fillStyle = '#cfd9e3'; rr(X, Y, o.w, o.h, 3); ctx.fill(); break;
        case 'hl': ctx.fillStyle = A('amber', 0.35); rr(X, Y, o.w, o.h, 3); ctx.fill(); break;
        case 'dot': ctx.fillStyle = col.green; ctx.beginPath(); ctx.arc(X, Y, 3, 0, 6.283); ctx.fill(); break;
        case 'q':
          ctx.fillStyle = A('green', 0.08); rr(X, Y, o.w, o.h, 6); ctx.fill();
          ctx.fillStyle = col.green; ctx.fillRect(X, Y, 4, o.h);
          ctx.fillStyle = '#b9c6d3'; rr(X + 18, Y + 12, o.w - 60, 6, 3); ctx.fill();
          rr(X + 18, Y + 28, o.w * 0.5, 6, 3); ctx.fill();
          break;
        case 'img':
          ctx.save(); rr(X, Y, o.w, o.h, 6); ctx.clip();
          ctx.fillStyle = '#dcebf7'; ctx.fillRect(X, Y, o.w, o.h);
          ctx.fillStyle = A('amber', 0.75); ctx.beginPath(); ctx.arc(X + o.w * 0.75, Y + o.h * 0.32, 14, 0, 6.283); ctx.fill();
          ctx.fillStyle = A('blue', 0.5);
          ctx.beginPath(); ctx.moveTo(X, Y + o.h); ctx.lineTo(X, Y + o.h * 0.65);
          ctx.quadraticCurveTo(X + o.w * 0.25, Y + o.h * 0.3, X + o.w * 0.5, Y + o.h * 0.7);
          ctx.quadraticCurveTo(X + o.w * 0.75, Y + o.h * 0.95, X + o.w, Y + o.h * 0.55);
          ctx.lineTo(X + o.w, Y + o.h); ctx.closePath(); ctx.fill();
          ctx.fillStyle = A('green', 0.55);
          ctx.beginPath(); ctx.moveTo(X, Y + o.h); ctx.lineTo(X, Y + o.h * 0.85);
          ctx.quadraticCurveTo(X + o.w * 0.35, Y + o.h * 0.55, X + o.w * 0.65, Y + o.h * 0.9);
          ctx.quadraticCurveTo(X + o.w * 0.85, Y + o.h * 0.75, X + o.w, Y + o.h * 0.85);
          ctx.lineTo(X + o.w, Y + o.h); ctx.closePath(); ctx.fill();
          ctx.restore();
          break;
      }
    }
    ctx.restore();

    // Barra de herramientas
    ctx.fillStyle = '#f6f9fc'; ctx.fillRect(0, 0, BW, TBH);
    ctx.fillStyle = '#d9e2eb'; ctx.fillRect(0, TBH - 1, BW, 1);
    ctx.fillStyle = col.ink; ctx.globalAlpha = 0.7; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.font = '800 14px Raleway, sans-serif'; ctx.fillText('B', 24, 19);
    ctx.font = 'italic 600 14px Raleway, sans-serif'; ctx.fillText('I', 54, 19);
    ctx.font = '600 14px Raleway, sans-serif'; ctx.fillText('U', 84, 19);
    ctx.fillRect(81, 27, 7, 1);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
    ctx.fillStyle = '#d2dce6'; rr(116, 12, 60, 12, 6); ctx.fill();
    ctx.strokeStyle = '#b4c2d0'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath();
    for (let k = 0; k < 3; k++) { ctx.moveTo(200, 12 + k * 6); ctx.lineTo(216 - (k === 1 ? 4 : 0), 12 + k * 6); }
    ctx.stroke();

    // Barra de scroll
    const tx = BW - 11, ty = TBH + 8, th = BH - TBH - 16, thumb = Math.max(30, th * viewH / docH);
    ctx.fillStyle = 'rgba(36,36,36,0.07)'; rr(tx, ty, 5, th, 2.5); ctx.fill();
    ctx.fillStyle = 'rgba(36,36,36,0.35)'; rr(tx, ty + (th - thumb) * (s / maxS), 5, thumb, 2.5); ctx.fill();
  }

  // =====================================================================
  //  ESCENA: barra de tareas + ventanas que se maximizan
  // =====================================================================
  // os = inicio de apertura, cs = inicio del cierre (se minimizan en orden inverso)
  const WINS = [
    { kind: 'map',   title: 'Mapa',          icon: 84,  os: 500,  cs: 11500, cd: 500, accent: 'green', draw: drawMap },
    { kind: 'table', title: 'Base de datos', icon: 134, os: 3900, cs: 11100, cd: 450, accent: 'amber', draw: drawTable },
    { kind: 'doc',   title: 'Documento',     icon: 184, os: 7300, cs: 10500, cd: 550, accent: 'blue',  draw: drawDoc }
  ];
  const OPEN = 800, CYCLE = 12900;
  const prog = (w, c) => c < w.os ? 0 : (c >= w.cs ? 1 - clamp((c - w.cs) / w.cd) : clamp((c - w.os) / OPEN));

  function drawTaskbar(c, ps) {
    ctx.fillStyle = col.ink; ctx.fillRect(0, DESK_H, VW, TB);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, DESK_H, VW, 1);
    ctx.fillStyle = col.green; ctx.beginPath(); ctx.arc(30, 478, 8, 0, 6.283); ctx.fill();
    ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(30, 478, 3, 0, 6.283); ctx.fill();

    let top = -1; ps.forEach((p, i) => { if (p > 0.5) top = i; });
    WINS.forEach((w, i) => {
      const p = ps[i], cx = w.icon, cy = 477;
      const a = p > 0.02 ? (i === top ? 0.16 : 0.07) : 0;
      const ft = c - w.os, flash = ft >= 0 && ft < 300 ? 1 - ft / 300 : 0; // destello al "hacer click"
      if (a > 0 || flash > 0) {
        rr(cx - 17, cy - 17, 34, 34, 8);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
        if (flash > 0) { ctx.fillStyle = A(w.accent, 0.55 * flash); ctx.fill(); }
      }
      glyph(w.kind, cx, cy - 1, '#f0f8ff');
      if (p > 0.02) { const iw = 16 * clamp(p * 2); ctx.fillStyle = col[w.accent]; rr(cx - iw / 2, cy + 15, iw, 3, 1.5); ctx.fill(); }
    });

    // Bandeja del sistema (decorativa)
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(702, 478, 3, 0, 6.283); ctx.arc(718, 478, 3, 0, 6.283); ctx.fill();
    rr(742, 471, 40, 5, 2.5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; rr(750, 480, 32, 4, 2); ctx.fill();
  }

  function drawWindow(w, p, c) {
    const e = inOutCubic(p), lt = Math.max(c - w.os, 0);
    const ix = w.icon - 14, iy = 463, is = 28;               // rectángulo del icono en la barra
    const x = lerp(ix, WX, e), y = lerp(iy, WY, e), ww = lerp(is, WW, e), hh = lerp(is, WH, e);

    ctx.save();
    ctx.globalAlpha = clamp(p * 5);
    ctx.translate(x, y); ctx.scale(ww / WW, hh / WH);

    ctx.shadowColor = 'rgba(20,30,40,0.3)'; ctx.shadowBlur = 24 * blurK; ctx.shadowOffsetY = 6 * blurK;
    rr(0, 0, WW, WH, 8); ctx.fillStyle = col.paper; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    rr(0, 0, WW, WH, 8); ctx.clip();

    // Barra de título
    ctx.fillStyle = col.ink; ctx.fillRect(0, 0, WW, TITLE);
    glyph(w.kind, 20, 16, col[w.accent], 1.6);
    ctx.font = '600 12.5px Raleway, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = '#f0f8ff'; ctx.fillText(w.title, 38, 17);
    ctx.strokeStyle = 'rgba(240,248,255,0.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(WW - 27, 11); ctx.lineTo(WW - 17, 21); ctx.moveTo(WW - 17, 11); ctx.lineTo(WW - 27, 21); // cerrar
    ctx.moveTo(WW - 87, 19); ctx.lineTo(WW - 77, 19);                                                   // minimizar
    ctx.stroke();
    ctx.strokeRect(WW - 57, 11, 10, 10);                                                                // maximizar

    // Contenido: aparece cuando la ventana ya casi terminó de abrirse
    const fa = clamp((p - 0.45) * 2.2);
    if (fa > 0) {
      ctx.globalAlpha *= fa;
      ctx.save();
      ctx.translate(0, TITLE);
      ctx.beginPath(); ctx.rect(0, 0, BW, BH); ctx.clip();
      w.draw(lt);
      ctx.restore();
    }
    ctx.restore();
  }

  let curC = reduce ? 10000 : 0;
  function draw(c) {
    curC = c;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);

    ctx.save();
    rr(0, 0, VW, VH, 16); ctx.clip();
    ctx.fillStyle = col.desk; ctx.fillRect(0, 0, VW, VH);
    const g = ctx.createRadialGradient(620, 120, 20, 620, 120, 460);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);

    const ps = WINS.map(w => prog(w, c));
    WINS.forEach((w, i) => { if (ps[i] > 0.001) drawWindow(w, ps[i], c); });
    drawTaskbar(c, ps);
    ctx.restore();

    rr(0, 0, VW, VH, 16); ctx.lineWidth = 4; ctx.strokeStyle = col.ink; ctx.stroke();
  }

  // ---------- Tamaño ----------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    sc = Math.min(W / VW, H / VH);
    ox = (W - VW * sc) / 2; oy = (H - VH * sc) / 2;
    blurK = sc * dpr;
    draw(curC);
  }
  addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cv);
  resize();

  // ---------- Animación: corre solo mientras el canvas está en pantalla ----------
  let clock = 0, last = 0, raf = 0, running = false;
  function loop(now) {
    if (!running) return;
    clock += Math.min(now - last, 50); last = now;
    draw(clock % CYCLE);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running || reduce) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? play() : pause());
    }, { threshold: 0.2 }).observe(cv);
  } else {
    play();
  }

  // Click: reinicia la secuencia desde la barra de tareas vacía
  cv.addEventListener('click', () => { clock = 0; if (reduce) draw(10000); });
})();