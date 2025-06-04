// Variables globales
let modalProducto;
let productoEnEdicion = null;

// Inicializar elementos cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    
    // Verificar autenticación y cargar productos
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            cargarProductos();
        }
    });
});

// Función para mostrar el modal de producto
function mostrarModalProducto(productoId = null) {
    // Limpiar el formulario y las alertas
    document.getElementById('formProducto').reset();
    document.getElementById('alertaModalError').classList.add('d-none');
    document.getElementById('alertaModalExito').classList.add('d-none');
    
    productoEnEdicion = productoId;
    const modalTitle = document.getElementById('modalProductoLabel');
    
    if (productoId) {
        modalTitle.textContent = 'Editar Producto';
        cargarDatosProducto(productoId);
    } else {
        modalTitle.textContent = 'Agregar Producto';
    }
    
    modalProducto.show();
}

// Función para cargar datos de un producto para edición
async function cargarDatosProducto(productoId) {
    try {
        const doc = await firebase.firestore().collection('productos').doc(productoId).get();
        if (!doc.exists) {
            throw new Error('El producto no existe');
        }

        const producto = doc.data();
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('precioProducto').value = producto.precio;
        document.getElementById('cantidadProducto').value = producto.cantidad;
        document.getElementById('descripcionProducto').value = producto.descripcion;
    } catch (error) {
        console.error('Error al cargar producto:', error);
        mostrarAlertaModal('alertaModalError', 'Error al cargar los datos del producto');
    }
}

// Función para guardar un producto
async function guardarProducto() {
    try {
        const nombre = document.getElementById('nombreProducto').value.trim();
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const cantidad = parseInt(document.getElementById('cantidadProducto').value);
        const descripcion = document.getElementById('descripcionProducto').value.trim();

        if (!nombre || !precio || !cantidad || !descripcion) {
            throw new Error('Por favor, completa todos los campos');
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('Debes iniciar sesión para gestionar productos');
        }

        const producto = {
            nombre,
            precio,
            cantidad,
            descripcion,
            empresaId: user.uid,
            updatedAt: new Date().toISOString()
        };

        if (!productoEnEdicion) {
            // Crear nuevo producto
            producto.createdAt = new Date().toISOString();
            await firebase.firestore().collection('productos').add(producto);
            mostrarAlertaModal('alertaModalExito', 'Producto guardado exitosamente');
        } else {
            // Actualizar producto existente
            await firebase.firestore().collection('productos').doc(productoEnEdicion).update(producto);
            mostrarAlertaModal('alertaModalExito', 'Producto actualizado exitosamente');
        }
        
        // Cerrar el modal después de 1.5 segundos
        setTimeout(() => {
            modalProducto.hide();
            cargarProductos();
        }, 1500);
    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarAlertaModal('alertaModalError', error.message);
    }
}

// Función para cargar productos de la empresa
async function cargarProductos() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('No hay usuario autenticado');
            return;
        }

        const listaProductos = document.getElementById('listaProductos');
        if (!listaProductos) {
            console.error('No se encontró el elemento listaProductos');
            return;
        }

        // Mostrar mensaje de carga
        listaProductos.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';

        // Crear el índice compuesto si no existe
        const productosRef = firebase.firestore().collection('productos')
            .where('empresaId', '==', user.uid)
            .orderBy('createdAt', 'desc');

        // Suscribirse a cambios en tiempo real
        productosRef.onSnapshot(snapshot => {
            if (snapshot.empty) {
                listaProductos.innerHTML = `
                    <div class="alert alert-info text-center" role="alert">
                        <i class="fas fa-box me-2"></i>
                        No hay productos registrados. ¡Agrega tu primer producto!
                    </div>`;
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
                                <button class="btn btn-sm btn-primary me-2" onclick="mostrarModalProducto('${doc.id}')" aria-label="Editar ${producto.nombre}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${doc.id}')" aria-label="Eliminar ${producto.nombre}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p class="card-text">
                            <strong>Precio:</strong> $${producto.precio.toFixed(2)}<br>
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
        }, error => {
            console.error('Error al escuchar cambios en productos:', error);
            listaProductos.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar los productos. Por favor, intenta de nuevo más tarde.
                </div>`;
            mostrarAlerta('alertaError', 'Error al cargar los productos');
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        const listaProductos = document.getElementById('listaProductos');
        if (listaProductos) {
            listaProductos.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar los productos. Por favor, intenta de nuevo más tarde.
                </div>`;
        }
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

// Función para mostrar alertas en el modal
function mostrarAlertaModal(tipo, mensaje) {
    const alerta = document.getElementById(tipo);
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove('d-none');
    }
}

// Función para mostrar alertas generales
function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById(tipo);
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove('d-none');
        setTimeout(() => {
            alerta.classList.add('d-none');
        }, 5000);
    }
} 