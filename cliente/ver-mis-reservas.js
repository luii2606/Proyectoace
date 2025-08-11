document.addEventListener("DOMContentLoaded", async () => {
  const idCliente = localStorage.getItem("usuario");
  if (!idCliente) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del cliente"
    });
    return;
  }

  function formatearFecha(fechaRaw) {
    const fecha = new Date(fechaRaw);
    if (isNaN(fecha)) return fechaRaw;
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
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
        Swal.fire({
          icon: "error",
          title: "Error al actualizar estado",
          text: error.message || "Error desconocido"
        });
        return false;
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor"
      });
      return false;
    }
  }

  try {
    const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/cliente/${idCliente}`);
    const reservas = await resp.json();

    const contenedor = document.getElementById("lista-citas");
    contenedor.innerHTML = "";

    reservas.forEach((reserva) => {
      let horaFormateada = reserva.hora_servicio;
      if (horaFormateada) {
        horaFormateada = horaFormateada.substring(0, 5);
      }
      const fechaFormateada = formatearFecha(reserva.fecha_servicio);

      const card = document.createElement("div");
      card.classList.add("cita-card");

      card.innerHTML = `
        <img src="../recursos/usuarios.jpg" class="cita-img" alt="Cliente">
        <div class="cita-info">
          <h3>${reserva.nombre_cliente || "Cliente"}</h3>
          <p>${reserva.servicio || "Servicio"}</p>
          <p>${fechaFormateada} ${horaFormateada}</p>
          <p>Trabajador: ${reserva.nombre_trabajador || "N/A"}</p>
          <p>Estado: <span class="estado-orden">${reserva.estado || "pendiente"}</span></p>
          <button class="btn-pagar">Pagar</button>
          <button class="btn-cancelar">Cancelar</button>
        </div>
      `;

      contenedor.appendChild(card);

      const btnPagar = card.querySelector(".btn-pagar");
      const btnCancelar = card.querySelector(".btn-cancelar");
      const estadoSpan = card.querySelector(".estado-orden");

      function crearBotonEliminar() {
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn-eliminar");
        btnCancelar.insertAdjacentElement("afterend", btnEliminar);

        btnEliminar.addEventListener("click", async () => {
          const confirmado = await Swal.fire({
            icon: "warning",
            title: "Eliminar reserva",
            text: "¿Seguro que quieres eliminar esta reserva?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
          });

          if (!confirmado.isConfirmed) return;

          // Aquí puedes llamar endpoint de eliminar si tienes o solo remover visualmente
          card.remove();
          Swal.fire({
            icon: "success",
            title: "Reserva eliminada"
          });
        });
      }

      const estadoText = (estadoSpan.textContent || "").toLowerCase();

      if (estadoText === "cancelado" || estadoText === "completado") {
        btnPagar.style.display = "none";
        btnCancelar.style.display = "none";
        crearBotonEliminar();
      } else if (estadoText === "confirmado") {
        btnPagar.style.display = "none";
        btnCancelar.style.display = "none";
        // No botón eliminar en confirmado
      } else {
        btnPagar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
      }

      btnPagar.addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
          icon: "question",
          title: "Confirmar pago",
          text: "¿Deseas realizar el pago y generar la factura?",
          showCancelButton: true,
          confirmButtonText: "Sí, pagar",
          cancelButtonText: "Cancelar"
        });

        if (!confirmacion.isConfirmed) return;

        const facturaData = {
          id_usuario_cliente: reserva.id_usuario_cliente,
          cod_servi: reserva.cod_servi,
          fecha_emision: new Date().toISOString().split("T")[0]
        };

        try {
          const respFactura = await fetch("http://localhost:8080/pruebaApi/api/ordenes/factura", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facturaData)
          });

          if (respFactura.ok) {
            Swal.fire({
              icon: "success",
              title: "Pago realizado",
              text: "Factura registrada correctamente"
            });

            const exito = await cambiarEstado(reserva.id_orden, "confirmado");
            if (exito) {
              estadoSpan.textContent = "confirmado";
              btnPagar.style.display = "none";
              btnCancelar.style.display = "none";
            }
          } else {
            const error = await respFactura.json();
            Swal.fire({
              icon: "error",
              title: "Error al generar factura",
              text: error.message || "desconocido"
            });
          }
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo generar la factura"
          });
        }
      });

      btnCancelar.addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
          icon: "warning",
          title: "Cancelar reserva",
          text: "¿Estás seguro de que quieres cancelar esta reserva?",
          showCancelButton: true,
          confirmButtonText: "Sí, cancelar",
          cancelButtonText: "Volver"
        });

        if (!confirmacion.isConfirmed) return;

        const exito = await cambiarEstado(reserva.id_orden, "cancelado");
        if (exito) {
          estadoSpan.textContent = "cancelado";
          btnPagar.style.display = "none";
          btnCancelar.style.display = "none";
          crearBotonEliminar();
          Swal.fire({
            icon: "success",
            title: "Reserva cancelada"
          });
        }
      });
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error cargando reservas",
      text: "No se pudieron cargar las reservas"
    });
    console.error("Error cargando reservas:", error);
  }
});





