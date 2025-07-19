document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {
    nombre_usuario: this.querySelector("input[placeholder='Nombre de usuario']").value,
    contrasena: this.querySelector("input[placeholder='Contraseña']").value
  };
  

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (result.success) {
      alert("Inicio de sesión exitoso");
      window.location.href = "inicio.html"; // Redirige al panel principal
    } else {
      alert("Nombre de usuario o contraseña incorrectos");
    }
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    alert("Ocurrió un error al intentar iniciar sesión");
  }
});
