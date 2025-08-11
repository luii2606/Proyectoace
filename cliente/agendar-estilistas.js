//trabajadores insertados en la vista del cliente
document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("estilistas-contenedor");

  try {
    // ✅ Cambiado para traer también el nombre_rol
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/trabajadores-rol");
    const trabajadores = await response.json();

    trabajadores.forEach(trabajador => {
      const tarjeta = document.createElement("a");
      tarjeta.href = `agendar.html?nombre=${encodeURIComponent(trabajador.nombre_usuario)}&id=${trabajador.id_usuario}`;
      tarjeta.className = "estilista estilista--hover";
      tarjeta.innerHTML = `
        <img src="../recursos/Tony Chopper.jpeg" alt="${trabajador.nombre_usuario}" class="estilista__foto">
        <div class="estilista__info">
          <div class="estilista__nombre">${trabajador.nombre_usuario}</div>
          <div class="estilista__descripcion">${trabajador.nombre_rol || "Sin rol"}</div>
          <div class="estilista__telefono">tel. ${trabajador.telefono}</div>
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("Error cargando trabajadores:", error);
  }
});













