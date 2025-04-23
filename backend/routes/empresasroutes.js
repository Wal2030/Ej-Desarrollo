const express = require("express");
const router = express.Router();
const empresascontrollers = require("../controllers/empresascontrollers");

router.get("/", empresascontrollers.consultar);
router.post("/", empresascontrollers.ingresar);
router.put("/actualizar", empresascontrollers.actualizar);
router.delete("/eliminar", empresascontrollers.eliminar);
router.get("/agregar", handler);


module.exports = router;
