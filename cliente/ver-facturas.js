// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene la clase jsPDF desde la librería cargada en window
    const { jsPDF } = window.jspdf;

    // Selecciona el contenedor donde se mostrarán las facturas
    const contenedor = document.getElementById("contenedor-reservas");
    // Obtiene el ID del cliente almacenado en localStorage
    const idCliente = localStorage.getItem("usuario");
    console.log(localStorage.getItem("usuario"));

    // Si no hay ID de cliente, muestra error y detiene ejecución
    if (!idCliente) {
        console.error("No se encontró el ID del cliente en sessionStorage");
        return;
    }

    // Llama a la función para cargar las facturas del cliente
    cargarFacturas(idCliente);

    // Función asíncrona para cargar facturas desde el backend
    async function cargarFacturas(idCliente) {
        try {
            // Realiza petición GET para obtener las facturas del cliente
            const response = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/usuario/${idCliente}`);
            // Si la respuesta no es exitosa, lanza un error
            if (!response.ok) throw new Error("Error al obtener facturas");

            // Convierte la respuesta en formato JSON
            const facturas = await response.json();

            // Limpia el contenedor antes de mostrar nuevas facturas
            contenedor.innerHTML = "";

            // Si no hay facturas, muestra un mensaje informativo
            if (facturas.length === 0) {
                contenedor.innerHTML = "<p>No tienes facturas registradas.</p>";
                return;
            }

            // Itera sobre cada factura recibida
            facturas.forEach(factura => {
                // Crea un div para mostrar cada factura
                const facturaDiv = document.createElement("div");
                facturaDiv.classList.add("factura-item");
                facturaDiv.innerHTML = `
                    <h3>Factura #${factura.id_factura}</h3>
                    <p><strong>Cliente: ${factura.nombre_cliente}</strong><p>
                    <p><strong>Trabajador : ${factura.nombre_trabajador}</strong><p>
                    <p><strong>servicio Realizado : ${factura.nombre_servicio}</strong><p>
                    <p><strong>Fecha de emisión:</strong> ${new Date(factura.fecha_emision).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${factura.total}</p>
                    <button class="btn-imprimir">Imprimir PDF</button>
                    <hr>
                `;
                // Añade el div al contenedor principal
                contenedor.appendChild(facturaDiv);

                // Añade evento click al botón para imprimir la factura en PDF
                facturaDiv.querySelector(".btn-imprimir").addEventListener("click", () => {
                    // Crea un nuevo documento PDF
                    const doc = new jsPDF();

                    // Agrega título con tamaño de fuente 18
                    doc.setFontSize(18);
                    doc.text(`Factura #${factura.id_factura}`, 20, 20);

                    // Agrega detalles con tamaño de fuente 12
                    doc.setFontSize(12);
                    doc.text(`Fecha de emisión: ${new Date(factura.fecha_emision).toLocaleDateString()}`, 20, 40);
                    doc.text(`Total: $${factura.total}`, 20, 50);

                    // Guarda el PDF con nombre dinámico
                    doc.save(`Factura_${factura.id_factura}.pdf`);
                });
            });

        } catch (error) {
            // En caso de error, muestra mensaje en consola y en el contenedor
            console.error("Error cargando facturas:", error);
            contenedor.innerHTML = "<p>Error al cargar las facturas.</p>";
        }
    }
});




