// Newsletter -> Firebase Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// 1) Pegá acá la config de tu proyecto
//    (Firebase Console > Configuración del proyecto > Tus apps > App web)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("newsletter-form");
const emailInput = document.getElementById("newsletter-email");
const consentInput = document.getElementById("newsletter-consent");
const submitBtn = document.getElementById("newsletter-submit");
const msg = document.getElementById("newsletter-msg");

const EMAIL_RE = /^[^@\s/]+@[^@\s/]+\.[^@\s/]+$/;

function showMessage(text, type) {
  msg.textContent = text;
  msg.className = "news-form__msg" + (type ? " is-" + type : "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Honeypot: si un bot lo completó, fingimos éxito y no guardamos nada
  if (form.elements["website"].value) return;

  const email = emailInput.value.trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    showMessage("Ingresá un correo electrónico válido.", "error");
    emailInput.focus();
    return;
  }
  if (!consentInput.checked) {
    showMessage("Tenés que aceptar recibir correos informativos para suscribirte.", "error");
    return;
  }

  submitBtn.disabled = true;
  showMessage("Enviando...", "");

  try {
    // El email es el ID del documento: evita duplicados
    await setDoc(doc(db, "newsletter_subscribers", email), {
      email,
      consent: true,
      source: "web-newsletter",
      createdAt: serverTimestamp(),
    });
    form.reset();
    showMessage("¡Listo! Te suscribiste correctamente.", "ok");
  } catch (err) {
    console.error("Error al guardar suscripción:", err);
    if (err.code === "permission-denied") {
      // Las reglas no permiten sobrescribir: el correo ya existe
      showMessage("Este correo ya está suscripto.", "ok");
    } else {
      showMessage("No pudimos procesar tu suscripción. Probá de nuevo en unos minutos.", "error");
    }
  } finally {
    submitBtn.disabled = false;
  }
});