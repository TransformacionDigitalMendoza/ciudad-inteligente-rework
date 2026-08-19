// Reemplazá 'href' y 'src' por los enlaces y logos reales de cada empresa.
  const filaUno = [
    { nombre: "Lugano Region", href: "#", src: "/assets/membresias/govlab.png" },
    { nombre: "SUPSI", href: "#", src: "/assets/membresias/delivery.png" },
    { nombre: "Swisscom", href: "#", src: "/assets/membresias/govtech.png" },
    { nombre: "European Network of Living Labs", href: "#", src: "/assets/membresias/gpl.png" },
    { nombre: "ABB", href: "#", src: "/assets/membresias/indice-datos.png" },
    { nombre: "Città di Lugano", href: "#", src: "/assets/membresias/ocd.png" },
    { nombre: "Arduino", href: "#", src: "/assets/membresias/ogp.png" },
  ];
 
  const filaDos = [
    { nombre: "Swisscom", href: "#", src: "/assets/membresias/results.png" },
    { nombre: "SUPSI", href: "#", src: "/assets/membresias/youth.png" },
    { nombre: "Lugano Region", href: "#", src: "/assets/membresias/wwc.png" },
    { nombre: "IBM", href: "#", src: "/assets/membresias/eco.webp" },
    { nombre: "Franklin University", href: "#", src: "/assets/membresias/ogp.png" },
    { nombre: "EOC", href: "#", src: "/assets/membresias/delivery.png" },
  ];
 
  function itemHTML(item){
    return `
      <div class="carrusel-item">
        <a class="carrusel-link" href="${item.href}" target="_blank" rel="noopener" aria-label="${item.nombre}">
          <img src="${item.src}" alt="${item.nombre}" loading="lazy">
        </a>
      </div>`;
  }
 
  /**
   * Construye un carrusel con loop continuo real (sin reinicio visible).
   * En vez de animar con @keyframes de 0% a -50% (que se percibe como
   * "resetear"), se mueve el track con requestAnimationFrame y, apenas
   * el desplazamiento supera el ancho de UN set de items, se le resta
   * ese mismo ancho al acumulado. Como los sets son idénticos pixel a
   * pixel, el "salto" es matemáticamente invisible: nunca hay principio
   * ni final perceptible.
   */
  function crearCarrusel({ trackId, items, pxPerSecond, direction }){
    const track = document.getElementById(trackId);
    const container = track.parentElement;
 
    // Repetimos la lista lo suficiente para llenar como mínimo 2x el
    // ancho visible, garantizando que siempre haya contenido de sobra
    // a ambos lados durante el loop.
    let setWidth = 0;
    let repeticiones = 2;
 
    function construir(){
      track.innerHTML = "";
      const frag = document.createDocumentFragment();
      const wrapper = document.createElement("div");
      wrapper.style.display = "contents";
 
      // Primero insertamos un set y medimos su ancho real
      items.forEach(it => {
        const div = document.createElement("div");
        div.innerHTML = itemHTML(it);
        frag.appendChild(div.firstElementChild);
      });
      track.appendChild(frag);
      setWidth = track.scrollWidth;
 
      // Calculamos cuántos sets adicionales hacen falta para cubrir
      // al menos 2x el ancho del contenedor + margen de seguridad
      const minWidth = container.clientWidth * 2 + setWidth;
      repeticiones = Math.max(2, Math.ceil(minWidth / setWidth));
 
      // Agregamos los sets restantes
      for (let i = 1; i < repeticiones; i++){
        items.forEach(it => {
          const div = document.createElement("div");
          div.innerHTML = itemHTML(it);
          track.appendChild(div.firstElementChild);
        });
      }
    }
 
    construir();
 
    let offset = direction === "left" ? 0 : -setWidth;
    let lastTime = null;
    let paused = false;
    let rafId = null;
 
    container.addEventListener("mouseenter", () => { paused = true; });
    container.addEventListener("mouseleave", () => { paused = false; lastTime = null; });
 
    function tick(time){
      if (lastTime === null) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
 
      if (!paused){
        const dir = direction === "left" ? -1 : 1;
        offset += dir * pxPerSecond * delta;
 
        // Wrap continuo: al superar un set completo de ancho, se
        // reacomoda el acumulado sin que se note ningún corte.
        if (direction === "left" && offset <= -setWidth){
          offset += setWidth;
        }
        if (direction === "right" && offset >= 0){
          offset -= setWidth;
        }
 
        track.style.transform = `translateX(${offset}px)`;
      }
 
      rafId = requestAnimationFrame(tick);
    }
 
    rafId = requestAnimationFrame(tick);
 
    // Reconstruye si cambia el tamaño de la ventana, para mantener
    // suficiente contenido duplicado y que el loop siga sin cortes.
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
        construir();
        offset = direction === "left" ? 0 : -setWidth;
        lastTime = null;
        rafId = requestAnimationFrame(tick);
      }, 200);
    });
  }
 
  crearCarrusel({
    trackId: "track-1",
    items: filaUno,
    pxPerSecond: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--speed-1")) || 60,
    direction: "left"
  });
 
  crearCarrusel({
    trackId: "track-2",
    items: filaDos,
    pxPerSecond: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--speed-2")) || 60,
    direction: "right"
  });