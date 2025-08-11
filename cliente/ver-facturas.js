document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    const contenedor = document.getElementById("contenedor-reservas");
    const idCliente = localStorage.getItem("usuario");
    console.log(localStorage.getItem("usuario"));

    if (!idCliente) {
        console.error("No se encontró el ID del cliente en sessionStorage");
        return;
    }

    cargarFacturas(idCliente);

    async function cargarFacturas(idCliente) {
        try {
            const response = await fetch(`http://localhost:8080/pruebaApi/api/ordenes/usuario/${idCliente}`);
            if (!response.ok) throw new Error("Error al obtener facturas");

            const facturas = await response.json();

            contenedor.innerHTML = "";

            if (facturas.length === 0) {
                contenedor.innerHTML = "<p>No tienes facturas registradas.</p>";
                return;
            }

            facturas.forEach(factura => {
                const facturaDiv = document.createElement("div");
                facturaDiv.classList.add("factura-item");
                facturaDiv.innerHTML = `
                    <h3>Factura #${factura.id_factura}</h3>
                    <p><strong>Fecha de emisión:</strong> ${new Date(factura.fecha_emision).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> $${factura.total}</p>
                    <button class="btn-imprimir">Imprimir PDF</button>
                    <hr>
                `;
                contenedor.appendChild(facturaDiv);

                facturaDiv.querySelector(".btn-imprimir").addEventListener("click", () => {
                    const doc = new jsPDF();

                    doc.setFontSize(18);
                    doc.text(`Factura #${factura.id_factura}`, 20, 20);

                    doc.setFontSize(12);
                    doc.text(`Fecha de emisión: ${new Date(factura.fecha_emision).toLocaleDateString()}`, 20, 40);
                    doc.text(`Total: $${factura.total}`, 20, 50);

                    doc.save(`Factura_${factura.id_factura}.pdf`);
                });
            });

        } catch (error) {
            console.error("Error cargando facturas:", error);
            contenedor.innerHTML = "<p>Error al cargar las facturas.</p>";
        }
    }
});



