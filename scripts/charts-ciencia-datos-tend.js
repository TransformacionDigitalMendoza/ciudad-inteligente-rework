const DRAW_DURATION_MS = 1600;
const DRAW_STAGGER_MS = 200;
const INITIAL_DELAY_MS = 2000;
const PULSE_INTERVAL_MS = 3200;
const PULSE_VISIBLE_MS = 1600;
 
const CROSS_POINT = { x: 160, y: 130 };
const ALERT_OFFSET_Y = -10;
 
function drawLine(path, delayMs) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  // Forzar reflow para que la transición se aplique desde el estado inicial
  path.getBoundingClientRect();
  path.style.transition = `stroke-dashoffset ${DRAW_DURATION_MS}ms ease`;
  setTimeout(() => {
    path.style.strokeDashoffset = 0;
  }, delayMs);
}
 
function pulseAlert(marker, alert) {
  marker.style.opacity = '1';
  alert.style.opacity = '1';
  alert.setAttribute(
    'transform',
    `translate(${CROSS_POINT.x},${CROSS_POINT.y + ALERT_OFFSET_Y})`
  );
 
  setTimeout(() => {
    marker.style.opacity = '0';
    alert.style.opacity = '0';
    alert.setAttribute('transform', `translate(${CROSS_POINT.x},${CROSS_POINT.y})`);
  }, PULSE_VISIBLE_MS);
}
 
function init() {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const marker = document.getElementById('marker');
  const alert = document.getElementById('alert');
 
  drawLine(line1, 150);
  drawLine(line2, 150 + DRAW_STAGGER_MS);
 
  setTimeout(() => {
    pulseAlert(marker, alert);
    setInterval(() => pulseAlert(marker, alert), PULSE_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
 
document.addEventListener('DOMContentLoaded', init);
 