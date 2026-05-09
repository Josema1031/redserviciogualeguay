import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

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
const storage = getStorage(app);

const $ = (id) => document.getElementById(id);
const valor = (id) => $(id)?.value?.trim() || "";
let servicioIdActual = null;
let usuarioActual = null;

function setValor(id, value = "") {
  const el = $(id);
  if (el) el.value = value || "";
}

function extensionArchivo(nombre = "imagen.jpg") {
  const partes = nombre.split(".");
  return partes.length > 1 ? partes.pop().toLowerCase() : "jpg";
}

const inputImagenPanel = $("imagenArchivoPanel");
const previewImagenPanel = $("previewImagenPanel");

inputImagenPanel?.addEventListener("change", () => {
  const archivo = inputImagenPanel.files?.[0];
  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    inputImagenPanel.value = "";
    alert("Seleccioná una imagen válida.");
    return;
  }

  previewImagenPanel.src = URL.createObjectURL(archivo);
});

async function subirImagenPanel(uid) {
  const archivo = inputImagenPanel?.files?.[0];
  if (!archivo) return "";

  const maxMb = 5;
  if (archivo.size > maxMb * 1024 * 1024) {
    throw new Error(`La imagen no puede superar los ${maxMb}MB.`);
  }

  const ext = extensionArchivo(archivo.name);
  const nombreSeguro = `prestadores/${uid}/perfil-${Date.now()}.${ext}`;
  const referencia = ref(storage, nombreSeguro);
  await uploadBytes(referencia, archivo);
  return await getDownloadURL(referencia);
}

function crearLinkMapsPorDireccion() {
  const partes = [
    valor("direccion"),
    valor("zona"),
    valor("localidad") || "Gualeguay",
    "Entre Ríos",
    "Argentina"
  ].filter(Boolean).join(", ");

  return partes ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partes)}` : "";
}

$("btnUsarUbicacionPanel")?.addEventListener("click", () => {
  const estado = $("estadoUbicacionPanel");
  const btn = $("btnUsarUbicacionPanel");

  if (!navigator.geolocation) {
    estado.textContent = "Este dispositivo no permite obtener ubicación automática. Completá dirección, zona y localidad.";
    return;
  }

  estado.textContent = "Buscando ubicación actual...";
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;
      setValor("latitud", lat);
      setValor("longitud", lng);
      setValor("geolocalizacion", `https://www.google.com/maps?q=${lat},${lng}`);
      $("latitud").value = lat;
      $("longitud").value = lng;
      $("geolocalizacion").value = `https://www.google.com/maps?q=${lat},${lng}`;
      estado.textContent = "Ubicación GPS actualizada correctamente.";
      btn.disabled = false;
    },
    () => {
      estado.textContent = "No se pudo obtener ubicación GPS. Podés guardar igual con dirección, zona y localidad.";
      btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

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
      ${servicio.urgencia24 ? `<span class="mini-badge">Urgencia 24 hs</span>` : ""}
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
    <p><strong>Ubicación:</strong> ${[servicio.direccion, servicio.zona, servicio.localidad].filter(Boolean).join(" - ") || "No informada"}</p>
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
  setValor("email", servicio.email || servicio.ownerEmail || usuarioActual?.email || "");
  setValor("direccion", servicio.direccion);
  setValor("zona", servicio.zona);
  setValor("localidad", servicio.localidad || "Gualeguay");
  setValor("horario", servicio.horario);
  setValor("imagen", servicio.imagen);
  setValor("geolocalizacion", servicio.geolocalizacion);
  setValor("latitud", servicio.latitud);
  setValor("longitud", servicio.longitud);
  setValor("web", servicio.web);
  setValor("instagram", servicio.instagram);
  setValor("facebook", servicio.facebook);

  if (previewImagenPanel) {
    previewImagenPanel.src = servicio.imagen || "img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png";
  }
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
  const boton = event.target.querySelector("button[type='submit']");
  mensaje.textContent = "Guardando cambios...";
  boton.disabled = true;

  try {
    const imagenNueva = await subirImagenPanel(usuarioActual.uid);
    const linkMaps = valor("geolocalizacion") || crearLinkMapsPorDireccion();

    await updateDoc(doc(db, "servicios", servicioIdActual), {
      ownerUid: usuarioActual.uid,
      ownerEmail: usuarioActual.email,
      nombre: valor("nombre"),
      categoria: valor("categoria"),
      descripcion: valor("descripcion"),
      telefono: valor("telefono"),
      email: valor("email") || usuarioActual.email,
      direccion: valor("direccion"),
      zona: valor("zona"),
      localidad: valor("localidad") || "Gualeguay",
      horario: valor("horario"),
      imagen: imagenNueva || valor("imagen"),
      geolocalizacion: linkMaps,
      latitud: valor("latitud"),
      longitud: valor("longitud"),
      web: valor("web"),
      instagram: valor("instagram"),
      facebook: valor("facebook"),
      estado: "pendiente",
      actualizadoEn: new Date().toISOString()
    });
    mensaje.innerHTML = "Cambios guardados. El perfil quedó nuevamente <strong>pendiente de aprobación</strong>.";
    if (inputImagenPanel) inputImagenPanel.value = "";
    await cargarMiServicio(usuarioActual.uid);
  } catch (error) {
    console.error(error);
    mensaje.textContent = error.code === "storage/unauthorized"
      ? "Firebase Storage no permitió subir la imagen. Revisá las reglas de Storage."
      : (error.message || "No se pudieron guardar los cambios. Revisá las reglas de Firebase.");
  } finally {
    boton.disabled = false;
  }
});

async function cerrarSesion() {
  await signOut(auth);
  window.location.href = "login-prestador.html";
}

$("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
$("btnCerrarSesionTopMobile")?.addEventListener("click", cerrarSesion);
$("btnCerrarSesionMobile")?.addEventListener("click", cerrarSesion);
