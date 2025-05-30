const { admin } = require('../config/firebase');
const { ROLES_PERMISOS } = require('../config/roles');

const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ mensaje: "No se proporcionó token de autenticación" });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Agregar información del usuario al request
        req.usuario = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            rol: decodedToken.rol || 'usuario'
        };

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({ mensaje: "Usuario no autenticado" });
            }

            const rolUsuario = req.usuario.rol;
            if (!rolesPermitidos.includes(rolUsuario)) {
                return res.status(403).json({ 
                    mensaje: "No tienes permisos para realizar esta acción",
                    rolRequerido: rolesPermitidos,
                    rolActual: rolUsuario
                });
            }

            next();
        } catch (error) {
            console.error('Error al verificar rol:', error);
            res.status(500).json({ mensaje: "Error al verificar permisos" });
        }
    };
};

const verificarPermisos = (permisoRequerido) => {
    return (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({ mensaje: "Usuario no autenticado" });
            }

            const rolUsuario = req.usuario.rol;
            const permisosRol = ROLES_PERMISOS[rolUsuario] || [];

            if (!permisosRol.includes(permisoRequerido)) {
                return res.status(403).json({ 
                    mensaje: "No tienes el permiso necesario para realizar esta acción",
                    permisoRequerido,
                    permisosActuales: permisosRol
                });
            }

            next();
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            res.status(500).json({ mensaje: "Error al verificar permisos" });
        }
    };
};

module.exports = {
    verificarToken,
    verificarRol,
    verificarPermisos
}; 