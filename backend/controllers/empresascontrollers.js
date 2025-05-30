const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const { ROLES } = require('../config/roles');

const ingresar = async (req, res) => {
    try {
        let body = req.body;
        if (Buffer.isBuffer(body)) {
            body = JSON.parse(body.toString());
        }

        const { nombre, email, password } = body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: "Faltan datos requeridos",
                requeridos: ["nombre", "email", "password"]
            });
        }

        // Verificar si ya existe una empresa
        const empresaRef = db.collection('empresas');
        const snapshot = await empresaRef.where('email', '==', email).get();
        
        if (!snapshot.empty) {
            return res.status(400).json({ mensaje: "Ya existe una empresa con ese email" });
        }

        // Crear nueva empresa
        const id = uuidv4();
        const nuevaEmpresa = {
            id,
            nombre,
            email,
            rol: ROLES.EMPRESA,
            verificado: false,
            calificacion: 0,
            numeroResenas: 0,
            createdAt: new Date().toISOString(),
            notificaciones: []
        };

        // Guardar en Firebase
        await empresaRef.doc(id).set(nuevaEmpresa);

        // Crear documento de verificación
        await db.collection('verificaciones').doc(id).set({
            empresaId: id,
            estado: 'pendiente',
            documentos: [],
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            mensaje: "Empresa registrada correctamente. Pendiente de verificación.",
            empresa: nuevaEmpresa
        });
    } catch (error) {
        console.error('Error al registrar empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const verificarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, comentarios } = req.body;

        const empresaRef = db.collection('empresas').doc(id);
        const verificationRef = db.collection('verificaciones').doc(id);

        const [empresaDoc, verificationDoc] = await Promise.all([
            empresaRef.get(),
            verificationRef.get()
        ]);

        if (!empresaDoc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        await db.runTransaction(async (t) => {
            // Actualizar estado de verificación
            t.update(verificationRef, {
                estado,
                comentarios,
                updatedAt: new Date().toISOString()
            });

            // Actualizar empresa
            t.update(empresaRef, {
                verificado: estado === 'aprobado',
                updatedAt: new Date().toISOString()
            });

            // Crear notificación
            const notificacion = {
                id: uuidv4(),
                tipo: 'verificacion',
                mensaje: `Tu empresa ha sido ${estado === 'aprobado' ? 'verificada' : 'rechazada'}`,
                leida: false,
                createdAt: new Date().toISOString()
            };

            t.update(empresaRef, {
                notificaciones: admin.firestore.FieldValue.arrayUnion(notificacion)
            });
        });

        res.json({ mensaje: "Estado de verificación actualizado correctamente" });
    } catch (error) {
        console.error('Error al verificar empresa:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const agregarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario, usuarioId } = req.body;

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ mensaje: "La calificación debe estar entre 1 y 5" });
        }

        const empresaRef = db.collection('empresas').doc(id);
        const empresaDoc = await empresaRef.get();

        if (!empresaDoc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        const resena = {
            id: uuidv4(),
            calificacion,
            comentario,
            usuarioId,
            createdAt: new Date().toISOString()
        };

        await db.runTransaction(async (t) => {
            const doc = await t.get(empresaRef);
            const data = doc.data();
            
            // Calcular nueva calificación promedio
            const nuevaCalificacion = ((data.calificacion * data.numeroResenas) + calificacion) / (data.numeroResenas + 1);
            
            t.update(empresaRef, {
                calificacion: nuevaCalificacion,
                numeroResenas: data.numeroResenas + 1,
                resenas: admin.firestore.FieldValue.arrayUnion(resena)
            });

            // Crear notificación
            const notificacion = {
                id: uuidv4(),
                tipo: 'resena',
                mensaje: `Has recibido una nueva reseña con calificación ${calificacion}`,
                leida: false,
                createdAt: new Date().toISOString()
            };

            t.update(empresaRef, {
                notificaciones: admin.firestore.FieldValue.arrayUnion(notificacion)
            });
        });

        res.json({ mensaje: "Reseña agregada correctamente" });
    } catch (error) {
        console.error('Error al agregar reseña:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const obtenerNotificaciones = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaRef = db.collection('empresas').doc(id);
        const doc = await empresaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        const { notificaciones } = doc.data();
        res.json(notificaciones || []);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const marcarNotificacionLeida = async (req, res) => {
    try {
        const { id, notificacionId } = req.params;
        const empresaRef = db.collection('empresas').doc(id);
        const doc = await empresaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Empresa no encontrada" });
        }

        const { notificaciones } = doc.data();
        const notificacionIndex = notificaciones.findIndex(n => n.id === notificacionId);

        if (notificacionIndex === -1) {
            return res.status(404).json({ mensaje: "Notificación no encontrada" });
        }

        notificaciones[notificacionIndex].leida = true;
        await empresaRef.update({ notificaciones });

        res.json({ mensaje: "Notificación marcada como leída" });
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

const consultar = async (req, res) => {
    try {
        const empresasRef = db.collection('empresas');
        const snapshot = await empresasRef.get();
        
        const empresas = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Excluir información sensible
            const { notificaciones, ...empresaData } = data;
            empresas.push(empresaData);
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

module.exports = {
    ingresar,
    consultar,
    actualizar,
    eliminar,
    getUser,
    verificarEmpresa,
    agregarResena,
    obtenerNotificaciones,
    marcarNotificacionLeida
};

