// Verificar autenticación
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Verificar rol
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'empresa') {
        window.location.href = '/';
        return;
    }

    // Cargar datos de la empresa
    cargarDatosEmpresa(user.uid);
    
    // Cargar reseñas
    cargarResenas(user.uid);
    
    // Cargar notificaciones
    cargarNotificaciones(user.uid);
});

// Cargar datos de la empresa
async function cargarDatosEmpresa(empresaId) {
    const empresaDoc = await db.collection('empresas').doc(empresaId).get();
    const empresa = empresaDoc.data();

    document.getElementById('nombreEmpresa').textContent = empresa.nombre;
    document.getElementById('rucEmpresa').textContent = empresa.ruc;
    document.getElementById('direccionEmpresa').textContent = empresa.direccion;
    document.getElementById('telefonoEmpresa').textContent = empresa.telefono;

    const estadoBadge = document.getElementById('estadoEmpresa');
    estadoBadge.textContent = empresa.status.toUpperCase();
    
    switch(empresa.status) {
        case 'pending':
            estadoBadge.className = 'badge bg-warning';
            mostrarAlertaEstado('warning', 'Tu empresa está pendiente de verificación');
            break;
        case 'verified':
            estadoBadge.className = 'badge bg-success';
            break;
        case 'rejected':
            estadoBadge.className = 'badge bg-danger';
            mostrarAlertaEstado('danger', 'Tu solicitud ha sido rechazada. Por favor, actualiza tus documentos.');
            break;
    }
}

// Mostrar alerta de estado
function mostrarAlertaEstado(tipo, mensaje) {
    const alert = document.getElementById('statusAlert');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alert.classList.remove('d-none');
}

// Cargar reseñas
async function cargarResenas(empresaId) {
    const resenasRef = db.collection('resenas')
        .where('empresaId', '==', empresaId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc');

    const snapshot = await resenasRef.get();
    const listaResenas = document.getElementById('listaResenas');
    listaResenas.innerHTML = '';

    if (snapshot.empty) {
        listaResenas.innerHTML = '<p class="text-center">No hay reseñas aún</p>';
        document.getElementById('promedioCalificacion').textContent = 'N/A';
        return;
    }

    let totalCalificacion = 0;
    let count = 0;

    snapshot.forEach(doc => {
        const resena = doc.data();
        totalCalificacion += resena.calificacion;
        count++;

        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="rating-display">
                        ${mostrarEstrellas(resena.calificacion)}
                    </div>
                    <small class="text-muted">
                        ${new Date(resena.createdAt).toLocaleDateString()}
                    </small>
                </div>
                <p class="card-text mt-2">${resena.comentario}</p>
                ${resena.respuestaEmpresa ? `
                    <div class="mt-3 p-3 bg-light">
                        <strong>Tu respuesta:</strong>
                        <p class="mb-0">${resena.respuestaEmpresa.comentario}</p>
                    </div>
                ` : `
                    <button class="btn btn-outline-primary btn-sm mt-2" 
                            onclick="abrirModalRespuesta('${doc.id}')">
                        Responder
                    </button>
                `}
            </div>
        `;
        listaResenas.appendChild(div);
    });

    // Actualizar promedio
    const promedio = totalCalificacion / count;
    document.getElementById('promedioCalificacion').textContent = promedio.toFixed(1);
    document.getElementById('ratingPromedio').innerHTML = mostrarEstrellas(Math.round(promedio));
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

// Editar perfil
function editarPerfil() {
    const empresaId = auth.currentUser.uid;
    db.collection('empresas').doc(empresaId).get().then(doc => {
        const empresa = doc.data();
        document.getElementById('editNombre').value = empresa.nombre;
        document.getElementById('editDireccion').value = empresa.direccion;
        document.getElementById('editTelefono').value = empresa.telefono;
        
        const modal = new bootstrap.Modal(document.getElementById('perfilModal'));
        modal.show();
    });
}

// Guardar cambios del perfil
async function guardarPerfil() {
    const empresaId = auth.currentUser.uid;
    const nombre = document.getElementById('editNombre').value;
    const direccion = document.getElementById('editDireccion').value;
    const telefono = document.getElementById('editTelefono').value;
    const rucDoc = document.getElementById('editRucDoc').files[0];
    const licenciaDoc = document.getElementById('editLicenciaDoc').files[0];

    try {
        const actualizacion = {
            nombre,
            direccion,
            telefono,
            updatedAt: new Date().toISOString()
        };

        // Si hay nuevos documentos, subirlos
        if (rucDoc) {
            actualizacion['documentosVerificacion.rucDoc'] = await subirDocumento(rucDoc, `empresas/${empresaId}/ruc`);
        }
        if (licenciaDoc) {
            actualizacion['documentosVerificacion.licenciaFuncionamiento'] = await subirDocumento(licenciaDoc, `empresas/${empresaId}/licencia`);
        }

        // Si se subieron nuevos documentos, cambiar estado a pendiente
        if (rucDoc || licenciaDoc) {
            actualizacion.status = 'pending';
        }

        await db.collection('empresas').doc(empresaId).update(actualizacion);

        bootstrap.Modal.getInstance(document.getElementById('perfilModal')).hide();
        cargarDatosEmpresa(empresaId);
        alert('Perfil actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        alert('Error al actualizar el perfil');
    }
}

// Subir documento
async function subirDocumento(file, path) {
    const storageRef = storage.ref(path);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
}

// Abrir modal de respuesta
function abrirModalRespuesta(resenaId) {
    document.getElementById('resenaId').value = resenaId;
    const modal = new bootstrap.Modal(document.getElementById('respuestaModal'));
    modal.show();
}

// Enviar respuesta a reseña
async function enviarRespuesta() {
    const resenaId = document.getElementById('resenaId').value;
    const respuesta = document.getElementById('respuesta').value;

    if (!respuesta) {
        alert('Por favor escribe una respuesta');
        return;
    }

    try {
        await db.collection('resenas').doc(resenaId).update({
            'respuestaEmpresa': {
                comentario: respuesta,
                fecha: new Date().toISOString()
            }
        });

        // Crear notificación para el cliente
        const resenaDoc = await db.collection('resenas').doc(resenaId).get();
        const resena = resenaDoc.data();

        await db.collection('notificaciones').add({
            tipo: 'respuesta_resena',
            titulo: 'La empresa respondió tu reseña',
            mensaje: 'Han respondido a tu reseña. Haz clic para ver la respuesta.',
            destinatarioId: resena.usuarioId,
            createdAt: new Date().toISOString(),
            leido: false,
            expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        bootstrap.Modal.getInstance(document.getElementById('respuestaModal')).hide();
        cargarResenas(auth.currentUser.uid);
        alert('Respuesta enviada exitosamente');
    } catch (error) {
        console.error('Error al enviar respuesta:', error);
        alert('Error al enviar la respuesta');
    }
}

// Cargar notificaciones
async function cargarNotificaciones(empresaId) {
    const notificacionesRef = db.collection('notificaciones')
        .where('destinatarioId', 'in', [empresaId, 'all'])
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

// Mostrar perfil
function mostrarPerfil() {
    editarPerfil(); // Reutilizamos la función existente que ya muestra el modal con los datos
} 