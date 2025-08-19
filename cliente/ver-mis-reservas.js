// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async () => {
  // Obtiene el ID del cliente almacenado en localStorage
  const idCliente = localStorage.getItem("usuario");
  // Si no hay ID, muestra un error y termina la ejecución
  if (!idCliente) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del cliente"
    });
    return;
  }

  // Función para cambiar el estado de una orden mediante un PUT al backend
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
    // Obtiene las reservas del cliente mediante un fetch al backend
    const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/cliente/${idCliente}`);
    const reservas = await resp.json();

    // Selecciona el contenedor donde se mostrarán las reservas y limpia su contenido
    const contenedor = document.getElementById("lista-citas");
    contenedor.innerHTML = "";

    // Itera sobre cada reserva recibida para construir su UI
    reservas.forEach((reserva) => {
      // Extraemos fecha y hora del campo fecha_hora_servicio
      const fechaHora = reserva.fecha_hora_servicio;
      let fechaFormateada = "";
      let horaFormateada = "";
if (fechaHora) {
  if (typeof fechaHora === 'string') {
    // Caso string ISO
    const fechaStr = fechaHora.replace('T', ' ').substring(0, 16); // "2025-08-12 11:24"
    fechaFormateada = fechaStr.substring(8, 10) + '/' + fechaStr.substring(5, 7) + '/' + fechaStr.substring(0, 4);
    horaFormateada = fechaStr.substring(11, 16);
  } else if (fechaHora instanceof Date) {
    // Caso objeto Date
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0'); // Mes inicia en 0
    const anio = fechaHora.getFullYear();
    const hora = String(fechaHora.getHours()).padStart(2, '0');
    const minuto = String(fechaHora.getMinutes()).padStart(2, '0');

    fechaFormateada = `${dia}/${mes}/${anio}`;
    horaFormateada = `${hora}:${minuto}`;
  } else if (typeof fechaHora === "number") {
    // Si es timestamp en milisegundos
    const fechaDate = new Date(fechaHora);
    const dia = String(fechaDate.getDate()).padStart(2, '0');
    const mes = String(fechaDate.getMonth() + 1).padStart(2, '0');
    const anio = fechaDate.getFullYear();
    const hora = String(fechaDate.getHours()).padStart(2, '0');
    const minuto = String(fechaDate.getMinutes()).padStart(2, '0');

    fechaFormateada = `${dia}/${mes}/${anio}`;
    horaFormateada = `${hora}:${minuto}`;
  } else {
    // Otro tipo -> conviertes a string directo
    const fechaStr = String(fechaHora);
    fechaFormateada = fechaStr;
    horaFormateada = "";
  }
}



      // Crea la tarjeta o card para la reserva
      const card = document.createElement("div");
      card.classList.add("cita-card");

      // Inserta la estructura HTML con los datos de la reserva
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

      // Agrega la card al contenedor principal
      contenedor.appendChild(card);

      // Obtiene los botones y el span de estado para manipularlos
      const btnPagar = card.querySelector(".btn-pagar");
      const btnCancelar = card.querySelector(".btn-cancelar");
      const estadoSpan = card.querySelector(".estado-orden");

      // Función para crear un botón de eliminar reserva
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

          // Aquí se puede llamar endpoint para eliminar o solo eliminar visualmente
          card.remove();
          Swal.fire({
            icon: "success",
            title: "Reserva eliminada"
          });
        });
      }

      // Obtiene el texto del estado en minúsculas para la lógica de visualización
      const estadoText = (estadoSpan.textContent || "").toLowerCase();

      // Ajusta botones según estado de la reserva
      if (estadoText === "cancelado" || estadoText === "completado") {
        btnPagar.style.display = "none";
        btnCancelar.style.display = "none";
        crearBotonEliminar();
      } else if (estadoText === "confirmado") {
        btnPagar.style.display = "none";
        btnCancelar.style.display = "none";
        // No mostrar botón eliminar en estado confirmado
      } else {
        btnPagar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
      }

      // Evento para manejar pago y generación de factura
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

        // Datos para enviar al backend para crear la factura
        const facturaData = {
           id_orden: reserva.id_orden ,
          id_usuario_cliente: reserva.id_usuario_cliente,
          cod_servi: reserva.cod_servi,
          fecha_emision: new Date().toISOString().split("T")[0]
        };

        try {
          // Petición POST para generar factura
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

            // Cambia el estado de la reserva a confirmado si la factura fue creada con éxito
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

      // Evento para cancelar la reserva
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

        // Cambia el estado a cancelado si el usuario confirma
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
    // Manejo de errores al cargar reservas
    Swal.fire({
      icon: "error",
      title: "Error cargando reservas",
      text: "No se pudieron cargar las reservas"
    });
    console.error("Error cargando reservas:", error);
  }
});
