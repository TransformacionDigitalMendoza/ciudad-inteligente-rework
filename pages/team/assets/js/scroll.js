// Anima los elementos de .animate-up en función del progreso de scroll dentro
// del hero, y además "fuerza" el scroll a completar la transición apenas el
// usuario hace un pequeño gesto de scroll (wheel o touch), para que la
// animación sea siempre fluida y no dependa del ritmo manual del usuario.
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const animatedElements = document.querySelectorAll('.animate-up');

    if (!hero || animatedElements.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SNAP_DURATION = 700; // ms que dura la animación forzada
    const WHEEL_TRIGGER_THRESHOLD = 4; // px de deltaY mínimos para considerar "intención de scroll"
    const TOUCH_TRIGGER_THRESHOLD = 10; // px de swipe mínimos en touch

    let isLocked = false; // true mientras se está ejecutando un scroll forzado

    const getHeroHeight = () => hero.offsetHeight || window.innerHeight;

    // --- Animación visual de los elementos según el progreso (0 a 1) ---
    const applyProgress = (progress) => {
        const heroHeight = getHeroHeight();
        animatedElements.forEach((el) => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.4;
            const translateY = -progress * heroHeight * speed;
            const opacity = 1 - progress * 1.2;
            el.style.transform = `translateY(${translateY}px)`;
            el.style.opacity = Math.min(Math.max(opacity, 0), 1);
        });
    };

    const updateFromScroll = () => {
        const heroHeight = getHeroHeight();
        const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        applyProgress(progress);
    };

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateFromScroll();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();

    if (prefersReducedMotion) return; // no forzamos el scroll si el usuario prefiere menos movimiento

    // --- Scroll forzado (snap) ---
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animateScrollTo = (targetY) => {
        isLocked = true;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / SNAP_DURATION, 1);
            const eased = easeInOutCubic(t);
            const currentY = startY + distance * eased;

            window.scrollTo(0, currentY);
            applyProgress(Math.min(Math.max(currentY / getHeroHeight(), 0), 1));

            if (t < 1) {
                window.requestAnimationFrame(step);
            } else {
                isLocked = false;
            }
        };

        window.requestAnimationFrame(step);
    };

    const tryTriggerSnap = (deltaY) => {
        if (isLocked) return true; // ya estamos animando: absorbemos el gesto

        const heroHeight = getHeroHeight();
        const scrollY = window.scrollY;

        // Scroll hacia abajo, todavía dentro de la zona del hero -> completar hacia adelante
        if (deltaY > 0 && scrollY < heroHeight) {
            animateScrollTo(heroHeight);
            return true;
        }

        // Scroll hacia arriba, todavía dentro de la zona del hero -> completar hacia atrás
        if (deltaY < 0 && scrollY > 0 && scrollY <= heroHeight) {
            animateScrollTo(0);
            return true;
        }

        return false;
    };

    // Wheel (mouse / trackpad)
    window.addEventListener(
        'wheel',
        (e) => {
            if (Math.abs(e.deltaY) < WHEEL_TRIGGER_THRESHOLD && !isLocked) return;
            const handled = tryTriggerSnap(e.deltaY);
            if (handled) e.preventDefault();
        },
        { passive: false }
    );

    // --- Barras de la sección "primary": se deslizan al ver la sección completa ---
    const primary = document.querySelector('.primary');

    if (primary) {
        const bars = primary.querySelectorAll('.slide-left, .slide-right');

        bars.forEach((bar) => {
            const delay = bar.getAttribute('data-delay') || 0;
            bar.style.setProperty('--delay', `${delay}ms`);
        });

        const barsObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        bars.forEach((bar) => bar.classList.add('is-visible'));
                    } else {
                        // se resetea para poder repetir la animación la próxima vez que se vea completa
                        bars.forEach((bar) => bar.classList.remove('is-visible'));
                    }
                });
            },
            {
                threshold: 0.95, // se considera "vista completa" cuando casi el 100% está en viewport
            }
        );

        barsObserver.observe(primary);
    }

    // Touch (mobile)
    let touchStartY = null;

    window.addEventListener(
        'touchstart',
        (e) => {
            touchStartY = e.touches[0].clientY;
        },
        { passive: true }
    );

    window.addEventListener(
        'touchmove',
        (e) => {
            if (touchStartY === null) return;
            const currentY = e.touches[0].clientY;
            const deltaY = touchStartY - currentY; // positivo = swipe hacia arriba = scroll hacia abajo

            if (Math.abs(deltaY) < TOUCH_TRIGGER_THRESHOLD && !isLocked) return;
            const handled = tryTriggerSnap(deltaY);
            if (handled) {
                e.preventDefault();
                touchStartY = null; // evita retriggers dentro del mismo gesto
            }
        },
        { passive: false }
    );
});