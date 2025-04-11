// backend/controllers/empresascontrollers.js
let empresas = [];

const ingresar = (req, res) => {
  console.log("Body recibido:", req.body); // Esto te mostrará si llegan o no los datos
  const { nombre, email, password, password_confirmation } = req.body;
  if (!nombre || !email || !password || !password_confirmation) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }
  empresas.push({ nombre, email });
  res.json({ mensaje: "Empresa registrada correctamente" });
};

const consultar = (req, res) => {
  res.json(empresas);
};

module.exports = {
  ingresar,
  consultar
};
