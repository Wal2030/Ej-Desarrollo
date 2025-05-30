const ROLES = {
    ADMIN: 'admin',
    EMPRESA: 'empresa',
    EVALUADOR: 'evaluador',
    USUARIO: 'usuario'
};

const PERMISOS = {
    GESTIONAR_USUARIOS: 'gestionar_usuarios',
    GESTIONAR_EMPRESAS: 'gestionar_empresas',
    EVALUAR_PROYECTOS: 'evaluar_proyectos',
    VER_REPORTES: 'ver_reportes'
};

const ROLES_PERMISOS = {
    [ROLES.ADMIN]: [
        PERMISOS.GESTIONAR_USUARIOS,
        PERMISOS.GESTIONAR_EMPRESAS,
        PERMISOS.EVALUAR_PROYECTOS,
        PERMISOS.VER_REPORTES
    ],
    [ROLES.EMPRESA]: [
        PERMISOS.GESTIONAR_EMPRESAS
    ],
    [ROLES.EVALUADOR]: [
        PERMISOS.EVALUAR_PROYECTOS,
        PERMISOS.VER_REPORTES
    ],
    [ROLES.USUARIO]: []
};

module.exports = {
    ROLES,
    PERMISOS,
    ROLES_PERMISOS
}; 