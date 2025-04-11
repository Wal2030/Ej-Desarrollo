// backend/controllers/empresascontrollers.js
let empresas = [];

const ingresar = (req, res) => {
    console.log("📩 Body recibido:", req.body); // Útil para depurar
  
    const { nombre, email, password, password_confirmation } = req.body;
  
    // 1. Validar campos faltantes
    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push("nombre");
    if (!email) camposFaltantes.push("email");
    if (!password) camposFaltantes.push("password");
    if (!password_confirmation) camposFaltantes.push("password_confirmation");
  
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        mensaje: "Faltan datos",
        faltan: camposFaltantes,
        recibido: req.body,
      });
    }
  
    // 2. Verificar si las contraseñas coinciden
    if (password !== password_confirmation) {
      return res.status(400).json({
        mensaje: "Las contraseñas no coinciden",
      });
    }
  
    // 3. Guardar empresa
    empresas.push({ nombre, email });
    console.log("✅ Empresa registrada:", { nombre, email });
  
    res.json({ mensaje: "Empresa registrada correctamente" });
  };

const consultar = (req, res) => {
  res.json(empresas);
};

module.exports = { ingresar, consultar };