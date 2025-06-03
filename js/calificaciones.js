// Variables globales
let empresasFiltradas = [];
let paginaActual = 1;
const empresasPorPagina = 6;

// Variables globales para modales
let modalProductos;

// Inicializar modales cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    modalProductos = new bootstrap.Modal(document.getElementById('modalProductos'));
});

// Función para cargar empresas
async function cargarEmpresas() {
    try {
        const empresasRef = firebase.firestore().collection('empresas')
            .where('status', '==', 'verified');
        
        const snapshot = await empresasRef.get();
        empresasFiltradas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        mostrarEmpresas();
    } catch (error) {
        console.error('Error al cargar empresas:', error);
        mostrarAlerta('alertaError', 'Error al cargar las empresas');
    }
}

// Función para mostrar empresas
function mostrarEmpresas(pagina = 1) {
    const container = document.getElementById('empresasContainer');
    container.innerHTML = '';

    if (empresasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="lead">No se encontraron empresas</p>
            </div>
        `;
        return;
    }

    // Calcular índices para paginación
    const inicio = (pagina - 1) * empresasPorPagina;
    const fin = inicio + empresasPorPagina;
    const empresasPagina = empresasFiltradas.slice(inicio, fin);

    // Mostrar empresas
    empresasPagina.forEach(empresa => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${empresa.nombre}</h5>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt"></i> ${empresa.direccion}
                        </small>
                    </p>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-phone"></i> ${empresa.telefono}
                        </small>
                    </p>
                    <div class="rating-display mb-3">
                        ${mostrarEstrellas(empresa.promedioCalificacion || 0)}
                        <small class="text-muted ms-2">
                            (${empresa.totalResenas || 0} reseñas)
                        </small>
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" 
                                onclick="mostrarModalCalificacion('${empresa.id}', '${empresa.nombre}')">
                            <i class="fas fa-star me-2"></i>Calificar
                        </button>
                        <button class="btn btn-info text-white" 
                                onclick="verProductos('${empresa.id}', '${empresa.nombre}')">
                            <i class="fas fa-box me-2"></i>Ver Productos
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });

    actualizarPaginacion(pagina);
}

// Función para mostrar estrellas
function mostrarEstrellas(calificacion) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(calificacion)) {
            estrellas += '<i class="fas fa-star text-warning"></i>';
        } else {
            estrellas += '<i class="far fa-star"></i>';
        }
    }
    return estrellas;
}

// Función para actualizar paginación
function actualizarPaginacion(pagina) {
    const totalPaginas = Math.ceil(empresasFiltradas.length / empresasPorPagina);
    const paginacion = document.querySelector('.pagination');
    
    let html = `
        <li class="page-item ${pagina === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${pagina - 1})">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `
            <li class="page-item ${i === pagina ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${pagina === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${pagina + 1})">Siguiente</a>
        </li>
    `;

    paginacion.innerHTML = html;
}

// Función para cambiar de página
function cambiarPagina(pagina) {
    if (pagina < 1 || pagina > Math.ceil(empresasFiltradas.length / empresasPorPagina)) {
        return;
    }
    paginaActual = pagina;
    mostrarEmpresas(pagina);
}

// Función para filtrar empresas
function filtrarEmpresas() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const calificacionMinima = parseFloat(document.getElementById('filtroCalificacion').value) || 0;

    empresasFiltradas = empresasFiltradas.filter(empresa => {
        const cumpleBusqueda = empresa.nombre.toLowerCase().includes(busqueda) ||
                              empresa.direccion.toLowerCase().includes(busqueda);
        const cumpleCalificacion = (empresa.promedioCalificacion || 0) >= calificacionMinima;
        return cumpleBusqueda && cumpleCalificacion;
    });

    mostrarEmpresas(1);
}

// Función para mostrar modal de calificación
function mostrarModalCalificacion(empresaId, empresaNombre) {
    // Verificar si ya existe el modal
    let modal = document.getElementById('modalCalificacion');
    if (!modal) {
        // Crear el modal si no existe
        modal = document.createElement('div');
        modal.id = 'modalCalificacion';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Calificar Empresa</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formCalificacion">
                            <input type="hidden" id="empresaIdCalificacion">
                            <div class="mb-3">
                                <label class="form-label">Calificación</label>
                                <div class="rating">
                                    ${Array.from({length: 5}, (_, i) => `
                                        <i class="far fa-star" data-rating="${i + 1}"></i>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="calificacionValor" required>
                            </div>
                            <div class="mb-3">
                                <label for="comentario" class="form-label">Comentario</label>
                                <textarea class="form-control" id="comentario" rows="3" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="enviarCalificacion()">
                            Enviar Calificación
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Configurar el sistema de calificación
        const estrellas = modal.querySelectorAll('.rating i');
        estrellas.forEach(estrella => {
            estrella.addEventListener('click', () => {
                const rating = estrella.dataset.rating;
                document.getElementById('calificacionValor').value = rating;
                estrellas.forEach(s => {
                    if (s.dataset.rating <= rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }

    // Configurar el modal
    document.getElementById('empresaIdCalificacion').value = empresaId;
    document.querySelector('#modalCalificacion .modal-title').textContent = `Calificar a ${empresaNombre}`;
    
    // Mostrar el modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Función para enviar calificación
async function enviarCalificacion() {
    try {
        const empresaId = document.getElementById('empresaIdCalificacion').value;
        const calificacion = parseInt(document.getElementById('calificacionValor').value);
        const comentario = document.getElementById('comentario').value;

        if (!calificacion || !comentario) {
            throw new Error('Por favor completa todos los campos');
        }

        const user = firebase.auth().currentUser;
        
        // Crear la reseña
        const resenaRef = await firebase.firestore().collection('resenas').add({
            empresaId,
            usuarioId: user.uid,
            usuarioNombre: user.displayName || user.email,
            calificacion,
            comentario,
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        // Actualizar promedio de calificaciones de la empresa
        const empresaRef = firebase.firestore().collection('empresas').doc(empresaId);
        
        await firebase.firestore().runTransaction(async (transaction) => {
            const empresaDoc = await transaction.get(empresaRef);
            if (!empresaDoc.exists) {
                throw new Error('La empresa no existe');
            }

            const empresaData = empresaDoc.data();
            const totalResenas = (empresaData.totalResenas || 0) + 1;
            const sumaCalificaciones = (empresaData.sumaCalificaciones || 0) + calificacion;
            const promedioCalificacion = sumaCalificaciones / totalResenas;

            transaction.update(empresaRef, {
                totalResenas,
                sumaCalificaciones,
                promedioCalificacion
            });

            // Crear notificación para la empresa
            const notificacionRef = firebase.firestore().collection('notificaciones').doc();
            transaction.set(notificacionRef, {
                tipo: 'nueva_resena',
                titulo: 'Nueva reseña recibida',
                mensaje: `Has recibido una nueva reseña con calificación de ${calificacion} estrellas`,
                destinatarioId: empresaId,
                createdAt: new Date().toISOString(),
                leido: false,
                expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        });

        // Cerrar modal y mostrar mensaje de éxito
        bootstrap.Modal.getInstance(document.getElementById('modalCalificacion')).hide();
        mostrarAlerta('alertaExito', 'Calificación enviada exitosamente');
        
        // Recargar empresas para actualizar la vista
        await cargarEmpresas();
    } catch (error) {
        console.error('Error al enviar calificación:', error);
        mostrarAlerta('alertaError', error.message);
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

// Función para calificar una empresa
async function calificarEmpresa(empresaId, calificacion, comentario) {
    try {
        // Obtener el usuario actual
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('Debes iniciar sesión para calificar');
        }

        // Verificar que el usuario sea un cliente
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'cliente') {
            throw new Error('Solo los clientes pueden calificar empresas');
        }

        // Crear la calificación
        const nuevaCalificacion = {
            userId: user.uid,
            userName: user.displayName || userDoc.data().nombre,
            calificacion: calificacion,
            comentario: comentario,
            fecha: new Date().toISOString()
        };

        // Obtener la empresa
        const empresaRef = firebase.firestore().collection('empresas').doc(empresaId);
        const empresaDoc = await empresaRef.get();

        if (!empresaDoc.exists) {
            throw new Error('La empresa no existe');
        }

        // Actualizar las calificaciones de la empresa
        const empresa = empresaDoc.data();
        const calificaciones = empresa.calificaciones || [];
        calificaciones.push(nuevaCalificacion);

        // Calcular el nuevo promedio
        const sumaCalificaciones = calificaciones.reduce((sum, c) => sum + c.calificacion, 0);
        const promedioCalificacion = sumaCalificaciones / calificaciones.length;

        // Actualizar la empresa
        await empresaRef.update({
            calificaciones: calificaciones,
            promedioCalificacion: promedioCalificacion
        });

        return {
            success: true,
            mensaje: '¡Calificación enviada con éxito!'
        };
    } catch (error) {
        console.error('Error al calificar empresa:', error);
        throw error;
    }
}

// Función para mostrar las calificaciones de una empresa
async function mostrarCalificaciones(empresaId, contenedorId) {
    try {
        const empresaDoc = await firebase.firestore().collection('empresas').doc(empresaId).get();
        
        if (!empresaDoc.exists) {
            throw new Error('La empresa no existe');
        }

        const empresa = empresaDoc.data();
        const contenedor = document.getElementById(contenedorId);
        
        if (!contenedor) {
            throw new Error('Contenedor no encontrado');
        }

        // Mostrar promedio
        const promedioHTML = `
            <div class="text-center mb-4">
                <h3>Calificación Promedio</h3>
                <div class="display-4">${empresa.promedioCalificacion.toFixed(1)}</div>
                <div class="stars">
                    ${generarEstrellasHTML(empresa.promedioCalificacion)}
                </div>
                <small>(${empresa.calificaciones ? empresa.calificaciones.length : 0} calificaciones)</small>
            </div>
        `;

        // Mostrar calificaciones individuales
        const calificacionesHTML = empresa.calificaciones ? empresa.calificaciones.map(c => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title">${c.userName}</h5>
                        <div class="stars">
                            ${generarEstrellasHTML(c.calificacion)}
                        </div>
                    </div>
                    <p class="card-text">${c.comentario || 'Sin comentario'}</p>
                    <small class="text-muted">${new Date(c.fecha).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('') : '<p class="text-center">No hay calificaciones aún</p>';

        contenedor.innerHTML = promedioHTML + calificacionesHTML;
    } catch (error) {
        console.error('Error al mostrar calificaciones:', error);
        throw error;
    }
}

// Función auxiliar para generar HTML de estrellas
function generarEstrellasHTML(calificacion) {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            estrellas.push('<i class="fas fa-star text-warning"></i>');
        } else if (i - 0.5 <= calificacion) {
            estrellas.push('<i class="fas fa-star-half-alt text-warning"></i>');
        } else {
            estrellas.push('<i class="far fa-star text-warning"></i>');
        }
    }
    return estrellas.join('');
}

// Función para ver productos de una empresa
async function verProductos(empresaId, empresaNombre) {
    try {
        const productosRef = firebase.firestore().collection('productos')
            .where('empresaId', '==', empresaId)
            .orderBy('createdAt', 'desc');

        const snapshot = await productosRef.get();
        const listaProductos = document.getElementById('listaProductosEmpresa');
        
        // Actualizar título del modal
        document.querySelector('#modalProductos .modal-title').textContent = `Productos de ${empresaNombre}`;
        
        if (snapshot.empty) {
            listaProductos.innerHTML = '<p class="text-center">Esta empresa aún no tiene productos registrados</p>';
        } else {
            listaProductos.innerHTML = '';
            snapshot.forEach(doc => {
                const producto = doc.data();
                const div = document.createElement('div');
                div.className = 'card mb-3';
                div.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">
                            <strong>Cantidad disponible:</strong> ${producto.cantidad}<br>
                            <strong>Descripción:</strong> ${producto.descripcion}
                        </p>
                        <small class="text-muted">
                            Actualizado: ${new Date(producto.updatedAt).toLocaleDateString()}
                        </small>
                    </div>
                `;
                listaProductos.appendChild(div);
            });
        }

        modalProductos.show();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarAlerta('alertaError', 'Error al cargar los productos de la empresa');
    }
} 