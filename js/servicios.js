import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCXRkJAVQKMNgMGXFE8a13vrKvH4diARsg",
  authDomain: "red-servicio-gualeguay.firebaseapp.com",
  projectId: "red-servicio-gualeguay",
  storageBucket: "red-servicio-gualeguay.firebasestorage.app",
  messagingSenderId: "746177371010",
  appId: "1:746177371010:web:44612952639c6666010d9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const serviciosRef = collection(db, "servicios");

// Cargar servicios y mostrarlos
async function mostrarServicios() {
  const lista = document.getElementById("listaServicios");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(serviciosRef);

  querySnapshot.forEach(docSnap => {
    const servicio = docSnap.data();
    const promedio = servicio.calificaciones?.length
      ? (servicio.calificaciones.reduce((a, b) => a + b, 0) / servicio.calificaciones.length).toFixed(1)
      : "Sin calificaciones";

    const tarjeta = document.createElement("div");
    tarjeta.classList.add("servicio-card");
    tarjeta.innerHTML = `
      <img src="${servicio.imagen}" alt="${servicio.nombre}">
      <h3>${servicio.nombre}</h3>
      <p>${servicio.descripcion}</p>
      <p><strong>categoría:</strong> ${servicio.categoria}</p>
      <p><strong>teléfono:</strong> ${servicio.telefono}</p>
      <p><strong>Email:</strong> ${servicio.email}</p>
      <p><strong>Dirección:</strong> ${servicio.direccion}</p>
      <p><strong>Ubicación:</strong> <a href="${servicio.geolocalizacion}" target="_blank">Ver en mapa</a></p>
      <p><strong>Horario:</strong> ${servicio.horario}</p>
      <p><strong>Web:</strong> ${servicio.web}</p>
      <p><strong>Facebook:</strong> ${servicio.facebook}</p>
      <p><strong>Instagram:</strong> ${servicio.instagram}</p>
      <p><strong>Calificación:</strong> ${promedio} ⭐</p>
    `;
    lista.appendChild(tarjeta);
  });
}

mostrarServicios();