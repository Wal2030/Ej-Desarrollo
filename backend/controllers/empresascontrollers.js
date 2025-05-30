const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');

const ingresar = async (req, res) => {
    try {
        let body = req.body;
        if (Buffer.isBuffer(body)) {
            body = JSON.parse(body.toString());
        }

        const { nombre, email, password } = body;

        // Validación de campos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: "Faltan datos requeridos",
                requeridos: ["nombre", "email", "password"]
            });
        }

        // Verificar si ya existe una empresa con ese email
        const empresaRef = db.collection('empresas');
        const snapshot = await empresaRef.where('email', '==', email).get();
        
        if (!snapshot.empty) {
            return res.status(400).json({ mensaje: "Ya existe una empresa con ese email" });
        }

        // Crear nueva empresa con ID único
        const id = uuidv4();
        const nuevaEmpresa = {
            id,
            nombre,
            email,
            createdAt: new Date().toISOString()
        };

        // Guardar en Firebase
        await empresaRef.doc(id).set(nuevaEmpresa);

        res.status(201).json({
            mensaje: "Empresa registrada correctamente",
            empresa: nuevaEmpresa
        });
    } catch (error) {
        console.error('Error al registrar empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const consultar = async (req, res) => {
    try {
        const empresasRef = db.collection('empresas');
        const snapshot = await empresasRef.get();
        
        const empresas = [];
        snapshot.forEach(doc => {
            empresas.push({ id: doc.id, ...doc.data() });
        });

        res.json(empresas);
    } catch (error) {
        console.error('Error al consultar empresas:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        let body = req.body;
        if (Buffer.isBuffer(body)) {
            body = JSON.parse(body.toString());
        }

        const { nombre, email } = body;

        if (!nombre && !email) {
            return res.status(400).json({ mensaje: "No hay datos para actualizar" });
        }

        const empresaRef = db.collection('empresas').doc(id);
        const doc = await empresaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        const datosActualizar = {
            ...body,
            updatedAt: new Date().toISOString()
        };

        await empresaRef.update(datosActualizar);

        res.json({
            mensaje: "Empresa actualizada correctamente",
            empresa: { id, ...datosActualizar }
        });
    } catch (error) {
        console.error('Error al actualizar empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaRef = db.collection('empresas').doc(id);
        const doc = await empresaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        await empresaRef.delete();
        res.json({ mensaje: "Empresa eliminada correctamente" });
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaRef = db.collection('empresas').doc(id);
        const doc = await empresaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

module.exports = { ingresar, consultar, actualizar, eliminar, getUser };

