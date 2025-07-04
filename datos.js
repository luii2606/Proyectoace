document.getElementById("registro-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {
    nombre_usuario: this.nombre_usuario.value,
    contrasena: this.contrasena.value,
    correo: this.correo.value,
    telefono: this.telefono.value,
    id_tipo_usuario: parseInt(this.id_tipo_usuario.value)
  };

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (result.success) {
      alert("Usuario registrado con éxito");
      window.location.href = "login.html";
    } else {
      alert("No se pudo registrar");
    }
  } catch (err) {
    console.error("Error al enviar:", err);
  }
});
