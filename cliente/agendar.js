document.addEventListener("DOMContentLoaded", async () => {
  const fechaInput = document.querySelector('#fecha');
  const horaSelect = document.querySelector('#hora');

  // --- BLOQUEAR FECHAS PASADAS ---
  if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // --- CARGAR NOMBRE E ID DEL ESTILISTA ---
  const nombreEstilista = obtenerParametro("nombre");
  if (nombreEstilista) {
    document.querySelector(".cuadro__titulo").textContent = `Agendar con ${nombreEstilista}`;
    document.getElementById("campo-estilista").value = nombreEstilista;
  }

  const idTrabajador = obtenerParametro("id");
  if (idTrabajador) {
    document.getElementById("id-trabajador").value = idTrabajador;

    try {
      const respUsuario = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idTrabajador}`);
      if (!respUsuario.ok) throw new Error("No se pudo cargar el trabajador");
      const usuario = await respUsuario.json();

      if (usuario.cod_tipo_rol) {
        const respServicios = await fetch(`http://localhost:8080/pruebaApi/api/servicios/rol/${usuario.cod_tipo_rol}`);
        if (!respServicios.ok) throw new Error("No se pudo cargar los servicios");
        const servicios = await respServicios.json();

        const selectServicios = document.getElementById("select-servicio");
        selectServicios.innerHTML = "<option value=''>Selecciona un servicio...</option>";
        servicios.forEach(servicio => {
          const option = document.createElement("option");
          option.value = servicio.cod_servi;
          option.textContent = servicio.nombre_servicio;
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

  // --- CARGA DE MODALIDADES ---
  try {
    const respuesta = await fetch("http://localhost:8080/pruebaApi/api/modalidades");
    if (!respuesta.ok) throw new Error("Error al cargar las modalidades");
    const modalidades = await respuesta.json();
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

  // --- CARGAR HORAS DISPONIBLES AL CAMBIAR FECHA ---
  fechaInput.addEventListener("change", async () => {
    const fecha = fechaInput.value;
    const idTrabajador = document.getElementById("id-trabajador").value;

    if (!fecha || !idTrabajador) return;

    try {
      const resp = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/ocupadas?fecha=${fecha}&id=${idTrabajador}`);
      if (!resp.ok) throw new Error("Error al consultar horas ocupadas");
      const ocupadas = await resp.json(); // ["2025-08-18T14:00:00", "2025-08-18 15:00:00"]
      console.log(ocupadas);

      // --- CAMBIO AQUÍ: Normalizamos a HH:mm ---
      const horasOcupadas = ocupadas.map(h => {
        if (!h) return null;
        const partes = h.includes("T") ? h.split("T") : h.split(" ");
        const hora = partes[1];
        // Si incluye segundos, los eliminamos
        return hora.length > 5 ? hora.substring(0,5) : hora; // HH:mm
      }).filter(Boolean);

      // Generamos horas de 08:00 a 18:00
      horaSelect.innerHTML = "<option value=''>Selecciona una hora...</option>";
      for (let h = 8; h <= 18; h++) {
        const hora = h.toString().padStart(2,"0") + ":00";
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;

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

  // --- ENVÍO DEL FORMULARIO ---
  const formAgendar = document.querySelector(".formulario");

  formAgendar.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const cod_servi = document.getElementById("select-servicio").value;
    const id_modali = document.getElementById("modalidad").value;
    const id_trabajador = document.getElementById("id-trabajador").value;
    const id_cliente = localStorage.getItem("usuario");

    if (!fecha || !hora || !cod_servi || !id_modali) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    const fecha_hora_servicio = `${fecha} ${hora}:00`;

    const Agenda = {
      fecha_hora_servicio: fecha_hora_servicio,
      id_modali: parseInt(id_modali),
      id_usuario_cliente: id_cliente ? parseInt(id_cliente) : null,
      id_usuario_trabajador: parseInt(id_trabajador || 0),
      cod_servi: parseInt(cod_servi),
    };

    try {
      const resp = await fetch("http://localhost:8080/pruebaApi/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Agenda)
      });

      if (!resp.ok) throw new Error(await resp.text());

      Swal.fire({
        icon: "success",
        title: "Cita agendada con éxito",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#d63384"
      });
      formAgendar.reset();

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

function obtenerParametro(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}
