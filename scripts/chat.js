// Anima una conversación de ejemplo dentro de la tarjeta .chat-card
// (sección "Inteligencia Artificial"). Usa las clases ya definidas en
// styles.css: .chat-row .bot/.user, .bubble, .typing-bubble, .exit

(function () {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  // Guion de la conversación de ejemplo.
  const SCRIPT = 
[
  { from: 'bot', text: '¡Hola! Soy el asistente virtual de Ciudad Inteligente. ¿En qué puedo ayudarte?' },

  { from: 'user', text: '¿Cómo hago para renovar mi licencia de conducir?' },
  { from: 'bot', text: 'Podés iniciar la gestión solicitando un turno. Te indico los requisitos y te llevo al sistema de turnos.' },
  { from: 'user', text: 'Sí, quiero sacar turno.' },
  { from: 'bot', text: 'Perfecto. ¿Querés hacerlo para renovación, primera licencia o duplicado?' },

  { from: 'user', text: 'Quiero consultar una deuda municipal.' },
  { from: 'bot', text: 'Claro. Puedo ayudarte a consultar tasas y medios de pago. ¿Querés revisar una deuda de inmueble, comercio o automotor?' },
  { from: 'user', text: 'De un inmueble.' },
  { from: 'bot', text: 'Ingresá el dato solicitado y te muestro las opciones disponibles para consultar y pagar.' },

  { from: 'user', text: 'Hay una luminaria que no funciona en mi cuadra.' },
  { from: 'bot', text: 'Puedo ayudarte a generar el aviso. Indicame la calle, la altura aproximada y, si querés, una referencia del lugar.' },
  { from: 'user', text: 'San Martín al 1200.' },
  { from: 'bot', text: 'Gracias. Voy a registrar la ubicación para que el área correspondiente pueda intervenir.' },

  { from: 'user', text: 'Necesito un turno para hacer un trámite.' },
  { from: 'bot', text: 'Claro. ¿Qué trámite necesitás realizar?' },
  { from: 'user', text: 'Habilitación comercial.' },
  { from: 'bot', text: 'Te muestro los requisitos y las opciones disponibles para continuar con la gestión.' },

  { from: 'user', text: '¿Dónde puedo pedir información pública?' },
  { from: 'bot', text: 'Podés realizar una solicitud de acceso a la información pública de manera online. Si querés, te explico cómo hacerlo o te llevo directamente al formulario.' },

  { from: 'user', text: 'Necesito datos sobre la ciudad para un trabajo.' },
  { from: 'bot', text: 'Podés consultar el Portal de Datos Abiertos, donde vas a encontrar conjuntos de datos municipales para descargar y reutilizar. ¿Sobre qué temática estás buscando información?' },

  { from: 'user', text: '¿Hay alguna forma de presentar una propuesta para mi barrio?' },
  { from: 'bot', text: 'Sí. La Ciudad cuenta con diferentes espacios de participación ciudadana. Puedo mostrarte las iniciativas disponibles y cómo participar en cada una.' },

  { from: 'user', text: '¿Qué puedo hacer este fin de semana en la Ciudad?' },
  { from: 'bot', text: 'Hay actividades culturales, espectáculos y propuestas para distintos públicos. ¿Querés ver música, teatro, muestras, actividades familiares o toda la agenda?' },
  { from: 'user', text: 'Actividades familiares.' },
  { from: 'bot', text: 'Perfecto. Te muestro las propuestas familiares disponibles para este fin de semana.' },

  { from: 'user', text: 'Quiero conocer lugares para visitar.' },
  { from: 'bot', text: 'Puedo recomendarte museos, plazas, circuitos, espacios culturales y otros puntos de interés. ¿Buscás algo para hacer caminando, una actividad cultural o un recorrido turístico?' },

  { from: 'user', text: '¿Hay algún evento hoy?' },
  { from: 'bot', text: 'Sí. Puedo mostrarte las actividades programadas para hoy y ayudarte a filtrarlas por horario, ubicación o temática.' },

  { from: 'user', text: '¿Dónde queda la municipalidad?' },
  { from: 'bot', text: 'Te puedo mostrar la dirección, horarios de atención y cómo llegar. También puedo indicarte si el trámite que necesitás se puede hacer online.' },

  { from: 'user', text: 'Quiero avisar sobre una situación en la vía pública.' },
  { from: 'bot', text: 'Puedo orientarte al canal correspondiente según el tipo de situación. ¿Se trata de una emergencia, un reclamo urbano o una situación de seguridad?' },

  { from: 'user', text: 'No sé dónde hacer mi trámite.' },
  { from: 'bot', text: 'No hay problema. Contame brevemente qué necesitás hacer y te indico el área, los requisitos y el canal más adecuado.' }

  ];

  const TYPING_DELAY = 900;   // tiempo que "escribe" antes de responder
  const MSG_PAUSE = 1400;     // pausa entre mensajes
  const RESTART_PAUSE = 2200; // pausa antes de reiniciar el loop
  const MAX_VISIBLE = 4;      // filas visibles antes de empezar a limpiar

  // --- Control de ejecución ---------------------------------------------
  // Causa del bug original: cada vez que el IntersectionObserver reportaba
  // "visible" se llamaba a runScript() otra vez, y como `cancelled` volvía a
  // ser false, los loops viejos (que seguían dormidos en un wait) despertaban
  // junto con los nuevos. Resultado: varios loops en paralelo, cada vez más
  // rápido. Ahora hay UN solo loop, identificado por runId; si el id cambia,
  // el loop viejo termina solo.
  let runId = 0;
  let running = false;
  let index = 0;           // posición actual en SCRIPT (se conserva al pausar)
  let cardVisible = false;

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function activeRows() {
    // Filas reales: sin las que ya se están yendo ni el indicador "escribiendo"
    return Array.from(chatBody.querySelectorAll('.chat-row')).filter(
      (r) => !r.classList.contains('exit') && !r.dataset.typing
    );
  }

  function removeTypingRows() {
    chatBody.querySelectorAll('.chat-row[data-typing="true"]').forEach((r) => r.remove());
  }

  function addBubble(from, text) {
    const row = document.createElement('div');
    row.className = `chat-row ${from}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollToBottom();

    // Saca las filas más viejas con fade-out hasta quedar en MAX_VISIBLE
    const rows = activeRows();
    for (let k = 0; k < rows.length - MAX_VISIBLE; k++) {
      const oldest = rows[k];
      oldest.classList.add('exit');
      const remove = () => oldest.remove();
      oldest.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, 800); // respaldo por si la animación no se dispara
    }
  }

  function addTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'chat-row bot';
    row.dataset.typing = 'true';

    const bubble = document.createElement('div');
    bubble.className = 'bubble typing-bubble';
    bubble.innerHTML =
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollToBottom();
    return row;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runScript(myId) {
    // El loop sólo sigue mientras siga siendo el "vigente"
    const alive = () => myId === runId;

    while (alive()) {
      while (index < SCRIPT.length) {
        const msg = SCRIPT[index];

        if (msg.from === 'bot') {
          const typingRow = addTypingIndicator();
          await wait(TYPING_DELAY);
          typingRow.remove();
          if (!alive()) return;
        }

        addBubble(msg.from, msg.text);
        index++;
        await wait(MSG_PAUSE);
        if (!alive()) return;
      }

      await wait(RESTART_PAUSE);
      if (!alive()) return;
      index = 0;
    }
  }

  function start() {
    if (running) return;          // nunca más de un loop
    running = true;
    runScript(++runId);
  }

  function stop() {
    if (!running) return;
    running = false;
    runId++;                      // invalida cualquier loop en curso
    removeTypingRows();
  }

  function sync() {
    if (cardVisible && !document.hidden) start();
    else stop();
  }

  // Sólo corre la animación mientras la tarjeta esté visible en pantalla,
  // para no gastar recursos cuando la card de IA está cerrada/fuera de vista.
  const chatCard = chatBody.closest('.chat-card');
  const observer = new IntersectionObserver((entries) => {
    // Se usa el último estado reportado; start()/stop() son idempotentes
    cardVisible = entries[entries.length - 1].isIntersecting;
    sync();
  }, { threshold: 0.2 });

  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);

  if (chatCard) observer.observe(chatCard);
})();