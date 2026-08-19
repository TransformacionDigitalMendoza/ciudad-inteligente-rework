(function () {
  const items = document.querySelectorAll(".area-item");
  const card = document.getElementById("areaCard");
  const barsWrapper = document.getElementById("barsWrapper");
  const areaImage = document.getElementById("areaImage");
  if (!items.length || !card) return;

  const cardText = card.querySelector("p");
  const offsetX = 24; // separación horizontal respecto al cursor
  const offsetY = 24; // separación vertical respecto al cursor
  const ease = 0.12; // 0 = sin movimiento, 1 = sin delay. Más bajo = más "lag".

  let mouseX = 0;
  let mouseY = 0;
  let cardX = 0;
  let cardY = 0;
  let initialized = false;

  function getTargetPosition() {
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    let x = mouseX + offsetX;
    let y = mouseY + offsetY;

    // Evita que la tarjeta se salga por el borde derecho/inferior de la pantalla
    if (x + cardWidth > window.innerWidth) {
      x = mouseX - cardWidth - offsetX;
    }
    if (y + cardHeight > window.innerHeight) {
      y = mouseY - cardHeight - offsetY;
    }
    return { x, y };
  }

  function tick() {
    const target = getTargetPosition();

    if (!initialized) {
      cardX = target.x;
      cardY = target.y;
      initialized = true;
    } else {
      cardX += (target.x - cardX) * ease;
      cardY += (target.y - cardY) * ease;
    }

    card.style.transform = `translate(${cardX}px, ${cardY}px)`;
    requestAnimationFrame(tick);
  }

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      cardText.textContent = item.dataset.text || "";

      // Fondo propio de cada tarjeta, si el bloque trae data-bg
      const bg = item.dataset.bg;
      if (bg) {
        card.style.backgroundImage = `url("${bg}")`;
        card.classList.add("has-bg");
      } else {
        card.style.backgroundImage = "none";
        card.classList.remove("has-bg");
      }

      card.classList.add("visible");

      // Las barras se juntan (sin gap) para formar un bloque sólido
      if (barsWrapper) barsWrapper.classList.add("merged");

      // Si el área tiene una imagen válida, la mostramos por encima de las barras
      if (areaImage) {
        if (bg && bg !== "#") {
          areaImage.src = bg;
          areaImage.classList.add("visible");
        } else {
          areaImage.classList.remove("visible");
        }
      }
    });

    item.addEventListener("mouseleave", () => {
      card.classList.remove("visible");

      // Las barras vuelven a separarse y a mostrar el gradiente animado
      if (barsWrapper) barsWrapper.classList.remove("merged");

      // La imagen se desvanece y quedan las barras a la vista
      if (areaImage) areaImage.classList.remove("visible");
    });
  });

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  requestAnimationFrame(tick);
})();