(function () {
  var cards = document.querySelectorAll('#gob-abierto-main .gob-card');

  var observer = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('en-vista');
      } else {
        // se quita para que la animación se repita cada vez que la card entra en pantalla
        entrada.target.classList.remove('en-vista');
      }
    });
  }, {
    threshold: 0.5 // dispara cuando el 50% de CADA card es visible
  });

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();