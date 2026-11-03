/* Slider de gobierno abierto. Todo scopeado al contenedor #gobierno-abierto-slider, sin globales ni ids genéricos. */
(function () {
  var root = document.getElementById("gobierno-abierto-slider");
  if (!root) return;

  var DATA = [
    { tab: "Participación ciudadana", title: "Participación ciudadana", wm: "voz", cards: [
      { t: "Consultas públicas", d: "Opiná sobre proyectos y normas antes de que se aprueben.", b: "Participar" },
      { t: "Presupuesto participativo", d: "Decidí junto a tu comunidad el destino de una parte del presupuesto.", b: "Proponer" },
      { t: "Reclamos y sugerencias", d: "Canal directo para enviar tus ideas y seguir su respuesta.", b: "Enviar" }
    ]},
    { tab: "Información pública", title: "Información pública", wm: "datos", cards: [
      { t: "Acceso a la información", d: "Solicitá documentos y datos en poder del Estado de forma simple.", b: "Solicitar" },
      { t: "Datos abiertos", d: "Descargá conjuntos de datos en formatos reutilizables.", b: "Explorar" },
      { t: "Transparencia presupuestaria", d: "Consultá cómo se recaudan y gastan los recursos públicos.", b: "Ver gastos" }
    ]},
    { tab: "Seguridad", title: "Seguridad", wm: "paz", cards: [
      { t: "Alertas ciudadanas", d: "Recibí avisos oficiales de emergencias y situaciones de riesgo.", b: "Suscribirme" },
      { t: "Denuncias", d: "Realizá denuncias de manera segura y hacé su seguimiento.", b: "Denunciar" },
      { t: "Mapa del delito", d: "Visualizá estadísticas de seguridad por zona y período.", b: "Ver mapa" }
    ]}
  ];

  var $ = function (s) { return root.querySelector(s); };
  var tabsEl = $(".gas__tabs"), cardsEl = $(".gas__cards"), bigEl = $(".gas__big");
  var titleEl = $(".gas__title"), wm = $(".gas__wm"), num = $(".gas__num");
  var current = 0;

  DATA.forEach(function (s, i) {
    var b = document.createElement("button");
    b.className = "gas__tab"; b.type = "button"; b.setAttribute("role", "tab");
    var n = document.createElement("span"); n.textContent = "0" + (i + 1);
    b.append(n, s.tab);
    b.addEventListener("click", function () { select(i); });
    tabsEl.appendChild(b);
  });

  function render(i) {
    var s = DATA[i];
    titleEl.innerHTML = "";
    s.title.split(" ").forEach(function (w) {
      var sp = document.createElement("span"); sp.textContent = w; titleEl.appendChild(sp);
    });
    wm.textContent = s.wm;
    num.textContent = "0" + (i + 1);
    cardsEl.innerHTML = "";
    s.cards.forEach(function (c) {
      var el = document.createElement("article"); el.className = "gas__card";
      var top = document.createElement("div");
      var h = document.createElement("h3"); h.className = "gas__card-title"; h.textContent = c.t;
      var p = document.createElement("p"); p.className = "gas__card-text"; p.textContent = c.d;
      top.append(h, p);
      var b = document.createElement("button"); b.type = "button"; b.className = "gas__card-btn"; b.textContent = c.b + " →";
      el.append(top, b);
      cardsEl.appendChild(el);
    });
    Array.prototype.forEach.call(tabsEl.children, function (t, k) { t.setAttribute("aria-selected", k === i); });
  }

  function select(i) {
    if (i === current) return;
    current = i;
    cardsEl.classList.add("is-fading"); bigEl.classList.add("is-fading");
    setTimeout(function () {
      render(i);
      cardsEl.classList.remove("is-fading"); bigEl.classList.remove("is-fading");
    }, 300);
  }

  $(".gas__next").addEventListener("click", function () { select((current + 1) % DATA.length); });
  render(0);
})();