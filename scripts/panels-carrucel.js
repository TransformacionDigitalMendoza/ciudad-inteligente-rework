(function () {
  const track = document.querySelector(".panels-track");
  const prevBtn = document.querySelector(".panels-arrow--prev");
  const nextBtn = document.querySelector(".panels-arrow--next");

  if (!track) return;

  // ---- Escala de los iframes ----
  // Cada iframe mide siempre 1280x800 "por dentro" (así la página que
  // muestra arma su layout de escritorio), y acá lo achicamos con
  // transform: scale() para que ocupe el espacio real de la tarjeta.
  // Como .panel-card-media tiene aspect-ratio 16/10 (=1280/800), el
  // mismo factor sirve para ancho y alto.
  const IFRAME_WIDTH = 1280;

  function updateIframeScale() {
    document.querySelectorAll(".panel-card-media").forEach((media) => {
      const scaler = media.querySelector(".panel-card-scaler");
      if (!scaler) return;

      const scale = media.clientWidth / IFRAME_WIDTH;
      scaler.style.transform = `scale(${scale})`;
    });
  }

  updateIframeScale();
  window.addEventListener("resize", updateIframeScale);
  // El carrusel puede cambiar anchos disponibles al montarse fuentes/imágenes;
  // recalculamos una vez más cuando termina de cargar todo.
  window.addEventListener("load", updateIframeScale);

  // ---- Flechas de navegación ----
  // Avanza/retrocede el ancho de una tarjeta + el gap, así cada click
  // "engancha" la próxima tarjeta gracias al scroll-snap del CSS.
  function scrollByCard(direction) {
    const card = track.querySelector(".panel-card");
    if (!card) return;

    const gap = parseFloat(getComputedStyle(track).gap || "32");
    const distance = card.getBoundingClientRect().width + gap;

    track.scrollBy({ left: distance * direction, behavior: "smooth" });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollByCard(1));

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = track.scrollWidth - track.clientWidth - 1;

    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= maxScroll;

    prevBtn.style.opacity = prevBtn.disabled ? "0.35" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.35" : "1";
  }

  track.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateArrows();

  // ---- Activación del iframe al click ----
  // El iframe arranca con pointer-events: none (así nunca "roba" el
  // scroll ni el drag del carrusel). Al tocar la etiqueta, se habilita
  // la interacción y la etiqueta se desvanece.
  document.querySelectorAll(".panel-card-media").forEach((media) => {
    const activateBtn = media.querySelector(".panel-card-activate");
    if (!activateBtn) return;

    activateBtn.addEventListener("click", () => {
      media.classList.add("panel-card-media--active");
    });
  });

  // ---- Favoritos (corazón) ----
  document.querySelectorAll(".panel-card-fav").forEach((favBtn) => {
    favBtn.addEventListener("click", () => {
      const icon = favBtn.querySelector("i");
      if (!icon) return;
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
      favBtn.classList.toggle("panel-card-fav--active");
    });
  });
})();