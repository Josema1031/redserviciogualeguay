// Definir los servicios de ejemplo
const servicios = [
  {
      nombre: "Electricista",
      descripcion: "Instalación y reparación de sistemas eléctricos en viviendas y comercios.",
      imagen: "https://via.placeholder.com/250x150?text=Electricista"
  },
  {
      nombre: "Plomero",
      descripcion: "Reparación de cañerías, fugas de agua y mantenimiento de sistemas hidráulicos.",
      imagen: "https://via.placeholder.com/250x150?text=Plomero"
  },
  {
      nombre: "Carpintero",
      descripcion: "Fabricación y reparación de muebles, puertas, ventanas, y más.",
      imagen: "https://via.placeholder.com/250x150?text=Carpintero"
  }
];

// Función para mostrar los servicios y actualizar el contador
function mostrarServicios(servicios) {
    const listaServicios = document.querySelector("#listaServicios");
    listaServicios.innerHTML = ''; // Limpiar la lista de servicios
  
    // Mostrar las tarjetas de servicio
    servicios.forEach(servicio => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("servicio-card");
  
        tarjeta.innerHTML = `
            <img src="${servicio.imagen}" alt="${servicio.nombre}">
            <h3>${servicio.nombre}</h3>
            <p>${servicio.descripcion}</p>
        `;
  
        listaServicios.appendChild(tarjeta);
    });
  
    // Actualizar el contador de servicios
    const contador = document.querySelector("#totalServicios");
    contador.textContent = `Servicios disponibles: ${servicios.length}`;
  }
  
  // Cargar los servicios cuando la página se cargue
  document.addEventListener("DOMContentLoaded", () => mostrarServicios(servicios));
  

// Llamamos a la función cuando la página cargue
document.addEventListener("DOMContentLoaded", mostrarServicios);
