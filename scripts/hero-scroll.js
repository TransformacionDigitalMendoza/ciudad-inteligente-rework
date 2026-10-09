(function () {
  const wrapper = document.querySelector(".hero-wrapper");
  const heroTitle = document.querySelector(".hero-title");
  const heroBkg = document.querySelector(".hero-bkg");
  const heroAside = document.querySelector(".hero-aside");
  const overlay = document.querySelector(".hero-overlay");
  const textBlocks = document.querySelector(".hero-text-blocks");
  const nav = document.querySelector(".hero-nav");

  if (!wrapper || !heroTitle || !heroBkg || !heroAside) return;

  const MOBILE_BREAKPOINT = 992;
  const GAP = 24; // aire hacia los bordes de la pantalla (px)
  const RADIUS = 24; // radio de las puntas (px)
  const EXTRA = 0.15;    // el bloque llega a 100vh + 15%
const OUTSIDE = 120;   // px libres debajo del bloque para el h2 externo
const PHASE1 = 0.7;    // 70% del scroll expande, 30% crece y sube
const DOCK_OFFSET = 40; // scroll (px) tras terminar el hero para que el nav se pegue arriba

const cornerTitle = document.querySelector(".hero-text-corner h2");
const outsideTitle = document.querySelector(".hero-outside h2");
const outside = document.querySelector(".hero-outside");
  let isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  let startTop = 0;
let startHeight = 0;

function measureInitial() {
  // Quita los inline de top/height para leer los valores reales del CSS
  heroBkg.style.top = "";
  heroBkg.style.height = "";
  startTop = heroBkg.offsetTop;
  startHeight = heroBkg.offsetHeight;
}

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function clamp01(n) {
    return Math.min(Math.max(n, 0), 1);
  }

  function resetInlineStyles() {
    // Limpia los estilos que aplica el modo escritorio, para que
    // el CSS responsive tome el control total.
    heroTitle.style.opacity = "";
    heroTitle.style.transform = "";
    heroAside.style.opacity = "";
    heroAside.style.transform = "";
    heroBkg.style.left = "";
    heroBkg.style.width = "";
    heroBkg.style.borderRadius = "";
    if (overlay) overlay.style.opacity = "";
    if (textBlocks) {
      textBlocks.style.opacity = "";
      textBlocks.style.transform = "";
      textBlocks.style.pointerEvents = "";
    }
    if (nav) {
      nav.style.top = "";
      nav.style.opacity = "";
      nav.style.transform = "";
      nav.style.pointerEvents = "";
      nav.classList.remove("is-visible", "is-top");
    }
  }

function update(p, q) {
  if (isMobile) return;

  const titleFade = clamp01(p / 0.4);
  heroTitle.style.opacity = 1 - titleFade;
  heroTitle.style.transform = `translateX(${lerp(0, -100, p)}%)`;

  heroAside.style.opacity = 1 - titleFade;
  heroAside.style.transform = `translateX(${lerp(0, 100, p)}%)`;

  // Horizontal (fase 1)
  heroBkg.style.left = `calc(${lerp(36, 0, p)}% + ${lerp(0, GAP, p)}px)`;
  heroBkg.style.width = `calc(${lerp(60, 100, p)}% - ${lerp(0, GAP * 2, p)}px)`;
  heroBkg.style.borderRadius = `${RADIUS}px`;

  // Vertical: fase 1 (expande con aire) + fase 2 (crece y sube)
  const parentH = heroBkg.offsetParent
    ? heroBkg.offsetParent.clientHeight
    : window.innerHeight;
  const fullH = parentH * (1 + EXTRA);
  const endTop = parentH - OUTSIDE - fullH; // negativo: el borde superior sale de pantalla

  const topP = lerp(startTop, GAP, p);
  const heightP = lerp(startHeight, parentH - GAP * 2, p);

  const curTop = lerp(topP, endTop, q);
  const curHeight = lerp(heightP, fullH, q);
  heroBkg.style.top = `${curTop}px`;
  heroBkg.style.height = `${curHeight}px`;

  if (overlay) overlay.style.opacity = lerp(0.5, 0.55, p);

  if (textBlocks) {
    const textP = clamp01((p - 0.5) / 0.5);
    textBlocks.style.opacity = textP;
    textBlocks.style.transform = `translateY(${lerp(30, 0, textP)}px)`;
    textBlocks.style.pointerEvents = textP > 0.5 ? "auto" : "none";
  }

  // h2 interno: sube desde el borde inferior (primera mitad de la fase 2)
  if (cornerTitle) {
    const t = clamp01(q / 0.5);
    cornerTitle.style.transform = `translateY(${(1 - t) * 100}%)`;
  }

  // h2 externo: baja desde el borde del bloque (segunda mitad)
  if (outsideTitle) {
    const t = clamp01((q - 0.5) / 0.5);
    outsideTitle.style.transform = `translateY(${-(1 - t) * 100}%)`;
  }
}

// Nav independiente: no sigue al hero-bkg. Solo tiene dos estados (clases) y el
// CSS se encarga de la posición y la transición:
//   .is-visible -> aparece fijo en la parte inferior una vez expandido el hero-bkg
//   .is-top     -> al seguir bajando por la página, se pega a la parte superior
function updateNav(p, scrolled, totalScrollable) {
  if (!nav) return;
  const visible = p >= 1;
  const docked = visible && scrolled > totalScrollable + DOCK_OFFSET;

  nav.classList.toggle("is-visible", visible);

  if (docked !== nav.classList.contains("is-top")) {
    nav.classList.toggle("is-top", docked);
    // Los dropdowns cambian de dirección: cerrar los que estén abiertos
    nav.querySelectorAll(".hero-nav__li.is-open").forEach((li) => {
      li.classList.remove("is-open");
      const btn = li.querySelector(".hero-nav__chevron");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }
}

function onScroll() {
  if (isMobile) return;
  const totalScrollable = wrapper.offsetHeight - window.innerHeight;
  const scrolled = -wrapper.getBoundingClientRect().top;
  const P = clamp01(totalScrollable > 0 ? scrolled / totalScrollable : 0);

  const p = clamp01(P / PHASE1);
  const q = clamp01((P - PHASE1) / (1 - PHASE1));
  update(p, q);
  updateNav(p, scrolled, totalScrollable);
}

function handleResize() {
  const wasMobile = isMobile;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  if (isMobile) {
    resetInlineStyles();
    if (cornerTitle) cornerTitle.style.transform = "";
if (outsideTitle) outsideTitle.style.transform = "";
  } else {
    measureInitial();   // recalcula el aire inicial según el CSS actual
    onScroll();
  }
}

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", handleResize);
  handleResize();
  onScroll();
})();

// ---- Dropdowns del sticky nav ----
(function () {
  const nav = document.querySelector(".hero-nav");
  if (!nav) return;

  const MOBILE = "(max-width: 992px)";
  const items = nav.querySelectorAll(".hero-nav__li");

  function closeAll(except) {
    items.forEach((li) => {
      if (li === except) return;
      li.classList.remove("is-open");
      const b = li.querySelector(".hero-nav__chevron");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  function toggleItem(li) {
    const open = !li.classList.contains("is-open");
    closeAll(open ? li : null);
    li.classList.toggle("is-open", open);
    const b = li.querySelector(".hero-nav__chevron");
    if (b) b.setAttribute("aria-expanded", String(open));
  }

  items.forEach((li) => {
    const hasMenu = li.querySelector(".hero-nav__dropdown");
    if (!hasMenu) return;

    const chevron = li.querySelector(".hero-nav__chevron");
    if (chevron) {
      chevron.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleItem(li);
      });
    }

    // En mobile no hay chevron: tocar el segmento abre/cierra el menú
    const main = li.querySelector(".hero-nav__item");
    main.addEventListener("click", (e) => {
      if (window.matchMedia(MOBILE).matches) {
        e.preventDefault();
        toggleItem(li);
      }
    });
  });

  nav.querySelectorAll(".hero-nav__sub-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sub = btn.closest(".hero-nav__sub");
      const open = !sub.classList.contains("is-open");
      sub.parentElement
        .querySelectorAll(".hero-nav__sub.is-open")
        .forEach((s) => s.classList.remove("is-open"));
      sub.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // Cerrar al elegir un enlace del dropdown, al clickear afuera o con Esc
  nav.querySelectorAll(".hero-nav__dropdown a").forEach((a) =>
    a.addEventListener("click", () => closeAll(null))
  );
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeAll(null);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
})();