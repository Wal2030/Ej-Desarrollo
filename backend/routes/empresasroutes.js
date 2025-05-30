const express = require("express");
const router = express.Router();
const empresascontrollers = require("../controllers/empresascontrollers");
const { verificarRol } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

// Rutas públicas
router.post("/", empresascontrollers.ingresar);
router.get("/", empresascontrollers.consultar);
router.get("/:id", empresascontrollers.getUser);

// Rutas que requieren autenticación y roles específicos
router.put("/:id", verificarRol([ROLES.ADMIN, ROLES.EMPRESA]), empresascontrollers.actualizar);
router.delete("/:id", verificarRol([ROLES.ADMIN]), empresascontrollers.eliminar);

// Rutas de verificación
router.post("/:id/verificar", verificarRol([ROLES.ADMIN]), empresascontrollers.verificarEmpresa);

// Rutas de reseñas
router.post("/:id/resenas", verificarRol([ROLES.USUARIO, ROLES.EVALUADOR]), empresascontrollers.agregarResena);

// Rutas de notificaciones
router.get("/:id/notificaciones", verificarRol([ROLES.EMPRESA]), empresascontrollers.obtenerNotificaciones);
router.put("/:id/notificaciones/:notificacionId", verificarRol([ROLES.EMPRESA]), empresascontrollers.marcarNotificacionLeida);

module.exports = router;
