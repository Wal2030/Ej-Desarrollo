const { getFirestore } = require('./firebaseAdmin');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log(`Procesando solicitud ${event.httpMethod}`);
    const db = getFirestore();
    const empresasRef = db.collection('empresas');

    switch (event.httpMethod) {
      case 'GET':
        console.log('Obteniendo todas las empresas');
        const snapshot = await empresasRef.get();
        const empresas = [];
        snapshot.forEach(doc => {
          empresas.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Se encontraron ${empresas.length} empresas`);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(empresas)
        };

      case 'POST':
        console.log('Creando nueva empresa');
        const data = JSON.parse(event.body);
        
        // Validar datos requeridos
        const requiredFields = ['nombre', 'ruc', 'email'];
        for (const field of requiredFields) {
          if (!data[field]) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ message: `El campo ${field} es requerido` })
            };
          }
        }

        const docRef = await empresasRef.add({
          ...data,
          createdAt: new Date().toISOString()
        });
        console.log(`Empresa creada con ID: ${docRef.id}`);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ id: docRef.id, ...data })
        };

      case 'DELETE':
        const deleteId = event.queryStringParameters?.id;
        if (!deleteId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Se requiere el ID de la empresa' })
          };
        }

        console.log(`Eliminando empresa con ID: ${deleteId}`);
        const doc = await empresasRef.doc(deleteId).get();
        if (!doc.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Empresa no encontrada' })
          };
        }

        await empresasRef.doc(deleteId).delete();
        console.log('Empresa eliminada exitosamente');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Empresa eliminada exitosamente' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ message: 'Método no permitido' })
        };
    }
  } catch (error) {
    console.error('Error en la función:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      })
    };
  }
}; 