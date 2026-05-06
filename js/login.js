// login.js con Firebase Auth

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Configuración de Firebase (reutilizá tu config real)
const firebaseConfig = {
  apiKey: "AIzaSyCXRkJAVQKMNgMGXFE8a13vrKvH4diARsg",
  authDomain: "red-servicio-gualeguay.firebaseapp.com",
  projectId: "red-servicio-gualeguay",
  storageBucket: "red-servicio-gualeguay.firebasestorage.app",
  messagingSenderId: "746177371010",
  appId: "1:746177371010:web:44612952639c6666010d9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Manejo del formulario de login
document.getElementById('formLogin').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('username').value;  // usamos el campo 'username' como email
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Login exitoso
      window.location.href = "admin.html";
    })
    .catch((error) => {
      // Error de autenticación
      document.getElementById('mensaje-error').textContent = "Email o contraseña incorrectos.";
    });
});
// Mostrar/ocultar contraseña
document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const icon = document.getElementById("togglePassword");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    icon.textContent = "👁️";
  }
});

// Permitir login con tecla Enter desde el campo contraseña
document.getElementById("password").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("formLogin").dispatchEvent(new Event("submit"));
  }
});
