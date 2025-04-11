// netlify/functions/Prueba.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const path = require("path");

// Cargar las rutas
const empresasroutes = require("../../backend/routes/empresasroutes");

const app = express();
app.use(cors());
app.use(express.json());

// Usar las rutas importadas
app.use("/.netlify/functions/Prueba", empresasroutes);

module.exports.handler = serverless(app);
