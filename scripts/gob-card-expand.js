/* Selector de gobierno abierto.
   - El resaltado por categoría es SOLO mientras hay hover (o foco con teclado): al salir, todo vuelve a la normalidad.
   - Nada queda "seleccionado" con el click. Excepción: en pantallas táctiles (sin hover) un toque resalta
     la categoría hasta tocar de nuevo o tocar afuera.
   - Las tarjetas expandibles se abren/cierran con click; se cierran con Esc o click afuera.
   Scopeado al contenedor, sin globales. */
(function () {
  var root = document.getElementById("gobierno-abierto-selector");
  if (!root) return;

  var grid = root.querySelector(".gsel__grid");
  var btns = Array.prototype.slice.call(root.querySelectorAll(".gsel__btn"));
  var cards = Array.prototype.slice.call(root.querySelectorAll(".gsel__card"));
  var hovered = null;   // categoría bajo el mouse / con foco de teclado
  var tapped = null;    // categoría resaltada con un toque (solo táctil)
  var open = null;      // tarjeta expandible abierta
  var pointer = "mouse";

  function paint() {
    var cat = hovered || tapped;
    root.classList.toggle("has-active", !!cat);
    btns.forEach(function (b) { b.classList.toggle("is-active", b.dataset.cat === cat); });
    cards.forEach(function (c) { c.classList.toggle("is-active", c.dataset.cat === cat); });
  }

  /* ---- tarjetas expandibles ---- */
  function place(card) { // si no entra hacia la derecha, se expande hacia la izquierda
    var gap = 12;
    card.classList.toggle("is-flip", card.offsetLeft + card.offsetWidth * 2 + gap > grid.clientWidth + 1);
  }
  function setOpen(card, state) {
    var t = card.querySelector(".gsel__toggle");
    if (state) place(card);
    card.classList.toggle("is-open", state);
    t.setAttribute("aria-expanded", String(state));
    t.querySelector("span").textContent = state ? "Cerrar" : "Ver opciones";
    t.querySelector("i").textContent = state ? "−" : "+";
    open = state ? card : (open === card ? null : open);
  }
  function toggleOpen(card) {
    var willOpen = !card.classList.contains("is-open");
    if (open && open !== card) setOpen(open, false);
    setOpen(card, willOpen);
  }

  /* ---- eventos ---- */
  root.addEventListener("pointerdown", function (e) { pointer = e.pointerType; }, true);

  btns.concat(cards).forEach(function (el) {
    var cat = el.dataset.cat;
    var isCard = el.classList.contains("gsel__card");

    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovered = cat; paint(); } });
    el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hovered = null; paint(); } });

    // foco: solo cuando viene del teclado (el foco por click no debe dejar nada resaltado)
    el.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible")) { hovered = cat; paint(); } });
    el.addEventListener("focusout", function () { hovered = null; paint(); });

    el.addEventListener("click", function (e) {
      if (isCard && e.target.closest("a")) return;                      // los enlaces navegan normalmente
      if (isCard && el.classList.contains("gsel__card--exp")) toggleOpen(el);
      if (pointer !== "mouse") { tapped = tapped === cat ? null : cat; paint(); } // táctil: sin hover
    });
  });

  document.addEventListener("click", function (e) {
    if (open && !open.contains(e.target)) setOpen(open, false);
    if (tapped && !e.target.closest(".gsel__btn, .gsel__card")) { tapped = null; paint(); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) setOpen(open, false); });
  window.addEventListener("resize", function () { if (open) place(open); });
})();