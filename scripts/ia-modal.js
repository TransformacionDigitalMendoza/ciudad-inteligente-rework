/* Modales de proyectos de IA (slider de Gestión).
   Cada botón [data-ia-modal="id"] abre el <dialog> con ese id. */
(function () {
  'use strict';

  var openers = document.querySelectorAll('[data-ia-modal]');
  if (!openers.length) return;

  openers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = document.getElementById(btn.getAttribute('data-ia-modal'));
      if (!dlg) return;
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
      document.documentElement.classList.add('ia-modal-open');
    });
  });

  document.querySelectorAll('dialog.ia-modal').forEach(function (dlg) {
    function close() {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
    }
    dlg.querySelectorAll('[data-ia-close]').forEach(function (b) { b.addEventListener('click', close); });
    // Click fuera del contenido (sobre el fondo) cierra el modal
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () {
      if (!document.querySelector('dialog.ia-modal[open]')) {
        document.documentElement.classList.remove('ia-modal-open');
      }
    });
  });
})();