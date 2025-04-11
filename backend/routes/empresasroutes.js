const express = require("express");
const router = express.Router();
const empresascontrollers = require("../controllers/empresascontrollers");

router.get("/", empresascontrollers.consultar);
router.post("/", empresascontrollers.ingresar);

module.exports = router;
