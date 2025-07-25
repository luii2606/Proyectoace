const URL_API = "http://localhost:8080/pruebaApi/api/productos";
const form = document.getElementById("form-producto");
const tabla = document.getElementById("tabla-productos");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const producto = {
    id_producto: document.getElementById("id_producto").value || null,
    nombre_producto: document.getElementById("nombre_producto").value,
    descripcion: document.getElementById("descripcion").value,
    precio: parseFloat(document.getElementById("precio").value)
  };

  const metodo = producto.id_producto ? "PUT" : "POST";

  await fetch(URL_API, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  });

  form.reset();
  cargarProductos();
});

async function cargarProductos() {
  const res = await fetch(URL_API);
  const productos = await res.json();
  tabla.innerHTML = "";

  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class = "productos__row">${p.id_producto}</td>
      <td class = "productos__row">${p.nombre_producto}</td>
      <td class = "productos__row">${p.descripcion}</td>
      <td class = "productos__row">$${p.precio}</td>
      <td class = "productos__row">
        <button class ="productos__boton--editar" onclick="editarProducto(${p.id_producto}, '${p.nombre_producto}', '${p.descripcion}', ${p.precio})">✏️</button>
        <button class ="productos__boton--eliminar" onclick="eliminarProducto(${p.id_producto})">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function editarProducto(id, nombre, desc, precio) {
  document.getElementById("id_producto").value = id;
  document.getElementById("nombre_producto").value = nombre;
  document.getElementById("descripcion").value = desc;
  document.getElementById("precio").value = precio;
}

async function eliminarProducto(id) {
  if (confirm("¿Eliminar este producto?")) {
    await fetch(`${URL_API}/${id}`, { method: "DELETE" });
    cargarProductos();
  }
}

cargarProductos();
