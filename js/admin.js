// admin.js

// Mostrar el formulario de edición con los datos del servicio
function editarServicio(id) {
    const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    const servicio = servicios.find(servicio => servicio.id === id);

    if (servicio) {
        // Llenar el formulario de edición con los datos del servicio
        document.getElementById("editNombre").value = servicio.nombre;
        document.getElementById("editDescripcion").value = servicio.descripcion;
        document.getElementById("editCategoria").value = servicio.categoria;
        document.getElementById("editTelefono").value = servicio.telefono;
        document.getElementById("editEmail").value = servicio.email;
        document.getElementById("editImagen").value = servicio.imagen;
        document.getElementById("editDireccion").value = servicio.direccion; // Dirección
        document.getElementById("editHorario").value = servicio.horario; // Horario de atención
        document.getElementById("editWeb").value = servicio.web;
        document.getElementById("editFacebook").value = servicio.facebook;
        document.getElementById("editInstagram").value = servicio.instagram;
        document.getElementById("editGeolocalizacion").value = servicio.geolocalizacion;


       
        

        // Mostrar el modal de edición
        document.getElementById("modalEditar").style.display = "block";

        // Guardar el id del servicio que estamos editando
        document.getElementById("formEditarServicio").onsubmit = function(event) {
            event.preventDefault();
            const nombre = document.getElementById("editNombre").value;
            const descripcion = document.getElementById("editDescripcion").value;
            const categoria = document.getElementById("editCategoria").value;
            const telefono = document.getElementById("editTelefono").value;
            const email = document.getElementById("editEmail").value;
            const imagen = document.getElementById("editImagen").value;
            const direccion = document.getElementById("editDireccion").value;  // Obtener la dirección
            const horario = document.getElementById("editHorario").value;  // Obtener el horario
            const web = document.getElementById("editWeb").value;
            const facebook = document.getElementById("editFacebook").value;
            const instagram = document.getElementById("editInstagram").value;
            const geolocalizacion = document.getElementById("editGeolocalizacion").value;



            // Actualizar el servicio con los nuevos datos
            servicio.nombre = nombre;
            servicio.descripcion = descripcion;
            servicio.categoria = categoria;
            servicio.telefono = telefono;
            servicio.email = email;
            servicio.imagen = imagen;
            servicio.direccion = direccion;
            servicio.horario = horario;
            servicio.web = web;
            servicio.facebook = facebook;
            servicio.instagram = instagram;
            servicio.geolocalizacion = geolocalizacion;




            // Guardar los servicios actualizados en localStorage
            localStorage.setItem("servicios", JSON.stringify(servicios));

            alert("Servicio actualizado con éxito.");

            // Recargar los servicios
            cargarServicios();

            // Cerrar el modal
            cerrarModal();
        };
    }
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById("modalEditar").style.display = "none";
}

// Función para eliminar un servicio
function eliminarServicio(id) {
    let servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    servicios = servicios.filter(servicio => servicio.id !== id);
    localStorage.setItem("servicios", JSON.stringify(servicios));
    alert("Servicio eliminado.");
    cargarServicios();
}

// Función para cargar los servicios
function cargarServicios() {
    const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    const listaServicios = document.getElementById("listaServiciosAdmin");
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

    <!-- Comentarios -->
<div class="comentarios">
    <h4>Comentarios:</h4>
    <ul id="lista-comentarios-${servicio.id}">
        ${servicio.comentarios?.map(c => `<li>${c}</li>`).join('') || '<li>Sin comentarios.</li>'}
    </ul>
    <input type="text" id="comentario-input-${servicio.id}" placeholder="Escribe un comentario..." />
    <button onclick="agregarComentario(${servicio.id})">Enviar</button>
</div>




            <button onclick="editarServicio(${servicio.id})">Editar</button>
            <button onclick="eliminarServicio(${servicio.id})">Eliminar</button>
        `;
        listaServicios.appendChild(tarjeta);
    });
}



// Función para agregar un nuevo servicio
document.getElementById("formAgregarServicio").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;  // Horario de atención
    const telefono = document.getElementById("telefono").value;  // Horario de atención
    const email = document.getElementById("email").value;  // Horario de atención
    const imagen = document.getElementById("imagen").value;
    const direccion = document.getElementById("direccion").value;  // Dirección
    const horario = document.getElementById("horario").value;  // Horario de atención
    const web = document.getElementById("web").value;  // Horario de atención
    const facebook = document.getElementById("facebook").value;  // Horario de atención
    const instagram = document.getElementById("instagram").value;  // Horario de atención
    const geolocalizacion = document.getElementById("geolocalizacion").value;


    const nuevoServicio = {
        id: new Date().getTime(),
        nombre,
        descripcion,
        categoria,
        telefono,
        email,
        imagen,
        direccion,  // Incluir la dirección
        horario, // Incluir el horario
        web,
        facebook,
        instagram,
        geolocalizacion,
        calificaciones, // 👈 nuevo campo para almacenar calificaciones
        comentarios,// 👈 nuevo campo


        
    };

    let servicios = JSON.parse(localStorage.getItem("servicios")) || [];
    servicios.push(nuevoServicio);
    localStorage.setItem("servicios", JSON.stringify(servicios));

    alert(`Servicio '${nombre}' agregado exitosamente.`);

    // Limpiar el formulario
    document.getElementById("formAgregarServicio").reset();

    // Recargar los servicios
    cargarServicios();
});

// Cargar los servicios al cargar la página
cargarServicios();

// codigo para buscar un servicio

const inputBuscador = document.getElementById('buscador');

inputBuscador.addEventListener('input', () => {
  const textoBuscado = inputBuscador.value.toLowerCase();
  const tarjetas = document.querySelectorAll('.tarjeta-servicio');

  tarjetas.forEach(tarjeta => {
    const nombreServicio = tarjeta.querySelector('.nombre-servicio').textContent.toLowerCase();
    const categoriaServicio = tarjeta.querySelector('.categoria-servicio').textContent.toLowerCase();

    if (nombreServicio.includes(textoBuscado) || categoriaServicio.includes(textoBuscado)) {
      tarjeta.style.display = 'block';
    } else {
      tarjeta.style.display = 'none';
    }
  });
});

const geolocalizacion = document.getElementById("geolocalizacion").value;

function agregarComentario(id) {
  const input = document.getElementById(`comentario-input-${id}`);
  const texto = input.value.trim();
  if (!texto) return;

  const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
  const servicio = servicios.find(s => s.id === id);

  if (servicio) {
      servicio.comentarios = servicio.comentarios || [];
      servicio.comentarios.push(texto);
      localStorage.setItem("servicios", JSON.stringify(servicios));
      input.value = "";
      cargarServicios(); // Recargar la vista con el nuevo comentario
  }
}
function calificarServicio(id, calificacion) {
  const servicios = JSON.parse(localStorage.getItem("servicios")) || [];
  const servicio = servicios.find(s => s.id === id);

  if (servicio) {
      servicio.calificacion = calificacion;
      localStorage.setItem("servicios", JSON.stringify(servicios));
      cargarServicios(); // Recarga la vista
  }
}

document.getElementById('ordenar').addEventListener('change', (e) => {
    const criterio = e.target.value;
    servicios.sort((a, b) => a[criterio].localeCompare(b[criterio]));
    cargarServicios();
  });
  
  document.getElementById('filtro-categoria').addEventListener('change', (e) => {
    const categoria = e.target.value;
    const tarjetas = document.querySelectorAll('.tarjeta-servicio');
  
    tarjetas.forEach(tarjeta => {
      const categoriaServicio = tarjeta.querySelector('.categoria-servicio').textContent.toLowerCase();
      if (!categoria || categoriaServicio.includes(categoria.toLowerCase())) {
        tarjeta.style.display = 'block';
      } else {
        tarjeta.style.display = 'none';
      }
    });
  });
  