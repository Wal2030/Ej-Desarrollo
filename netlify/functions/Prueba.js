const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");

const empresasroutes = require("../../backend/routes/empresasroutes");

const app = express();

app.use(cors());
app.use(bodyParser.json()); // Esto se encarga de parsear el JSON del body

app.use("/.netlify/functions/Prueba", empresasroutes);

module.exports.handler = serverless(app);
