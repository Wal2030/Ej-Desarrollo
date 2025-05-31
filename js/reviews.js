// Función para cargar las empresas disponibles
async function cargarEmpresas() {
    try {
        const empresasSnapshot = await db.collection('empresas')
            .where('status', '==', 'active')
            .get();
        
        const empresasContainer = document.getElementById('empresasContainer');
        empresasContainer.innerHTML = '';

        empresasSnapshot.forEach(doc => {
            const empresa = doc.data();
            const empresaCard = crearEmpresaCard(doc.id, empresa);
            empresasContainer.appendChild(empresaCard);
        });
    } catch (error) {
        console.error('Error al cargar empresas:', error);
        mostrarAlerta('alertaError', 'Error al cargar las empresas');
    }
}

// Función para crear el card de una empresa
function crearEmpresaCard(empresaId, empresa) {
    const div = document.createElement('div');
    div.className = 'col-md-6 mb-4';
    div.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${empresa.nombre}</h5>
                <p class="card-text">
                    <i class="fas fa-map-marker-alt"></i> ${empresa.direccion}<br>
                    <i class="fas fa-phone"></i> ${empresa.telefono}<br>
                    <div class="rating" id="rating-${empresaId}">
                        ${generarEstrellas(empresa.promedio_rating || 0)}
                    </div>
                    <small class="text-muted">${empresa.total_reviews || 0} reseñas</small>
                </p>
                <button class="btn btn-primary" onclick="mostrarFormularioResena('${empresaId}')">
                    <i class="fas fa-star me-2"></i>Calificar
                </button>
            </div>
        </div>
    `;
    return div;
}

// Función para generar las estrellas de calificación
function generarEstrellas(rating) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            estrellas += '<i class="fas fa-star text-warning"></i>';
        } else if (i - 0.5 <= rating) {
            estrellas += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            estrellas += '<i class="far fa-star text-warning"></i>';
        }
    }
    return estrellas;
}

// Función para mostrar el formulario de reseña
function mostrarFormularioResena(empresaId) {
    // Verificar si el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Crear y mostrar el modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'resenaModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Calificar Empresa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="resenaForm">
                        <div class="mb-3">
                            <label class="form-label">Calificación</label>
                            <div class="rating-input">
                                ${generarEstrellasInteractivas()}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="comentario" class="form-label">Comentario</label>
                            <textarea class="form-control" id="comentario" rows="3" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="enviarResena('${empresaId}')">
                        Enviar Reseña
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Eliminar el modal del DOM cuando se cierre
    modal.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modal);
    });
}

// Función para generar estrellas interactivas
function generarEstrellasInteractivas() {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        estrellas += `
            <i class="far fa-star text-warning estrella-input" 
               data-rating="${i}" 
               onmouseover="highlightStars(${i})" 
               onclick="selectRating(${i})"></i>
        `;
    }
    return estrellas;
}

// Variables para manejar la calificación
let selectedRating = 0;

// Función para resaltar estrellas al pasar el mouse
function highlightStars(rating) {
    const estrellas = document.querySelectorAll('.estrella-input');
    estrellas.forEach((estrella, index) => {
        if (index < rating) {
            estrella.classList.remove('far');
            estrella.classList.add('fas');
        } else {
            estrella.classList.remove('fas');
            estrella.classList.add('far');
        }
    });
}

// Función para seleccionar una calificación
function selectRating(rating) {
    selectedRating = rating;
    highlightStars(rating);
}

// Función para enviar la reseña
async function enviarResena(empresaId) {
    if (!selectedRating) {
        mostrarAlerta('alertaError', 'Por favor, selecciona una calificación');
        return;
    }

    const comentario = document.getElementById('comentario').value;
    if (!comentario.trim()) {
        mostrarAlerta('alertaError', 'Por favor, escribe un comentario');
        return;
    }

    const user = auth.currentUser;
    
    try {
        // Crear la reseña
        const resenaRef = await db.collection('resenas').add({
            empresaId: empresaId,
            userId: user.uid,
            userName: user.displayName || 'Usuario',
            rating: selectedRating,
            comentario: comentario,
            fecha: new Date().toISOString()
        });

        // Actualizar estadísticas de la empresa
        const empresaRef = db.collection('empresas').doc(empresaId);
        await db.runTransaction(async (transaction) => {
            const empresaDoc = await transaction.get(empresaRef);
            const empresaData = empresaDoc.data();
            
            const totalReviews = (empresaData.total_reviews || 0) + 1;
            const sumaRatings = (empresaData.suma_ratings || 0) + selectedRating;
            const promedioRating = sumaRatings / totalReviews;

            transaction.update(empresaRef, {
                total_reviews: totalReviews,
                suma_ratings: sumaRatings,
                promedio_rating: promedioRating
            });
        });

        // Cerrar el modal y mostrar mensaje de éxito
        const modal = bootstrap.Modal.getInstance(document.getElementById('resenaModal'));
        modal.hide();
        mostrarAlerta('alertaExito', '¡Gracias por tu reseña!');
        
        // Recargar las empresas para mostrar la actualización
        cargarEmpresas();
    } catch (error) {
        console.error('Error al enviar reseña:', error);
        mostrarAlerta('alertaError', 'Error al enviar la reseña');
    }
}

// Función para mostrar alertas
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