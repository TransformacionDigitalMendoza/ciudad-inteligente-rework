(function () {
  const heroBkg = document.querySelector(".hero-bkg");
  const heroWrapper = document.querySelector(".hero-wrapper");

  if (!heroBkg || !heroWrapper) return;

  heroBkg.addEventListener("click", () => {
    // .hero-section queda "sticky" (pineada) mientras dura el alto extra
    // de .hero-wrapper (250vh). El pineo termina justo cuando
    // scrollY llega a: offsetTop del wrapper + (alto del wrapper - alto de pantalla).
    // Ese es el último frame de la animación ligada al scroll, donde
    // .hero-text-blocks queda completamente visible, todavía dentro del hero
    // (sin pasar a .secondary).
    const targetY =
      heroWrapper.offsetTop + (heroWrapper.offsetHeight - window.innerHeight);

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  });

  // Apenas arranca la animación de scroll (el video empieza a expandirse),
  // ocultamos el hint "Conocé nuestro trabajo": si no, queda pisando el
  // título y el resto del texto que aparece encima del video expandido.
  const scrollableHeight = heroWrapper.offsetHeight - window.innerHeight;
  const hideThreshold = 0.05; // 5% de progreso ya alcanza para ocultarlo

  let ticking = false;

  function updateHintVisibility() {
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