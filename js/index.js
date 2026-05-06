import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, increment, addDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let serviciosCache = [];

const $ = (selector) => document.querySelector(selector);
const listaServicios = $("#listaServicios");
const contadorServicios = $("#contadorServicios");
const estadoServicios = $("#estadoServicios");

const normalizar = (texto = "") => texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const limpiarTelefono = (telefono = "") => {
  const numeros = telefono.toString().replace(/\D/g, "");
  if (!numeros) return "";
  if (numeros.startsWith("549")) return numeros;
  if (numeros.startsWith("54")) return numeros;
  return `54${numeros}`;
};

const valorSeguro = (valor, reemplazo = "No informado") => valor && valor.toString().trim() ? valor : reemplazo;

const imagenServicio = (servicio) => servicio.imagen && servicio.imagen.trim()
  ? servicio.imagen
  : "img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png";

async function registrarMetrica(servicioId, campo) {
  if (!servicioId || !campo) return;
  try {
    await updateDoc(doc(db, "servicios", servicioId), {
      [campo]: increment(1),
      ultimaInteraccion: new Date().toISOString()
    });
    const item = serviciosCache.find(servicio => servicio.id === servicioId);
    if (item) item[campo] = Number(item[campo] || 0) + 1;
  } catch (error) {
    // No bloqueamos la experiencia del usuario si falla una métrica.
    console.warn(`No se pudo registrar métrica ${campo}:`, error);
  }
}

const obtenerReputacion = (servicio = {}) => {
  const cantidad = Number(servicio.ratingCantidad || servicio.cantidadOpiniones || 0);
  const promedio = Number(servicio.ratingPromedio || 0);

  if (cantidad > 0 && promedio > 0) {
    return { promedio, cantidad, texto: `${promedio.toFixed(1)} ⭐`, estado: "con-opiniones" };
  }

  if (Array.isArray(servicio.calificaciones) && servicio.calificaciones.length > 0) {
    const suma = servicio.calificaciones.reduce((acc, item) => acc + Number(item || 0), 0);
    const prom = suma / servicio.calificaciones.length;
    return { promedio: prom, cantidad: servicio.calificaciones.length, texto: `${prom.toFixed(1)} ⭐`, estado: "legacy" };
  }

  return { promedio: 0, cantidad: 0, texto: "Nuevo", estado: "nuevo" };
};

const promedioCalificacion = (servicio) => obtenerReputacion(servicio).texto;

function estrellasHTML(valor = 0) {
  const rating = Math.round(Number(valor || 0));
  return Array.from({ length: 5 }, (_, i) => `<span class="estrella ${i < rating ? "activa" : ""}">★</span>`).join("");
}

async function cargarResenas(servicioId) {
  try {
    const q = query(collection(db, "resenas"), where("servicioId", "==", servicioId));
    const snap = await getDocs(q);
    const resenas = [];
    snap.forEach(item => resenas.push({ id: item.id, ...item.data() }));
    return resenas.sort((a, b) => String(b.creadoEn || "").localeCompare(String(a.creadoEn || ""))).slice(0, 8);
  } catch (error) {
    console.warn("No se pudieron cargar reseñas:", error);
    return [];
  }
}

function renderResenas(resenas = []) {
  if (!resenas.length) {
    return `<div class="resena-vacia">Todavía no hay opiniones. Sé el primero en calificar este servicio.</div>`;
  }

  return resenas.map(resena => `
    <article class="resena-item">
      <div class="resena-head">
        <strong>${resena.autor || "Vecino/a"}</strong>
        <span>${estrellasHTML(resena.rating)}</span>
      </div>
      <p>${resena.comentario || "Sin comentario."}</p>
    </article>
  `).join("");
}

function insignias(servicio) {
  const badges = [];
  if (servicio.verificado === true || servicio.estado === "verificado") badges.push("Verificado");
  if (servicio.plan === "premium" || servicio.destacado === true) badges.push("Destacado");
  if (servicio.urgencia24 === true || normalizar(servicio.horario).includes("24")) badges.push("24 hs");
  return badges;
}

function crearCard(servicio) {
  const telefonoWhatsApp = limpiarTelefono(servicio.telefono);
  const badges = insignias(servicio);
  const card = document.createElement("article");
  card.className = "servicio-card";
  card.dataset.categoria = servicio.categoria || "";
  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${imagenServicio(servicio)}" alt="${valorSeguro(servicio.nombre, "Servicio")}" loading="lazy" onerror="this.src='img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png'">
      <span class="rating-pill">${promedioCalificacion(servicio)}</span>
    </div>
    <div class="card-body">
      <div class="badges-row">
        ${badges.map(b => `<span class="mini-badge">${b}</span>`).join("") || `<span class="mini-badge muted">Nuevo</span>`}
      </div>
      <h3>${valorSeguro(servicio.nombre, "Servicio sin nombre")}</h3>
      <p class="card-desc">${valorSeguro(servicio.descripcion, "Prestador disponible en la ciudad.")}</p>
      <div class="card-meta">
        <span>📌 ${valorSeguro(servicio.categoria, "General")}</span>
        <span>📍 ${valorSeguro(servicio.zona || servicio.direccion, "Gualeguay")}</span>
        <span>🕒 ${valorSeguro(servicio.horario)}</span>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-card" onclick="mostrarModal('${servicio.id}')">Ver perfil</button>
        ${telefonoWhatsApp ? `<a class="btn-whatsapp js-whatsapp" data-servicio-id="${servicio.id}" target="_blank" href="https://wa.me/${telefonoWhatsApp}?text=Hola,%20vi%20tu%20servicio%20en%20Red%20de%20Servicio%20Gualeguay%20y%20quiero%20consultar.">WhatsApp</a>` : ""}
      </div>
    </div>
  `;
  return card;
}

function aplicarFiltros() {
  const texto = normalizar($("#buscarServicio")?.value || "");
  const categoria = $("#categoriaFiltro")?.value || "todas";
  const orden = $("#ordenarServicios")?.value || "default";

  let filtrados = serviciosCache.filter((servicio) => {
    const coincideTexto = [servicio.nombre, servicio.descripcion, servicio.categoria, servicio.direccion, servicio.zona]
      .some(campo => normalizar(campo).includes(texto));
    const coincideCategoria = categoria === "todas" || normalizar(servicio.categoria) === normalizar(categoria);
    return coincideTexto && coincideCategoria;
  });

  if (orden === "asc") filtrados.sort((a, b) => valorSeguro(a.nombre, "").localeCompare(valorSeguro(b.nombre, "")));
  if (orden === "desc") filtrados.sort((a, b) => valorSeguro(b.nombre, "").localeCompare(valorSeguro(a.nombre, "")));
  if (orden === "premium") filtrados.sort((a, b) => Number(b.destacado === true || b.plan === "premium") - Number(a.destacado === true || a.plan === "premium"));
  if (orden === "rating") filtrados.sort((a, b) => {
    const repA = obtenerReputacion(a);
    const repB = obtenerReputacion(b);
    return (repB.promedio * 100 + repB.cantidad) - (repA.promedio * 100 + repA.cantidad);
  });

  renderServicios(filtrados);
}

function renderServicios(servicios) {
  listaServicios.innerHTML = "";
  contadorServicios.textContent = `${servicios.length} servicio(s) encontrado(s)`;

  if (servicios.length === 0) {
    estadoServicios.innerHTML = `<p>No se encontraron servicios con ese filtro. Probá con otra categoría o limpiá la búsqueda.</p>`;
    return;
  }

  estadoServicios.innerHTML = "";
  servicios.forEach(servicio => listaServicios.appendChild(crearCard(servicio)));
}

async function cargarServiciosDesdeFirestore() {
  try {
    listaServicios.innerHTML = `<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>`;
    const querySnapshot = await getDocs(serviciosRef);
    serviciosCache = [];
    querySnapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      // Monetización / control de calidad:
      // solo se muestran públicamente los servicios aprobados.
      // Los registros viejos sin campo estado siguen visibles para no romper tu base actual.
      if (!data.estado || data.estado === "aprobado") serviciosCache.push(data);
    });
    serviciosCache.sort((a, b) => {
      const score = (item) => Number(item.plan === "premium") * 3 + Number(item.plan === "profesional") * 2 + Number(item.destacado === true) * 4 + Number(item.verificado === true);
      return score(b) - score(a);
    });
    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar servicios:", error);
    listaServicios.innerHTML = "";
    contadorServicios.textContent = "No se pudieron cargar los servicios";
    estadoServicios.innerHTML = `<p class="error-box">Revisá la conexión, las reglas de Firestore o la configuración de Firebase.</p>`;
  }
}

window.mostrarModal = async (id) => {
  try {
    const docRef = doc(db, "servicios", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert("El servicio no existe.");
      return;
    }

    const servicio = { id: docSnap.id, ...docSnap.data() };
    await registrarMetrica(id, "vistas");
    const telefonoWhatsApp = limpiarTelefono(servicio.telefono);
    const contenidoModal = $("#contenidoModal");
    contenidoModal.innerHTML = `
      <div class="modal-profile">
        <img src="${imagenServicio(servicio)}" alt="${valorSeguro(servicio.nombre, "Servicio")}" onerror="this.src='img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png'">
        <div>
          <div class="badges-row">${insignias(servicio).map(b => `<span class="mini-badge">${b}</span>`).join("")}</div>
          <h2>${valorSeguro(servicio.nombre, "Servicio")}</h2>
          <p>${valorSeguro(servicio.descripcion, "Sin descripción disponible.")}</p>
        </div>
      </div>
      <div class="modal-info-grid">
        <p><strong>Categoría</strong><span>${valorSeguro(servicio.categoria)}</span></p>
        <p><strong>Teléfono</strong><span><a href="tel:${servicio.telefono}">${valorSeguro(servicio.telefono)}</a></span></p>
        <p><strong>Dirección</strong><span>${valorSeguro(servicio.direccion)}</span></p>
        <p><strong>Horario</strong><span>${valorSeguro(servicio.horario)}</span></p>
        <p><strong>Email</strong><span>${valorSeguro(servicio.email)}</span></p>
        <p><strong>Calificación</strong><span>${promedioCalificacion(servicio)} · ${obtenerReputacion(servicio).cantidad} opinión(es)</span></p>
      </div>
      <section class="reputacion-box" id="reputacionBox">
        <div class="reputacion-head">
          <div>
            <h3>Opiniones de vecinos</h3>
            <p>Calificá solo si tuviste contacto real con el prestador.</p>
          </div>
          <strong class="rating-grande">${promedioCalificacion(servicio)}</strong>
        </div>
        <div id="listaResenasModal" class="resenas-lista">Cargando opiniones...</div>
        <form id="formResena" class="form-resena" data-servicio-id="${servicio.id}">
          <label>Tu nombre<input type="text" id="resenaAutor" maxlength="40" placeholder="Ej: José" required></label>
          <label>Calificación
            <select id="resenaRating" required>
              <option value="5">5 estrellas - Excelente</option>
              <option value="4">4 estrellas - Muy bueno</option>
              <option value="3">3 estrellas - Bueno</option>
              <option value="2">2 estrellas - Regular</option>
              <option value="1">1 estrella - Malo</option>
            </select>
          </label>
          <label class="full">Comentario<textarea id="resenaComentario" rows="3" maxlength="260" placeholder="Contá brevemente cómo fue la atención..." required></textarea></label>
          <button class="btn btn-secondary full" type="submit">Enviar opinión</button>
          <p id="mensajeResena" class="mensaje-resena"></p>
        </form>
      </section>
      <div class="modal-links">
        ${telefonoWhatsApp ? `<a class="btn btn-primary js-whatsapp" data-servicio-id="${servicio.id}" target="_blank" href="https://wa.me/${telefonoWhatsApp}?text=Hola,%20vi%20tu%20servicio%20en%20Red%20de%20Servicio%20Gualeguay%20y%20quiero%20consultar.">Contactar por WhatsApp</a>` : ""}
        ${servicio.geolocalizacion ? `<a class="btn btn-light" target="_blank" href="${servicio.geolocalizacion}">Ver ubicación</a>` : ""}
        ${servicio.web ? `<a class="btn btn-light" target="_blank" href="${servicio.web}">Sitio web</a>` : ""}
      </div>
    `;

    const modal = $("#modalServicio");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const resenas = await cargarResenas(id);
    const listaResenas = $("#listaResenasModal");
    if (listaResenas) listaResenas.innerHTML = renderResenas(resenas);
  } catch (error) {
    console.error("Error al abrir modal:", error);
    alert("No se pudo abrir el perfil del servicio.");
  }
};

window.cerrarModal = () => {
  const modal = $("#modalServicio");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
};

async function guardarResena(event) {
  event.preventDefault();
  const form = event.target;
  const servicioId = form.dataset.servicioId;
  const mensaje = $("#mensajeResena");
  if (!servicioId) return;

  const bloqueoKey = `resena_${servicioId}`;
  const ultima = Number(localStorage.getItem(bloqueoKey) || 0);
  const ahora = Date.now();
  const bloqueo24hs = 24 * 60 * 60 * 1000;
  if (ultima && ahora - ultima < bloqueo24hs) {
    if (mensaje) mensaje.textContent = "Ya enviaste una opinión para este servicio recientemente.";
    return;
  }

  const autor = $("#resenaAutor")?.value.trim();
  const rating = Number($("#resenaRating")?.value || 0);
  const comentario = $("#resenaComentario")?.value.trim();

  if (!autor || !comentario || rating < 1 || rating > 5) {
    if (mensaje) mensaje.textContent = "Completá nombre, estrellas y comentario.";
    return;
  }

  try {
    if (mensaje) mensaje.textContent = "Guardando opinión...";
    await addDoc(collection(db, "resenas"), {
      servicioId,
      autor,
      rating,
      comentario,
      aprobado: true,
      creadoEn: new Date().toISOString(),
      creadoServidor: serverTimestamp()
    });

    const servicio = serviciosCache.find(item => item.id === servicioId) || {};
    const cantidadAnterior = Number(servicio.ratingCantidad || 0);
    const promedioAnterior = Number(servicio.ratingPromedio || 0);
    const sumaAnterior = Number(servicio.ratingSuma || (promedioAnterior * cantidadAnterior));
    const nuevaCantidad = cantidadAnterior + 1;
    const nuevaSuma = sumaAnterior + rating;
    const nuevoPromedio = nuevaSuma / nuevaCantidad;

    await updateDoc(doc(db, "servicios", servicioId), {
      ratingSuma: nuevaSuma,
      ratingCantidad: nuevaCantidad,
      ratingPromedio: Number(nuevoPromedio.toFixed(2)),
      ultimaResena: new Date().toISOString()
    });

    localStorage.setItem(bloqueoKey, String(ahora));
    if (mensaje) mensaje.textContent = "Gracias. Tu opinión ayuda a que la red sea más confiable.";
    form.reset();

    const resenas = await cargarResenas(servicioId);
    const listaResenas = $("#listaResenasModal");
    if (listaResenas) listaResenas.innerHTML = renderResenas(resenas);

    const item = serviciosCache.find(s => s.id === servicioId);
    if (item) {
      item.ratingSuma = nuevaSuma;
      item.ratingCantidad = nuevaCantidad;
      item.ratingPromedio = Number(nuevoPromedio.toFixed(2));
    }
  } catch (error) {
    console.error("Error al guardar reseña:", error);
    if (mensaje) mensaje.textContent = "No se pudo guardar la opinión. Revisá las reglas de Firestore.";
  }
}

function activarEventos() {
  document.addEventListener("click", (event) => {
    const linkWhatsapp = event.target.closest(".js-whatsapp");
    if (!linkWhatsapp) return;
    registrarMetrica(linkWhatsapp.dataset.servicioId, "contactosWhatsapp");
  });

  document.addEventListener("submit", (event) => {
    if (event.target?.id === "formResena") guardarResena(event);
  });

  $("#buscarServicio")?.addEventListener("input", aplicarFiltros);
  $("#categoriaFiltro")?.addEventListener("change", aplicarFiltros);
  $("#ordenarServicios")?.addEventListener("change", aplicarFiltros);
  $("#btnLimpiar")?.addEventListener("click", () => {
    $("#buscarServicio").value = "";
    $("#categoriaFiltro").value = "todas";
    $("#ordenarServicios").value = "default";
    document.querySelectorAll(".categoria-chip").forEach(btn => btn.classList.remove("active"));
    document.querySelector('[data-categoria="todas"]')?.classList.add("active");
    aplicarFiltros();
  });

  document.querySelectorAll(".categoria-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".categoria-chip").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      $("#categoriaFiltro").value = btn.dataset.categoria;
      aplicarFiltros();
    });
  });

  $("#modalServicio")?.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) cerrarModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  activarEventos();
  cargarServiciosDesdeFirestore();
});
