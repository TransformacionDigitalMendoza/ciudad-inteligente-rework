  (function () {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ---- Barras: cada una muta en su propio ritmo, sin sincronizarse ----
    document.querySelectorAll(".dm-bar").forEach((bar) => {
      function randomize() {
        const height = 25 + Math.random() * 90;
        const y = 130 - height;
        bar.setAttribute("height", height.toFixed(1));
        bar.setAttribute("y", y.toFixed(1));

        if (!prefersReducedMotion) {
          setTimeout(randomize, 900 + Math.random() * 1400);
        }
      }
      randomize();
    });

    // ---- Onda: puntos que flotan hacia objetivos aleatorios sin parar ----
    const waveFill = document.querySelector(".dm-wave-fill");
    const waveLine = document.querySelector(".dm-wave-line");

    if (waveFill && waveLine) {
      const POINTS = 6;
      const width = 220;
      const baseline = 128;
      const xs = Array.from({ length: POINTS }, (_, i) => (i * width) / (POINTS - 1));

      const current = xs.map(() => 40 + Math.random() * 60);
      const target = xs.map(() => 30 + Math.random() * 80);

      function smoothPath(ys) {
        let d = `M ${xs[0]} ${ys[0]}`;
        for (let i = 0; i < xs.length - 1; i++) {
          const midX = (xs[i] + xs[i + 1]) / 2;
          const midY = (ys[i] + ys[i + 1]) / 2;
          d += ` Q ${xs[i]} ${ys[i]} ${midX} ${midY}`;
        }
        d += ` T ${xs[xs.length - 1]} ${ys[ys.length - 1]}`;
        return d;
      }

      function tick() {
        let allClose = true;

        for (let i = 0; i < POINTS; i++) {
          current[i] += (target[i] - current[i]) * 0.03;
          if (Math.abs(target[i] - current[i]) > 0.5) allClose = false;
        }

        if (allClose) {
          for (let i = 0; i < POINTS; i++) {
            target[i] = 25 + Math.random() * 85;
          }
        }

        const linePath = smoothPath(current);
        waveLine.setAttribute("d", linePath);
        waveFill.setAttribute(
          "d",
          `${linePath} L ${width} ${baseline} L 0 ${baseline} Z`
        );

        if (!prefersReducedMotion) requestAnimationFrame(tick);
      }

      tick();
      if (prefersReducedMotion) {
        // Deja un solo frame estático en vez de animar.
        const linePath = smoothPath(current);
        waveLine.setAttribute("d", linePath);
        waveFill.setAttribute(
          "d",
          `${linePath} L ${width} ${baseline} L 0 ${baseline} Z`
        );
      }
    }

    // ---- Anillos: cada uno cambia de proporción cada tanto ----
    [
      { el: document.querySelector(".dm-ring--1"), r: 58 },
      { el: document.querySelector(".dm-ring--2"), r: 42 },
      { el: document.querySelector(".dm-ring--3"), r: 26 },
    ].forEach(({ el, r }) => {
      if (!el) return;
      const circumference = 2 * Math.PI * r;

      function randomize() {
        const portion = 0.15 + Math.random() * 0.55;
        const dash = circumference * portion;
        const offset = Math.random() * circumference;

        el.setAttribute("stroke-dasharray", `${dash} ${circumference}`);
        el.setAttribute("stroke-dashoffset", offset.toFixed(1));

        if (!prefersReducedMotion) {
          setTimeout(randomize, 1600 + Math.random() * 1800);
        }
      }
      randomize();
    });
  })();