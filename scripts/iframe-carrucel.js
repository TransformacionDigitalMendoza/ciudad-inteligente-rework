(function () {
  const cards = document.querySelectorAll("#terciaryCards .terciary-card");
  if (!cards.length) return;

  const INTERVAL = 4000; // milisegundos entre cada cambio de tarjeta
  let current = [...cards].findIndex((card) =>
    card.classList.contains("active")
  );
  if (current === -1) current = 0;

  function goTo(index) {
    cards[current].classList.remove("active");
    current = (index + cards.length) % cards.length;
    cards[current].classList.add("active");
  }

  let timer = setInterval(() => goTo(current + 1), INTERVAL);

  // Si el usuario pasa el mouse por encima, pausamos el avance automático
  // para que pueda leer con tranquilidad; al sacar el mouse, retoma.
  const wrapper = document.getElementById("terciaryCards");
  wrapper.addEventListener("mouseenter", () => clearInterval(timer));
  wrapper.addEventListener("mouseleave", () => {
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  });
})();