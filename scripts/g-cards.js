/* ============================================================
   g-cards.js
   - Abre/cierra cada .g-card (acordeón: al abrir una se cierran
     las demás).
   - El <video> del hero desplegado NO tiene src en el HTML
     (usa data-src) y sólo se le asigna al abrirse la card, para
     no descargar video que el usuario nunca llega a ver.
   - Los <iframe> de los tableros tampoco tienen src (data-src) y
     sólo se cargan cuando el usuario hace click en el botón
     "Click para interactuar" de cada tablero, para no tirar
     abajo la página cargando varios sitios pesados a la vez.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const cards = document.querySelectorAll('.g-card');

  /* ---------- Abrir / cerrar cards ---------- */

  function loadHeroVideo(card) {
    const video = card.querySelector('.g-expanded-hero video[data-src]');
    if (!video) return;
    const source = video.dataset.src;
    video.src = source;
    video.removeAttribute('data-src');
    video.load();
    video.play().catch(() => {
      /* algunos navegadores bloquean el autoplay: no pasa nada,
         el video queda listo para reproducirse igual */
    });
  }

  function pauseHeroVideo(card) {
    const video = card.querySelector('.g-expanded-hero video');
    if (video && !video.paused) video.pause();
  }

  function openCard(card) {
    cards.forEach((other) => {
      if (other !== card && other.classList.contains('is-open')) {
        closeCard(other);
      }
    });
    card.classList.add('is-open');
    loadHeroVideo(card);
  }

  function closeCard(card) {
    card.classList.remove('is-open');
    pauseHeroVideo(card);
  }

  cards.forEach((card) => {
    const openBtn = card.querySelector('.g-open-btn');
    const closeBtn = card.querySelector('.g-close-btn');

    if (openBtn) {
      openBtn.addEventListener('click', () => openCard(card));
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeCard(card));
    }
  });

  /* ---------- Tableros (iframes): sólo cargan al hacer click ---------- */

  const panelRows = document.querySelectorAll('.panel-row-media');

  function scalePanel(media) {
    const scaler = media.querySelector('.panel-row-scaler');
    if (!scaler) return;
    const width = media.clientWidth;
    if (!width) return; // la card puede seguir colapsada (max-height 0)
    const scale = width / 1280;
    scaler.style.transform = `scale(${scale})`;
    media.style.height = `${800 * scale}px`;
  }

  function scaleAllPanels() {
    panelRows.forEach(scalePanel);
  }

  window.addEventListener('resize', scaleAllPanels);
  scaleAllPanels();

  // Cuando una card se despliega, sus tableros pasan de max-height:0
  // a su tamaño real recién con la transición CSS, así que hay que
  // recalcular la escala un instante después de abrir.
  cards.forEach((card) => {
    const openBtn = card.querySelector('.g-open-btn');
    if (!openBtn) return;
    openBtn.addEventListener('click', () => {
      setTimeout(scaleAllPanels, 50);
      setTimeout(scaleAllPanels, 650); // al terminar la transición de apertura
    });
  });

  document.querySelectorAll('.panel-row-activate').forEach((btn) => {
    btn.addEventListener('click', () => {
      const media = btn.closest('.panel-row-media');
      const iframe = media.querySelector('iframe[data-src]');

      if (iframe) {
        scalePanel(media);
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        media.classList.add('panel-row-media--loaded');
      }

      media.classList.add('panel-row-media--active');
    });
  });

  /* ---------- Favoritos ---------- */

  document.querySelectorAll('.panel-row-fav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('panel-row-fav--active');
      const icon = btn.querySelector('i');
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
    });
  });

});