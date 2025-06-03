// Variables globales
let modalProducto;

// Inicializar elementos cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
});

// Función para mostrar el modal de producto
function mostrarModalProducto(productoId = null) {
    // Limpiar el formulario
    document.getElementById('formProducto').reset();
    
    // Si se proporciona un ID, cargar los datos del producto para edición
    if (productoId) {
        cargarDatosProducto(productoId);
    }
    
    modalProducto.show();
}

// Función para guardar un producto
async function guardarProducto() {
    try {
        const nombre = document.getElementById('nombreProducto').value.trim();
        const cantidad = parseInt(document.getElementById('cantidadProducto').value);
        const descripcion = document.getElementById('descripcionProducto').value.trim();

        if (!nombre || !cantidad || !descripcion) {
            throw new Error('Por favor, completa todos los campos');
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('Debes iniciar sesión para agregar productos');
        }

        const producto = {
            nombre,
            cantidad,
            descripcion,
            empresaId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await firebase.firestore().collection('productos').add(producto);

        modalProducto.hide();
        mostrarAlerta('alertaExito', 'Producto guardado exitosamente');
        cargarProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarAlerta('alertaError', error.message);
    }
}

// Función para cargar productos de la empresa
async function cargarProductos() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const productosRef = firebase.firestore().collection('productos')
            .where('empresaId', '==', user.uid)
            .orderBy('createdAt', 'desc');

        const snapshot = await productosRef.get();
        const listaProductos = document.getElementById('listaProductos');
        
        if (snapshot.empty) {
            listaProductos.innerHTML = '<p class="text-center">No hay productos registrados</p>';
            return;
        }

        listaProductos.innerHTML = '';
        snapshot.forEach(doc => {
            const producto = doc.data();
            const div = document.createElement('div');
            div.className = 'card mb-3';
            div.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <div>
                            <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="card-text">
                        <strong>Cantidad:</strong> ${producto.cantidad}<br>
                        <strong>Descripción:</strong> ${producto.descripcion}
                    </p>
                    <small class="text-muted">
                        Actualizado: ${new Date(producto.updatedAt).toLocaleDateString()}
                    </small>
                </div>
            `;
            listaProductos.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarAlerta('alertaError', 'Error al cargar los productos');
    }
}

// Función para eliminar un producto
async function eliminarProducto(productoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        await firebase.firestore().collection('productos').doc(productoId).delete();
        mostrarAlerta('alertaExito', 'Producto eliminado exitosamente');
        cargarProductos();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        mostrarAlerta('alertaError', 'Error al eliminar el producto');
    }
}

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById(tipo);
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
    setTimeout(() => {
        alerta.classList.add('d-none');
    }, 5000);
} 