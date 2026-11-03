(function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  if (!hamburgerBtn || !navMenu) return; // evita errores si el header no está en la página

  const mq = window.matchMedia('(max-width: 992px)');

  function isMobile() {
    return mq.matches;
  }

  function closeAllAccordions() {
    document.querySelectorAll('.nav-item.open').forEach(li => {
      li.classList.remove('open');
      const t = li.querySelector(':scope > .nav-btn-row > .nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.dropdown-item.open').forEach(li => {
      li.classList.remove('open');
      const t = li.querySelector(':scope > .dropdown-item-row > .submenu-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMobileMenu() {
    navMenu.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    closeAllAccordions();
  }

  function openMobileMenu() {
    navMenu.classList.add('active');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });

  // Acordeón para cada botón principal con dropdown (Gestión, Gobierno Abierto, Agenda)
  document.querySelectorAll('.nav-menu > .nav-list > .nav-item').forEach(item => {
    const row = item.querySelector(':scope > .nav-btn-row');
    if (!row) return;
    const toggleBtn = row.querySelector('.nav-toggle');
    const mainLink = row.querySelector('.nav-btn');
    if (!toggleBtn || !mainLink) return;

    const toggleAccordion = () => {
      const willOpen = !item.classList.contains('open');
      // cierra los otros ítems principales abiertos (acordeón exclusivo)
      document.querySelectorAll('.nav-menu > .nav-list > .nav-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const ot = other.querySelector(':scope > .nav-btn-row > .nav-toggle');
          if (ot) ot.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', willOpen);
      toggleBtn.setAttribute('aria-expanded', String(willOpen));
    };

    toggleBtn.addEventListener('click', (e) => {
      if (!isMobile()) return; // escritorio: el dropdown lo maneja el CSS (hover), no se toca nada
      e.preventDefault();
      e.stopPropagation();
      toggleAccordion();
    });

    mainLink.addEventListener('click', (e) => {
      if (!isMobile()) return; // en desktop el hover ya maneja el dropdown
      if (mainLink.hasAttribute('data-no-scroll')) {
        // Gestión / Gobierno Abierto: ya no navegan, solo despliegan
        e.preventDefault();
        toggleAccordion();
      } else {
        // Agenda: conserva el scroll-to, solo cerramos el menú móvil
        closeMobileMenu();
      }
    });
  });

  // Acordeón anidado (categorías dentro de Gobierno Abierto)
  document.querySelectorAll('.submenu-toggle').forEach(btn => {
    const parentLi = btn.closest('.dropdown-item');
    if (!parentLi) return;
    btn.addEventListener('click', (e) => {
      if (!isMobile()) return; // escritorio: sin interferir con el submenú por hover
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !parentLi.classList.contains('open');
      parentLi.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Los enlaces "destino" reales dentro de los dropdowns cierran el menú móvil al hacer clic
  document.querySelectorAll('.dropdown a:not([data-no-scroll]), .submenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile()) closeMobileMenu();
    });
  });

  // Los links simples (Equipo / Contactanos) también cierran el menú
  document.querySelectorAll('.nav-item--simple .nav-btn--simple').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile()) closeMobileMenu();
    });
  });

  // Si el usuario agranda la ventana a escritorio, resetea todo
  mq.addEventListener('change', (e) => {
    if (!e.matches) closeMobileMenu();
  });

  // Estado inicial en escritorio: sin clases de acordeón residuales
  if (!isMobile()) closeAllAccordions();
})();