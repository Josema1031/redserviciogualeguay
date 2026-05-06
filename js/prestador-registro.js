import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const valor = (id) => $(id)?.value?.trim() || "";

$("formRegistroPrestador")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const mensaje = $("mensajePrestador");
  mensaje.textContent = "Creando cuenta y perfil...";

  try {
    const email = valor("registroEmail");
    const password = valor("registroPassword");
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await addDoc(collection(db, "servicios"), {
      ownerUid: cred.user.uid,
      ownerEmail: email,
      nombre: valor("nombre"),
      categoria: valor("categoria"),
      descripcion: valor("descripcion"),
      telefono: valor("telefono"),
      direccion: valor("direccion"),
      zona: valor("zona"),
      horario: valor("horario"),
      imagen: valor("imagen"),
      geolocalizacion: valor("geolocalizacion"),
      instagram: valor("instagram"),
      plan: "basico",
      estado: "pendiente",
      verificado: false,
      destacado: false,
      urgencia24: false,
      calificaciones: [],
      comentarios: [],
      vistas: 0,
      contactosWhatsapp: 0,
      origen: "registro-prestador",
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    });

    mensaje.innerHTML = "Perfil creado correctamente. Quedó <strong>pendiente de aprobación</strong>. Ahora podés ingresar a tu panel.";
    event.target.reset();
    setTimeout(() => window.location.href = "prestador-panel.html", 1200);
  } catch (error) {
    console.error(error);
    mensaje.textContent = "No se pudo crear el perfil. Revisá el email, la contraseña o las reglas de Firebase.";
  }
});
