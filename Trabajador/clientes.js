// 📌 Espera a que todo el HTML esté cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", async () => {
  
  // 🔹 Obtener el ID del trabajador guardado en localStorage
  const idTrabajador = localStorage.getItem("usuario");
  
  // 🔹 Si no existe el ID, muestra un error y detiene la ejecución
  if (!idTrabajador) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del trabajador"
    });
    return; // ⛔ Detener el código
  }

  // 📌 Función para formatear la fecha y hora en formato DD/MM/YYYY HH:mm
  function formatearFechaHora(fechaHora) {
    let fechaFormateada = "";
    let horaFormateada = "";

    if (fechaHora) {
      // Caso 1: Si viene como string tipo "2025-08-13T15:30"
      if (typeof fechaHora === 'string') {
        const fechaStr = fechaHora.replace('T', ' ').substring(0, 16);
        fechaFormateada = fechaStr.substring(8, 10) + '/' + fechaStr.substring(5, 7) + '/' + fechaStr.substring(0, 4);
        horaFormateada = fechaStr.substring(11, 16);
      }
      // Caso 2: Si es un objeto Date
      else if (fechaHora instanceof Date) {
        const dia = String(fechaHora.getDate()).padStart(2, '0');
        const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
        const anio = fechaHora.getFullYear();
        const hora = String(fechaHora.getHours()).padStart(2, '0');
        const minuto = String(fechaHora.getMinutes()).padStart(2, '0');
        fechaFormateada = `${dia}/${mes}/${anio}`;
        horaFormateada = `${hora}:${minuto}`;
      }
      // Caso 3: Si es un número (timestamp)
      else if (typeof fechaHora === "number") {
        const fechaDate = new Date(fechaHora);
        const dia = String(fechaDate.getDate()).padStart(2, '0');
        const mes = String(fechaDate.getMonth() + 1).padStart(2, '0');
        const anio = fechaDate.getFullYear();
        const hora = String(fechaDate.getHours()).padStart(2, '0');
        const minuto = String(fechaDate.getMinutes()).padStart(2, '0');
        fechaFormateada = `${dia}/${mes}/${anio}`;
        horaFormateada = `${hora}:${minuto}`;
      }
      // Caso 4: Cualquier otro tipo de valor
      else {
        const fechaStr = String(fechaHora);
        fechaFormateada = fechaStr;
        horaFormateada = "";
      }
    }

    return { fechaFormateada, horaFormateada };
  }

  // 📌 Función para cambiar el estado de una orden en la API
  async function cambiarEstado(idOrden, nuevoEstado) {
    try {
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/${idOrden}/estado`, {
        method: "PUT", // Usamos PUT porque estamos actualizando datos
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (resp.ok) return true; // ✅ Actualización exitosa

      // ❌ Si falla, mostramos error
      const error = await resp.json();
      await Swal.fire({ icon: "error", title: "Error al actualizar estado", text: error.message || "Error desconocido" });
      return false;

    } catch {
      // ❌ Error de conexión
      await Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor" });
      return false;
    }
  }

  // 📌 Bloque principal: Cargar citas del trabajador
  try {
    const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/trabajador/${idTrabajador}`);
    const citas = await resp.json();

    // 📌 Limpiamos el contenedor de citas
    const contenedor = document.getElementById("lista-citas");
    contenedor.innerHTML = "";

    // 📌 Recorremos todas las citas y las mostramos en tarjetas
    citas.forEach(cita => {

      // 📅 Unificar fecha y hora
      let fechaHora = cita.fecha_hora_servicio || `${cita.fecha_servicio}T${cita.hora_servicio || "00:00"}`;
      const { fechaFormateada, horaFormateada } = formatearFechaHora(fechaHora);

      // 📌 Crear la tarjeta
      const card = document.createElement("div");
      card.classList.add("cita-cardt");
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
      contenedor.appendChild(card);

      // 📌 Referencias a elementos
      const btnCompletar = card.querySelector(".btn-completar");
      const btnCancelar = card.querySelector(".btn-cancelar");
      const estadoSpan = card.querySelector(".estado-orden");

      // 📌 Función para crear botón "Eliminar"
      function crearBotonEliminar() {
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn-eliminar");
        btnCancelar.insertAdjacentElement("afterend", btnEliminar);

        btnEliminar.addEventListener("click", async () => {
          const { isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro?",
            text: "¿Quieres eliminar esta cita?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
          });

          if (!isConfirmed) return;

          const eliminado = await cambiarEstado(cita.id_orden, "cancelado");
          if (eliminado) {
            card.remove();
            await Swal.fire({ icon: "success", title: "Cita eliminada", timer: 1500, showConfirmButton: false });
          }
        });
      }

      // 📌 Ajustar botones y estado según la cita
      const estadoText = (cita.estado || "").toLowerCase();

      if (estadoText === "confirmado") {
        estadoSpan.textContent = "Confirmada";
        estadoSpan.style.color = "green";
        btnCancelar.style.display = "none";
        btnCompletar.style.display = "inline-block";
      } 
      else if (estadoText === "completado" || estadoText === "cancelado") {
        btnCompletar.style.display = "none";
        btnCancelar.style.display = "none";
        crearBotonEliminar();
        estadoSpan.textContent = estadoText.charAt(0).toUpperCase() + estadoText.slice(1);
        estadoSpan.style.color = "gray";
      } 
      else {
        btnCompletar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
      }

      // 📌 Evento: Completar cita
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
          estadoSpan.textContent = "Completado";
          estadoSpan.style.color = "gray";
          btnCompletar.style.display = "none";
          btnCancelar.style.display = "none";
          crearBotonEliminar();
          await Swal.fire({ icon: "success", title: "Cita completada", timer: 1500, showConfirmButton: false });
        }
      });

      // 📌 Evento: Cancelar cita
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
          estadoSpan.textContent = "Cancelado";
          estadoSpan.style.color = "gray";
          btnCompletar.style.display = "none";
          btnCancelar.style.display = "none";
          crearBotonEliminar();
          await Swal.fire({ icon: "success", title: "Cita cancelada", timer: 1500, showConfirmButton: false });
        }
      });

    });
  } catch (error) {
    // ❌ Error cargando citas desde el servidor
    await Swal.fire({ icon: "error", title: "Error cargando citas", text: "No se pudieron cargar las citas" });
    console.error("Error cargando citas:", error);
  }
});




