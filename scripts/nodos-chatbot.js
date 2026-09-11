// Añade interactividad adicional (opcional)
document.querySelectorAll('.lista-servicios li').forEach(item => {
  item.addEventListener('mouseenter', function() {
    // Puedes añadir efectos adicionales aquí
    console.log('Mostrando:', this.textContent.trim());
  });
});