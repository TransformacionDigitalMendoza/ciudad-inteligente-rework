const teamCards = document.querySelectorAll('.team-card');

teamCards.forEach(card => {
  const openButton = card.querySelector('.team-toggle');
  const closeButton = card.querySelector('.team-close');

  openButton?.addEventListener('click', () => {
    // Si querés que haya una sola tarjeta abierta a la vez
    teamCards.forEach(otherCard => {
      if (otherCard !== card) {
        otherCard.classList.remove('is-open');
      }
    });

    card.classList.add('is-open');
  });

  closeButton?.addEventListener('click', () => {
    card.classList.remove('is-open');
  });
});