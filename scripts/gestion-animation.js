// ===== Slider de Gestión =====
// Controla el nav interno, el desplazamiento de los slides y los videos de fondo.
(() => {
  const slider = document.getElementById('gSlider');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('.g-slide')];
  const tabs = [...slider.querySelectorAll('.g-slider-tab')];
  const nav = slider.querySelector('.g-slider-nav');
  const indicator = slider.querySelector('.g-slider-indicator');
  const video = slider.querySelector('.g-slider-video');
  const cardItems = [...slider.querySelectorAll('.g-card-item')];
  let current = 0;

  // Posiciona el fondo amarillo del nav sobre la pestaña activa
  function moveIndicator() {
    const tab = tabs[current];
    indicator.style.setProperty('--x', tab.offsetLeft + 'px');
    indicator.style.setProperty('--w', tab.offsetWidth + 'px');
  }

  function goTo(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slider.style.setProperty('--g-index', current);
    slider.dataset.active = current; // define el color del borde de la card
    cardItems.forEach((item, i) => item.setAttribute('aria-hidden', String(i !== current)));

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === current);
      tab.setAttribute('aria-selected', String(i === current));
      tab.tabIndex = i === current ? 0 : -1;
    });

    moveIndicator();
  }

  // Click en el nav interno
  tabs.forEach((tab, i) => tab.addEventListener('click', () => goTo(i)));

  // Flechas del teclado dentro del nav
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { goTo(current + 1); tabs[current].focus(); }
    if (e.key === 'ArrowLeft') { goTo(current - 1); tabs[current].focus(); }
  });

  // Swipe en pantallas táctiles
  let startX = null;
  slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 60) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  // Los links del header (#gestion-ia, #gestion-ciencia-datos, #gestion-productos)
  // abren el slide correspondiente y llevan el scroll hasta el slider
  document.querySelectorAll('a[href^="#gestion-"]').forEach((link) => {
    const index = slides.findIndex((s) => '#' + s.id === link.getAttribute('href'));
    if (index < 0) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(index);
      slider.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Mantener el indicador alineado si cambia el tamaño o cargan las fuentes
  new ResizeObserver(moveIndicator).observe(nav);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  window.addEventListener('load', moveIndicator);

  // El video es único: se reproduce solo mientras el slider está a la vista
  if (video) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.1 }).observe(slider);
  }

  goTo(0);
})();