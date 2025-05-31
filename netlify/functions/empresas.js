const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

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
    const empresasRef = db.collection('empresas');

    switch (event.httpMethod) {
      case 'GET':
        const snapshot = await empresasRef.get();
        const empresas = [];
        snapshot.forEach(doc => {
          empresas.push({ id: doc.id, ...doc.data() });
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(empresas)
        };

      case 'POST':
        const data = JSON.parse(event.body);
        const docRef = await empresasRef.add({
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ id: docRef.id, ...data })
        };

      case 'PUT':
        const { id, ...updateData } = JSON.parse(event.body);
        await empresasRef.doc(id).update({
          ...updateData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Empresa actualizada exitosamente' })
        };

      case 'DELETE':
        const deleteId = event.queryStringParameters.id;
        await empresasRef.doc(deleteId).delete();
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
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message })
    };
  }
}; 