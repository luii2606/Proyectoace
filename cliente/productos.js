
  

//------- productos vista cliente-------
// async function cargarProductos() {
//   try {
//     const response = await fetch("http://localhost:8080/pruebaApi/api/productos");
//     const productos = await response.json();

//     const lista = document.getElementById("lista-productos");
//     lista.innerHTML = ""; // Limpiar lista

//     productos.forEach(producto => {
//       const div = document.createElement("div");
//       div.classList.add("productos__item");
//       div.innerHTML = `
//         <h3 class="productos__nombre">${producto.nombre_producto}</h3>
//         <p class="productos__descripcion">Descripción: ${producto.descripcion}</p>
//         <p class="productos__precio">Precio: $${producto.precio}</p>
//         <label class="productos__cantidad-label">Cantidad:
//           <input 
//             class="productos__cantidad-input"
//             type="number" 
//             min="0" 
//             value="0" 
//             data-id="${producto.id_producto}" 
//             data-precio="${producto.precio}" 
//           />
//         </label>
//       `;
//       lista.appendChild(div);
//     });
//   } catch (error) {
//     console.error("Error al cargar productos:", error);
//   }
// }

// document.getElementById("confirmarProductos").addEventListener("click", () => {
//   const cantidades = document.querySelectorAll('.productos__cantidad-input');
//   const seleccionados = [];

//   cantidades.forEach(input => {
//     const cantidad = parseInt(input.value);
//     if (cantidad > 0) {
//       seleccionados.push({
//         id_producto: parseInt(input.dataset.id),
//         cantidad,
//         precio_unitario: parseFloat(input.dataset.precio)
//       });
//     }
//   });

//   localStorage.setItem("productosSeleccionados", JSON.stringify(seleccionados));
//   alert("Productos agregados correctamente ✅");
// });

// cargarProductos();
/////////////////////////////////////////////////////////77
// cliente.js (carga en productos.html)
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("lista-productos");

      data.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "productos__item";
        tarjeta.innerHTML = `
          <h3 class="productos__nombre">${producto.nombre_producto}</h3>
          <p class="productos__descripcion">${producto.descripcion}</p>
          <p class="productos__precio">Precio: $${producto.precio}</p>
          <button class="productos__agregar" data-id="${producto.id_producto}">Agregar</button>
        `;
        contenedor.appendChild(tarjeta);
      });

      // Agregar funcionalidad al botón
      contenedor.addEventListener("click", (e) => {
        if (e.target.classList.contains("productos__agregar")) {
          const id = e.target.dataset.id;
          const nombre = e.target.parentElement.querySelector("h3").textContent;

          // Obtener productos guardados (o lista vacía)
          let seleccionados = JSON.parse(localStorage.getItem("productosSeleccionados")) || [];

          // Evitar duplicados
          if (!seleccionados.find(p => p.id === id)) {
            seleccionados.push({ id, nombre });
            localStorage.setItem("productosSeleccionados", JSON.stringify(seleccionados));
            alert(`Producto "${nombre}" agregado`);
          } else {
            alert("Este producto ya fue agregado.");
          }
        }
      });
    });
});






  





