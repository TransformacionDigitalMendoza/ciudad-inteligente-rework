(function(){
    var seccion = document.getElementById('gob-abierto-main');
 
    var observer = new IntersectionObserver(function(entradas){
      entradas.forEach(function(entrada){
        if (entrada.isIntersecting) {
          seccion.classList.add('en-vista');
        } else {
          // se quita para que la animación se repita cada vez que entra al 70%
          seccion.classList.remove('en-vista');
        }
      });
    }, {
      threshold: 0.7 // dispara cuando el 70% de la sección es visible
    });
 
    observer.observe(seccion);
  })();