const { getFirestore } = require('./firebaseAdmin');
const { requireRole, unauthorized, forbidden } = require('./middleware/auth');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Verificar autenticación y rol
  const authResult = await requireRole(event, ['admin']);
  if (!authResult.isAuthorized) {
    return unauthorized(authResult.error);
  }

  const db = getFirestore();

  try {
    switch (event.httpMethod) {
      case 'POST':
        const { empresaId, status, comentarios } = JSON.parse(event.body);
        
        if (!empresaId || !status) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Faltan datos requeridos' })
          };
        }

        // Verificar que el status sea válido
        const statusValidos = ['verified', 'rejected', 'pending'];
        if (!statusValidos.includes(status)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Estado de verificación inválido' })
          };
        }

        // Obtener la empresa
        const empresaRef = db.collection('empresas').doc(empresaId);
        const empresa = await empresaRef.get();

        if (!empresa.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Empresa no encontrada' })
          };
        }

        // Actualizar estado de verificación
        await empresaRef.update({
          status,
          verificadoPor: authResult.user.uid,
          fechaVerificacion: new Date().toISOString(),
          comentariosVerificacion: comentarios || null
        });

        // Crear notificación para la empresa
        await db.collection('notificaciones').add({
          tipo: 'verificacion',
          titulo: `Tu empresa ha sido ${status === 'verified' ? 'verificada' : 'rechazada'}`,
          mensaje: comentarios || `Tu empresa ha sido ${status === 'verified' ? 'verificada exitosamente' : 'rechazada'}`,
          destinatarioId: empresa.data().uid,
          createdAt: new Date().toISOString(),
          leido: false,
          expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Estado de verificación actualizado exitosamente',
            empresaId,
            status
          })
        };

      case 'GET':
        const { estado } = event.queryStringParameters || {};
        let query = db.collection('empresas');
        
        if (estado) {
          query = query.where('status', '==', estado);
        }

        const snapshot = await query.get();
        const empresas = [];
        
        snapshot.forEach(doc => {
          empresas.push({
            id: doc.id,
            ...doc.data()
          });
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(empresas)
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método no permitido' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
}; 