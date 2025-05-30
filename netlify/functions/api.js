const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { verificarToken } = require('../../backend/middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
const empresasRoutes = require('../../backend/routes/empresasroutes');

// Ruta de prueba/salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Aplicar middleware de autenticación a todas las rutas excepto las públicas
app.use('/empresas', (req, res, next) => {
    // Lista de rutas públicas que no requieren autenticación
    const rutasPublicas = [
        { path: '/empresas', method: 'GET' },
        { path: '/empresas', method: 'POST' },
        { path: new RegExp('^/empresas/[^/]+$'), method: 'GET' }
    ];

    const esRutaPublica = rutasPublicas.some(ruta => {
        if (ruta.path instanceof RegExp) {
            return ruta.path.test(req.originalUrl) && req.method === ruta.method;
        }
        return req.originalUrl.startsWith(ruta.path) && req.method === ruta.method;
    });

    if (esRutaPublica) {
        return next();
    }

    return verificarToken(req, res, next);
});

// Usar rutas
app.use('/empresas', empresasRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// Exportar el handler para Netlify Functions
module.exports.handler = serverless(app);
