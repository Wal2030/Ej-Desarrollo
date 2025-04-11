let empresas = [];

const ingresar = (req, res) => {
  console.log("📩 Body recibido:", req.body);

  // Asegurarse de usar el body ya parseado; si es Buffer, convertirlo.
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    body = body.toString();
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ mensaje: "Error al parsear el body", error: error.message });
    }
  }

  // Extraer los datos usando la variable 'body'
  const { nombre, email, password, password_confirmation } = body;

  // Validar campos faltantes
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

  // Validar que las contraseñas coincidan
  if (password !== password_confirmation) {
    return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
  }

  // Agregar la empresa (solo se guarda nombre y email)
  empresas.push({ nombre, email });
  console.log("✅ Empresa registrada:", { nombre, email });

  res.json({ mensaje: "Empresa registrada correctamente" });
};

const consultar = (req, res) => {
  res.json(empresas);
};

const actualizar = (req, res) => {
    const { email, nombre } = req.body;
  
    if (!email) {
      return res.status(400).json({ mensaje: "Falta el email" });
    }
  
    const empresa = empresas.find(e => e.email === email);
    if (!empresa) {
      return res.status(404).json({ mensaje: "Empresa no encontrada" });
    }
  
    if (nombre) empresa.nombre = nombre;
  
    console.log("🛠️ Empresa actualizada:", empresa);
  
    res.json({ mensaje: "Datos actualizados", empresa });
  };
  module.exports = { ingresar, consultar, actualizar };
  

