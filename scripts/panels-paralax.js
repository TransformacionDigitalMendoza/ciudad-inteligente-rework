(function () {
  const cards = document.querySelectorAll(".panel-card");
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Paralax ----
  // Cada tarjeta trae su propia velocidad en data-speed (positiva o
  // negativa) desde el HTML. A medida que la tarjeta se acerca/aleja
  // del centro de la pantalla, la desplazamos verticalmente en
  // proporción a esa distancia: así cada una "flota" a su propio
  // ritmo en vez de moverse todas pegadas al scroll general.
  if (!prefersReducedMotion) {
    let ticking = false;

    function updateParallax() {
      const viewportCenter = window.innerHeight / 2;

      cards.forEach((card) => {
        const speed = parseFloat(card.dataset.speed || "0");
        const rect = card.getBoundingClientRect();

        // Si la tarjeta está lejos de la pantalla, no hace falta tocarla.
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) {
          return;
        }

        const cardCenter = rect.top + rect.height / 2;
        const distanceFromCenter = viewportCenter - cardCenter;

        card.style.transform = `translateY(${distanceFromCenter * speed}px)`;
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }

  // ---- Activación del iframe al click ----
  // El iframe arranca con pointer-events: none (así nunca "roba" el
  // scroll de la página). Al tocar el hint, se habilita la
  // interacción y el hint se desvanece. Un segundo click en la
  // tarjeta (fuera del iframe) la vuelve a bloquear.
  document.querySelectorAll(".panel-card-frame").forEach((frame) => {
    const hint = frame.querySelector(".panel-card-hint");
    if (!hint) return;

    hint.addEventListener("click", () => {
      frame.classList.add("panel-card-frame--active");
    });
  });
})();