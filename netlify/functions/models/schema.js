// Estructura de la base de datos en Firestore

/*
Colecciones:
- users
- empresas
- productos
- reseñas
- notificaciones
*/

const schemas = {
  users: {
    uid: 'string', // ID único del usuario
    email: 'string',
    role: 'string', // 'cliente' o 'empresa'
    nombre: 'string',
    createdAt: 'timestamp',
    status: 'string', // 'pending', 'verified', 'rejected'
    lastLogin: 'timestamp'
  },

  empresas: {
    uid: 'string', // ID único de la empresa
    nombre: 'string',
    ruc: 'string',
    direccion: 'string',
    telefono: 'string',
    email: 'string',
    status: 'string', // 'pending', 'verified', 'rejected'
    documentosVerificacion: {
      rucDoc: 'string', // URL del documento
      licenciaFuncionamiento: 'string', // URL del documento
      otrosDocumentos: ['string'] // Array de URLs
    },
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    verificadoPor: 'string', // ID del admin que verificó
    fechaVerificacion: 'timestamp'
  },

  productos: {
    id: 'string',
    empresaId: 'string',
    nombre: 'string',
    descripcion: 'string',
    precio: 'number',
    categoria: 'string',
    imagenes: ['string'],
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    status: 'string', // 'active', 'inactive'
    promedioCalificacion: 'number'
  },

  resenas: {
    id: 'string',
    productoId: 'string',
    empresaId: 'string',
    usuarioId: 'string',
    calificacion: 'number', // 1-5
    comentario: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    status: 'string', // 'active', 'hidden'
    respuestaEmpresa: {
      comentario: 'string',
      fecha: 'timestamp'
    }
  },

  notificaciones: {
    id: 'string',
    tipo: 'string', // 'promocion', 'actualizacion', 'verificacion'
    titulo: 'string',
    mensaje: 'string',
    destinatarioId: 'string', // ID del usuario o 'all'
    createdAt: 'timestamp',
    leido: 'boolean',
    fechaLectura: 'timestamp',
    expiraEn: 'timestamp',
    accion: {
      tipo: 'string', // 'link', 'button'
      texto: 'string',
      url: 'string'
    }
  }
};

module.exports = schemas; 