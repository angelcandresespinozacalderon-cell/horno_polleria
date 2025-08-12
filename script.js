document.addEventListener("DOMContentLoaded", () => {
    fetch("productos.json")
        .then(res => res.json())
        .then(productos => {
            const contenedor = document.getElementById("catalogo");
            productos.forEach(prod => {
                contenedor.innerHTML += `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm">
                            <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
                            <div class="card-body">
                                <h5 class="card-title">${prod.nombre}</h5>
                                <p class="card-text">${prod.precio}</p>
                                <button class="btn btn-primary" onclick="verProducto(${prod.id})">
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            window.verProducto = (id) => {
                const producto = productos.find(p => p.id === id);
                document.getElementById("modalTitulo").textContent = producto.nombre;
                document.getElementById("modalImagen").src = producto.imagen;
                document.getElementById("modalDescripcion").textContent = producto.descripcion;
                document.getElementById("modalPrecio").textContent = producto.precio;
                new bootstrap.Modal(document.getElementById("modalProducto")).show();
            };
        })
        .catch(err => console.error("Error cargando productos:", err));
});
