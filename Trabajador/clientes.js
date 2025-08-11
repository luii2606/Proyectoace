// Esperar a que el DOM esté completamente cargado para ejecutar el código
document.addEventListener("DOMContentLoaded", async () => {
  // Obtener el ID del trabajador almacenado en localStorage tras login
  const idTrabajador = localStorage.getItem("usuario");
  
  // Si no se encuentra el ID, mostrar alerta y salir
  if (!idTrabajador) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del trabajador"
    });
    return;
  }

  // Función para formatear fechas en formato dd/mm/yyyy
  function formatearFecha(fechaRaw) {
    const fecha = new Date(fechaRaw);
    if (isNaN(fecha)) return fechaRaw; // Si la fecha es inválida, retorna el valor original
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes inicia en 0
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Función para cambiar el estado de una orden/cita en el backend
  async function cambiarEstado(idOrden, nuevoEstado) {
    try {
      // Enviar petición PUT para actualizar el estado
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/${idOrden}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (resp.ok) {
        return true; // Éxito
      } else {
        const error = await resp.json();
        // Mostrar error si falla la actualización
        await Swal.fire({
          icon: "error",
          title: "Error al actualizar estado",
          text: error.message || "Error desconocido"
        });
        return false;
      }
    } catch (e) {
      // Manejar errores de conexión
      await Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor"
      });
      return false;
    }
  }

  try {
    // Solicitar al backend todas las citas del trabajador usando su ID
    const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/trabajador/${idTrabajador}`);
    const citas = await resp.json();

    // Contenedor donde se mostrarán las citas
    const contenedor = document.getElementById("lista-citas");
    contenedor.innerHTML = ""; // Limpiar contenido previo

    // Iterar por cada cita para crear su card en el DOM
    citas.forEach(cita => {
      // Formatear hora a formato hh:mm, si existe
      let horaFormateada = cita.hora_servicio;
      if (horaFormateada) {
        horaFormateada = horaFormateada.substring(0, 5);
      }

      // Formatear fecha con función personalizada
      const fechaFormateada = formatearFecha(cita.fecha_servicio);

      // Crear div contenedor para la cita
      const card = document.createElement("div");
      card.classList.add("cita-cardt");

      // Insertar HTML con detalles de la cita y botones de acción
      card.innerHTML = `
        <img src="../recursos/usuarios.jpg" class="cita-img" alt="Cliente">
        <div class="cita-info">
          <h3>${cita.nombre_cliente || "Cliente"}</h3>
          <p>${cita.servicio || "Servicio"}</p>
          <p>${fechaFormateada} ${horaFormateada}</p>
          <span class="cita-tel">Tel. ${cita.telefono_cliente || "N/A"}</span>
          <p>Estado: <span class="estado-orden">${cita.estado || "pendiente"}</span></p>
          <button class="btn-completar">Completar</button>
          <button class="btn-cancelar">Cancelar</button>
        </div>
      `;

      // Agregar la card al contenedor principal
      contenedor.appendChild(card);

      // Obtener referencias a botones y texto estado dentro de la card
      const btnCompletar = card.querySelector(".btn-completar");
      const btnCancelar = card.querySelector(".btn-cancelar");
      const estadoSpan = card.querySelector(".estado-orden");

      // Función para agregar botón eliminar a la card
      function crearBotonEliminar() {
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn-eliminar");
        // Insertar botón eliminar justo después del botón cancelar
        btnCancelar.insertAdjacentElement("afterend", btnEliminar);

        // Evento para confirmar y eliminar la cita (marcar como cancelada)
        btnEliminar.addEventListener("click", async () => {
          const { isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro?",
            text: "¿Quieres eliminar esta cita?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
          });

          if (!isConfirmed) return; // Si cancela, salir

          const eliminado = await cambiarEstado(cita.id_orden, "cancelado");
          if (eliminado) {
            card.remove(); // Quitar card del DOM
            await Swal.fire({
              icon: "success",
              title: "Cita eliminada",
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }

      // Convertir estado a minúsculas para comparaciones
      const estadoText = (cita.estado || "").toLowerCase();

      // Ajustar botones y estado visual según estado actual de la cita
      if (estadoText === "confirmado") {
        estadoSpan.textContent = "Confirmada";
        estadoSpan.style.color = "green";

        btnCancelar.style.display = "none";      // Ocultar cancelar
        btnCompletar.style.display = "inline-block"; // Mostrar completar

      } else if (estadoText === "completado" || estadoText === "cancelado") {
        btnCompletar.style.display = "none";  // Ocultar botones completar y cancelar
        btnCancelar.style.display = "none";
        crearBotonEliminar();                  // Agregar botón eliminar

        // Mostrar estado con primera letra mayúscula
        estadoSpan.textContent = estadoText.charAt(0).toUpperCase() + estadoText.slice(1);
        estadoSpan.style.color = "gray";

      } else {
        // Para otros estados (ejemplo: pendiente), mostrar ambos botones
        btnCompletar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
      }

      // Evento click para botón completar
      btnCompletar.addEventListener("click", async () => {
        const { isConfirmed } = await Swal.fire({
          icon: "question",
          title: "Completar servicio",
          text: "¿Deseas marcar esta cita como completada?",
          showCancelButton: true,
          confirmButtonText: "Sí, completar",
          cancelButtonText: "Cancelar"
        });

        if (!isConfirmed) return;

        const exito = await cambiarEstado(cita.id_orden, "completado");
        if (exito) {
          // Actualizar estado visual y ocultar botones
          estadoSpan.textContent = "Completado";
          estadoSpan.style.color = "gray";

          btnCompletar.style.display = "none";
          btnCancelar.style.display = "none";

          crearBotonEliminar();

          await Swal.fire({
            icon: "success",
            title: "Cita completada",
            timer: 1500,
            showConfirmButton: false
          });
        }
      });

      // Evento click para botón cancelar
      btnCancelar.addEventListener("click", async () => {
        const { isConfirmed } = await Swal.fire({
          icon: "warning",
          title: "Cancelar cita",
          text: "¿Estás seguro que quieres cancelar esta cita?",
          showCancelButton: true,
          confirmButtonText: "Sí, cancelar",
          cancelButtonText: "No"
        });

        if (!isConfirmed) return;

        const exito = await cambiarEstado(cita.id_orden, "cancelado");
        if (exito) {
          // Actualizar estado visual y ocultar botones
          estadoSpan.textContent = "Cancelado";
          estadoSpan.style.color = "gray";

          btnCompletar.style.display = "none";
          btnCancelar.style.display = "none";

          crearBotonEliminar();

          await Swal.fire({
            icon: "success",
            title: "Cita cancelada",
            timer: 1500,
            showConfirmButton: false
          });
        }
      });

    });
  } catch (error) {
    // Mostrar error si falla la carga de citas
    await Swal.fire({
      icon: "error",
      title: "Error cargando citas",
      text: "No se pudieron cargar las citas"
    });
    console.error("Error cargando citas:", error);
  }
});



