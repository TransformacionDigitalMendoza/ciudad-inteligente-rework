/**
 * Gestión basada en evidencia — efecto de scroll.
 *
 * Al entrar la sección en pantalla:
 *  1. El título (h2/h3/p) aparece centrado (fade + translateY).
 *  2. Los costados de todo el bloque (título, video y KPIs) se
 *     desplazan hacia adentro hasta dejar un margen fijo de 80px
 *     (menos en pantallas chicas, ver breakpoints más abajo).
 *
 * El margen se expone como la custom property --gestion-pad en
 * .gestion-scroll-wrap, y title/video/kpi la heredan vía CSS.
 * Sin JS, --gestion-pad cae al valor final definido en el CSS.
 */
(function () {
  const section = document.querySelector(".gestion");
  if (!section) return;

  const wrap = section.querySelector(".gestion-scroll-wrap");
  const titleBlock = section.querySelector(".gestion-title-block");
  if (!wrap || !titleBlock) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    titleBlock.classList.add("is-visible");
    return;
  }

  // Margen final según ancho de pantalla (debe coincidir con el CSS)
  function getPadEnd() {
    const w = window.innerWidth;
    if (w <= 600) return 20;
    if (w <= 992) return 40;
    return 80;
  }

  // Margen inicial (ancho), proporcional al viewport
  function getPadStart() {
    const padEnd = getPadEnd();
    return Math.max(padEnd, window.innerWidth * 0.24);
  }

  let ticking = false;

  function update() {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // progreso 0 -> 1 a medida que el bloque entra en pantalla:
    // 0 = el top de la sección todavía está en el borde inferior del viewport
    // 1 = el top de la sección llegó aprox. al 15% superior del viewport
    const start = vh;
    const end = vh * 0.15;
    let progress = (start - rect.top) / (start - end);
    progress = Math.min(1, Math.max(0, progress));

    const padStart = getPadStart();
    const padEnd = getPadEnd();
    const pad = padStart + (padEnd - padStart) * progress;

    wrap.style.setProperty("--gestion-pad", pad.toFixed(1) + "px");

    titleBlock.classList.toggle("is-visible", progress > 0.15);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();