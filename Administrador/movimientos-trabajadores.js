document.addEventListener("DOMContentLoaded", async () => {
  const fechaAdmin = document.getElementById("fecha-admin");
  const trabajadorAdmin = document.getElementById("trabajador-admin");
  const tablaBody = document.getElementById("tabla-citas-body");

  // --- Cargar trabajadores en el select ---
  try {
    const resp = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores");
    const trabajadores = await resp.json();

    trabajadores.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id_usuario;  
      opt.textContent = t.nombre_usuario;
      trabajadorAdmin.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando trabajadores:", err);
  }

  // --- Consultar citas ---
  document.getElementById("btn-ver-citas").addEventListener("click", async () => {
    const fecha = fechaAdmin.value;
    const idTrabajador = trabajadorAdmin.value;

    if (!fecha || !idTrabajador) {
      if (typeof Swal !== "undefined") {
        Swal.fire({icon:"warning", title:"Campos incompletos", text:"Selecciona trabajador y fecha"});
      } else {
        alert("Selecciona trabajador y fecha");
      }
      return;
    }

    try {
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/trabajador/${idTrabajador}/fecha/${fecha}`);

      if (!resp.ok) {
        throw new Error("Error HTTP: " + resp.status);
      }

      const citas = await resp.json();

      tablaBody.innerHTML = "";
      if (citas.length === 0) {
        tablaBody.innerHTML = "<tr><td colspan='3'>No hay citas</td></tr>";
      } else {
        citas.forEach(c => {
          console.log("Cita recibida:", c); // 👈 debug

          // ✅ Extraer hora desde "fecha_hora" (ej: "2025-08-18 03:00:00")
          let hora = "N/D";
          if (c.fecha_hora) {
            const fechaObj = new Date(c.fecha_hora.replace(" ", "T")); 
            hora = fechaObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
          }

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${hora}</td>
            <td>${c.cliente || "Sin nombre"}</td>
            <td>${c.servicio || "Sin servicio"}</td>
          `;
          tablaBody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error("Error cargando citas:", err);
      if (typeof Swal !== "undefined") {
        Swal.fire({icon:"error", title:"Error", text:"No se pudieron cargar las citas"});
      } else {
        alert("No se pudieron cargar las citas");
      }
    }
  });
});


