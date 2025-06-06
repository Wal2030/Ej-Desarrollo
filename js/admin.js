// Función para hacer admin a un usuario
async function hacerAdmin(email) {
    try {
        // Buscar usuario por email
        const usersRef = firebase.firestore().collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (snapshot.empty) {
            throw new Error('No se encontró ningún usuario con ese correo');
        }

        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
            role: 'admin',
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            mensaje: `${email} ahora es administrador`
        };
    } catch (error) {
        console.error('Error al hacer admin:', error);
        throw new Error('Error al asignar rol de administrador');
    }
}

// Función para obtener empresas pendientes
async function obtenerEmpresasPendientes() {
    try {
        const empresasRef = firebase.firestore().collection('empresas');
        const snapshot = await empresasRef
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            console.log('No hay empresas registradas');
            return [];
        }

        console.log(`Se encontraron ${snapshot.size} empresas`);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        throw new Error('Error al cargar empresas');
    }
}

// Función para gestionar empresa (aprobar/rechazar)
async function gestionarEmpresa(empresaId, accion, motivo = '') {
    try {
        const empresaRef = firebase.firestore().collection('empresas').doc(empresaId);
        const empresa = await empresaRef.get();

        if (!empresa.exists) {
            throw new Error('Empresa no encontrada');
        }

        const actualizacion = {
            status: accion === 'aprobar' ? 'verified' : 'rejected',
            updatedAt: new Date().toISOString(),
            verificadoPor: {
                uid: firebase.auth().currentUser.uid,
                email: firebase.auth().currentUser.email,
                fecha: new Date().toISOString()
            }
        };

        if (accion === 'rechazar') {
            actualizacion.motivoRechazo = motivo;
        }

        await empresaRef.update(actualizacion);

        // Crear notificación para la empresa
        await firebase.firestore().collection('notificaciones').add({
            tipo: accion === 'aprobar' ? 'empresa_aprobada' : 'empresa_rechazada',
            titulo: accion === 'aprobar' ? 'Empresa Verificada' : 'Verificación Rechazada',
            mensaje: accion === 'aprobar' 
                ? 'Tu empresa ha sido verificada exitosamente' 
                : `Tu verificación ha sido rechazada. Motivo: ${motivo}`,
            destinatarioId: empresaId,
            createdAt: new Date().toISOString(),
            leido: false,
            expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        return {
            success: true,
            mensaje: `Empresa ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`
        };
    } catch (error) {
        console.error('Error al gestionar empresa:', error);
        throw new Error(`Error al ${accion} la empresa`);
    }
}

// Función para arreglar timestamps de empresas
async function arreglarTimestamps() {
    try {
        const empresasRef = firebase.firestore().collection('empresas');
        const snapshot = await empresasRef.get();

        let actualizadas = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!data.createdAt) {
                await doc.ref.update({
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: data.status || 'pending' // Aseguramos que tenga un status
                });
                actualizadas++;
                console.log(`Timestamp agregado a empresa ${doc.id}`);
            }
        }
        mostrarAlerta('alertaExito', `Proceso completado. ${actualizadas} empresas actualizadas.`);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('alertaError', 'Error al actualizar timestamps: ' + error.message);
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
    } else {
        console.log(mensaje);
    }
} 