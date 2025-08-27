// Escucha el evento 'submit' del formulario con id 'registro-form'
document.getElementById("registro-form").addEventListener("submit", async function (e) {
  // Evita que el formulario realice su envío tradicional (recarga de página)
  e.preventDefault();

  // Obtiene los valores ingresados en los campos del formulario y elimina espacios en blanco
  const nombre_usuario = document.querySelector("input[name='nombre_usuario']").value.trim();
  const contrasena = document.querySelector("input[name='contrasena']").value.trim();
  const correo = document.querySelector("input[name='correo']").value.trim();
  const telefono = document.querySelector("input[name='telefono']").value.trim();
  // Se asigna id_tipo_usuario = 2 (cliente)
  const id_tipo_usuario = 2;

  // Validación mínima para asegurar que ningún campo esté vacío
  if (!nombre_usuario || !contrasena || !correo || !telefono) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor completa todos los campos"
    });
    return; // Detiene la ejecución si falta algún campo
  }

  // Valida que el nombre de usuario tenga al menos 5 caracteres
  if (nombre_usuario.length < 5) {
    Swal.fire({
      icon: "warning",
      title: "Nombre de usuario inválido",
      text: "El nombre de usuario debe tener al menos 5 caracteres"
    });
    return;
  }

  // Expresión regular básica para validar formato de correo electrónico
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(correo)) {
    Swal.fire({
      icon: "warning",
      title: "Correo inválido",
      text: "Por favor ingresa un correo electrónico válido"
    });
    return;
  }

  // Expresión regular para validar que el teléfono tenga exactamente 10 dígitos numéricos
  const telefonoRegex = /^\d{10}$/;
  if (!telefonoRegex.test(telefono)) {
    Swal.fire({
      icon: "warning",
      title: "Teléfono inválido",
      text: "El teléfono debe contener exactamente 10 dígitos numéricos"
    });
    return;
  }

  // Array para recopilar todos los errores de validación de la contraseña
  const erroresContrasena = [];

  // Validaciones específicas para la contraseña
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

  // Si hay algún error, muestra todos juntos en una alerta y detiene el envío
  if (erroresContrasena.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Contraseña inválida",
      html: erroresContrasena.join("<br>")
    });
    return;
  }

  // Si pasa todas las validaciones, crea un objeto con los datos del usuario
  const usuario = {
    nombre_usuario,
    contrasena,
    correo,
    telefono,
    id_tipo_usuario
  };

  try {
    // Envia los datos al backend para registrar el usuario usando POST con JSON
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario) // Convierte el objeto usuario a JSON
    });

    // Si la respuesta es exitosa (status 200-299)
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Usuario registrado correctamente",
        confirmButtonColor: "#d63384"
      }).then(() => {
        // Redirige a la página de login tras mostrar el mensaje de éxito
        window.location.href = "../Login/login.html";
      });
    } else if (response.status === 409) {
      // Usuario ya existe
      Swal.fire({
        icon: "error",
        title: "Nombre de usuario no disponible",
        text: "El nombre de usuario ya está en uso, por favor elige otro"
        
      });
    } else {
      // Si la respuesta no es exitosa, obtiene y muestra el error
      const error = await response.text();
      console.error("Error en el registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "No se pudo registrar el usuario"
      });
    }
  } catch (err) {
    // Captura errores de conexión o red
    console.error("Error de red:", err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor"
    });
  }
});





