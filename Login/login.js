document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombreUsuario = this.querySelector('input[name="nombre_usuario"]').value.trim();
  const contrasena = this.querySelector('input[name="contrasena"]').value.trim();

  // Validaciones antes de enviar
  if (!nombreUsuario || !contrasena) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor ingresa tu usuario y contraseña",
      confirmButtonColor: "#d63384"
    });
    return;
  }

  const usuario = {
    nombre_usuario: nombreUsuario,
    contrasena: contrasena
  };

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Usuario autenticado:", result);

      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        localStorage.setItem("usuario", result.id_usuario);

        // Redirección según tipo
        if (result.id_tipo_usuario === 1) {
          window.location.href = "/Administrador/trabajadores.html";
        } else if (result.id_tipo_usuario === 2) {
          window.location.href = "/cliente/agendar-estilista.html"; 
        } else if (result.id_tipo_usuario === 3) {
          window.location.href = "/Trabajador/clientes.html"; 
        } else {
          Swal.fire({
            icon: "error",
            title: "Tipo de usuario desconocido",
            text: "Contacta al administrador"
          });
        }
      });

    } else if (response.status === 401) {
      Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        text: "Nombre de usuario o contraseña inválidos",
        confirmButtonColor: "#d63384"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error en el inicio de sesión",
        text: "Ocurrió un error desconocido. Intenta nuevamente",
        confirmButtonColor: "#d63384"
      });
    }

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor",
      confirmButtonColor: "#d63384"
    });
  }

  // Pega esto en la consola mientras estás en Login/login.html
const rel = "../cliente/agendar-estilista.html";
const resolved = new URL(rel, window.location.href).href;
console.log("Resolved URL:", resolved);
fetch(resolved, { method: "HEAD" })
  .then(r => console.log("HEAD status:", r.status))
  .catch(err => console.error("Fetch HEAD error:", err));

});


