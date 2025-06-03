// Verificar autenticación
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Verificar rol
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'cliente') {
        window.location.href = '/';
        return;
    }

    // Cargar datos del usuario
    document.getElementById('nombreUsuario').textContent = userDoc.data().nombre;
    
    // Cargar empresas verificadas
    cargarEmpresas();
    
    // Cargar reseñas del usuario
    cargarMisResenas(user.uid);
    
    // Cargar notificaciones
    cargarNotificaciones(user.uid);
});

// Cargar empresas verificadas
async function cargarEmpresas() {
    const empresasRef = db.collection('empresas').where('status', '==', 'verified');
    const snapshot = await empresasRef.get();
    const listaEmpresas = document.getElementById('listaEmpresas');
    listaEmpresas.innerHTML = '';

    if (snapshot.empty) {
        listaEmpresas.innerHTML = '<p class="text-center">No hay empresas verificadas disponibles</p>';
        return;
    }

    snapshot.forEach(doc => {
        const empresa = doc.data();
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${empresa.nombre}</h5>
                    <p class="mb-1">${empresa.direccion}</p>
                    <small>Teléfono: ${empresa.telefono}</small>
                    <div class="mt-2">
                        ${mostrarEstrellas(empresa.promedioCalificacion || 0)}
                        <small class="text-muted ms-2">(${empresa.totalResenas || 0} reseñas)</small>
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="abrirModalResena('${doc.id}', '${empresa.nombre}')">
                        Dejar Reseña
                    </button>
                </div>
            </div>
        `;
        listaEmpresas.appendChild(div);
    });
}

// Cargar reseñas del usuario
async function cargarMisResenas(userId) {
    const resenasRef = db.collection('resenas').where('usuarioId', '==', userId);
    const snapshot = await resenasRef.get();
    const misResenas = document.getElementById('misResenas');
    misResenas.innerHTML = '';

    if (snapshot.empty) {
        misResenas.innerHTML = '<p class="text-center">No has dejado reseñas aún</p>';
        return;
    }

    snapshot.forEach(doc => {
        const resena = doc.data();
        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h5 class="card-title">${resena.empresaNombre || 'Empresa'}</h5>
                    <div class="rating-display">
                        ${mostrarEstrellas(resena.calificacion)}
                    </div>
                </div>
                <p class="card-text">${resena.comentario}</p>
                <small class="text-muted">Fecha: ${new Date(resena.createdAt).toLocaleDateString()}</small>
            </div>
        `;
        misResenas.appendChild(div);
    });
}

// Función para mostrar estrellas
function mostrarEstrellas(calificacion) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            estrellas += '<i class="fas fa-star text-warning"></i>';
        } else {
            estrellas += '<i class="far fa-star"></i>';
        }
    }
    return estrellas;
}

// Abrir modal de reseña
function abrirModalResena(empresaId, empresaNombre) {
    document.getElementById('empresaId').value = empresaId;
    const modal = new bootstrap.Modal(document.getElementById('resenaModal'));
    modal.show();

    // Configurar el sistema de calificación
    const estrellas = document.querySelectorAll('.rating i');
    estrellas.forEach(estrella => {
        estrella.addEventListener('click', () => {
            const rating = estrella.dataset.rating;
            document.getElementById('calificacion').value = rating;
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

// Enviar reseña
async function enviarResena() {
    const empresaId = document.getElementById('empresaId').value;
    const calificacion = parseInt(document.getElementById('calificacion').value);
    const comentario = document.getElementById('comentario').value;

    if (!calificacion || !comentario) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const user = auth.currentUser;
        const empresaDoc = await db.collection('empresas').doc(empresaId).get();
        const empresa = empresaDoc.data();

        // Crear reseña
        await db.collection('resenas').add({
            empresaId,
            empresaNombre: empresa.nombre,
            usuarioId: user.uid,
            calificacion,
            comentario,
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        // Actualizar promedio de calificaciones
        const resenasRef = db.collection('resenas').where('empresaId', '==', empresaId);
        const snapshot = await resenasRef.get();
        let total = 0;
        let count = 0;
        snapshot.forEach(doc => {
            total += doc.data().calificacion;
            count++;
        });
        const promedio = total / count;

        await db.collection('empresas').doc(empresaId).update({
            promedioCalificacion: promedio,
            totalResenas: count
        });

        // Crear notificación para la empresa
        await db.collection('notificaciones').add({
            tipo: 'resena',
            titulo: 'Nueva reseña recibida',
            mensaje: `Un cliente ha dejado una reseña de ${calificacion} estrellas`,
            destinatarioId: empresaId,
            createdAt: new Date().toISOString(),
            leido: false,
            expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        // Cerrar modal y recargar reseñas
        bootstrap.Modal.getInstance(document.getElementById('resenaModal')).hide();
        cargarMisResenas(user.uid);
        alert('Reseña enviada exitosamente');
    } catch (error) {
        console.error('Error al enviar reseña:', error);
        alert('Error al enviar la reseña');
    }
}

// Cargar notificaciones
async function cargarNotificaciones(userId) {
    const notificacionesRef = db.collection('notificaciones')
        .where('destinatarioId', 'in', [userId, 'all'])
        .where('leido', '==', false)
        .orderBy('createdAt', 'desc');

    const snapshot = await notificacionesRef.get();
    const badge = document.getElementById('notificacionesBadge');
    const lista = document.getElementById('notificacionesList');
    lista.innerHTML = '';

    if (snapshot.empty) {
        lista.innerHTML = '<li><a class="dropdown-item text-center" href="#">No hay notificaciones</a></li>';
        badge.style.display = 'none';
        return;
    }

    badge.style.display = 'inline';
    badge.textContent = snapshot.size;

    snapshot.forEach(doc => {
        const notif = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
            <a class="dropdown-item" href="#" onclick="marcarLeida('${doc.id}')">
                <strong>${notif.titulo}</strong><br>
                <small>${notif.mensaje}</small>
            </a>
        `;
        lista.appendChild(li);
    });
}

// Marcar notificación como leída
async function marcarLeida(notifId) {
    try {
        await db.collection('notificaciones').doc(notifId).update({
            leido: true,
            fechaLectura: new Date().toISOString()
        });
        cargarNotificaciones(auth.currentUser.uid);
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
    }
} 