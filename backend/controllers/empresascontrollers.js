let empresas = [];

const ingresar = (req, res) => {
    console.log("📩 Body recibido:", req.body);
    console.log("Tipo de body:", typeof req.body);
    console.log("Nombre:", req.body.nombre);
    console.log("Email:", req.body.email);
    console.log("Password:", req.body.password);
    console.log("Confirmación:", req.body.password_confirmation);
  
    const { nombre, email, password, password_confirmation } = req.body;
  
    if (!nombre || !email || !password || !password_confirmation) {
      console.log("❌ Faltan datos - campos vacíos");
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
  console.log("📄 Consultando empresas:", empresas);
  res.json(empresas);
};

module.exports = {
  ingresar,
  consultar
};
