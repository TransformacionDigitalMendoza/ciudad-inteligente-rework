(function(){
  const messagesEl = document.getElementById('messages');
  const chatBlock = document.getElementById('chatBlock');
  const MAX_VISIBLE = 6;
 
  // ---------- Tiempos configurables ----------
  const READ_PAUSE_MIN = 1100;   // pausa mínima tras un mensaje, antes de que el otro lado empiece a escribir (ms)
  const READ_PAUSE_MAX = 1800;  // pausa máxima
  const TYPING_MIN = 1100;       // duración mínima del globo "escribiendo..." (ms)
  const TYPING_MAX = 1600;      // duración máxima
  // --------------------------------------------
 
  // Genera anchos de "líneas" aleatorios para simular texto
  function randomLines(bubble, min, max){
    const bubbleWidth = 110 + Math.random()*140; // ancho total de la burbuja en px
    bubble.style.width = bubbleWidth + 'px';
 
    const innerWidth = bubbleWidth - 24; // resta el padding horizontal
    const n = Math.floor(Math.random()*(max-min+1))+min;
    for(let i=0;i<n;i++){
      const line = document.createElement('div');
      line.className = 'line';
      const isLast = i === n-1;
      const ratio = isLast ? (0.4 + Math.random()*0.35) : (0.7 + Math.random()*0.3);
      line.style.width = Math.max(24, innerWidth * Math.min(ratio,1)) + 'px';
      bubble.appendChild(line);
    }
  }
 
  function createBubble(type){
    const row = document.createElement('div');
    row.className = 'bubble-row ' + type + ' enter';
 
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + type;
    randomLines(bubble, 1, 3);
 
    row.appendChild(bubble);
    return row;
  }
 
  function createTyping(type){
    const row = document.createElement('div');
    row.className = 'bubble-row ' + type + ' enter';
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(typing);
    return row;
  }
 
  // Técnica FLIP: mide la posición de cada burbuja ANTES de insertar una nueva,
  // y luego de insertarla anima la diferencia, logrando que todo el historial
  // suba verticalmente como en un scroll real, sin perspectiva ni desenfoque.
  function captureRects(){
    const rects = new Map();
    messagesEl.querySelectorAll('.bubble-row').forEach(row=>{
      rects.set(row, row.getBoundingClientRect().top);
    });
    return rects;
  }
 
  function playFlip(oldRects){
    const rows = messagesEl.querySelectorAll('.bubble-row');
    rows.forEach(row=>{
      const oldTop = oldRects.get(row);
      if(oldTop == null) return; // fila nueva, no aplica FLIP
      const newTop = row.getBoundingClientRect().top;
      const delta = oldTop - newTop;
      if(Math.abs(delta) < 0.5) return;
      row.style.transition = 'none';
      row.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(()=>{
        row.style.transition = '';
        row.style.transform = '';
      });
    });
  }
 
  let seq = 0;
  function nextType(){
    seq++;
    // patrón conversacional: alterna con algo de variación
    return (seq % 3 === 0) ? 'sent' : 'received';
  }
 
  async function addMessage(token){
    const type = nextType();
 
    // 1) Pausa de "lectura": tiempo que pasa desde que se vio el último
    //    mensaje hasta que el otro lado empieza a escribir.
    await new Promise(r => setTimeout(r, READ_PAUSE_MIN + Math.random()*(READ_PAUSE_MAX-READ_PAUSE_MIN)));
    if(token !== runToken) return false; // el loop fue detenido/reiniciado mientras esperábamos
 
    // 2) Aparece el globo de "escribiendo" para el lado que va a responder.
    let oldRects = captureRects();
    const typingRow = createTyping(type);
    messagesEl.appendChild(typingRow);
    requestAnimationFrame(()=>{
      typingRow.classList.add('enter-active');
      playFlip(oldRects);
    });
 
    // 3) Duración del "escribiendo..."
    await new Promise(r => setTimeout(r, TYPING_MIN + Math.random()*(TYPING_MAX-TYPING_MIN)));
    if(token !== runToken){
      typingRow.remove(); // evita dejar un globo de "escribiendo" huérfano
      return false;
    }
 
    // 4) Se reemplaza el indicador por el mensaje real.
    oldRects = captureRects();
    typingRow.remove();
    playFlip(oldRects);
 
    oldRects = captureRects();
    const row = createBubble(type);
    messagesEl.appendChild(row);
    requestAnimationFrame(()=>{
      row.classList.remove('enter');
      row.classList.add('enter-active');
      playFlip(oldRects);
    });
 
    // limpia mensajes antiguos para mantener el rendimiento
    const rows = messagesEl.querySelectorAll('.bubble-row');
    if(rows.length > MAX_VISIBLE + 2){
      rows[0].remove();
    }
 
    return true;
  }
 
  let running = false;
  let runToken = 0; // se incrementa cada vez que se detiene/arranca el loop
 
  function startLoop(){
    if(running) return; // ya hay un loop activo, no crear otro en paralelo
    running = true;
    const myToken = ++runToken;
    (async function loop(){
      while(running && myToken === runToken){
        const ok = await addMessage(myToken);
        if(!ok) break; // el token cambió: este loop quedó obsoleto, se corta solo
      }
    })();
  }
 
  function stopLoop(){
    running = false;
    runToken++; // invalida inmediatamente cualquier loop que siga en curso
  }
 
  // Inicia la animación cuando el bloque entra en el viewport (al hacer scroll)
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        startLoop();
      } else {
        stopLoop();
      }
    });
  }, { threshold: 0.35 });
 
  observer.observe(chatBlock);
 
})();