const admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}

const db = admin.firestore();
let empresas = [];

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
        requeridos: ["nombre", "email", "password"],
        recibido: Object.keys(body)
      });
    }

    // Verificar si ya existe una empresa con ese email
    const empresaExistente = empresas.find(e => e.email === email);
    if (empresaExistente) {
      return res.status(400).json({ mensaje: "Ya existe una empresa con ese email" });
    }

    // Crear nueva empresa con ID único
    const nuevaEmpresa = {
      id: uuidv4(),
      nombre,
      email,
      createdAt: new Date().toISOString()
    };

    empresas.push(nuevaEmpresa);

    // También guardar en Firebase si está disponible
    try {
      await db.collection('empresas').doc(nuevaEmpresa.id).set(nuevaEmpresa);
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
      // Continuar aunque falle Firebase
    }

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
    // Obtener empresas tanto locales como de Firebase
    let todasEmpresas = [...empresas];

    try {
      const snapshot = await db.collection('empresas').get();
      snapshot.forEach(doc => {
        if (!empresas.find(e => e.id === doc.id)) {
          todasEmpresas.push({ id: doc.id, ...doc.data() });
        }
      });
    } catch (error) {
      console.error('Error al consultar Firebase:', error);
      // Continuar con las empresas locales si Firebase falla
    }

    res.json(todasEmpresas);
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

    // Actualizar en memoria
    const empresa = empresas.find(e => e.id === id);
    if (empresa) {
      if (nombre) empresa.nombre = nombre;
      if (email) empresa.email = email;
      empresa.updatedAt = new Date().toISOString();
    }

    // Actualizar en Firebase
    try {
      await db.collection('empresas').doc(id).update({
        ...body,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al actualizar en Firebase:', error);
    }

    res.json({
      mensaje: "Empresa actualizada correctamente",
      empresa: empresa || { id, ...body }
    });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar de memoria
    const index = empresas.findIndex(e => e.id === id);
    if (index !== -1) {
      empresas.splice(index, 1);
    }

    // Eliminar de Firebase
    try {
      await db.collection('empresas').doc(id).delete();
    } catch (error) {
      console.error('Error al eliminar de Firebase:', error);
    }

    res.json({ mensaje: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar en memoria
    const empresaLocal = empresas.find(e => e.id === id);
    if (empresaLocal) {
      return res.json(empresaLocal);
    }

    // Buscar en Firebase
    try {
      const doc = await db.collection('empresas').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ mensaje: "Empresa no encontrada" });
      }
      return res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error al consultar Firebase:', error);
      return res.status(500).json({ mensaje: "Error al consultar la base de datos" });
    }
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

module.exports = { ingresar, consultar, actualizar, eliminar, getUser };

