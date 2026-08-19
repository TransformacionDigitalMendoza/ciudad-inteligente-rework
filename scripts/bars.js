const block = document.getElementById('barsBlock');
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        block.classList.add('in-view');
      } else {
        // Si querés que se repita cada vez que vuelve a la vista, descomentá:
        // block.classList.remove('in-view');
      }
    });
  }, { threshold: 0.3 });
 
  observer.observe(block);