/* ==========================================================
   PAGE TRANSITION — bloque que tapa/revela entre subpáginas
   Incluir este archivo en TODAS las páginas que participen
   de la transición (principal y subpáginas).

   Uso:
   - Marcá cualquier link con  data-pt-link  y listo:
     <a href="/pages/team/" data-pt-link>Conocer al equipo</a>
   - Al hacer click: el bloque tapa (600ms), espera 1s en total
     y recién ahí navega de verdad a esa URL.
   - En la página destino, si llegó vía uno de estos links,
     el bloque arranca tapando todo y se abre solo
     (de arriba hacia abajo) apenas carga el DOM.
   ========================================================== */

(function () {
  const COVER_MS = 600;   // debe matchear --pt-duration del CSS
  const DELAY_MS = 1000;  // delay total pedido antes de redirigir
  const FLAG_KEY = 'pt-incoming';

  // Crea el bloque si todavía no existe en el DOM
  let block = document.getElementById('pt-block');
  if (!block) {
    block = document.createElement('div');
    block.id = 'pt-block';
    document.body.appendChild(block);
  }

  function coverAndGo(href) {
    block.classList.add('pt-cover');

    setTimeout(() => {
      sessionStorage.setItem(FLAG_KEY, '1');
      window.location.href = href;
    }, DELAY_MS);
  }

  function revealOnLoad() {
    // arranca tapado, sin transición, para que no se note el salto
    block.classList.add('pt-instant', 'pt-cover');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        block.classList.remove('pt-instant');
        block.classList.remove('pt-cover');
        block.classList.add('pt-reveal');
      });
    });

    setTimeout(() => {
      block.classList.remove('pt-reveal');
    }, COVER_MS);
  }

  // Enganchamos todos los links marcados con data-pt-link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-pt-link]');
    if (!link) return;
    e.preventDefault();
    coverAndGo(link.getAttribute('href'));
  });

  // Si llegamos acá viniendo de otro link con transición, revelamos
  if (sessionStorage.getItem(FLAG_KEY) === '1') {
    sessionStorage.removeItem(FLAG_KEY);
    revealOnLoad();
  }
})();