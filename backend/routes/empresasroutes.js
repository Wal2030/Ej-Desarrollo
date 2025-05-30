const express = require("express");
const router = express.Router();
const empresascontrollers = require("../controllers/empresascontrollers");

// Rutas CRUD básicas
router.get("/", empresascontrollers.consultar);
router.post("/", empresascontrollers.ingresar);
router.put("/:id", empresascontrollers.actualizar);
router.delete("/:id", empresascontrollers.eliminar);

// Rutas adicionales
router.get("/:id", empresascontrollers.getUser);

module.exports = router;
