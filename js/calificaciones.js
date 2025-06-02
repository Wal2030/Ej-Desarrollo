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