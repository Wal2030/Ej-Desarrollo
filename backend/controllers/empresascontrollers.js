// controllers/empresascontrollers.js
let empresas = [];

const ingresar = (req, res) => {
  const { nombre, email, password, password_confirmation } = req.body;
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
