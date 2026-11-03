document.addEventListener('DOMContentLoaded', function () {
      var submenuToggles = document.querySelectorAll('.submenu-toggle');

      submenuToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          var item = toggle.closest('.dropdown-item');
          var isOpen = item.classList.contains('open');

          // Cierra las otras categorías abiertas dentro del mismo dropdown
          var siblings = item.parentElement.querySelectorAll('.dropdown-item.open');
          siblings.forEach(function (sibling) {
            if (sibling !== item) {
              sibling.classList.remove('open');
              var siblingToggle = sibling.querySelector('.submenu-toggle');
              if (siblingToggle) siblingToggle.setAttribute('aria-expanded', 'false');
            }
          });

          item.classList.toggle('open', !isOpen);
          toggle.setAttribute('aria-expanded', String(!isOpen));
        });
      });

      // Al hacer click en el nombre de una categoría (scroll-to), cierra el menú
      var scrollLinks = document.querySelectorAll('.dropdown--nested .scroll-link');
      scrollLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          var openItem = link.closest('.nav-item');
          if (openItem) {
            openItem.classList.remove('open');
            var openSubmenu = openItem.querySelector('.dropdown-item.open');
            if (openSubmenu) openSubmenu.classList.remove('open');
          }
        });
      });

      // ---- Menú "Gestión": scroll-to + despliegue de la tarjeta correspondiente ----
      function isGCardExpandedOpen(card) {
        var expanded = card.querySelector('.g-card-expanded');
        if (!expanded) return false;
        var style = window.getComputedStyle(expanded);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (parseFloat(style.opacity) === 0) return false;
        if (expanded.offsetWidth === 0 && expanded.offsetHeight === 0) return false;
        return true;
      }

      var gestionLinks = document.querySelectorAll('.gestion-open-link');
      gestionLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();

          var targetId = link.getAttribute('href').slice(1);
          var card = document.getElementById(targetId);
          if (!card) return;

          // Cierra el dropdown "Gestión" del header
          var navItem = link.closest('.nav-item');
          if (navItem) navItem.classList.remove('open');

          // Si la tarjeta todavía no está desplegada, abrimos usando su propio
          // botón (así reutilizamos la lógica existente de scripts/g-cards.js:
          // carga de video con data-src, animaciones, etc.)
          if (!isGCardExpandedOpen(card)) {
            var openBtn = card.querySelector('.g-open-btn');
            if (openBtn) openBtn.click();
          }

          // Esperamos un instante a que arranque la apertura/expansión antes
          // de hacer scroll, para que el destino final ya tenga en cuenta el
          // nuevo alto de la tarjeta expandida.
          window.requestAnimationFrame(function () {
            setTimeout(function () {
              card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
          });
        });
      });
    });