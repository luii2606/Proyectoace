// Agrega un listener para el evento 'submit' del formulario con id 'login-form'
document.getElementById("login-form").addEventListener("submit", async function (e) {
  // Evita que el formulario se envíe y recargue la página por defecto
  e.preventDefault();

  // Obtiene el valor ingresado en el input 'nombre_usuario' y elimina espacios extras
  const nombreUsuario = this.querySelector('input[name="nombre_usuario"]').value.trim();
  // Obtiene el valor ingresado en el input 'contrasena' y elimina espacios extras
  const contrasena = this.querySelector('input[name="contrasena"]').value.trim();

  // Validaciones para verificar que ambos campos tengan datos antes de enviar
  if (!nombreUsuario || !contrasena) {
    // Muestra alerta de advertencia si faltan campos
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor ingresa tu usuario y contraseña",
      confirmButtonColor: "#d63384"
    });
    return; // Detiene la ejecución si hay campos vacíos
  }

  // Crea un objeto con los datos de usuario para enviar al backend
  const usuario = {
    nombre_usuario: nombreUsuario,
    contrasena: contrasena
  };

  try {
    // Realiza una petición POST al endpoint de login del backend con los datos JSON
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario) // Convierte el objeto a JSON
    });

    // Si la respuesta es exitosa (código 200-299)
    if (response.ok) {
      // Convierte la respuesta a JSON
      const result = await response.json();
      console.log("Usuario autenticado:", result);

      // Muestra alerta de éxito y oculta el botón de confirmación automáticamente
      Swal.fire({
        icon: "success",
        title: `Bienvenido ${nombreUsuario}`,
        text: "Inicio de sesión exitoso",
        confirmButtonColor: "#d63384",
       
      }).then(() => {
        // Guarda el id del usuario autenticado en el localStorage para usarlo en otras páginas
        localStorage.setItem("usuario", result.id_usuario);

        // Redirige según el tipo de usuario recibido
        if (result.id_tipo_usuario === 1) {
          window.location.href = "/Administrador/trabajadores.html";
        } else if (result.id_tipo_usuario === 2) {
          window.location.href = "/cliente/agendar-estilista.html";
        } else if (result.id_tipo_usuario === 3) {
          window.location.href = "/Trabajador/clientes.html";
        } else {
          // En caso de recibir un tipo de usuario no esperado, muestra un error
          Swal.fire({
            icon: "error",
            title: "Tipo de usuario desconocido",
            text: "Contacta al administrador"
          });
        }
      });

    } else if (response.status === 401) {
      // Si el backend responde con código 401, significa credenciales inválidas
      Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        text: "Nombre de usuario o contraseña inválidos",
        confirmButtonColor: "#d63384"
      });
    } else {
      // Para otros errores, muestra alerta genérica de fallo en el login
      Swal.fire({
        icon: "error",
        title: "Error en el inicio de sesión",
        text: "Ocurrió un error desconocido. Intenta nuevamente",
        confirmButtonColor: "#d63384"
      });
    }

  } catch (err) {
    // Captura errores de conexión o de red
    console.error("Error al iniciar sesión:", err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor",
      confirmButtonColor: "#d63384"
    });
  }

  // Código para probar en consola la resolución de URL y el estado HEAD de la página de cliente
  const rel = "../cliente/agendar-estilista.html";
  const resolved = new URL(rel, window.location.href).href;
  console.log("Resolved URL:", resolved);
  fetch(resolved, { method: "HEAD" })
    .then(r => console.log("HEAD status:", r.status))
    .catch(err => console.error("Fetch HEAD error:", err));
});



