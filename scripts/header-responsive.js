// scripts/header-responsive.js
(function () {
  const MOBILE_BREAKPOINT = 992;

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const header = document.getElementById('mainNavHeader');

  // FIX: si falta cualquiera de los dos, avisamos por consola en vez de
  // salir en silencio (así te enterás si el id no está en el HTML).
  if (!navToggle || !navMenu) {
    console.warn('[header-responsive] Falta #navToggle o #navMenu en el HTML.');
    return;
  }

  const icon = navToggle.querySelector('i');

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  /* ---------- Abrir / cerrar el menú principal ---------- */
  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    if (icon) icon.className = 'fa-solid fa-xmark';
  }

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (icon) icon.className = 'fa-solid fa-bars';
  }

  navToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (navMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* ---------- Acordeones: click en un .nav-btn con dropdown ---------- */
  const navItems = navMenu.querySelectorAll('.nav-item');

  navItems.forEach(function (item) {
    const btn = item.querySelector('.nav-btn');
    const dropdown = item.querySelector('.dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function (e) {
      if (!isMobile()) return; // en desktop manda el hover

      // En mobile el primer tap abre el acordeón en vez de navegar.
      e.preventDefault();

      const isOpen = item.classList.contains('open');

      // Cierra los demás acordeones del mismo nivel
      navItems.forEach(function (other) {
        if (other !== item) other.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- Al hacer click en un link interno, cerrar todo ---------- */
  navMenu.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    // Si es un link con href a sección o página, cerramos el menú
    closeMenu();
    // También cerramos los acordeones abiertos
    navItems.forEach(function (item) {
      item.classList.remove('open');
    });
  });

  /* ---------- Click fuera del menú lo cierra ---------- */
  document.addEventListener('click', function (e) {
    if (!navMenu.classList.contains('is-open')) return;
    if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
    closeMenu();
  });

  /* ---------- Si se agranda la ventana, resetear estado ---------- */
  window.addEventListener('resize', function () {
    if (!isMobile()) {
      closeMenu();
      navItems.forEach(function (item) {
        item.classList.remove('open');
      });
    }
  });

  /* ---------- Header siempre visible en mobile ---------- */
  // (lo forzamos por CSS con !important, pero por las dudas
  //  limpiamos los estilos inline que pueda haber dejado header.js)
  function ensureHeaderVisible() {
    if (!header) return;
    if (isMobile()) {
      header.style.opacity = '1';
      header.style.pointerEvents = 'auto';
    }
  }

  ensureHeaderVisible();
  window.addEventListener('resize', ensureHeaderVisible);
  window.addEventListener('scroll', ensureHeaderVisible, { passive: true });
})();