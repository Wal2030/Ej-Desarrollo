const { getFirestore } = require('../firebaseAdmin');
const admin = require('firebase-admin');

async function verifyToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

async function getUserRole(uid) {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data().role;
  } catch (error) {
    console.error('Error obteniendo rol del usuario:', error);
    return null;
  }
}

async function requireAuth(event) {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthorized: false,
      error: 'Token no proporcionado'
    };
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    return {
      isAuthorized: false,
      error: 'Token inválido'
    };
  }

  return {
    isAuthorized: true,
    user: decodedToken
  };
}

async function requireRole(event, allowedRoles) {
  const authResult = await requireAuth(event);
  
  if (!authResult.isAuthorized) {
    return authResult;
  }

  const userRole = await getUserRole(authResult.user.uid);
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      isAuthorized: false,
      error: 'No tienes permiso para realizar esta acción'
    };
  }

  return {
    isAuthorized: true,
    user: authResult.user,
    role: userRole
  };
}

function unauthorized(message = 'No autorizado') {
  return {
    statusCode: 401,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: message
    })
  };
}

function forbidden(message = 'Acceso denegado') {
  return {
    statusCode: 403,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: message
    })
  };
}

module.exports = {
  requireAuth,
  requireRole,
  unauthorized,
  forbidden
}; 