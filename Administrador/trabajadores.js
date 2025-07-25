let idEditando = null; // Almacena si estamos editando

  document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-trabajador");
  const tabla = document.getElementById("tabla-trabajadores").querySelector("tbody");

  // ✅ Cargar la tabla al iniciar
  cargarTrabajadores();

  form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const trabajador = {
    nombre_usuario: document.getElementById("usuario-trabajador").value,
    contrasena: document.getElementById("contrasena-trabajador").value,
    correo: document.getElementById("correo-trabajador").value,
    telefono: document.getElementById("telefono-trabajador").value,
    id_tipo_usuario: 3
  };

  try {
    let response;
    
    if (idEditando) {
      // Estamos editando → usar PUT
      response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trabajador),
      });

      if (response.ok) {
        alert("Trabajador actualizado");
      } else {
        alert("Error al actualizar");
      }

      idEditando = null; // Reinicia estado
    } else {
      // Nuevo registro → usar POST
      response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trabajador),
      });

      if (response.ok) {
        alert("Trabajador registrado exitosamente");
      } else {
        const error = await response.json();
        alert("Error al registrar: " + error.message);
      }
    }

    form.reset();
    cargarTrabajadores();
  } catch (error) {
    console.error("Error:", error);
    alert("Error en la conexión con el servidor");
  }
});


  // ✅ Función para cargar trabajadores en la tabla
  async function cargarTrabajadores() {
    tabla.innerHTML = ""; // limpia antes de cargar

    try {
      const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores");
      const trabajadores = await response.json();

      trabajadores
        .filter(t => t.id_tipo_usuario === 3) // solo trabajadores
        .forEach(t => {
          const fila = document.createElement("tr");

          fila.innerHTML = `
          <td class="admin__tabla-cuerpo">${t.id_usuario}</td>
          <td class="admin__tabla-cuerpo">${t.nombre_usuario}</td>
          <td class="admin__tabla-cuerpo">${t.correo}</td>
          <td class="admin__tabla-cuerpo">${t.telefono}</td>
          <td class="admin__tabla-cuerpo">
            <button class="tabla__boton tabla__boton--editar" data-id="${t.id_usuario}">Editar</button>
            <button class="tabla__boton tabla__boton--eliminar" data-id="${t.id_usuario}">Eliminar</button>
          </td>
        `;

          tabla.appendChild(fila);
          // Añadir eventos a los botones de esa fila
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

  // ✅ Eliminar trabajador
  window.eliminarTrabajador = async function (id) {
    if (!confirm("¿Estás segura de eliminar este trabajador?")) return;

    try {
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Trabajador eliminado");
        cargarTrabajadores();
      } else {
        alert("Error al eliminar trabajador");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  window.editarTrabajador = async function (id) {
  try {
    const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`);
    const trabajador = await response.json();

    document.getElementById("usuario-trabajador").value = trabajador.nombre_usuario;
    document.getElementById("correo-trabajador").value = trabajador.correo;
    document.getElementById("telefono-trabajador").value = trabajador.telefono;
    document.getElementById("contrasena-trabajador").value = trabajador.contrasena;

    idEditando = id; // Guardamos el ID para editar

    alert("Edita los datos y presiona Guardar para actualizar.");
  } catch (error) {
    console.error("Error al editar:", error);
  }
};

});
 