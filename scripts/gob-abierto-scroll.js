(function () {
  const gobAbierto = document.querySelector(".gob-abierto");
  const gobHero = document.querySelector(".gob-abierto-hero");

  if (!gobAbierto || !gobHero) return;

  let revealed = false; // evita relanzar la animación de despliegue

  function triggerReveal() {
    if (revealed) return;
    revealed = true;
    gobAbierto.classList.add("is-revealed");
  }

  // Observa .gob-abierto-hero (el bloque de video, 100vh) para
  // disparar la animación de despliegue cuando está 100% visible
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          triggerReveal();
        }
      });
    },
    { threshold: [0.6] }
  );

  heroObserver.observe(gobHero);
})();