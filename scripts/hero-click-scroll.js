(function () {
  const heroBkg = document.querySelector(".hero-bkg");
  const heroWrapper = document.querySelector(".hero-wrapper");

  if (!heroBkg || !heroWrapper) return;

  const MOBILE_BREAKPOINT = 992;

  heroBkg.addEventListener("click", () => {
    // En móvil el video ocupa 100vh y no hay animación de expansión:
    // no hacemos scroll automático.
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;

    const targetY =
      heroWrapper.offsetTop + (heroWrapper.offsetHeight - window.innerHeight);

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  });

  const scrollableHeight = heroWrapper.offsetHeight - window.innerHeight;
  const hideThreshold = 0.05;

  let ticking = false;

  function updateHintVisibility() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      heroBkg.classList.remove("hero-bkg--hide-hint");
      ticking = false;
      return;
    }

    const progress =
      scrollableHeight > 0
        ? (window.scrollY - heroWrapper.offsetTop) / scrollableHeight
        : 0;

    heroBkg.classList.toggle("hero-bkg--hide-hint", progress > hideThreshold);
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHintVisibility);
      ticking = true;
    }
  });

  updateHintVisibility();
})();