/*
const express = require("express");
const router = express.Router();
const estudiantescontroller = require("../controllers/estudiantescontrollers.js");
router.get("/",estudiantescontroller.consultar);
router.post("/",estudiantescontroller.ingresar);
module.exports = router;
*/

class EstudiantesController{
    construct(){
    }
    consultar(req,res){
        try{
            let arreglo=[];
            let myObj = {nombre: "Walter", email:"ejemplo@nose.com"};
            let myObj2 = {nombre: "Danna",email:"222ejemplo@nose.com"};

            arreglo.push (myObj);
            arreglo.push (myObj2);

            let myJSON = JSON.stringify(arreglo);

            res.status(200).send (myJSON);
        }catch (err){
            res.status(500).send(err.message);
        }
    }
    ingresar(req,res){
        try{
            const {nombre,email} = req.body;
            console.log ("Nombres:" + nombre);
            console.log ("email: "+ email);
            res.status(200).send ("Funciono ok");
        }catch (err){
            res.status(500).send(err.message);
        }
    }
}
module.exports = new EstudiantesController();