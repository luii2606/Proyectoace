// Variables globales para controlar la edición
let idEditando = null;           // Guarda el ID del trabajador que se está editando
let contrasenaAnterior = null;   // Guarda la contraseña anterior para no perderla si no se cambia

// Se ejecuta cuando el DOM ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const form = document.getElementById("form-trabajador");
  const tabla = document.getElementById("tabla-trabajadores").querySelector("tbody");
  const btnGuardar = document.getElementById("btn-guardar"); // botón para guardar o actualizar

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

    // Validaciones de campos individuales (algunas están comentadas, pero puedes activarlas)
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

    // Validar que nombre de usuario no sea solo números
    if (!/^[a-zA-Z]+$/.test(nombre_usuario)) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario inválido",
        text: "El nombre de usuario no puede ser solo números",
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

    // Validación especial para la contraseña:
    // Si está editando y no ingresa contraseña, se mantiene la anterior
    if (!contrasena && idEditando) {
      contrasena = contrasenaAnterior;
    } else {
      // Si ingresa contraseña, validar requisitos de complejidad
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

    // Validar que se haya seleccionado un rol válido
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

    // Construir objeto trabajador a enviar al backend
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
        // Si está editando, hacer PUT con el ID para actualizar
        response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/trabajadores/${idEditando}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trabajador),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Trabajador actualizado",
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: "#d63384"
          });
          idEditando = null;           // Limpiar modo edición
          contrasenaAnterior = null;   // Limpiar contraseña almacenada
          btnGuardar.textContent = "Registrar trabajador"; // Cambiar texto botón a registro
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
        // Si no está editando, crear nuevo trabajador con POST
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
          btnGuardar.textContent = "Registrar trabajador"; // Asegurar texto correcto
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

      // Limpiar formulario y recargar lista de trabajadores
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

  // Función para cargar la lista de trabajadores y mostrarla en la tabla
  async function cargarTrabajadores() {
    tabla.innerHTML = ""; // Limpiar contenido

    try {
      // Obtener lista de trabajadores con sus roles
      const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores-rol");
      const trabajadores = await response.json();

      // Por cada trabajador, crear fila en la tabla
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

        // Añadir fila a la tabla
        tabla.appendChild(fila);

        // Agregar evento para botón Editar
        fila.querySelector(".tabla__boton--editar").addEventListener("click", () => {
          editarTrabajador(t.id_usuario);
        });

        // Agregar evento para botón Eliminar
        fila.querySelector(".tabla__boton--eliminar").addEventListener("click", () => {
          eliminarTrabajador(t.id_usuario);
        });
      });
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    }
  }

  // Función para eliminar un trabajador con confirmación
  async function eliminarTrabajador(id) {
    // Mostrar alerta de confirmación
    const resultado = await Swal.fire({
      title: "¿Estás segura de eliminar este trabajador?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d63384"
    });

    // Si el usuario cancela, salir
    if (!resultado.isConfirmed) return;

    try {
      // Hacer petición DELETE al backend
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Mostrar éxito y recargar tabla
        Swal.fire({
          icon: "success",
          title: "Trabajador eliminado",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#d63384"
        });
        cargarTrabajadores();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar trabajador",
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

  // Función para cargar datos de un trabajador en el formulario para edición
  async function editarTrabajador(id) {
    try {
      // Obtener datos del trabajador desde backend
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`);
      const trabajador = await response.json();

      // Rellenar campos del formulario con datos recibidos
      document.getElementById("usuario-trabajador").value = trabajador.nombre_usuario;
      document.getElementById("correo-trabajador").value = trabajador.correo;
      document.getElementById("telefono-trabajador").value = trabajador.telefono;
      document.getElementById("contrasena-trabajador").value = ""; // No mostrar contraseña por seguridad
      contrasenaAnterior = trabajador.contrasena; // Guardar contraseña actual para mantenerla si no se cambia

      document.getElementById("rol-trabajador").value = trabajador.cod_tipo_rol;

      // Marcar que se está en modo edición
      idEditando = id;
      btnGuardar.textContent = "Guardar cambios"; // Cambiar texto botón

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

  // Función para cargar opciones de roles desde el backend y llenar el select
  async function cargarRoles() {
    const select = document.getElementById("rol-trabajador");
    select.innerHTML = '<option value="">Seleccione un rol</option>'; // opción por defecto

    try {
      // Obtener lista de roles
      const response = await fetch("http://localhost:8080/pruebaApi/api/roles");
      const roles = await response.json();

      // Agregar cada rol como opción en el select
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



