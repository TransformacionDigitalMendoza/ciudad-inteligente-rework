document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Tableros (iframes): carga solo al hacer click ---------- */
  const rows = document.querySelectorAll('.panel-row-media');

  function scaleMedia(media) {
    const scaler = media.querySelector('.panel-row-scaler');
    if (!scaler) return;
    const scale = media.clientWidth / 1280;
    scaler.style.transform = `scale(${scale})`;
    media.style.height = `${800 * scale}px`;
  }
  rows.forEach(scaleMedia);
  window.addEventListener('resize', () => rows.forEach(scaleMedia));

  document.querySelectorAll('.panel-row-activate').forEach((btn) => {
    btn.addEventListener('click', () => {
      const media = btn.closest('.panel-row-media');
      const iframe = media.querySelector('iframe[data-src]');

      // Solo la primera vez: asigna el src real
      if (iframe) {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        media.classList.add('panel-row-media--loaded');
      }

      media.classList.add('panel-row-media--active');
    });
  });

  // Favoritos (sin cambios)
  document.querySelectorAll('.panel-row-fav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('panel-row-fav--active');
      const icon = btn.querySelector('i');
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
    });
  });

  /* ---------- Videos de los heroes: se mantiene lazy por scroll ---------- */
  const heroVideos = document.querySelectorAll('.g-expanded-hero video[data-src]');

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      video.src = video.dataset.src;
      video.removeAttribute('data-src');
      video.load();
      video.play().catch(() => {});
      videoObserver.unobserve(video);
    });
  }, { threshold: 0.1 });

  heroVideos.forEach((v) => videoObserver.observe(v));
});