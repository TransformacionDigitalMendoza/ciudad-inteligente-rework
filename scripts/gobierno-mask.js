/* Máscara de video para Gobierno abierto (equivalente a la de Gestión).
   Genera en #gobiernoClip un rect redondeado por cada .ga-box-bkg y
   revela las cajas de abajo hacia arriba según el scroll (--p). */
(function () {
  var main = document.querySelector('.gobierno-main');
  var clip = document.getElementById('gobiernoClip');
  if (!main || !clip) return;

  var boxes = Array.prototype.slice.call(main.querySelectorAll('.ga-box-bkg'));
  var NS = 'http://www.w3.org/2000/svg';
  var rects = boxes.map(function () {
    var r = document.createElementNS(NS, 'rect');
    clip.appendChild(r);
    return r;
  });
  var geo = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function measure() {
    var m = main.getBoundingClientRect();
    geo = boxes.map(function (b) {
      var r = b.getBoundingClientRect();
      return { x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height,
               rx: parseFloat(getComputedStyle(b).borderTopLeftRadius) || 24 };
    });
    update();
  }

  function progress() {
    if (reduce) return 1;
    var r = main.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh - r.top) / (vh * 0.9);
    return Math.max(0, Math.min(1, p));
  }

  function update() {
    var p = progress();
    var e = 1 - Math.pow(1 - p, 3); // ease-out
    geo.forEach(function (g, i) {
      var h = g.h * e;
      rects[i].setAttribute('x', g.x);
      rects[i].setAttribute('y', g.y + g.h - h);
      rects[i].setAttribute('width', g.w);
      rects[i].setAttribute('height', h);
      rects[i].setAttribute('rx', g.rx);
      boxes[i].style.setProperty('--p', e.toFixed(3));
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();