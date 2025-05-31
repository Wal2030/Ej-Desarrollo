const { getFirestore } = require('./firebaseAdmin');
const { requireAuth, requireRole, unauthorized } = require('./middleware/auth');

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

  const db = getFirestore();

  try {
    switch (event.httpMethod) {
      case 'POST':
        // Solo empresas y admins pueden crear notificaciones
        const authResult = await requireRole(event, ['empresa', 'admin']);
        if (!authResult.isAuthorized) {
          return unauthorized(authResult.error);
        }

        const { tipo, titulo, mensaje, destinatarioId, accion } = JSON.parse(event.body);
        
        if (!tipo || !titulo || !mensaje) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Faltan datos requeridos' })
          };
        }

        // Verificar tipo válido
        const tiposValidos = ['promocion', 'actualizacion', 'verificacion'];
        if (!tiposValidos.includes(tipo)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Tipo de notificación inválido' })
          };
        }

        // Si es una empresa, solo puede enviar a sus clientes
        if (authResult.role === 'empresa') {
          // Aquí podrías agregar lógica para verificar que el destinatario
          // sea un cliente de la empresa
        }

        const notificacionRef = await db.collection('notificaciones').add({
          tipo,
          titulo,
          mensaje,
          destinatarioId: destinatarioId || 'all',
          createdAt: new Date().toISOString(),
          leido: false,
          expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          accion: accion || null,
          emisorId: authResult.user.uid,
          emisorTipo: authResult.role
        });

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            message: 'Notificación creada exitosamente',
            notificacionId: notificacionRef.id
          })
        };

      case 'GET':
        // Cualquier usuario autenticado puede ver sus notificaciones
        const userAuth = await requireAuth(event);
        if (!userAuth.isAuthorized) {
          return unauthorized(userAuth.error);
        }

        const { leido } = event.queryStringParameters || {};
        let query = db.collection('notificaciones')
          .where('destinatarioId', 'in', [userAuth.user.uid, 'all'])
          .orderBy('createdAt', 'desc');

        if (leido !== undefined) {
          query = query.where('leido', '==', leido === 'true');
        }

        const snapshot = await query.get();
        const notificaciones = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          // No mostrar notificaciones expiradas
          if (new Date(data.expiraEn) > new Date()) {
            notificaciones.push({
              id: doc.id,
              ...data
            });
          }
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(notificaciones)
        };

      case 'PUT':
        // Marcar como leída
        const userAuthPut = await requireAuth(event);
        if (!userAuthPut.isAuthorized) {
          return unauthorized(userAuthPut.error);
        }

        const { notificacionId } = JSON.parse(event.body);
        
        if (!notificacionId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de notificación requerido' })
          };
        }

        const notificacion = await db.collection('notificaciones').doc(notificacionId).get();
        
        if (!notificacion.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Notificación no encontrada' })
          };
        }

        // Verificar que la notificación sea para este usuario
        const notificacionData = notificacion.data();
        if (notificacionData.destinatarioId !== userAuthPut.user.uid && notificacionData.destinatarioId !== 'all') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'No tienes permiso para modificar esta notificación' })
          };
        }

        await db.collection('notificaciones').doc(notificacionId).update({
          leido: true,
          fechaLectura: new Date().toISOString()
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Notificación marcada como leída' })
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