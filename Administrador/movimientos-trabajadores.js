// ✅ Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", async () => {
  // Referencias a los elementos del DOM
  const fechaAdmin = document.getElementById("fecha-admin");             // Input de fecha
  const trabajadorAdmin = document.getElementById("trabajador-admin");   // Select de trabajadores
  const tablaBody = document.getElementById("tabla-citas-body");         // Cuerpo de la tabla donde se mostrarán citas

  // ---  Cargar trabajadores en el <select> ---
  try {
    // Petición al backend para obtener la lista de trabajadores
    const resp = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores");
    const trabajadores = await resp.json();

    // Recorremos los trabajadores y creamos un <option> por cada uno
    trabajadores.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id_usuario;           // El valor del option será el ID del trabajador
      opt.textContent = t.nombre_usuario; // El texto visible será el nombre
      trabajadorAdmin.appendChild(opt);   // Agregamos el option al <select>
    });
  } catch (err) {
    console.error("Error cargando trabajadores:", err);
  }

  // ---  Consultar citas cuando se haga clic en "Ver Citas" ---
  document.getElementById("btn-ver-citas").addEventListener("click", async () => {
    const fecha = fechaAdmin.value;             // Fecha seleccionada
    const idTrabajador = trabajadorAdmin.value; // Trabajador seleccionado

    // Validación: Si falta algún campo, mostramos advertencia
    if (!fecha || !idTrabajador) {
      if (typeof Swal !== "undefined") {
        Swal.fire({icon:"warning", title:"Campos incompletos", text:"Selecciona trabajador y fecha"});
      } else {
        alert("Selecciona trabajador y fecha");
      }
      return;
    }

    try {
      // Petición al backend para obtener las citas del trabajador en la fecha seleccionada
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/trabajador/${idTrabajador}/fecha/${fecha}`);

      // Si la respuesta no fue exitosa, lanzamos error
      if (!resp.ok) {
        throw new Error("Error HTTP: " + resp.status);
      }

      const citas = await resp.json(); // Convertimos la respuesta a JSON

      // Limpiamos la tabla antes de mostrar nuevas citas
      tablaBody.innerHTML = "";

      // Si no hay citas, mostramos un mensaje
      if (citas.length === 0) {
        tablaBody.innerHTML = "<tr><td colspan='4'>No hay citas</td></tr>";
      } else {
        // Recorremos las citas y las mostramos en la tabla
        citas.forEach(c => {
          let hora = "N/D"; // Valor por defecto si no hay fecha
          if (c.fecha_hora) {
            // Convertimos la fecha a objeto Date para formatear la hora
            const fechaObj = new Date(c.fecha_hora.replace(" ", "T")); 
            //  Mostramos la hora en formato 12 horas con AM/PM
            hora = fechaObj.toLocaleTimeString("es-ES", { 
              hour: "numeric",     // Hora sin cero delante (ej: 1, 2, 3)
              minute: "2-digit",   // Minutos con dos dígitos
              hour12: true         // 👈 convierte a formato 12h con AM/PM
            });
          }

          //  Normalizamos el estado de la cita a minúsculas para comparar
          const estadoText = (c.estado || "sin estado").toLowerCase();
          let estadoLabel = estadoText.charAt(0).toUpperCase() + estadoText.slice(1); // Capitalizamos
          let color = "black";

          //  Coloreamos según el estado
          if (estadoText === "confirmado") {
            color = "green";
            estadoLabel = "Confirmada";
          } else if (estadoText === "completado") {
            color = "skyblue";
            estadoLabel = "Completado";
          } else if (estadoText === "cancelado") {
            color = "red";
            estadoLabel = "Cancelado";
          } else {
            color = "orange"; // Para "pendiente" u otros estados
            estadoLabel = "Pendiente";
          }

          // Creamos la fila de la tabla con la información
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${hora}</td>
            <td>${c.cliente || "Sin nombre"}</td>
            <td>${c.servicio || "Sin servicio"}</td>
            <td style="color:${color}; font-weight:600;">${estadoLabel}</td>
          `;
          tablaBody.appendChild(tr); // Agregamos la fila a la tabla
        });
      }
    } catch (err) {
      // En caso de error en la petición mostramos alerta
      console.error("Error cargando citas:", err);
      if (typeof Swal !== "undefined") {
        Swal.fire({icon:"error", title:"Error", text:"No se pudieron cargar las citas"});
      } else {
        alert("No se pudieron cargar las citas");
      }
    }
  });
});


