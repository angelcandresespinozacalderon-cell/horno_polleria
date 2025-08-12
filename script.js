document.addEventListener("DOMContentLoaded", () => {
    const catalogo = document.getElementById("catalogo");
    const searchInput = document.getElementById("searchInput");

    let productos = [];

    // Cargar productos desde JSON
    fetch("productos.json")
        .then(res => res.json())
        .then(data => {
            productos = data;
            mostrarProductos(productos);
        })
        .catch(err => console.error("Error al cargar JSON:", err));

    // Mostrar productos en el catálogo
    function mostrarProductos(lista) {
        catalogo.innerHTML = "";
        lista.forEach(prod => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${prod.nombre}</h5>
                        <button class="btn btn-primary w-100 mb-2" onclick="verDetalle('${prod.nombre}')">Ver detalles</button>
                        <a href="${prod.whatsapp}" target="_blank" class="btn btn-success w-100">WhatsApp</a>
                    </div>
                </div>
            `;
            catalogo.appendChild(card);
        });
    }

    // Buscar productos
    searchInput.addEventListener("input", () => {
        const texto = searchInput.value.toLowerCase();
        const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
        mostrarProductos(filtrados);
    });

    // Función global para ver detalles
    window.verDetalle = (nombre) => {
        const prod = productos.find(p => p.nombre === nombre);
        if (prod) {
            document.getElementById("modalTitulo").textContent = prod.nombre;
            document.getElementById("modalImagen").src = prod.imagen;
            document.getElementById("modalDescripcion").textContent = prod.descripcion;
            document.getElementById("modalWhatsApp").href = prod.whatsapp;
            new bootstrap.Modal(document.getElementById("detalleModal")).show();
        }
    };
});
