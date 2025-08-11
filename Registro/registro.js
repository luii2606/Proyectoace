document.getElementById("registro-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre_usuario = document.querySelector("input[name='nombre_usuario']").value.trim();
  const contrasena = document.querySelector("input[name='contrasena']").value.trim();
  const correo = document.querySelector("input[name='correo']").value.trim();
  const telefono = document.querySelector("input[name='telefono']").value.trim();
  const id_tipo_usuario = 2;

  // Validación mínima de campos vacíos
  if (!nombre_usuario || !contrasena || !correo || !telefono) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor completa todos los campos"
    });
    return;
  }

  // Validar nombre de usuario (al menos 2 caracteres)
  if (nombre_usuario.length < 5) {
    Swal.fire({
      icon: "warning",
      title: "Nombre de usuario inválido",
      text: "El nombre de usuario debe tener al menos 5 caracteres"
    });
    return;
  }

  // Validar formato básico de correo
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(correo)) {
    Swal.fire({
      icon: "warning",
      title: "Correo inválido",
      text: "Por favor ingresa un correo electrónico válido"
    });
    return;
  }

  // Validar teléfono: exactamente 10 dígitos numéricos
  const telefonoRegex = /^\d{10}$/;
  if (!telefonoRegex.test(telefono)) {
    Swal.fire({
      icon: "warning",
      title: "Teléfono inválido",
      text: "El teléfono debe contener exactamente 10 dígitos numéricos"
    });
    return;
  }

  // Validar contraseña con expresión completa y mostrar TODOS los errores juntos
  const erroresContrasena = [];

  if (contrasena.length < 8) {
    erroresContrasena.push("Debe tener al menos 8 caracteres.");
  }
  if (!/[a-z]/.test(contrasena)) {
    erroresContrasena.push("Debe contener al menos una minúscula.");
  }
  if (!/[A-Z]/.test(contrasena)) {
    erroresContrasena.push("Debe contener al menos una mayúscula.");
  }
  if (!/\d/.test(contrasena)) {
    erroresContrasena.push("Debe contener al menos un número.");
  }
  if (!/\W/.test(contrasena)) {
    erroresContrasena.push("Debe contener al menos un carácter especial.");
  }

  if (erroresContrasena.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Contraseña inválida",
      html: erroresContrasena.join("<br>")
    });
    return;
  }

  // Si pasa todas las validaciones, continúa con el registro
  const usuario = {
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
      body: JSON.stringify(usuario)
    });

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Usuario registrado correctamente",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = "../Login/login.html";
      });
    } else {
      const error = await response.text();
      console.error("Error en el registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "No se pudo registrar el usuario"
      });
    }
  } catch (err) {
    console.error("Error de red:", err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor"
    });
  }
});



