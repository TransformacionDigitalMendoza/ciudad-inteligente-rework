function initCard(card) {
  const iframe = card.querySelector('.card-iframe');
  const loading = card.querySelector('.card-loading');
 
  if (!iframe || !iframe.dataset.src) return;
 
  iframe.addEventListener('load', () => {
    if (loading) loading.classList.add('hidden');
  });
 
  // Carga el reporte de Power BI recién ahora, para no bloquear el resto de la página
  iframe.src = iframe.dataset.src;
}
 
function init() {
  document.querySelectorAll('.card').forEach(initCard);
}
 
document.addEventListener('DOMContentLoaded', init);
 