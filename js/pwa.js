let deferredInstallPrompt = null;

function mostrarEstadoConexion() {
  let aviso = document.getElementById("pwaEstadoConexion");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "pwaEstadoConexion";
    aviso.className = "pwa-estado-conexion";
    document.body.appendChild(aviso);
  }

  if (navigator.onLine) {
    aviso.textContent = "Conectado";
    aviso.classList.remove("offline");
    aviso.classList.add("online");
    setTimeout(() => aviso.classList.add("oculto"), 1800);
  } else {
    aviso.textContent = "Sin conexión: la app sigue disponible con datos guardados";
    aviso.classList.remove("online", "oculto");
    aviso.classList.add("offline");
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("PWA activa: service worker registrado"))
      .catch((error) => console.warn("No se pudo registrar la PWA", error));
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelectorAll("[data-pwa-install]").forEach((btn) => {
    btn.hidden = false;
    btn.disabled = false;
  });
});

document.addEventListener("click", async (event) => {
  const boton = event.target.closest("[data-pwa-install]");
  if (!boton || !deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  boton.hidden = true;
});

window.addEventListener("online", mostrarEstadoConexion);
window.addEventListener("offline", mostrarEstadoConexion);
window.addEventListener("load", mostrarEstadoConexion);
