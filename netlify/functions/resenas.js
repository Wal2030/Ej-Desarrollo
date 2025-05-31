const { getFirestore } = require('./firebaseAdmin');
const { requireAuth, unauthorized } = require('./middleware/auth');

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

  // Verificar autenticación
  const authResult = await requireAuth(event);
  if (!authResult.isAuthorized) {
    return unauthorized(authResult.error);
  }

  const db = getFirestore();

  try {
    switch (event.httpMethod) {
      case 'POST':
        const { productoId, calificacion, comentario } = JSON.parse(event.body);
        
        if (!productoId || !calificacion) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Faltan datos requeridos' })
          };
        }

        // Verificar que la calificación sea válida
        if (calificacion < 1 || calificacion > 5) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'La calificación debe estar entre 1 y 5' })
          };
        }

        // Obtener el producto
        const productoRef = db.collection('productos').doc(productoId);
        const producto = await productoRef.get();

        if (!producto.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Producto no encontrado' })
          };
        }

        // Crear la reseña
        const resenaRef = await db.collection('resenas').add({
          productoId,
          empresaId: producto.data().empresaId,
          usuarioId: authResult.user.uid,
          calificacion,
          comentario: comentario || '',
          createdAt: new Date().toISOString(),
          status: 'active'
        });

        // Actualizar promedio de calificaciones del producto
        const resenasSnapshot = await db.collection('resenas')
          .where('productoId', '==', productoId)
          .where('status', '==', 'active')
          .get();

        let totalCalificaciones = 0;
        let numeroResenas = 0;

        resenasSnapshot.forEach(doc => {
          totalCalificaciones += doc.data().calificacion;
          numeroResenas++;
        });

        const promedioCalificacion = totalCalificaciones / numeroResenas;

        await productoRef.update({
          promedioCalificacion,
          totalResenas: numeroResenas
        });

        // Notificar a la empresa
        await db.collection('notificaciones').add({
          tipo: 'resena',
          titulo: 'Nueva reseña en tu producto',
          mensaje: `Un cliente ha dejado una reseña de ${calificacion} estrellas en tu producto ${producto.data().nombre}`,
          destinatarioId: producto.data().empresaId,
          createdAt: new Date().toISOString(),
          leido: false,
          expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            message: 'Reseña creada exitosamente',
            resenaId: resenaRef.id
          })
        };

      case 'GET':
        const { productoId: pid } = event.queryStringParameters || {};
        let query = db.collection('resenas');
        
        if (pid) {
          query = query.where('productoId', '==', pid);
        }

        query = query.where('status', '==', 'active')
                    .orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        const resenas = [];
        
        snapshot.forEach(doc => {
          resenas.push({
            id: doc.id,
            ...doc.data()
          });
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(resenas)
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