// Función para hacer admin a un usuario
async function hacerAdmin(email) {
    try {
        // Buscar el usuario por email
        const userQuery = await firebase.firestore().collection('users')
            .where('email', '==', email)
            .get();

        if (userQuery.empty) {
            throw new Error('Usuario no encontrado');
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Actualizar el rol a admin
        await firebase.firestore().collection('users').doc(userDoc.id).update({
            role: 'admin',
            updatedAt: new Date().toISOString()
        });

        return { success: true, mensaje: `Usuario ${email} ahora es administrador` };
    } catch (error) {
        console.error('Error al hacer admin:', error);
        throw error;
    }
}

// Función para obtener empresas pendientes
async function obtenerEmpresasPendientes() {
    try {
        const empresasQuery = await firebase.firestore().collection('empresas')
            .where('status', '==', 'pending')
            .get();

        const empresas = [];
        empresasQuery.forEach(doc => {
            empresas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return empresas;
    } catch (error) {
        console.error('Error al obtener empresas pendientes:', error);
        throw error;
    }
}

// Función para aprobar o rechazar una empresa
async function gestionarEmpresa(empresaId, accion, motivo = '') {
    try {
        const empresaRef = firebase.firestore().collection('empresas').doc(empresaId);
        const userRef = firebase.firestore().collection('users').doc(empresaId);

        const empresa = await empresaRef.get();
        if (!empresa.exists) {
            throw new Error('Empresa no encontrada');
        }

        const nuevoStatus = accion === 'aprobar' ? 'active' : 'rejected';
        const timestamp = new Date().toISOString();

        // Actualizar empresa
        await empresaRef.update({
            status: nuevoStatus,
            updatedAt: timestamp,
            ...(motivo && { motivoRechazo: motivo })
        });

        // Actualizar usuario
        await userRef.update({
            status: nuevoStatus,
            updatedAt: timestamp
        });

        return {
            success: true,
            mensaje: `Empresa ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`
        };
    } catch (error) {
        console.error('Error al gestionar empresa:', error);
        throw error;
    }
} 