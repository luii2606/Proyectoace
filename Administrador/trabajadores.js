// Variables globales para controlar la edición
let idEditando = null;           // Guarda el ID del trabajador que se está editando
let contrasenaAnterior = null;   // Guarda la contraseña anterior para no perderla si no se cambia

// Se ejecuta cuando el DOM ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const form = document.getElementById("form-trabajador");
  const tabla = document.getElementById("tabla-trabajadores").querySelector("tbody");
  const btnGuardar = document.getElementById("btn-guardar"); // botón para guardar o actualizar
  const inputUsuario = document.getElementById("usuario-trabajador");

  // 🚫 Bloquear números y caracteres especiales en el campo de usuario
  inputUsuario.addEventListener("input", () => {
    // Solo letras y espacios permitidos
    inputUsuario.value = inputUsuario.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  });

  // Cargar lista inicial de trabajadores y roles para el select
  cargarTrabajadores();
  cargarRoles();

  // Evento al enviar el formulario para agregar o actualizar trabajador
  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // evitar recarga de página

    // Obtener valores de los inputs
    const nombre_usuario = document.getElementById("usuario-trabajador").value.trim();
    const correo = document.getElementById("correo-trabajador").value.trim();
    const telefono = document.getElementById("telefono-trabajador").value.trim();
    const cod_tipo_rol = document.getElementById("rol-trabajador").value;
    let contrasena = document.getElementById("contrasena-trabajador").value;

    // Validación nombre de usuario mínimo 5 caracteres
    if (nombre_usuario.length < 5) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario inválido",
        text: "El nombre de usuario debe tener al menos 5 caracteres",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Validar que nombre de usuario solo contenga letras y espacios
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre_usuario)) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario inválido",
        text: "El nombre de usuario solo puede contener letras",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Validar formato básico de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(correo)) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Por favor ingresa un correo electrónico válido",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Validar teléfono con exactamente 10 dígitos numéricos
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
      Swal.fire({
        icon: "warning",
        title: "Teléfono inválido",
        text: "El teléfono debe contener exactamente 10 dígitos numéricos",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Validación de contraseña
    if (!contrasena && idEditando) {
      contrasena = contrasenaAnterior;
    } else {
      const erroresContrasena = [];
      if (contrasena.length < 8) erroresContrasena.push("Debe tener al menos 8 caracteres.");
      if (!/[a-z]/.test(contrasena)) erroresContrasena.push("Debe contener al menos una minúscula.");
      if (!/[A-Z]/.test(contrasena)) erroresContrasena.push("Debe contener al menos una mayúscula.");
      if (!/\d/.test(contrasena)) erroresContrasena.push("Debe contener al menos un número.");
      if (!/\W/.test(contrasena)) erroresContrasena.push("Debe contener al menos un carácter especial.");

      if (erroresContrasena.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Contraseña inválida",
          html: erroresContrasena.join("<br>"),
          confirmButtonColor: "#d63384"
        });
        return;
      }
    }

    // Validar rol
    const rol = document.getElementById("rol-trabajador").value;
    if (!rol || rol === "0" || rol === "") {
      Swal.fire({
        icon: "warning",
        title: "Rol obligatorio",
        text: "Debes seleccionar un rol para el trabajador",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Construir objeto trabajador
    const trabajador = {
      nombre_usuario,
      contrasena,
      correo,
      telefono,
      id_tipo_usuario: 3,             // 3 indica tipo trabajador en tu sistema
      cod_tipo_rol: parseInt(cod_tipo_rol)
    };

    try {
      let response;

      if (idEditando) {
        // PUT para actualizar
        response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/trabajadores/${idEditando}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trabajador),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Trabajador actualizado",
            confirmButtonColor: "#d63384"
          });
          idEditando = null;
          contrasenaAnterior = null;
          btnGuardar.textContent = "Registrar trabajador";
        } else {
          const error = await response.json();
          Swal.fire({
            icon: "error",
            title: "Error al actualizar",
            text: error.message || "Error desconocido",
            confirmButtonColor: "#d63384"
          });
        }
      } else {
        // POST para crear
        response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trabajador),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Trabajador registrado exitosamente",
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: "#d63384"
          });
          btnGuardar.textContent = "Registrar trabajador";
        } else {
          const error = await response.json();
          Swal.fire({
            icon: "error",
            title: "Error al registrar",
            text: error.message || "Error desconocido",
            confirmButtonColor: "#d63384"
          });
        }
      }

      // Reset y recargar
      form.reset();
      cargarTrabajadores();

    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la conexión con el servidor",
        text: "Intenta más tarde",
        confirmButtonColor: "#d63384"
      });
    }
  });

  // Función para cargar la lista de trabajadores
  async function cargarTrabajadores() {
    tabla.innerHTML = "";
    try {
      const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores-rol");
      const trabajadores = await response.json();

      trabajadores.forEach(t => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td class="admin__tabla-cuerpo">${t.id_usuario}</td>
          <td class="admin__tabla-cuerpo">${t.nombre_usuario}</td>
          <td class="admin__tabla-cuerpo">${t.correo}</td>
          <td class="admin__tabla-cuerpo">${t.telefono}</td>
          <td class="admin__tabla-cuerpo">${t.nombre_rol || "Sin rol"}</td>
          <td class="admin__tabla-cuerpo">
            <button class="tabla__boton tabla__boton--editar" data-id="${t.id_usuario}">Editar</button>
            <button class="tabla__boton tabla__boton--eliminar" data-id="${t.id_usuario}">Eliminar</button>
          </td>
        `;

        tabla.appendChild(fila);

        fila.querySelector(".tabla__boton--editar").addEventListener("click", () => {
          editarTrabajador(t.id_usuario);
        });
        fila.querySelector(".tabla__boton--eliminar").addEventListener("click", () => {
          eliminarTrabajador(t.id_usuario);
        });
      });
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    }
  }

  // Función para eliminar trabajador
  async function eliminarTrabajador(id) {
    const resultado = await Swal.fire({
      title: "¿Estás segura de eliminar este trabajador?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d63384"
    });

    if (!resultado.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Trabajador eliminado",
          confirmButtonColor: "#d63384"
        });
        cargarTrabajadores();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar trabajador",
          text: "tiene ordenes relacionadas",
          confirmButtonColor: "#d63384"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la conexión",
        confirmButtonColor: "#d63384"
      });
    }
  }

  // Función para editar trabajador
  async function editarTrabajador(id) {
    try {
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`);
      const trabajador = await response.json();

      document.getElementById("usuario-trabajador").value = trabajador.nombre_usuario;
      document.getElementById("correo-trabajador").value = trabajador.correo;
      document.getElementById("telefono-trabajador").value = trabajador.telefono;
      document.getElementById("contrasena-trabajador").value = "";
      contrasenaAnterior = trabajador.contrasena;

      document.getElementById("rol-trabajador").value = trabajador.cod_tipo_rol;

      idEditando = id;
      btnGuardar.textContent = "Guardar cambios";

      Swal.fire({
        icon: "info",
        title: "Edita los datos y presiona Guardar Cambios para actualizar.",
        confirmButtonColor: "#d63384"
      });
    } catch (error) {
      console.error("Error al editar:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos del trabajador",
        confirmButtonColor: "#d63384"
      });
    }
  }

  // Función para cargar roles
  async function cargarRoles() {
    const select = document.getElementById("rol-trabajador");
    select.innerHTML = '<option value="">Seleccione un rol</option>';

    try {
      const response = await fetch("http://localhost:8080/pruebaApi/api/roles");
      const roles = await response.json();

      roles.forEach(rol => {
        const option = document.createElement("option");
        option.value = rol.cod_tipo_rol;
        option.textContent = rol.nombre_rol;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar roles:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar roles",
        confirmButtonColor: "#d63384"
      });
    }
  }
});




