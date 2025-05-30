const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Reemplazar los saltos de línea en la clave privada
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
        console.log('Firebase inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
    }
}

const db = admin.firestore();

module.exports = { admin, db }; 