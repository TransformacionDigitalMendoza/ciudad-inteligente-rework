(function () {
  const wrapper = document.querySelector(".hero-wrapper");
  const heroTitle = document.querySelector(".hero-title");
  const heroBkg = document.querySelector(".hero-bkg");
  const heroAside = document.querySelector(".hero-aside");
  const overlay = document.querySelector(".hero-overlay");
  const textBlocks = document.querySelector(".hero-text-blocks");

  if (!wrapper || !heroTitle || !heroBkg || !heroAside) return;

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function clamp01(n) {
    return Math.min(Math.max(n, 0), 1);
  }

  function update(p) {
    // Título: se desliza hacia la izquierda y se desvanece rápido
    const titleFade = clamp01(p / 0.4);
    heroTitle.style.opacity = 1 - titleFade;
    heroTitle.style.transform = `translateX(${lerp(0, -100, p)}%)`;

    // Aside: se desliza hacia la derecha y se desvanece rápido
    heroAside.style.opacity = 1 - titleFade;
    heroAside.style.transform = `translateX(${lerp(0, 100, p)}%)`;

    // Fondo de video: crece pero deja un margen lateral (no llega al 100% del ancho)
    heroBkg.style.left = `${lerp(35, 0, p)}%`;
    heroBkg.style.width = `${lerp(25, 100, p)}%`;
    heroBkg.style.borderRadius = `${lerp(24, 0, p)}px`;

    // Overlay oscuro: aparece progresivamente
    if (overlay) overlay.style.opacity = lerp(0, 0.55, p);

    // Bloques de texto: aparecen recién en la segunda mitad de la animación
    if (textBlocks) {
      const textP = clamp01((p - 0.5) / 0.5);
      textBlocks.style.opacity = textP;
      textBlocks.style.transform = `translateY(${lerp(30, 0, textP)}px)`;
      textBlocks.style.pointerEvents = textP > 0.5 ? "auto" : "none";
    }
  }

  function onScroll() {
    const totalScrollable = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -wrapper.getBoundingClientRect().top;
    const p = clamp01(totalScrollable > 0 ? scrolled / totalScrollable : 0);
    update(p);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();