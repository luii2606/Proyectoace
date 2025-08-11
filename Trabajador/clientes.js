document.addEventListener("DOMContentLoaded", async () => {
  const idTrabajador = localStorage.getItem("usuario"); // ID del trabajador logueado
  if (!idTrabajador) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del trabajador"
    });
    return;
  }

  function formatearFecha(fechaRaw) {
    const fecha = new Date(fechaRaw);
    if (isNaN(fecha)) return fechaRaw;
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  async function cambiarEstado(idOrden, nuevoEstado) {
    try {
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/${idOrden}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (resp.ok) {
        return true;
      } else {
        const error = await resp.json();
        await Swal.fire({
          icon: "error",
          title: "Error al actualizar estado",
          text: error.message || "Error desconocido"
        });
        return false;
      }
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor"
      });
      return false;
    }
  }

  try {
    const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/trabajador/${idTrabajador}`);
    const citas = await resp.json();

    const contenedor = document.getElementById("lista-citas");
    contenedor.innerHTML = "";

    citas.forEach(cita => {
      let horaFormateada = cita.hora_servicio;
      if (horaFormateada) {
        horaFormateada = horaFormateada.substring(0, 5);
      }

      const fechaFormateada = formatearFecha(cita.fecha_servicio);

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

      const btnCompletar = card.querySelector(".btn-completar");
      const btnCancelar = card.querySelector(".btn-cancelar");
      const estadoSpan = card.querySelector(".estado-orden");

      // Función para crear botón eliminar
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
            await Swal.fire({
              icon: "success",
              title: "Cita eliminada",
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }

      const estadoText = (cita.estado || "").toLowerCase();

      if (estadoText === "confirmado") {
        estadoSpan.textContent = "Confirmada";
        estadoSpan.style.color = "green";

        btnCancelar.style.display = "none";
        btnCompletar.style.display = "inline-block";

      } else if (estadoText === "completado" || estadoText === "cancelado") {
        btnCompletar.style.display = "none";
        btnCancelar.style.display = "none";
        crearBotonEliminar();

        estadoSpan.textContent = estadoText.charAt(0).toUpperCase() + estadoText.slice(1);
        estadoSpan.style.color = "gray";

      } else {
        btnCompletar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
      }

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

          await Swal.fire({
            icon: "success",
            title: "Cita completada",
            timer: 1500,
            showConfirmButton: false
          });
        }
      });

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
    await Swal.fire({
      icon: "error",
      title: "Error cargando citas",
      text: "No se pudieron cargar las citas"
    });
    console.error("Error cargando citas:", error);
  }
});


