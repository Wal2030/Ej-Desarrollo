let empresas = [];

const ingresar = (req, res) => {
  console.log("📩 Body recibido:", req.body);
  const { nombre, email, password, password_confirmation } = req.body;

  if (!nombre || !email || !password || !password_confirmation) {
    console.log("❌ Faltan datos");
    return res.status(400).json({ mensaje: "Faltan datos", recibido: req.body });
  }

  if (password !== password_confirmation) {
    console.log("❌ Las contraseñas no coinciden");
    return res.status(400).json({ mensaje: "Las contraseñas no coinciden", recibido: req.body });
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
