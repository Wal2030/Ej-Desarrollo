let empresas = [];

const ingresar = (req, res) => {
    console.log("📩 Body recibido:", req.body); // Asegúrate que NO sea {}
  
    const { nombre, email, password, password_confirmation } = req.body;
  
    if (!nombre || !email || !password || !password_confirmation) {
      return res.status(400).json({ mensaje: "Faltan datos", recibido: req.body });
    }
  
    if (password !== password_confirmation) {
      return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
    }
  
    empresas.push({ nombre, email });
    console.log("✅ Empresa registrada:", { nombre, email });
  
    res.json({ mensaje: "Empresa registrada correctamente" });
  };

const consultar = (req, res) => {
  res.json(empresas);
};

module.exports = { ingresar, consultar };
