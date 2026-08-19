  // Animación de conteo numérico para los valores KPI dentro de "terciary-aside-top"
  (function () {
    function formatTerciaryNumber(n) {
      return "+" + Math.round(n).toLocaleString("es-AR");
    }
 
    function animateTerciaryCount(el) {
      var target = parseFloat(el.getAttribute("data-terciary-count"), 10);
      var duration = 1400;
      var start = null;
 
      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = formatTerciaryNumber(target * eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatTerciaryNumber(target);
        }
      }
      requestAnimationFrame(step);
    }
 
    var terciaryObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateTerciaryCount(entry.target);
          terciaryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
 
    document.querySelectorAll(".gestion-kpi-block [data-terciary-count]").forEach(function (el) {
      terciaryObserver.observe(el);
    });
  })();