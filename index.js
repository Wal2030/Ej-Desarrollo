const express = require('express');
const cors = require("cors");
const serverless = require ('serverless-http');

var port = process.env.PORT || 5000;


const app = express();
const estudiantesroutes = require("./backend/routes/empresasroutes.js");
/*const profesoresroutes = require("./backend/routes/profesoresroutes.js");
//const cursosroutes = require("./backend/routes/cursosroutes.js");
*/
app.use(express.json());
app.use(cors());


app.get ("/", (req,res) => {
    res.send ("Hola mundo");
})

app.use ("/estudiantes",empresasroutes);
/*app.use ("/profesores",profesoresroutes);
app.use ("/cursos",cursosroutes);
*/
app.listen (8888,() =>{
    console.log("servidor activo");
});