const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const app = express();
const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas para empresas
app.get('/api/empresas', async (req, res) => {
    try {
        const snapshot = await db.collection('empresas').get();
        const empresas = [];
        snapshot.forEach(doc => {
            empresas.push({ id: doc.id, ...doc.data() });
        });
        res.json(empresas);
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({ error: 'Error al obtener empresas' });
    }
});

app.post('/api/empresas', async (req, res) => {
    try {
        const empresa = {
            ...req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('empresas').add(empresa);
        res.json({ id: docRef.id, ...empresa });
    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({ error: 'Error al crear empresa' });
    }
});

app.delete('/api/empresas/:id', async (req, res) => {
    try {
        await db.collection('empresas').doc(req.params.id).delete();
        res.json({ message: 'Empresa eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        res.status(500).json({ error: 'Error al eliminar empresa' });
    }
});

// Rutas para proyectos
app.get('/api/proyectos', async (req, res) => {
    try {
        const snapshot = await db.collection('proyectos').get();
        const proyectos = [];
        for (const doc of snapshot.docs) {
            const proyecto = { id: doc.id, ...doc.data() };
            // Obtener datos de la empresa asociada
            if (proyecto.empresaId) {
                const empresaDoc = await db.collection('empresas').doc(proyecto.empresaId).get();
                if (empresaDoc.exists) {
                    proyecto.empresaNombre = empresaDoc.data().nombre;
                }
            }
            proyectos.push(proyecto);
        }
        res.json(proyectos);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});

app.post('/api/proyectos', async (req, res) => {
    try {
        const proyecto = {
            ...req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('proyectos').add(proyecto);
        res.json({ id: docRef.id, ...proyecto });
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        res.status(500).json({ error: 'Error al crear proyecto' });
    }
});

app.delete('/api/proyectos/:id', async (req, res) => {
    try {
        await db.collection('proyectos').doc(req.params.id).delete();
        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
});

// Exportar el handler
exports.handler = serverless(app);
