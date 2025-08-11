document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("estilistas-contenedor"); // Contenedor donde se mostrarán las tarjetas

  try {
    // Traemos todos los trabajadores con su rol desde la API
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores-rol");
    const trabajadores = await response.json();

    // Por cada trabajador, crear una tarjeta con enlace a la página de agendar, pasando datos en URL
    trabajadores.forEach(trabajador => {
      const tarjeta = document.createElement("a");
      tarjeta.href = `agendar.html?nombre=${encodeURIComponent(trabajador.nombre_usuario)}&id=${trabajador.id_usuario}`;
      tarjeta.className = "estilista estilista--hover"; // Clases para estilos CSS
      tarjeta.innerHTML = `
        <img src="../recursos/Tony Chopper.jpeg" alt="${trabajador.nombre_usuario}" class="estilista__foto">
        <div class="estilista__info">
          <div class="estilista__nombre">${trabajador.nombre_usuario}</div>
          <div class="estilista__descripcion">${trabajador.nombre_rol || "Sin rol"}</div>
          <div class="estilista__telefono">tel. ${trabajador.telefono}</div>
        </div>
      `;

      // Agregar la tarjeta al contenedor
      contenedor.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("Error cargando trabajadores:", error);
  }
});














