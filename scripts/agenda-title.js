const bloques = document.querySelectorAll('.agenda-top, .agenda-bottom');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
      // si querés que se repita cada vez que sale y vuelve a entrar,
      // descomentá la siguiente línea:
      // else { entry.target.classList.remove('in-view'); }
    });
  },
  { threshold: 0.4 } // dispara cuando el 40% del bloque es visible
);

bloques.forEach((bloque) => observer.observe(bloque));