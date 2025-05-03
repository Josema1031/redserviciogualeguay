// index.js

// Función para cargar los servicios en la página de inicio
function cargarServiciosEnInicio() {
    const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    const listaServicios = document.getElementById("listaServicios");
    listaServicios.innerHTML = ""; // Limpiar la lista

    servicios.forEach(servicio => {
        const tarjeta = document.createElement("div");
        const promedio =
    servicio.calificaciones && servicio.calificaciones.length > 0
        ? (servicio.calificaciones.reduce((a, b) => a + b, 0) / servicio.calificaciones.length).toFixed(1)
        : "Sin calificaciones";
        tarjeta.classList.add("servicio-card");
        tarjeta.innerHTML = `
            <img src="${servicio.imagen}" alt="${servicio.nombre}">
            <h3>${servicio.nombre}</h3>
            <p>${servicio.descripcion}</p>
            <p><strong>categoria:</strong> ${servicio.categoria}</p>
            <p><strong>telefono:</strong> ${servicio.telefono}</p>  <!-- Mostrar dirección -->
            <p><strong>Email:</strong> ${servicio.email}</p>
            <p><strong>Dirección:</strong> ${servicio.direccion}</p>  <!-- Mostrar dirección -->
            <p><strong>Ubicación:</strong> <a href="${servicio.geolocalizacion}" target="_blank">Ver en mapa</a></p>
            <p><strong>Horario:</strong> ${servicio.horario}</p>  <!-- Mostrar horario -->
            <p><strong>Web:</strong> ${servicio.web}</p>
            <p><strong>Facebook:</strong> ${servicio.facebook}</p>
            <p><strong>Instagram:</strong> ${servicio.instagram}</p>
            <p><strong>Calificación:</strong> ${promedio} ⭐</p>

    <!-- Formulario para calificar -->
    <div>
        <label for="calificacion-${servicio.id}">Calificar:</label>
        <select id="calificacion-${servicio.id}">
            <option value="1">⭐</option>
            <option value="2">⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
        </select>
        <button onclick="calificarServicio(${servicio.id})">Enviar</button>
    </div>
  <!-- Mostrar horario -->
        `;
        listaServicios.appendChild(tarjeta);
    });
}

// Cargar los servicios al cargar la página
cargarServiciosEnInicio();

// Función para buscar servicios por nombre
function buscarServicio() {
    const terminoBusqueda = document.getElementById("buscarServicio").value.toLowerCase();
    const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    const listaServicios = document.getElementById("listaServicios");
    listaServicios.innerHTML = ""; // Limpiar la lista

    // Filtrar los servicios que incluyan el término buscado
    const serviciosFiltrados = servicios.filter(servicio => 
        servicio.nombre.toLowerCase().includes(terminoBusqueda)
    );

    if (serviciosFiltrados.length > 0) {
        // Si hay servicios que coinciden, los mostramos
        serviciosFiltrados.forEach(servicio => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("servicio-card");
            tarjeta.innerHTML = `
                <img src="${servicio.imagen}" alt="${servicio.nombre}">
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion}</p>
                <p><strong>Dirección:</strong> ${servicio.direccion}</p>  <!-- Mostrar dirección -->
            <p><strong>Horario:</strong> ${servicio.horario}</p>  <!-- Mostrar horario -->
            `;
            listaServicios.appendChild(tarjeta);
        });
    } else {
        // Si no hay coincidencias, mostramos un mensaje
        listaServicios.innerHTML = `<p class="mensaje-no-encontrado">No se encontraron servicios que coincidan con la búsqueda.</p>`;

    }
    const contadorServicios = document.getElementById("contadorServicios");
contadorServicios.innerHTML = `<p>Se encontraron ${serviciosFiltrados.length} servicio(s).</p>`;

}

const categoria = document.getElementById("categoriaFiltro").value;

function buscarServicio() {
    const terminoBusqueda = document.getElementById("buscarServicio").value.toLowerCase();
    const orden = document.getElementById("ordenarServicios").value;
    let servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    const listaServicios = document.getElementById("listaServicios");

    // Primero, filtrar servicios que coincidan con la búsqueda
    let serviciosFiltrados = servicios.filter(servicio => {
        const coincideBusqueda = servicio.nombre.toLowerCase().includes(terminoBusqueda) || 
                                  servicio.descripcion.toLowerCase().includes(terminoBusqueda);
    
        const coincideCategoria = (categoria === "todas") || (servicio.nombre === categoria);
    
        return coincideBusqueda && coincideCategoria;
    });
    
    

    // Luego, ordenar los servicios filtrados
    if (orden === "asc") {
        serviciosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === "desc") {
        serviciosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    // Mostrar los servicios filtrados y ordenados
    listaServicios.innerHTML = "";

    if (serviciosFiltrados.length > 0) {
        serviciosFiltrados.forEach(servicio => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("servicio-card");
            tarjeta.innerHTML = `
                <img src="${servicio.imagen}" alt="${servicio.nombre}">
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion}</p>
                <p><strong>Dirección:</strong> ${servicio.direccion}</p>  <!-- Mostrar dirección -->
            <p><strong>Horario:</strong> ${servicio.horario}</p>  <!-- Mostrar horario -->
            `;
            listaServicios.appendChild(tarjeta);
        });
    } else {
        listaServicios.innerHTML = `<p class="mensaje-no-encontrado">No se encontraron servicios que coincidan con la búsqueda.</p>`;
    }
}

// Función para limpiar la búsqueda y mostrar todos los servicios
function limpiarBusqueda() {
    document.getElementById("buscarServicio").value = "";
    document.getElementById("ordenarServicios").value = "default";
    cargarServiciosEnInicio(); // Volvemos a mostrar todos los servicios
}




