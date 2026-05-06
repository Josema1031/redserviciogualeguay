import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
let servicioIdActual = null;
let usuarioActual = null;

function setValor(id, value = "") {
  const el = $(id);
  if (el) el.value = value || "";
}

function badgeEstado(estado = "pendiente") {
  const texto = estado === "aprobado" ? "Aprobado y visible" : estado === "suspendido" ? "Suspendido" : "Pendiente de aprobación";
  return `<span class="mini-badge estado-${estado}">${texto}</span>`;
}

function textoRating(servicio = {}) {
  const cantidad = Number(servicio.ratingCantidad || 0);
  const promedio = Number(servicio.ratingPromedio || 0);
  if (!cantidad || !promedio) return "Sin opiniones todavía";
  return `${promedio.toFixed(1)} ⭐ · ${cantidad} opinión(es)`;
}

async function cargarMisResenas(servicioId) {
  try {
    const q = query(collection(db, "resenas"), where("servicioId", "==", servicioId));
    const snap = await getDocs(q);
    const resenas = [];
    snap.forEach(item => resenas.push({ id: item.id, ...item.data() }));
    return resenas.sort((a, b) => String(b.creadoEn || "").localeCompare(String(a.creadoEn || ""))).slice(0, 5);
  } catch (error) {
    console.warn("No se pudieron cargar reseñas", error);
    return [];
  }
}

function renderMisResenas(resenas = []) {
  if (!resenas.length) return `<p class="resena-vacia">Todavía no recibiste opiniones.</p>`;
  return resenas.map(r => `
    <article class="resena-item">
      <div class="resena-head"><strong>${r.autor || "Vecino/a"}</strong><span>${"★".repeat(Number(r.rating || 0))}</span></div>
      <p>${r.comentario || "Sin comentario."}</p>
    </article>
  `).join("");
}

function calcularConversion(servicio) {
  const vistas = Number(servicio.vistas || 0);
  const contactos = Number(servicio.contactosWhatsapp || 0);
  if (!vistas) return "0%";
  return `${((contactos / vistas) * 100).toFixed(1)}%`;
}

function recomendacionComercial(servicio) {
  const estado = servicio.estado || "pendiente";
  const vistas = Number(servicio.vistas || 0);
  const contactos = Number(servicio.contactosWhatsapp || 0);
  if (estado !== "aprobado") return "Tu perfil todavía no está visible. Esperá la aprobación del administrador.";
  if (vistas === 0) return "Tu perfil ya está aprobado. Compartí el enlace de la plataforma para empezar a generar visitas.";
  if (contactos === 0) return "Tu perfil tiene visitas, pero todavía no genera contactos. Mejorá la descripción, horarios e imagen.";
  return "Tu perfil ya está generando consultas. Este dato sirve para justificar un plan Profesional o Premium.";
}

function pintarResumen(servicio) {
  const vistas = Number(servicio.vistas || 0);
  const contactos = Number(servicio.contactosWhatsapp || 0);
  $("resumenPrestador").innerHTML = `
    <h2>Estado del perfil</h2>
    <div class="badges-row">
      ${badgeEstado(servicio.estado || "pendiente")}
      <span class="mini-badge">Plan: ${servicio.plan || "basico"}</span>
      ${servicio.verificado ? `<span class="mini-badge">Verificado</span>` : ""}
      ${servicio.destacado ? `<span class="mini-badge">Destacado</span>` : ""}
    </div>

    <div class="metricas-prestador">
      <article><strong>${vistas}</strong><span>Visitas al perfil</span></article>
      <article><strong>${contactos}</strong><span>Clics en WhatsApp</span></article>
      <article><strong>${calcularConversion(servicio)}</strong><span>Conversión</span></article>
      <article><strong>${textoRating(servicio)}</strong><span>Reputación</span></article>
    </div>

    <p><strong>Servicio:</strong> ${servicio.nombre || "Sin nombre"}</p>
    <p><strong>Categoría:</strong> ${servicio.categoria || "No informada"}</p>
    <p><strong>WhatsApp:</strong> ${servicio.telefono || "No informado"}</p>
    <div class="recomendacion-box">${recomendacionComercial(servicio)}</div>
    <section class="prestador-resenas">
      <h3>Últimas opiniones recibidas</h3>
      <div id="misResenas">Cargando opiniones...</div>
    </section>
    <hr />
    <p>Para aparecer en la plataforma pública, el administrador debe aprobar tu perfil. Si editás tus datos, el perfil vuelve a revisión.</p>
  `;
}

function cargarFormulario(servicio) {
  setValor("nombre", servicio.nombre);
  setValor("categoria", servicio.categoria);
  setValor("descripcion", servicio.descripcion);
  setValor("telefono", servicio.telefono);
  setValor("direccion", servicio.direccion);
  setValor("zona", servicio.zona);
  setValor("horario", servicio.horario);
  setValor("imagen", servicio.imagen);
  setValor("geolocalizacion", servicio.geolocalizacion);
  setValor("instagram", servicio.instagram);
}

async function cargarMiServicio(uid) {
  const q = query(collection(db, "servicios"), where("ownerUid", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    $("resumenPrestador").innerHTML = `
      <h2>No tenés perfil cargado</h2>
      <p>Primero completá el registro de prestador.</p>
      <a class="btn btn-primary" href="prestador-registro.html">Crear perfil</a>
    `;
    $("formPanelPrestador")?.closest("article")?.classList.add("oculto");
    return;
  }

  const docSnap = snap.docs[0];
  servicioIdActual = docSnap.id;
  const servicio = docSnap.data();
  pintarResumen(servicio);
  cargarFormulario(servicio);
  const resenas = await cargarMisResenas(servicioIdActual);
  const contenedorResenas = $("misResenas");
  if (contenedorResenas) contenedorResenas.innerHTML = renderMisResenas(resenas);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login-prestador.html";
    return;
  }
  usuarioActual = user;
  await cargarMiServicio(user.uid);
});

$("formPanelPrestador")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!servicioIdActual || !usuarioActual) return;

  const mensaje = $("mensajePanel");
  mensaje.textContent = "Guardando cambios...";

  try {
    await updateDoc(doc(db, "servicios", servicioIdActual), {
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
      estado: "pendiente",
      actualizadoEn: new Date().toISOString()
    });
    mensaje.innerHTML = "Cambios guardados. El perfil quedó nuevamente <strong>pendiente de aprobación</strong>.";
    await cargarMiServicio(usuarioActual.uid);
  } catch (error) {
    console.error(error);
    mensaje.textContent = "No se pudieron guardar los cambios. Revisá las reglas de Firebase.";
  }
});

$("btnCerrarSesion")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login-prestador.html";
});
