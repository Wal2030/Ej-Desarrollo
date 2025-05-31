require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const admin = require('firebase-admin');

// Middleware para logging
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Inicializar Firebase Admin
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        console.log('Firebase Admin inicializado correctamente');
    }
} catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
}

const db = admin.firestore();

// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// Rutas para empresas
app.get('/empresas', async (req, res) => {
    try {
        console.log('Obteniendo empresas...');
        const snapshot = await db.collection('empresas').get();
        const empresas = [];
        snapshot.forEach(doc => {
            empresas.push({ id: doc.id, ...doc.data() });
        });
        console.log('Empresas obtenidas:', empresas.length);
        res.json(empresas);
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({ error: 'Error al obtener empresas', details: error.message });
    }
});

app.post('/empresas', async (req, res) => {
    try {
        console.log('Creando nueva empresa:', req.body);
        const empresa = {
            ...req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('empresas').add(empresa);
        const nuevaEmpresa = { id: docRef.id, ...empresa };
        console.log('Empresa creada:', nuevaEmpresa);
        res.json(nuevaEmpresa);
    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({ error: 'Error al crear empresa', details: error.message });
    }
});

app.delete('/empresas/:id', async (req, res) => {
    try {
        await db.collection('empresas').doc(req.params.id).delete();
        res.json({ message: 'Empresa eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        res.status(500).json({ error: 'Error al eliminar empresa' });
    }
});

// Rutas para proyectos
app.get('/proyectos', async (req, res) => {
    try {
        const snapshot = await db.collection('proyectos').get();
        const proyectos = [];
        for (const doc of snapshot.docs) {
            const proyecto = { id: doc.id, ...doc.data() };
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

app.post('/proyectos', async (req, res) => {
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

app.delete('/proyectos/:id', async (req, res) => {
    try {
        await db.collection('proyectos').doc(req.params.id).delete();
        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

// Exportar el handler
exports.handler = serverless(app);
