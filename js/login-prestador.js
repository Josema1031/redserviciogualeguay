import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXRkJAVQKMNgMGXFE8a13vrKvH4diARsg",
  authDomain: "red-servicio-gualeguay.firebaseapp.com",
  projectId: "red-servicio-gualeguay",
  storageBucket: "red-servicio-gualeguay.firebasestorage.app",
  messagingSenderId: "746177371010",
  appId: "1:746177371010:web:44612952639c6666010d9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);
const valor = (id) => $(id)?.value?.trim() || "";
const mensaje = $("mensajeLoginPrestador");

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "prestador-panel.html";
  }
});

$("formLoginPrestador")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensaje.textContent = "Ingresando al panel...";

  try {
    await signInWithEmailAndPassword(
      auth,
      valor("loginPrestadorEmail"),
      valor("loginPrestadorPassword")
    );
    mensaje.textContent = "Acceso correcto. Redirigiendo...";
    window.location.href = "prestador-panel.html";
  } catch (error) {
    console.error(error);
    mensaje.textContent = traducirErrorLogin(error.code);
  }
});

$("btnRecuperarPassword")?.addEventListener("click", async () => {
  const email = valor("loginPrestadorEmail");

  if (!email) {
    mensaje.textContent = "Primero escribí tu email y luego presioná recuperar contraseña.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    mensaje.textContent = "Te enviamos un correo para recuperar tu contraseña. Revisá tu bandeja de entrada o spam.";
  } catch (error) {
    console.error(error);
    mensaje.textContent = "No se pudo enviar el correo de recuperación. Verificá que el email esté bien escrito.";
  }
});

$("togglePrestadorPassword")?.addEventListener("click", () => {
  const input = $("loginPrestadorPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
});

function traducirErrorLogin(code) {
  const errores = {
    "auth/invalid-email": "El email ingresado no es válido.",
    "auth/user-disabled": "Esta cuenta fue deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y volvé a probar."
  };
  return errores[code] || "No se pudo iniciar sesión. Revisá email y contraseña.";
}
