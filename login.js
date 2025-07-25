document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {
    nombre_usuario: this.querySelector('input[name="nombre_usuario"]').value,
    contrasena: this.querySelector('input[name="contrasena"]').value
  };

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (response.ok) {
      // El login fue exitoso, parseamos el usuario que viene en el body
      const result = await response.json();
      console.log("Usuario autenticado:", result);
      alert("Inicio de sesión exitoso");
      window.location.href = "Administrador/inicio-administrador.html";
    } else if (response.status === 401) {
      alert("Nombre de usuario o contraseña incorrectos");
    } else {
      alert("Error desconocido al iniciar sesión");
    }

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    alert("Ocurrió un error de red o del servidor al intentar iniciar sesión");
  }
});
