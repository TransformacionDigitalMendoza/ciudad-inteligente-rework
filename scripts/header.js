// scripts/sticky-header-trigger.js
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('mainNavHeader');
  const trigger = document.querySelector('.hero-text-blocks'); // o el elemento que contiene "Distintas miradas"
  
  if (!header || !trigger) return;
  
  // Inicialmente oculto (opcional)
  header.style.opacity = '0';
  header.style.pointerEvents = 'none';
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        // El bloque ya no está en pantalla → mostramos el header
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      } else {
        // Todavía está visible → ocultamos el header
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
      }
    });
  }, { threshold: 0.2 });
  
  observer.observe(trigger);
});