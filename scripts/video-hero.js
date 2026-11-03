(function () {
    const videos = [
      document.getElementById('video1'),
      document.getElementById('video2'),
      document.getElementById('video3')
    ];
    let current = 0;
 
    function playCurrent() {
      videos.forEach((v, i) => {
        v.classList.toggle('active', i === current);
        if (i !== current) {
          v.pause();
          v.currentTime = 0;
        }
      });
      const v = videos[current];
      v.currentTime = 0;
      if (v.readyState === 0) {
        v.load();
      }
      v.play().catch((err) => console.warn('No se pudo reproducir', v.id, err));
    }
 
    videos.forEach((video, index) => {
      video.addEventListener('ended', () => {
        current = (index + 1) % videos.length; // al llegar al final del 3º, vuelve al 1º
        playCurrent();
      });
    });
 
    // Inicia la secuencia con el primer video
    playCurrent();
  })();