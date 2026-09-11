// Controla el panel de "Seguridad Ciudadana" dentro de la tarjeta
// de Participación Ciudadana (sección Gobierno Abierto).
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('gob-participacion-ciudadana');
  if (!card) return;

  const trigger = card.querySelector('.seguridad-trigger');
  const closeBtn = card.querySelector('.seguridad-close-btn');

  const openPanel = () => card.classList.add('seguridad-abierta');
  const closePanel = () => card.classList.remove('seguridad-abierta');

  if (trigger) {
    trigger.addEventListener('click', openPanel);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('gob-datos-abiertos');
  if (!card) return;

  const trigger = card.querySelector('.finanzas-trigger');
  const closeBtn = card.querySelector('.finanzas-close-btn');

  const openPanel = () => card.classList.add('finanzas-abierta');
  const closePanel = () => card.classList.remove('finanzas-abierta');

  if (trigger) trigger.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });
});