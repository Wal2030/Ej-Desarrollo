const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

const estudiantes = [];

router.get("/", (req, res) => {
  res.json(estudiantes);
});

router.post("/", (req, res) => {
  const { nombre, email, password, password_confirmation } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }
  estudiantes.push({ nombre, email, password, password_confirmation });
  res.status(200).json({ mensaje: "Registro exitoso" });
});

app.use("/.netlify/functions/Prueba", router);

module.exports.handler = serverless(app);
