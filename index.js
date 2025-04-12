const express = require('express');
const cors = require("cors");
const serverless = require('serverless-http');

const port = process.env.PORT || 5000;

const app = express();


const empresasroutes = require("./backend/routes/empresasroutes.js");

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));


app.use("/", empresasroutes);

module.exports.handler = serverless(app);
