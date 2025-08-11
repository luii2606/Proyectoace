document.addEventListener("DOMContentLoaded", async () => {
  // --- BLOQUEAR DÍAS PASADOS EN EL INPUT DE FECHA ---
  const inputFecha = document.querySelector('input[type="date"]');
  if (inputFecha) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaMin = `${yyyy}-${mm}-${dd}`;
    inputFecha.min = fechaMin;  // Establece fecha mínima como hoy para evitar seleccionar días anteriores
  }

  // --- PERSONALIZAR TÍTULO Y CARGAR ID TRABAJADOR / SERVICIOS ---
  const nombreEstilista = obtenerParametro("nombre");  // Obtiene el nombre del estilista de la URL
  if (nombreEstilista) {
    const titulo = document.querySelector(".cuadro__titulo");  // Elemento título para modificar
    const campoEstilista = document.getElementById("campo-estilista");  // Campo oculto para enviar nombre
    if (titulo) titulo.textContent = `Agendar con ${nombreEstilista}`;  // Cambia el título del formulario
    if (campoEstilista) campoEstilista.value = nombreEstilista;  // Asigna el nombre al campo oculto
  }

  const idTrabajador = obtenerParametro("id");  // Obtiene el ID del trabajador de la URL
  if (idTrabajador) {
    const campoIdTrabajador = document.getElementById("id-trabajador");  // Campo oculto para enviar ID
    if (campoIdTrabajador) campoIdTrabajador.value = idTrabajador;  // Asigna el ID al campo oculto

    try {
      // Obtiene información del usuario por ID para saber su rol
      const respUsuario = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idTrabajador}`);
      if (!respUsuario.ok) throw new Error("No se pudo cargar el trabajador");
      const usuario = await respUsuario.json();
      const codTipoRol = usuario.cod_tipo_rol;

      if (codTipoRol) {
        // Trae los servicios que corresponden al rol del trabajador
        const respServicios = await fetch(`http://localhost:8080/pruebaApi/api/servicios/rol/${codTipoRol}`);
        if (!respServicios.ok) throw new Error("No se pudo cargar los servicios");
        const servicios = await respServicios.json();

        const selectServicios = document.getElementById("select-servicio");
        if (selectServicios) {
          selectServicios.innerHTML = "<option value=''>Selecciona un servicio...</option>";  // Opción por defecto
          servicios.forEach(servicio => {
            const option = document.createElement("option");
            option.value = servicio.cod_servi;
            option.textContent = servicio.nombre_servicio;
            selectServicios.appendChild(option);  // Agrega cada servicio al select
          });
        }
      } else {
        console.warn("El trabajador no tiene un rol asignado.");  // Aviso si el trabajador no tiene rol
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
  async function cargarModalidades() {
    try {
      const respuesta = await fetch("http://localhost:8080/pruebaApi/api/modalidades");
      if (!respuesta.ok) throw new Error("Error al cargar las modalidades");
      const modalidades = await respuesta.json();
      const select = document.getElementById("modalidad");
      if (select) {
        select.innerHTML = '<option value="">Seleccione una modalidad</option>';  // Opción por defecto
        modalidades.forEach(modalidad => {
          const option = document.createElement("option");
          option.value = modalidad.id_modali;
          option.textContent = modalidad.nombre_modali;
          select.appendChild(option);  // Agrega cada modalidad al select
        });
      }
    } catch (error) {
      console.error("Error cargando modalidades:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las modalidades.",
        confirmButtonColor: "#d63384"
      });
    }
  }
  cargarModalidades();  // Llama la función para cargar modalidades

  // --- ENVÍO DEL FORMULARIO ---
  const formAgendar = document.querySelector(".formulario");

  if (!formAgendar) {
    console.error("No se encontró el formulario con clase 'formulario'.");
    return;
  }

  formAgendar.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtiene valores del formulario
    const fechaInput = formAgendar.querySelector('input[type="date"]');
    const horaInput = formAgendar.querySelector('input[type="time"]');
    const selectServicios = document.getElementById("select-servicio");
    const selectModalidad = document.getElementById("modalidad");
    const idTrabajadorField = document.getElementById("id-trabajador");

    const fecha = fechaInput ? fechaInput.value : "";
    const horaRaw = horaInput ? horaInput.value : "";
    // Si la hora tiene formato "HH:mm", agrega ":00" para formato "HH:mm:ss"
    const hora = horaRaw && horaRaw.length === 5 ? horaRaw + ":00" : horaRaw;
    const cod_servi = selectServicios ? selectServicios.value : "";
    const id_modali = selectModalidad ? selectModalidad.value : "";
    const id_trabajador = idTrabajadorField ? idTrabajadorField.value : "";
    const id_cliente = localStorage.getItem("usuario");  // Cliente que agenda, guardado en localStorage

    // Validación básica para campos obligatorios
    if (!fecha || !horaRaw || !cod_servi || !id_modali) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos (fecha, hora, servicio y modalidad).",
        confirmButtonColor: "#d63384"
      });
      return;
    }

    // Crea objeto con datos para enviar al backend
    const Agenda = {
      fecha_servicio: fecha,
      hora_servicio: hora,
      id_modali: parseInt(id_modali),
      id_usuario_cliente: id_cliente ? parseInt(id_cliente) : null,
      id_usuario_trabajador: parseInt(id_trabajador || 0),
      cod_servi: parseInt(cod_servi),
    };

    try {
      // Envía POST para crear la cita
      const resp = await fetch("http://localhost:8080/pruebaApi/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Agenda)
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al guardar la cita");
      }

      Swal.fire({
        icon: "success",
        title: "Cita agendada con éxito",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#d63384"
      });

      // Comentado: redirigir después de agendar
      // setTimeout(() => {
      //   window.location.href = `../Trabajador/clientes.html?userId=${id_cliente || ""}`;
      // }, 2000);

    } catch (error) {
      console.error("Error al agendar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al agendar la cita. Revisa la consola.",
        confirmButtonColor: "#d63384"
      });
    }
  });
});

// =================== Función para obtener parámetros de la URL ===================
function obtenerParametro(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);  // Devuelve el valor del parámetro solicitado
}













