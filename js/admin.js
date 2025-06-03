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
        const snapshot = await empresasRef.where('status', '==', 'pending').get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener empresas pendientes:', error);
        throw new Error('Error al cargar empresas pendientes');
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