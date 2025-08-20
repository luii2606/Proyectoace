// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene la clase jsPDF desde la librería cargada en window
    const { jsPDF } = window.jspdf;

    // Selecciona el contenedor HTML donde se mostrarán las facturas
    const contenedor = document.getElementById("contenedor-reservas");

    // Obtiene el ID del cliente almacenado en el localStorage del navegador
    const idCliente = localStorage.getItem("usuario");

    // Si no existe el ID del cliente, se muestra un error en consola y se detiene la ejecución
    if (!idCliente) {
        console.error("No se encontró el ID del cliente en localStorage");
        return;
    }

    // Llama a la función que carga las facturas del cliente
    cargarFacturas(idCliente);

    /**
     * Función asincrónica para obtener las facturas de un cliente
     * desde el backend (API REST) y mostrarlas en pantalla.
     */
    async function cargarFacturas(idCliente) {
        try {
            // Realiza una petición GET a la API para obtener las facturas del cliente
            const response = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/usuario/${idCliente}`);
            
            // Si la respuesta no fue exitosa, lanza un error
            if (!response.ok) throw new Error("Error al obtener facturas");

            // Convierte la respuesta en JSON (lista de facturas)
            const facturas = await response.json();

            // Limpia el contenido previo del contenedor antes de agregar nuevas facturas
            contenedor.innerHTML = "";

            // Si no hay facturas registradas, muestra un mensaje informativo
            if (facturas.length === 0) {
                contenedor.innerHTML = "<p>No tienes facturas registradas.</p>";
                return;
            }

            // Recorre cada factura obtenida
            facturas.forEach(factura => {
                // Crea un div para mostrar la factura en pantalla
                const facturaDiv = document.createElement("div");
                facturaDiv.classList.add("factura-item");
                
                // Inserta el contenido de la factura en el div
                facturaDiv.innerHTML = `
                    <h3>Factura #${factura.id_factura}</h3>
                    <p><strong>Cliente:</strong> ${factura.nombre_cliente}</p>
                    <p><strong>Trabajador:</strong> ${factura.nombre_trabajador}</p>
                    <p><strong>Servicio:</strong> ${factura.nombre_servicio}</p>
                    <p><strong>Fecha de emisión:</strong> ${new Date(factura.fecha_emision).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${factura.total}</p>
                    <button class="btn-imprimir">Imprimir PDF</button>
                    <hr>
                `;
                
                // Agrega el div de la factura al contenedor principal
                contenedor.appendChild(facturaDiv);

                /**
                 * Evento click para generar el PDF de la factura
                 * cuando el usuario presiona el botón "Imprimir PDF"
                 */
                facturaDiv.querySelector(".btn-imprimir").addEventListener("click", () => {
                    // Crea un nuevo documento PDF
                    const doc = new jsPDF();

                    // Encabezado del PDF
                    doc.setFontSize(20);
                    doc.text("Factura de Servicio", 70, 20);

                    // Línea separadora debajo del título
                    doc.setLineWidth(0.5);
                    doc.line(20, 25, 190, 25);

                    // Sección de datos de la factura
                    doc.setFontSize(12);
                    let y = 40; // Coordenada vertical inicial
                    doc.text(`Factura #: ${factura.id_factura}`, 20, y); y += 10;
                    doc.text(`Cliente: ${factura.nombre_cliente}`, 20, y); y += 10;
                    doc.text(`Trabajador: ${factura.nombre_trabajador}`, 20, y); y += 10;
                    doc.text(`Servicio: ${factura.nombre_servicio}`, 20, y); y += 10;
                    doc.text(`Fecha de emisión: ${new Date(factura.fecha_emision).toLocaleDateString()}`, 20, y); y += 10;

                    // Total destacado en rojo y con letra más grande
                    doc.setFontSize(14);
                    doc.setTextColor(200, 0, 0);
                    doc.text(`TOTAL: $${factura.total}`, 20, y); 

                    // Guarda el PDF en el navegador con un nombre dinámico
                    doc.save(`Factura_${factura.id_factura}.pdf`);
                });
            });

        } catch (error) {
            // En caso de error (ej: servidor caído), se muestra en consola y en pantalla
            console.error("Error cargando facturas:", error);
            contenedor.innerHTML = "<p>Error al cargar las facturas.</p>";
        }
    }
});




