let empresas = [];

const ingresar = (req, res) => {
  console.log("Body recibido:", req.body);

  let body = req.body;
  if (Buffer.isBuffer(body)) {
    body = body.toString();
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ mensaje: "Error al parsear el body", error: error.message });
    }
  }

  const { nombre, email, password, password_confirmation } = body;

  const camposFaltantes = [];
  if (!nombre) camposFaltantes.push("nombre");
  if (!email) camposFaltantes.push("email");
  if (!password) camposFaltantes.push("password");
  if (!password_confirmation) camposFaltantes.push("password_confirmation");

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      mensaje: "Faltan datos",
      faltan: camposFaltantes,
      recibido: body,
    });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ mensaje: "La contraseña no coincide" });
  }

  empresas.push({ nombre, email });
  console.log("Empresa registrada:", { nombre, email });

  res.json({ mensaje: "Empresa registrada correctamente" });
};

const consultar = (req, res) => {
  res.json(empresas);
};

const actualizar = (req, res) => {
    let body = req.body;

    if (Buffer.isBuffer(body)) {
      body = body.toString();
      try {
        body = JSON.parse(body);
      } catch (error) {
        return res.status(400).json({ mensaje: "Error al parsear el body", error: error.message });
      }
    }
  
    const { email, nombre } = body;
  
    if (!email) {
      return res.status(400).json({ mensaje: "Falta el email", bodyRecibido: body });
    }
  
    const empresa = empresas.find(e => e.email === email);
    if (!empresa) {
      return res.json({ mensaje: "No se encontró ninguna empresa con ese correo" });
    }
  
    if (nombre) empresa.nombre = nombre;
  
    console.log("Empresa actualizada:", empresa);
  
    res.json({ mensaje: "Datos actualizados", empresa });
  };
  const eliminar = (req, res) => {
    let body = req.body;
  
    if (Buffer.isBuffer(body)) {
      body = body.toString();
      try {
        body = JSON.parse(body);
      } catch (error) {
        return res.status(400).json({ mensaje: "Error al parsear el body", error: error.message });
      }
    }
  
    const { email } = body;
  
    if (!email) {
      return res.status(400).json({ mensaje: "Falta el email para eliminar" });
    }
  
    const indice = empresas.findIndex(e => e.email === email);
    if (indice === -1) {
      return res.json({ mensaje: "No se encontró ninguna empresa con ese email" });
    }
  
    empresas.splice(indice, 1);
    console.log(`Empresa con email ${email} eliminada`);
  
    res.json({ mensaje: "Empresa eliminada" });
  };

  const admin = require("firebase-admin");
  const db = admin.firestore();
  
  const getUser = async (req, res) => {
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).json({ mensaje: "Falta el ID del usuario" });
    }
  
    // Buscar primero en el arreglo local
    const empresa = empresas.find(e => e.email === id || e.nombre === id);
  
    if (empresa) {
      return res.json({ fuente: "local", ...empresa });
    }
  
    // Si no está localmente, buscar en Firebase
    try {
      const docRef = db.collection("users").doc(id);
      const doc = await docRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ mensaje: "Usuario no encontrado ni en local ni en Firebase" });
      }
  
      return res.json({ fuente: "firebase", id: doc.id, ...doc.data() });
    } catch (error) {
      return res.status(500).json({ mensaje: "Error al obtener el usuario desde Firebase", error: error.message });
    }
  };
  
  
  module.exports = { ingresar, consultar, actualizar, eliminar, getUser  };
  

