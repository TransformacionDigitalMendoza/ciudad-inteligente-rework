(function () {
  const wrapper = document.querySelector(".hero-wrapper");
  const heroTitle = document.querySelector(".hero-title");
  const heroBkg = document.querySelector(".hero-bkg");
  const heroAside = document.querySelector(".hero-aside");
  const overlay = document.querySelector(".hero-overlay");
  const textBlocks = document.querySelector(".hero-text-blocks");

  if (!wrapper || !heroTitle || !heroBkg || !heroAside) return;

  const MOBILE_BREAKPOINT = 992;
  let isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function clamp01(n) {
    return Math.min(Math.max(n, 0), 1);
  }

  function resetInlineStyles() {
    // Limpia los estilos que aplica el modo escritorio, para que
    // el CSS responsive tome el control total.
    heroTitle.style.opacity = "";
    heroTitle.style.transform = "";
    heroAside.style.opacity = "";
    heroAside.style.transform = "";
    heroBkg.style.left = "";
    heroBkg.style.width = "";
    heroBkg.style.borderRadius = "";
    if (overlay) overlay.style.opacity = "";
    if (textBlocks) {
      textBlocks.style.opacity = "";
      textBlocks.style.transform = "";
      textBlocks.style.pointerEvents = "";
    }
  }

  function update(p) {
    if (isMobile) return; // no animamos en móvil

    const titleFade = clamp01(p / 0.4);
    heroTitle.style.opacity = 1 - titleFade;
    heroTitle.style.transform = `translateX(${lerp(0, -100, p)}%)`;

    heroAside.style.opacity = 1 - titleFade;
    heroAside.style.transform = `translateX(${lerp(0, 100, p)}%)`;

    heroBkg.style.left = `${lerp(35, 0, p)}%`;
    heroBkg.style.width = `${lerp(25, 100, p)}%`;
    heroBkg.style.borderRadius = `${lerp(24, 0, p)}px`;

    if (overlay) overlay.style.opacity = lerp(0, 0.55, p);

    if (textBlocks) {
      const textP = clamp01((p - 0.5) / 0.5);
      textBlocks.style.opacity = textP;
      textBlocks.style.transform = `translateY(${lerp(30, 0, textP)}px)`;
      textBlocks.style.pointerEvents = textP > 0.5 ? "auto" : "none";
    }
  }

  function onScroll() {
    if (isMobile) return;
    const totalScrollable = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -wrapper.getBoundingClientRect().top;
    const p = clamp01(totalScrollable > 0 ? scrolled / totalScrollable : 0);
    update(p);
  }

  function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (isMobile) {
      resetInlineStyles();
    } else if (wasMobile) {
      // Volvió a desktop: recalcular al toque
      onScroll();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", handleResize);
  handleResize();
  onScroll();
})();