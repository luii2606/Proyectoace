// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  // Obtiene referencias a los elementos del DOM que usaremos
  const fechaInput = document.getElementById("fecha-busqueda");   // Input de tipo fecha
  const btnBuscar = document.getElementById("btn-buscar");        // Botón para buscar facturas
  const tablaBody = document.getElementById("tabla-facturas-body"); // Cuerpo de la tabla donde se mostrarán las facturas

  // ✅ Función para formatear la hora a formato de 12 horas (AM/PM)
  function formatearHora(fechaStr) {
    if (!fechaStr) return "N/D"; // Si no hay fecha, devuelve "No disponible"
    
    // Convierte el string de fecha en objeto Date (agregando "T" para compatibilidad ISO)
    const fecha = new Date(fechaStr.replace(" ", "T")); 
    
    // Retorna la hora formateada en español con AM/PM
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  // Evento al hacer clic en el botón "Buscar"
  btnBuscar.addEventListener("click", async () => {
    const fecha = fechaInput.value; // Obtiene la fecha seleccionada en el input
    
    // Si no se seleccionó ninguna fecha, muestra un error con SweetAlert2
    if (!fecha) {
      Swal.fire("Error", "Selecciona una fecha", "error");
      return;
    }

    // Limpia el contenido previo de la tabla
    tablaBody.innerHTML = "";

    try {
      // Hace una petición GET a la API para obtener las facturas del día seleccionado
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/porDia?fecha=${fecha}`);
      
      // Si la respuesta no fue exitosa, lanza un error
      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
      }

      // Convierte la respuesta en JSON (lista de facturas)
      const facturas = await resp.json();

      // Si no hay facturas para ese día, muestra un mensaje en la tabla
      if (facturas.length === 0) {
        tablaBody.innerHTML = "<tr><td colspan='5'>No hay facturas para este día</td></tr>";
      } else {
        // Si hay facturas, las recorre y genera filas en la tabla
        facturas.forEach(f => {
          const tr = document.createElement("tr"); // Crea una fila de tabla
          tr.innerHTML = `
            <td>${f.id_factura}</td>
            <td>${formatearHora(f.fecha_hora_servicio)}</td> <!-- Muestra hora formateada -->
            <td>$${f.total.toFixed(2)}</td>
            <td>${f.nombre_cliente}</td>
            <td>${f.nombre_trabajador}</td>
            <td>${f.nombre_servicio}</td>
          `;
          tablaBody.appendChild(tr); // Agrega la fila a la tabla
        });
      }
    } catch (err) {
      // En caso de error, muestra alerta con SweetAlert2
      Swal.fire("Error", `No se pudieron cargar las facturas: ${err.message}`, "error");
    }
  });
});



