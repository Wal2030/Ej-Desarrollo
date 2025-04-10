const express = require("express");
const router = express.Router();
const estudiantescontroller = require("../controllers/empresascontrollers.js");

router.get("/",empresascontroller.consultar);
router.post("/",empresascontroller.ingresar);

/* Ejemplo con parámetros
router.route("/:id")
.get(estudiantescontroller.consultarDetalle)
.put(estudiantescontroller.actualizar)
.delete(estudiantescontroller.borrar);
*/

module.exports = router;