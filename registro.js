document.getElementById("registro-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre_usuario = document.querySelector("input[name='nombre_usuario']").value;
  const contrasena = document.querySelector("input[name='contrasena']").value;
  const correo = document.querySelector("input[name='correo']").value;
  const telefono = document.querySelector("input[name='telefono']").value;
const id_tipo_usuario = 2;


  const datos = {
    nombre_usuario,
    contrasena,
    correo,
    telefono,
    id_tipo_usuario
  };

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (response.ok) {
      alert("Usuario registrado correctamente");
      window.location.href = "login.html";
    } else {
      const error = await response.text();
      console.error("Error en el registro:", error);
      alert("Error en el registro");
    }
  } catch (err) {
    console.error("Error de red:", err);
    alert("No se pudo conectar con el servidor");
  }
});

