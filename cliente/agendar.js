// ✅ Espera a que el DOM esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", async () => {
  const fechaInput = document.querySelector('#fecha');   // Campo de fecha del formulario
  const horaSelect = document.querySelector('#hora');    // Select de horas disponibles

  // --- 📌 BLOQUEAR FECHAS PASADAS ---
  if (fechaInput) {
    const hoy = new Date(); // Obtenemos la fecha actual
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0"); // Mes con 2 dígitos
    const dd = String(hoy.getDate()).padStart(2, "0");      // Día con 2 dígitos
    fechaInput.min = `${yyyy}-${mm}-${dd}`; // Se bloquean fechas anteriores a hoy
  }

  // --- 📌 CARGAR NOMBRE E ID DEL ESTILISTA DESDE LA URL ---
  const nombreEstilista = obtenerParametro("nombre"); // Se extrae el nombre del estilista de la URL
  if (nombreEstilista) {
    document.querySelector(".cuadro__titulo").textContent = `Agendar con ${nombreEstilista}`;
    document.getElementById("campo-estilista").value = nombreEstilista; // Se asigna al campo oculto
  }

  const idTrabajador = obtenerParametro("id"); // ID del trabajador pasado por la URL
  if (idTrabajador) {
    document.getElementById("id-trabajador").value = idTrabajador;

    try {
      // 📌 Petición para obtener info del trabajador
      const respUsuario = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idTrabajador}`);
      if (!respUsuario.ok) throw new Error("No se pudo cargar el trabajador");
      const usuario = await respUsuario.json();

      // 📌 Con el rol del trabajador se consultan sus servicios
      if (usuario.cod_tipo_rol) {
        const respServicios = await fetch(`http://localhost:8080/pruebaApi/api/servicios/rol/${usuario.cod_tipo_rol}`);
        if (!respServicios.ok) throw new Error("No se pudo cargar los servicios");
        const servicios = await respServicios.json();

        // 📌 Llenar el <select> con los servicios
        const selectServicios = document.getElementById("select-servicio");
        selectServicios.innerHTML = "<option value=''>Selecciona un servicio...</option>";
        servicios.forEach(servicio => {
          const option = document.createElement("option");
          option.value = servicio.cod_servi;           // ID del servicio
          option.textContent = servicio.nombre_servicio; // Nombre del servicio
          selectServicios.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error al cargar servicios del trabajador:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los servicios del trabajador.",
        confirmButtonColor: "#d63384"
      });
    }
  }

  // --- 📌 CARGA DE MODALIDADES ---
  try {
    const respuesta = await fetch("http://localhost:8080/pruebaApi/api/modalidades");
    if (!respuesta.ok) throw new Error("Error al cargar las modalidades");
    const modalidades = await respuesta.json();

    // 📌 Llenamos el select de modalidades
    const select = document.getElementById("modalidad");
    select.innerHTML = '<option value="">Seleccione una modalidad</option>';
    modalidades.forEach(modalidad => {
      const option = document.createElement("option");
      option.value = modalidad.id_modali;
      option.textContent = modalidad.nombre_modali;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando modalidades:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las modalidades.",
      confirmButtonColor: "#d63384"
    });
  }

  // --- 📌 CARGAR HORAS DISPONIBLES CUANDO CAMBIA LA FECHA ---
  fechaInput.addEventListener("change", async () => {
    const fecha = fechaInput.value; // Fecha seleccionada
    const idTrabajador = document.getElementById("id-trabajador").value;

    if (!fecha || !idTrabajador) return;

    try {
      // 📌 Consultamos las horas ocupadas del trabajador en la fecha
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/ocupadas?fecha=${fecha}&id=${idTrabajador}`);
      if (!resp.ok) throw new Error("Error al consultar horas ocupadas");
      const ocupadas = await resp.json(); // Ejemplo: ["2025-08-18T14:00:00", "2025-08-18 15:00:00"]

      console.log(ocupadas);

      // 📌 Normalizamos horas ocupadas al formato HH:mm
      const horasOcupadas = ocupadas.map(h => {
        if (!h) return null;
        const partes = h.includes("T") ? h.split("T") : h.split(" "); // Puede venir con "T" o con espacio
        const hora = partes[1];
        return hora.length > 5 ? hora.substring(0,5) : hora; // Nos quedamos con HH:mm
      }).filter(Boolean);

      // 📌 Generamos horas disponibles de 08:00 a 18:00
      horaSelect.innerHTML = "<option value=''>Selecciona una hora...</option>";
      for (let h = 8; h <= 18; h++) {
        const hora = h.toString().padStart(2,"0") + ":00"; // Ej: "08:00"
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;

        // Si la hora está ocupada, la deshabilitamos
        if (horasOcupadas.includes(hora)) {
          option.disabled = true;
          option.textContent += " (Ocupada)";
          option.style.color = "gray";
        }

        horaSelect.appendChild(option);
      }
    } catch (err) {
      console.error("Error al consultar horas ocupadas:", err);
    }
  });

  // --- 📌 ENVÍO DEL FORMULARIO ---
  const formAgendar = document.querySelector(".formulario");

  formAgendar.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evitamos el envío normal

    // 📌 Obtenemos valores del formulario
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const cod_servi = document.getElementById("select-servicio").value;
    const id_modali = document.getElementById("modalidad").value;
    const id_trabajador = document.getElementById("id-trabajador").value;
    const id_cliente = localStorage.getItem("usuario"); // Cliente guardado en localStorage

    // 📌 Validamos campos
    if (!fecha || !hora || !cod_servi || !id_modali) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // 📌 Formamos la fecha con hora para la cita
    const fecha_hora_servicio = `${fecha} ${hora}:00`;

    // 📌 Creamos el objeto que enviamos al backend
    const Agenda = {
      fecha_hora_servicio: fecha_hora_servicio,
      id_modali: parseInt(id_modali),
      id_usuario_cliente: id_cliente ? parseInt(id_cliente) : null,
      id_usuario_trabajador: parseInt(id_trabajador || 0),
      cod_servi: parseInt(cod_servi),
    };

    try {
      // 📌 Enviamos la cita al backend
      const resp = await fetch("http://localhost:8080/pruebaApi/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Agenda)
      });

      if (!resp.ok) throw new Error(await resp.text());

      // 📌 Si todo salió bien, mostramos confirmación
      Swal.fire({
        icon: "success",
        title: "Cita agendada con éxito",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#d63384"
      });
      formAgendar.reset(); // Reiniciamos el formulario

    } catch (error) {
      console.error("Error al agendar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al agendar la cita.",
        confirmButtonColor: "#d63384"
      });
    }
  });
});

// 📌 Función auxiliar para obtener parámetros de la URL
function obtenerParametro(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

