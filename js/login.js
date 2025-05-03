// Lista de usuarios y contraseñas
const usuarios = [
    { username: "josema", password: "13091988" },
    { username: "empleado2", password: "contraseña2" },
    { username: "empleado3", password: "contraseña3" },
    { username: "empleado4", password: "contraseña4" },
    { username: "empleado5", password: "contraseña5" }
  ];
  
  // Función para validar el login
  function validarLogin(username, password) {
    // Buscar el usuario en la lista
    const usuario = usuarios.find(user => user.username === username && user.password === password);
    return usuario !== undefined; // Si el usuario existe, devuelve true
  }
  
  // Manejo del formulario de login
  document.getElementById('formLogin').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (validarLogin(username, password)) {
      // Redirigir al panel de control si el login es exitoso
      window.location.href = "admin.html"; // Aquí pondrás la URL de tu panel de control
    } else {
      // Mostrar mensaje de error si el login es incorrecto
      document.getElementById('mensaje-error').textContent = "Usuario o contraseña incorrectos.";
    }
  });
  