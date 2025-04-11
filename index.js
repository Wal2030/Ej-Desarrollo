const express = require('express');
const cors = require("cors");
const serverless = require('serverless-http');

const port = process.env.PORT || 5000;

const app = express();

// ✅ Asegúrate de que el nombre sea el mismo que vas a usar después
const empresasroutes = require("./backend/routes/empresasroutes.js");

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));

// ✅ Aquí ya no dará error
app.use("/estudiantes", empresasroutes);

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
