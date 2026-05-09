import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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

const imagenArchivo = $("imagenArchivo");
const previewImagen = $("previewImagen");
const btnUsarUbicacion = $("btnUsarUbicacion");
const estadoUbicacion = $("estadoUbicacion");

imagenArchivo?.addEventListener("change", () => {
  const archivo = imagenArchivo.files?.[0];
  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    imagenArchivo.value = "";
    alert("Seleccioná una imagen válida.");
    return;
  }

  const urlTemporal = URL.createObjectURL(archivo);
  previewImagen.src = urlTemporal;
});

btnUsarUbicacion?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    estadoUbicacion.textContent = "Este dispositivo no permite obtener ubicación automática. Completá dirección, zona y localidad.";
    return;
  }

  estadoUbicacion.textContent = "Buscando ubicación actual...";
  btnUsarUbicacion.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;
      $("latitud").value = lat;
      $("longitud").value = lng;
      $("geolocalizacion").value = `https://www.google.com/maps?q=${lat},${lng}`;
      estadoUbicacion.textContent = "Ubicación cargada correctamente desde el celular/dispositivo.";
      btnUsarUbicacion.disabled = false;
    },
    () => {
      estadoUbicacion.textContent = "No se pudo obtener la ubicación. Podés continuar solo con dirección, zona y localidad.";
      btnUsarUbicacion.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

function crearLinkMapsPorDireccion() {
  const partes = [valor("direccion"), valor("zona"), valor("localidad") || "Gualeguay", "Entre Ríos", "Argentina"]
    .filter(Boolean)
    .join(", ");

  return partes ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partes)}` : "";
}

function extensionArchivo(nombre) {
  const partes = nombre.split(".");
  return partes.length > 1 ? partes.pop().toLowerCase() : "jpg";
}

async function subirImagenPrestador(uid) {
  const archivo = imagenArchivo?.files?.[0];
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

$("formRegistroPrestador")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const mensaje = $("mensajePrestador");
  const boton = event.target.querySelector("button[type='submit']");
  mensaje.textContent = "Creando cuenta y perfil...";
  boton.disabled = true;

  try {
    const email = valor("registroEmail");
    const password = valor("registroPassword");
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    mensaje.textContent = "Cuenta creada. Subiendo imagen y guardando datos...";
    const imagenUrl = await subirImagenPrestador(cred.user.uid);
    const linkMaps = valor("geolocalizacion") || crearLinkMapsPorDireccion();

    await addDoc(collection(db, "servicios"), {
      ownerUid: cred.user.uid,
      ownerEmail: email,
      nombre: valor("nombre"),
      categoria: valor("categoria"),
      descripcion: valor("descripcion"),
      telefono: valor("telefono"),
      email: email,
      direccion: valor("direccion"),
      zona: valor("zona"),
      localidad: valor("localidad") || "Gualeguay",
      horario: valor("horario"),
      imagen: imagenUrl,
      geolocalizacion: linkMaps,
      latitud: valor("latitud"),
      longitud: valor("longitud"),
      web: valor("web"),
      instagram: valor("instagram"),
      facebook: valor("facebook"),
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
    previewImagen.src = "img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png";
    setTimeout(() => window.location.href = "prestador-panel.html", 1200);
  } catch (error) {
    console.error(error);
    if (error.message?.includes("imagen")) {
      mensaje.textContent = error.message;
    } else if (error.code === "auth/email-already-in-use") {
      mensaje.textContent = "Este correo ya se encuentra registrado. Ingresá desde el login de prestador o usá otro email.";
    } else if (error.code === "auth/weak-password") {
      mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
    } else if (error.code === "auth/invalid-email") {
      mensaje.textContent = "El correo electrónico no es válido.";
    } else if (error.code === "storage/unauthorized") {
      mensaje.textContent = "La cuenta se creó, pero Firebase Storage no permitió subir la imagen. Revisá las reglas de Storage.";
    } else {
      mensaje.textContent = "No se pudo crear el perfil. Revisá el email, la contraseña, la conexión o las reglas de Firebase.";
    }
  } finally {
    boton.disabled = false;
  }
});
