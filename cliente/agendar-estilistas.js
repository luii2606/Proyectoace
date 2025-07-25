//
function obtenerParametro(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

const nombreEstilista = obtenerParametro("nombre");

if (nombreEstilista) {
  const titulo = document.querySelector(".cuadro__titulo");
  const campoEstilista = document.getElementById("campo-estilista");

  if (titulo) {
    titulo.textContent = `Agendar con ${nombreEstilista}`;
  }

  if (campoEstilista) {
    campoEstilista.value = nombreEstilista;
  }
}

//trabajadores insertados en la vista del cliente

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("estilistas-contenedor");

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios");
    const usuarios = await response.json();

    const trabajadores = usuarios.filter(u => u.id_tipo_usuario === 3);

    trabajadores.forEach(trabajador => {
      const tarjeta = document.createElement("a");
      tarjeta.href = `agendar.html?nombre=${encodeURIComponent(trabajador.nombre_usuario)}&id=${trabajador.id_usuario}`;
      tarjeta.className = "estilista estilista--hover";
      tarjeta.innerHTML = `
        <img src="../recursos/Tony Chopper.jpeg" alt="${trabajador.nombre_usuario}" class="estilista__foto">
        <div class="estilista__info">
          <div class="estilista__nombre">${trabajador.nombre_usuario}</div>
          <div class="estilista__descripcion">Estilista Integral</div>
          <div class="estilista__telefono ">tel.${trabajador.telefono}</div>
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("Error cargando trabajadores:", error);
  }
});
//////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("lista-productos-form");
  const seleccionados = JSON.parse(localStorage.getItem("productosSeleccionados")) || [];

  seleccionados.forEach(producto => {
    const contenedorProducto = document.createElement("div");
    contenedorProducto.className = "formulario__checkbox";

    contenedorProducto.innerHTML = `
      <label>
        <input type="checkbox" name="productos" value="${producto.id}" checked>
        ${producto.nombre}
      </label>
      <input type="number" name="cantidad-${producto.id}" class="formulario__cantidad" value="1" min="1" style="width: 60px; margin-left: 10px;" />
    `;

    contenedor.appendChild(contenedorProducto);
  });

  const form = document.querySelector(".formulario");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const productosSeleccionados = Array.from(form.querySelectorAll('input[name="productos"]:checked')).map(p => {
      const id = p.value;
      const cantidadInput = form.querySelector(`input[name="cantidad-${id}"]`);
      const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 1 : 1;
      return { id, cantidad };
    });

    // Mostrar en consola el array de productos con cantidad
    console.log("Productos seleccionados:", productosSeleccionados);

    // Aquí iría tu lógica para enviar los datos al backend si lo deseas

    localStorage.removeItem("productosSeleccionados");

    document.getElementById("mensaje-productos").classList.remove("mensaje--oculto");
  });
});


