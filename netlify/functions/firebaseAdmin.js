const admin = require('firebase-admin');

let firebaseApp;

function initializeFirebase() {
  if (!firebaseApp && !admin.apps.length) {
    try {
      // Verificar variables de entorno requeridas
      const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`La variable de entorno ${envVar} es requerida`);
        }
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });

      console.log('Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar Firebase Admin:', error);
      throw error;
    }
  }
  return firebaseApp;
}

module.exports = {
  initializeFirebase,
  getFirestore: () => {
    initializeFirebase();
    return admin.firestore();
  }
};