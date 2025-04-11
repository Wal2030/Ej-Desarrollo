const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const empresasroutes = require("../../backend/routes/empresasroutes");

const app = express();

// ✅ Necesario para que req.body funcione
app.use(express.json());
app.use(cors());

app.use("/.netlify/functions/Prueba", empresasroutes);

module.exports.handler = serverless(app);
