import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
const auth = getAuth(app);
const serviciosRef = collection(db, "servicios");

let idServicioActual = null;
let serviciosCache = [];

const $ = (selector) => document.querySelector(selector);
const normalizar = (texto = "") => texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const valor = (id) => document.getElementById(id)?.value?.trim() || "";
const check = (id) => document.getElementById(id)?.checked || false;

function textoRating(servicio = {}) {
  const cantidad = Number(servicio.ratingCantidad || 0);
  const promedio = Number(servicio.ratingPromedio || 0);
  if (!cantidad || !promedio) return "Sin opiniones";
  return `${promedio.toFixed(1)} ⭐ (${cantidad})`;
}

onAuthStateChanged(auth, (user) => {
  if (user) cargarServicios();
  else window.location.href = "login.html";
});

function datosFormulario(prefijo = "") {
  const edit = prefijo === "edit";
  return {
    nombre: valor(`${prefijo}Nombre`) || valor("nombre"),
    descripcion: valor(`${prefijo}Descripcion`) || valor("descripcion"),
    categoria: valor(`${prefijo}Categoria`) || valor("categoria"),
    telefono: valor(`${prefijo}Telefono`) || valor("telefono"),
    email: valor(`${prefijo}Email`) || valor("email"),
    imagen: valor(`${prefijo}Imagen`) || valor("imagen"),
    direccion: valor(`${prefijo}Direccion`) || valor("direccion"),
    zona: valor(`${prefijo}Zona`) || valor("zona"),
    horario: valor(`${prefijo}Horario`) || valor("horario"),
    geolocalizacion: valor(`${prefijo}Geolocalizacion`) || valor("geolocalizacion"),
    web: valor(`${prefijo}Web`) || valor("web"),
    instagram: valor(`${prefijo}Instagram`) || valor("instagram"),
    facebook: valor(`${prefijo}Facebook`) || valor("facebook"),
    estado: valor(`${prefijo}Estado`) || valor("estado") || "pendiente",
    plan: valor(`${prefijo}Plan`) || valor("plan") || "basico",
    verificado: check(`${prefijo}Verificado`) || (!edit && check("verificado")),
    destacado: check(`${prefijo}Destacado`) || (!edit && check("destacado")),
    urgencia24: check(`${prefijo}Urgencia24`) || (!edit && check("urgencia24"))
  };
}

function setValor(id, value = "") {
  const el = document.getElementById(id);
  if (el) el.value = value || "";
}

function setCheck(id, value = false) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(value);
}

async function cargarServicios() {
  const lista = $("#listaServiciosAdmin");
  const contador = $("#adminContador");
  if (!lista) return;

  lista.innerHTML = "";
  const querySnapshot = await getDocs(serviciosRef);
  serviciosCache = [];

  querySnapshot.forEach((docSnap) => serviciosCache.push({ id: docSnap.id, ...docSnap.data() }));
  renderAdmin();
  if (contador) contador.textContent = `${serviciosCache.length} servicio(s)`;
}

function renderAdmin() {
  const lista = $("#listaServiciosAdmin");
  const filtro = normalizar(valor("buscador"));
  const categoria = valor("filtro-categoria");
  const estado = valor("filtro-estado");
  const ordenarPor = valor("ordenar") || "nombre";

  let servicios = serviciosCache.filter((servicio) => {
    const coincideTexto = [servicio.nombre, servicio.categoria, servicio.zona, servicio.direccion, servicio.telefono]
      .some(campo => normalizar(campo).includes(filtro));
    const coincideCategoria = !categoria || normalizar(servicio.categoria) === normalizar(categoria);
    const coincideEstado = !estado || normalizar(servicio.estado || "aprobado") === normalizar(estado);
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  if (ordenarPor === "nombre") servicios.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  if (ordenarPor === "categoria") servicios.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));
  if (ordenarPor === "plan") servicios.sort((a, b) => (b.plan || "basico").localeCompare(a.plan || "basico"));
  if (ordenarPor === "estado") servicios.sort((a, b) => (a.estado || "aprobado").localeCompare(b.estado || "aprobado"));
  if (ordenarPor === "vistas") servicios.sort((a, b) => Number(b.vistas || 0) - Number(a.vistas || 0));
  if (ordenarPor === "contactos") servicios.sort((a, b) => Number(b.contactosWhatsapp || 0) - Number(a.contactosWhatsapp || 0));
  if (ordenarPor === "rating") servicios.sort((a, b) => (Number(b.ratingPromedio || 0) * 100 + Number(b.ratingCantidad || 0)) - (Number(a.ratingPromedio || 0) * 100 + Number(a.ratingCantidad || 0)));

  lista.innerHTML = "";
  servicios.forEach((servicio) => {
    const card = document.createElement("article");
    card.className = "admin-service-card";
    card.innerHTML = `
      <div class="badges-row">
        <span class="mini-badge estado-${servicio.estado || "aprobado"}">${servicio.estado || "aprobado"}</span>
        <span class="mini-badge">${servicio.plan || "basico"}</span>
        ${servicio.verificado ? `<span class="mini-badge">Verificado</span>` : ""}
        ${servicio.destacado ? `<span class="mini-badge">Destacado</span>` : ""}
        ${servicio.urgencia24 ? `<span class="mini-badge">24 hs</span>` : ""}
      </div>
      <h3>${servicio.nombre || "Sin nombre"}</h3>
      <p><strong>Categoría:</strong> ${servicio.categoria || "No informada"}</p>
      <p><strong>Teléfono:</strong> ${servicio.telefono || "No informado"}</p>
      <p><strong>Zona:</strong> ${servicio.zona || servicio.direccion || "Gualeguay"}</p>
      <div class="admin-metricas-linea">
        <span class="admin-metrica-pill">⭐ ${textoRating(servicio)}</span>
        <span class="admin-metrica-pill">👁️ ${servicio.vistas || 0} visitas</span>
        <span class="admin-metrica-pill">💬 ${servicio.contactosWhatsapp || 0} WhatsApp</span>
        <span class="admin-metrica-pill">📈 ${servicio.vistas ? (((Number(servicio.contactosWhatsapp || 0) / Number(servicio.vistas || 1)) * 100).toFixed(1)) : "0"}% conv.</span>
      </div>
      <div class="admin-service-actions">
        <button class="btn btn-success" onclick="cambiarEstadoServicio('${servicio.id}', 'aprobado')">Aprobar</button>
        <button class="btn btn-light" onclick="cambiarEstadoServicio('${servicio.id}', 'pendiente')">Pendiente</button>
        <button class="btn btn-dark" onclick="editarServicio('${servicio.id}')">Editar</button>
        <button class="btn btn-danger" onclick="eliminarServicio('${servicio.id}')">Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

$("#formAgregarServicio")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nuevoServicio = {
    ...datosFormulario(""),
    calificaciones: [],
    comentarios: [],
    creadoEn: new Date().toISOString(),
    origen: "admin",
    vistas: 0,
    contactosWhatsapp: 0
  };

  await addDoc(serviciosRef, nuevoServicio);
  alert(`Servicio '${nuevoServicio.nombre}' agregado correctamente.`);
  event.target.reset();
  await cargarServicios();
});

window.cambiarEstadoServicio = async function(id, estado) {
  await updateDoc(doc(db, "servicios", id), { estado, actualizadoEn: new Date().toISOString() });
  await cargarServicios();
};

window.eliminarServicio = async function(id) {
  if (!confirm("¿Estás seguro de eliminar este servicio?")) return;
  await deleteDoc(doc(db, "servicios", id));
  alert("Servicio eliminado.");
  await cargarServicios();
};

window.editarServicio = async function(id) {
  idServicioActual = id;
  const docSnap = await getDoc(doc(db, "servicios", id));
  if (!docSnap.exists()) {
    alert("El servicio no existe.");
    return;
  }

  const servicio = docSnap.data();
  setValor("editNombre", servicio.nombre);
  setValor("editDescripcion", servicio.descripcion);
  setValor("editCategoria", servicio.categoria);
  setValor("editTelefono", servicio.telefono);
  setValor("editEmail", servicio.email);
  setValor("editImagen", servicio.imagen);
  setValor("editDireccion", servicio.direccion);
  setValor("editZona", servicio.zona);
  setValor("editHorario", servicio.horario);
  setValor("editGeolocalizacion", servicio.geolocalizacion);
  setValor("editWeb", servicio.web);
  setValor("editInstagram", servicio.instagram);
  setValor("editFacebook", servicio.facebook);
  setValor("editEstado", servicio.estado || "aprobado");
  setValor("editPlan", servicio.plan || "basico");
  setCheck("editVerificado", servicio.verificado);
  setCheck("editDestacado", servicio.destacado);
  setCheck("editUrgencia24", servicio.urgencia24);

  document.getElementById("modalEditar")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

$("#formEditarServicio")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!idServicioActual) {
    alert("Primero seleccioná un servicio para editar.");
    return;
  }

  const nuevosDatos = datosFormulario("edit");
  await updateDoc(doc(db, "servicios", idServicioActual), nuevosDatos);
  alert("Servicio actualizado correctamente.");
  idServicioActual = null;
  event.target.reset();
  await cargarServicios();
});

$("#buscador")?.addEventListener("input", renderAdmin);
$("#ordenar")?.addEventListener("change", renderAdmin);
$("#filtro-categoria")?.addEventListener("change", renderAdmin);
$("#filtro-estado")?.addEventListener("change", renderAdmin);
