// Logo de ejemplo genérico (reemplazar por el logo real de cada tarjeta)
function logoPlaceholder(letra, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="34" viewBox="0 0 120 34">
      <text x="0" y="24" font-family="Space Grotesk, sans-serif" font-size="22" font-weight="700" fill="#ffffff">${letra}</text>
    </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

// Reemplazá 'href', 'logo' y los colores por los reales de cada empresa.
const filaUno = [
  {
    nombre: "RIL",
    href: "https://prensa.ciudaddemendoza.gob.ar/2026/06/05/la-ciudad-de-mendoza-fue-distinguida-como-ciudad-faro-por-su-excelencia-en-gestion-publica/",
    color: "#2b6cb0",
    titulo: "RIL - CERTIFICACIÓN CIUDADES EFICIENTES FARO",
    texto:
      "La Ciudad de Mendoza fue reconocida con la certificación Ciudad Faro, una iniciativa que evalúa la capacidad de los gobiernos locales para administrar los recursos públicos de manera estratégica, innovadora, sostenible y con impacto directo en la calidad de vida de la ciudadanía.",
    logo: "../assets/images/certificacion-faro.png",
    categoria: "certificacion",
    categoriaClase: "certificacion",
  },
  {
    nombre: "OGP",
    href: "https://www.opengovpartnership.org/es/members/mendoza-argentina/",
    color: "#b5502b",
    titulo:
      "MIEMBROS DE LA OGP LOCAL - 1° Y 2° PLAN DE ACCION DE GOBIERNO ABIERTO",
    texto:
      "Mendoza se unió a OGP como parte de la cohorte 2020. Actualmente están implementando tres compromisos de su plan de acción 2026-2027. Este plan de acción incluye compromisos relacionados con el cambio climático y la participación ciudadana.",
    logo: "../assets/membresias/ogp.png",
    categoria: "membresia",
    categoriaClase: "membresia",
  },
  {
    nombre: "WWC-SILVER",
    href: "https://prensa.ciudaddemendoza.gob.ar/2024/06/17/la-ciudad-de-mendoza-recibio-la-certificacion-what-works-cities-de-bloomberg-philanthropies/",
    color: "#1f7a5c",
    titulo: "WWC - CERTIFICACIÓN PLATA Junio 2024",
    texto:
      "Se trata de la distinción nivel Plata, otorgada por Results For America, por el uso excepcional de datos. La capital mendocina es una de las cinco ciudades de América Latina que consiguen este reconocimiento por primera vez.",
    logo: "../assets/images/wwc.png",
    categoria: "certificacion",
    categoriaClase: "certificacion",
  },
  {
    nombre: "WWC-GOLD",
    href: "#",
    color: "#6a4c9c",
    titulo: "WWC - CERTIFICACIÓN ORO Enero 2026",
    texto:
      "Este reconocimiento internacional examina 43 criterios que miden desde la gestión de datos y la transparencia hasta la planificación basada en evidencia, el presupuesto inteligente y el impacto en la comunidad. Obtener la certificación Oro implica superar el 68% de esos criterios, algo que sólo han logrado 34 ciudades en todo el continente desde la creación del programa.",
    logo: "../assets/images/wwc-GOLD.png",
    categoria: "certificacion",
    categoriaClase: "certificacion",
  },
  {
    nombre: "CIDEU",
    href: "https://prensa.ciudaddemendoza.gob.ar/2024/07/05/ulpiano-suarez-es-el-primer-intendente-mendocino-en-asumir-la-presidencia-de-cideu/",
    color: "#faf8f5",
    titulo: "Ciudades CIDEU Junio 2025",
    texto:
      "El Centro Iberoamericano de Desarrollo Estratégico Urbano (CIDEU) es una red de gobiernos locales, entidades y estrategas urbanos de Iberoamérica que impulsan la transformación de las ciudades a través de la planificación estratégica urbana. Está conformada por más de 150 ciudades y entidades colaboradoras, entre las que se encuentra la Ciudad de Mendoza.",
    logo: "../assets/images/cideu.png",
    sinCambioTexto: true,
    categoria: "Membresía",
    categoriaClase: "membresia",
  },
  {
    nombre: "SMART-CITY",
    href: "#",
    color: "#2b6cb0",
    titulo: "SMART CITY EXPO PUEBLA Junio 2026",
    texto:
      "La Municipalidad de la Ciudad de Mendoza fue reconocida como finalista en los LATAM Smart City Awards 2026, en la categoría Premio Transformación Digital, por el desarrollo del proyecto “Broker Ciudadano: Interoperabilidad Inteligente para una Gestión Municipal Integrada”.",
    logo: "../assets/images/SMART-CITY.png",
    categoria: "reconocimiento",
    categoriaClase: "reconocimiento",
  },
  {
    nombre: "OGP-OCT-2025",
    href: "https://prensa.ciudaddemendoza.gob.ar/2025/10/16/la-ciudad-obtiene-una-mencion-de-honor-internacional-por-su-compromiso-con-el-gobierno-abierto/",
    color: "#1f7a5c",
    titulo:
      "Mención Honorífica OGP Local al Presupuesto Participativo de la Ciudad de Mendoza Octubre 2025",
    texto:
      "El reconocimiento fue otorgado por la Alianza para el Gobierno Abierto (OGP) durante la Cumbre Global 2025, destacando la experiencia de Mendoza en la implementación de su programa de Presupuesto Participativo Digital.",
    logo: "AR",
    categoria: "reconocimiento",
    categoriaClase: "reconocimiento",
  },
];

const filaDos = [
  {
    nombre: "OKF",
    href: "https://prensa.ciudaddemendoza.gob.ar/2025/08/08/la-ciudad-lidera-el-indice-de-datos-abiertos-por-cuarto-ano-consecutivo/",
    color: "#b5502b",
    titulo:
      "Primer Puesto en el Índice de Ciudades Transparentes de Argentina OKF por 4to año Agosto 2025",
    texto:
      "Una vez más, por cuarto año consecutivo, la Ciudad de Mendoza obtuvo el primer puesto en el Índice Nacional de Datos Abiertos elaborado por la Open Knowledge Foundation Argentina (OKF), alcanzando el 100% de cumplimiento en todos los conjuntos de datos evaluados.",
    logo: "../assets/images/OKF.png",
    categoria: "reconocimiento",
    categoriaClase: "reconocimiento",
  },
  {
    nombre: "LAC",
    href: "https://prensa.ciudaddemendoza.gob.ar/2026/04/15/la-ciudad-fue-seleccionada-para-integrar-el-acelerador-de-inteligencia-artificial/",
    color: "#faf8f5",
    titulo: "LAC AI Accelerator GobLab Workshop - BANCO MUNDIAL Abril 2026",
    texto:
      "La iniciativa, impulsada por el Banco Mundial junto a aliados internacionales, eligió a la capital mendocina por su propuesta para optimizar la asignación de turnos en centros de salud mediante IA.",
    logo: "../assets/images/lac.png",
    sinCambioTexto: true,
    categoria: "apoyo",
    categoriaClase: "apoyo",
  },
  {
    nombre: "MENTOREO-SM",
    href: "https://prensa.ciudaddemendoza.gob.ar/2025/07/11/la-ciudad-y-el-municipio-bonaerense-de-san-martin-cerraron-de-manera-exitosa-su-programa-de-mentoria/",
    color: "#c2851f",
    titulo: "Mentoreo Municipalidad de San Martín - CIDEU Julio 2025",
    texto:
      "Después de varios meses de trabajo, la Ciudad de Mendoza junto al municipio de General San Martín de la provincia de Buenos Aires dieron por finalizado su programa de mentoría bilateral, en el marco de CIDEU (Centro Iberoamericano de Desarrollo Estratégico Urbano), con la firma de un convenio de cooperación.",
    logo: logoPlaceholder("SM"),
    categoria: "apoyo",
    categoriaClase: "apoyo",
  },
  {
    nombre: "MENTOREO-GOVTECH",
    href: "https://prensa.ciudaddemendoza.gob.ar/2024/12/27/la-ciudad-de-mendoza-avanza-en-su-proceso-de-innovacion-y-digitalizacion-con-el-programa-govtech-latam-del-bid/",
    color: "#2b6cb0",
    titulo: "Mentoreo en activación de ecosistema GovTech -BID LAB Marzo 2024",
    texto:
      "La Ciudad de Mendoza, puso en marcha un proceso de mentoría en el marco del Programa “Govtech LATAM” del Banco Interamericano de Desarrollo (BID). Durante el desarrollo, el equipo municipal, en colaboración con expertos internacionales, exploró diversas situaciones, necesidades y puntos críticos en torno al uso de datos comerciales en Mendoza.",
    logo: "../assets/images/GOVTECH.png",
    categoria: "apoyo",
    categoriaClase: "apoyo",
  },
  {
    nombre: "MENTOREO-PP",
    href: "https://fundacionpad.org.ar/novedades/hacia-un-gobierno-participativo-promocion-de-politicas/",
    color: "#181a19",
    titulo:
      "Mentoreo sobre Presupuesto Participativo - Fundación PAD financiado por la Unión Europea Marzo 2024",
    texto:
      "La iniciativa fue seleccionada por la Unión Europea en Argentina entre más de 109 propuestas en el marco de su última convocatoria a proyectos de la sociedad civil. El proyecto se destacó por promover la transparencia activa y fortalecer la representatividad de los gobiernos locales a través de la participación de sus comunidades en la toma de decisiones públicas.",
    logo: "../assets/images/pad.png",
    categoria: "apoyo",
    categoriaClase: "apoyo",
  },
  {
    nombre: "CDA",
    href: "https://prensa.ciudaddemendoza.gob.ar/2023/05/17/la-ciudad-de-mendoza-se-suma-a-city-data-alliance-de-bloomberg-philantropies/",
    color: "#b5502b",
    titulo:
      "Programa CITY DATA ALLIANCE - Bloomberg Philanthropies - Diciembre 2023",
    texto:
      "La capital mendocina es la única de Argentina en ser seleccionada en esta etapa para sumarse a esta alianza en 2023, a partir de su destacada gestión basada en datos. El intendente asistirá a encuentros y capacitaciones relacionados a la temática.",
    logo: "../assets/images/bloomberg.png",
    categoria: "apoyo",
    categoriaClase: "apoyo",
  },
];

function itemHTML(item){
  const claseExtra = item.sinCambioTexto ? "sin-cambio-texto" : "";
  return `
    <div class="carrusel-item">
      <a class="carrusel-card ${claseExtra}" style="--card-color:${item.color}" href="${item.href}" target="_blank" rel="noopener" aria-label="${item.nombre}">
        <div class="card-inner">
          <span class="card-tag card-tag--${item.categoriaClase}">${item.categoria}</span>
          <h3 class="card-title">${item.titulo}</h3>
          <p class="card-text">${item.texto}</p>
          <img class="card-logo" src="${item.logo}" alt="${item.nombre}" loading="lazy">
        </div>
      </a>
    </div>`;
}
/**
 * Construye un carrusel con loop continuo real (sin reinicio visible).
 * Se mueve el track con requestAnimationFrame y, apenas el desplazamiento
 * supera el ancho de UN set de items, se le resta ese mismo ancho al
 * acumulado. Como los sets son idénticos pixel a pixel, el "salto" es
 * matemáticamente invisible.
 */
function crearCarrusel({ trackId, items, pxPerSecond, direction }){
  const track = document.getElementById(trackId);
  const container = track.parentElement;

  let setWidth = 0;
  let repeticiones = 2;

  function construir(){
    track.innerHTML = "";
    const frag = document.createDocumentFragment();

    items.forEach(it => {
      const div = document.createElement("div");
      div.innerHTML = itemHTML(it);
      frag.appendChild(div.firstElementChild);
    });
    track.appendChild(frag);
    setWidth = track.scrollWidth;

    const minWidth = container.clientWidth * 2 + setWidth;
    repeticiones = Math.max(2, Math.ceil(minWidth / setWidth));

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

  // Pausa el carrusel apenas el mouse entra a la fila (incluye hover
  // sobre cualquier tarjeta individual, ya que están dentro del contenedor).
  container.addEventListener("mouseenter", () => { paused = true; });
  container.addEventListener("mouseleave", () => { if(!isDragging) { paused = false; lastTime = null; } });

   // ===== Arrastre manual (drag to scroll) =====
  let isDragging = false;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let hasMoved = false;
  const DRAG_THRESHOLD = 4; // px antes de considerarlo "arrastre" y no "click"

  function normalizarOffset(){
    if (offset <= -setWidth) offset += setWidth;
    if (offset > 0) offset -= setWidth;
  }

  container.addEventListener("pointerdown", (e) => {
    dragPointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    hasMoved = false;
    isDragging = false; // todavía no es un drag confirmado
    // ojo: NO capturamos el puntero acá, para no interferir con el click del link
  });

  container.addEventListener("pointermove", (e) => {
    if (dragPointerId === null || e.pointerId !== dragPointerId) return;
    const dx = e.clientX - dragStartX;

    if (!isDragging && Math.abs(dx) > DRAG_THRESHOLD){
      // recién ahora confirmamos que es un arrastre real
      isDragging = true;
      hasMoved = true;
      paused = true;
      container.classList.add("arrastrando");
      container.setPointerCapture(e.pointerId);
    }

    if (isDragging){
      offset = dragStartOffset + dx;
      normalizarOffset();
      track.style.transform = `translateX(${offset}px)`;
    }
  });

  function terminarArrastre(e){
    if (dragPointerId === null) return;
    if (isDragging && e){
      try { container.releasePointerCapture(dragPointerId); } catch(err){}
    }
    const estabaArrastrando = isDragging;
    isDragging = false;
    dragPointerId = null;
    container.classList.remove("arrastrando");
    lastTime = null;

    if (estabaArrastrando){
      const sigueAdentro = e && container.contains(document.elementFromPoint(e.clientX, e.clientY));
      if (!sigueAdentro) paused = false;
    } else {
      // fue un click simple, no un drag: el hover normal decide la pausa
    }
  }

  container.addEventListener("pointerup", terminarArrastre);
  container.addEventListener("pointercancel", terminarArrastre);

  container.addEventListener("click", (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  function tick(time){
    if (lastTime === null) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (!paused){
      const dir = direction === "left" ? -1 : 1;
      offset += dir * pxPerSecond * delta;

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
  pxPerSecond:
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--speed-1"),
    ) || 40,
  direction: "left",
});

crearCarrusel({
  trackId: "track-2",
  items: filaDos,
  pxPerSecond:
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--speed-2"),
    ) || 40,
  direction: "right",
});
